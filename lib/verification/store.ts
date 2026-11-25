import type { FamilyDatabase } from '../db/connection';
import { FamilyError } from '../identity-access';
import { validateGoogleAccessList } from '../google-access';
import { capabilityDigest, credentialPattern, newCredential, uuidPattern } from './cookies';
import type { VerificationPrincipal, VerificationMemberRow } from './types';
import type { VerificationTarget } from './target';

const bindingColumns = 'r.project_id=$3 AND r.deployment_id=$4 AND r.source_sha=$5 AND r.profile_sha256=$6 AND r.origin=$7 AND r.database_identity=$8';
function binding(target: VerificationTarget) { return [target.projectId, target.deploymentId, target.sourceSha, target.profileSha256, target.origin, target.databaseIdentity]; }
export async function verificationMember(db: FamilyDatabase, principal: VerificationPrincipal, allowed: unknown, now = Date.now()) {
  validateGoogleAccessList(allowed);
  if (!uuidPattern.test(principal.runId) || !uuidPattern.test(principal.memberId) || !/^[a-f0-9]{64}$/.test(principal.sessionDigest)) return null;
  return await db.one<VerificationMemberRow>(`SELECT u.id,u.identity_kind AS "identityKind",u.google_subject AS "googleSubject",u.verified_email AS "verifiedEmail",u.family_id AS "familyId",u.created_at AS "createdAt",u.invitation_granted_at AS "invitationGrantedAt",u.verification_run_id AS "verificationRunId"
    FROM verification_sessions s JOIN verification_runs r ON r.id=s.run_id JOIN app_users u ON u.id=s.member_id AND u.verification_run_id=r.id JOIN families f ON f.id=r.family_id
    WHERE s.digest=$1 AND r.id=$2 AND ${bindingColumns} AND s.member_id=$9 AND s.revoked_at IS NULL AND s.expires_at>$10 AND r.revoked_at IS NULL AND r.expires_at>$10 AND u.family_id=r.family_id AND u.identity_kind='verification' AND f.identity_kind='verification'`, [principal.sessionDigest, principal.runId, ...binding(principal.target), principal.memberId, now]) ?? null;
}
export async function readVerificationSession(db: FamilyDatabase, token: string, target: VerificationTarget, allowed: unknown, now = Date.now()) {
  validateGoogleAccessList(allowed);
  if (!credentialPattern.test(token)) return null;
  const digest = capabilityDigest(token);
  const row = await db.one<{ runId: string; memberId: string; expiresAt: number }>('SELECT run_id AS "runId",member_id AS "memberId",expires_at AS "expiresAt" FROM verification_sessions WHERE digest=$1', [digest]);
  if (!row) return null;
  const identity: VerificationPrincipal = { kind: 'verification', runId: row.runId, memberId: row.memberId, sessionDigest: digest, target };
  const user = await verificationMember(db, identity, allowed, now);
  return user ? { identity, user, expiresAt: row.expiresAt } : null;
}
export async function throttleVerification(db: FamilyDatabase, bucket: string, limit: number, deadline: number, now = Date.now()) {
  return db.verificationTransaction(deadline, async tx => {
    const window = Math.floor(now / 300000) * 300000;
    await tx.execute('DELETE FROM verification_throttles WHERE window_start<$1', [window - 300000]);
    const row = await tx.one<{ attempts: number }>(`INSERT INTO verification_throttles(bucket,window_start,attempts) VALUES($1,$2,1)
      ON CONFLICT(bucket) DO UPDATE SET window_start=EXCLUDED.window_start,attempts=CASE WHEN verification_throttles.window_start=EXCLUDED.window_start THEN verification_throttles.attempts+1 ELSE 1 END RETURNING attempts`, [bucket, window]);
    return Boolean(row && row.attempts <= limit);
  });
}
export async function exchangeVerification(db: FamilyDatabase, runId: string, capability: string, target: VerificationTarget, allowed: unknown, deadline = Date.now() + 5000, now = Date.now()) {
  validateGoogleAccessList(allowed);
  if (!uuidPattern.test(runId) || !credentialPattern.test(capability)) throw new FamilyError(401, 'Unauthorized');
  const token = newCredential(), digest = capabilityDigest(capability);
  return db.verificationTransaction(deadline, async tx => {
    now = Date.now();
    const row = await tx.one<{ memberId: string; expiresAt: number }>(`SELECT c.member_id AS "memberId",r.expires_at AS "expiresAt" FROM verification_capabilities c JOIN verification_runs r ON r.id=c.run_id JOIN app_users u ON u.id=c.member_id AND u.verification_run_id=r.id JOIN families f ON f.id=r.family_id
      WHERE c.digest=$1 AND r.id=$2 AND ${bindingColumns} AND c.consumed_at IS NULL AND c.expires_at>$9 AND r.revoked_at IS NULL AND r.expires_at>$9 AND u.family_id=r.family_id AND u.identity_kind='verification' AND f.identity_kind='verification'`, [digest, runId, ...binding(target), now]);
    if (!row) throw new FamilyError(401, 'Unauthorized');
    const expiresAt = Math.min(now + 900000, row.expiresAt);
    await tx.execute('UPDATE verification_capabilities SET consumed_at=$2 WHERE digest=$1', [digest, now]);
    await tx.execute('INSERT INTO verification_sessions(digest,run_id,member_id,created_at,expires_at) VALUES($1,$2,$3,$4,$5)', [capabilityDigest(token), runId, row.memberId, now, expiresAt]);
    return { token, expiresAt };
  });
}
export async function revokeVerificationSession(db: FamilyDatabase, token: string, target: VerificationTarget) {
  if (!credentialPattern.test(token)) return;
  await db.transaction(async tx => {
    await tx.execute('UPDATE verification_sessions SET revoked_at=$2 WHERE digest=$1 AND run_id IN (SELECT id FROM verification_runs WHERE project_id=$3 AND deployment_id=$4 AND source_sha=$5 AND profile_sha256=$6 AND origin=$7 AND database_identity=$8)', [capabilityDigest(token), Date.now(), ...binding(target)]);
  });
}
