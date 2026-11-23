import { createHash, randomBytes, randomUUID } from 'node:crypto';
import type { FamilyDatabase } from './db/connection';
import type { InvitationRow } from './db/schema';
import { classifyAccess, FamilyError, findUser, hasPendingInvitation, normalizeEmail, requireMember, type VerifiedIdentity } from './identity-access';
const invitationColumns = 'id, family_id AS familyId, created_by_user_id AS createdByUserId, recipient_email AS recipientEmail, token_hash AS tokenHash, created_at AS createdAt, expires_at AS expiresAt, status, accepted_by_user_id AS acceptedByUserId, accepted_at AS acceptedAt, revoked_at AS revokedAt';
const hash = (token: string) => createHash('sha256').update(token).digest('hex');
export function lookupInvitation(db: FamilyDatabase, token: string | null) {
  if (!token || !/^[A-Za-z0-9_-]{43}$/.test(token)) return undefined;
  return db.prepare<[string], InvitationRow>(`SELECT ${invitationColumns} FROM family_invitations WHERE token_hash=?`).get(hash(token));
}
export function invitationForRecipient(db: FamilyDatabase, identity: VerifiedIdentity, token: string | null) {
  const invitation = lookupInvitation(db, token);
  return invitation?.status === 'pending' && invitation.expiresAt > Date.now() && invitation.recipientEmail === identity.email ? invitation : null;
}
export function createInvitation(db: FamilyDatabase, identity: VerifiedIdentity, allowed: unknown, recipient: unknown, origin: string) {
  const email = normalizeEmail(recipient);
  if (!email) throw new FamilyError(400, 'Invalid request');
  return db.transaction(() => {
    const owner = requireMember(db, identity, allowed); const now = Date.now();
    const existing = db.prepare<[string], { id: string }>('SELECT id FROM app_users WHERE verified_email=?').get(email);
    if (existing || hasPendingInvitation(db, email, now)) throw new FamilyError(409);
    const created = db.prepare<[string, number], { n: number }>('SELECT count(*) AS n FROM family_invitations WHERE family_id=? AND created_at>?').get(owner.familyId, now - 3600000)!.n;
    const active = db.prepare<[string, number], { n: number }>("SELECT count(*) AS n FROM family_invitations WHERE family_id=? AND status='pending' AND expires_at>?").get(owner.familyId, now)!.n;
    if (created >= 10 || active >= 20) throw new FamilyError(429);
    const token = randomBytes(32).toString('base64url'); const id = randomUUID(); const expiresAt = now + 7 * 24 * 3600000;
    db.prepare<[string, string, string, string, string, number, number]>("INSERT INTO family_invitations (id,family_id,created_by_user_id,recipient_email,token_hash,created_at,expires_at,status) VALUES (?,?,?,?,?,?,?,'pending')").run(id, owner.familyId, owner.id, email, hash(token), now, expiresAt);
    return { id, url: `${origin}/invite#${token}`, expiresAt };
  }).immediate();
}
export function acceptInvitation(db: FamilyDatabase, identity: VerifiedIdentity, allowed: unknown, token: string | null) {
  return db.transaction(() => {
    const access = classifyAccess(db, identity, allowed); const invitation = lookupInvitation(db, token);
    if (access?.kind === 'member') {
      if (invitation?.status === 'accepted' && invitation.acceptedByUserId === access.user.id && invitation.familyId === access.user.familyId) return access.user;
      throw new FamilyError(409);
    }
    if (!access || !invitation || invitation.recipientEmail !== identity.email || invitation.status !== 'pending' || invitation.expiresAt <= Date.now()) throw new FamilyError(409);
    const now = Date.now(); const id = randomUUID();
    db.prepare<[string, string, string, string, number, number]>('INSERT INTO app_users (id,google_subject,verified_email,family_id,created_at,invitation_granted_at) VALUES (?,?,?,?,?,?)').run(id, identity.googleSubject, identity.email, invitation.familyId, now, now);
    db.prepare<[string, number, string]>("UPDATE family_invitations SET status='accepted',accepted_by_user_id=?,accepted_at=? WHERE id=?").run(id, now, invitation.id);
    return findUser(db, identity.googleSubject)!;
  }).immediate();
}
export function revokeInvitation(db: FamilyDatabase, identity: VerifiedIdentity, allowed: unknown, id: string) {
  db.transaction(() => {
    const owner = requireMember(db, identity, allowed);
    const row = db.prepare<[string, string], { status: string }>('SELECT status FROM family_invitations WHERE id=? AND family_id=?').get(id, owner.familyId);
    if (!row) throw new FamilyError(404, 'Not found');
    if (row.status !== 'pending') throw new FamilyError(409);
    db.prepare<[number, string, string]>("UPDATE family_invitations SET status='revoked',revoked_at=? WHERE id=? AND family_id=?").run(Date.now(), id, owner.familyId);
  }).immediate();
}
