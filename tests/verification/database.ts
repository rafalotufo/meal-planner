import { randomUUID } from 'node:crypto';
import { testDatabase } from '../family/database.ts';
import { capabilityDigest, newCredential } from '../../lib/verification/cookies.ts';
import type { VerificationTarget } from '../../lib/verification/target.ts';
const target: VerificationTarget = { projectId: 'prj_test', deploymentId: 'dpl_test', sourceSha: 'a'.repeat(40), profileSha256: 'b'.repeat(64), origin: 'https://meal-planner-staging-rafalotufos.vercel.app', databaseIdentity: 'c'.repeat(64) };
export async function verificationFixture() {
  const fixture = await testDatabase(); const db = await fixture.open();
  const familyId = randomUUID(), runId = randomUUID(), memberId = randomUUID(), capability = newCredential(), now = Date.now();
  await db.transaction(async tx => {
    await tx.execute("INSERT INTO families(id,created_at,identity_kind) VALUES($1,$2,'verification')", [familyId,now]);
    await tx.execute('INSERT INTO verification_runs(id,family_id,project_id,deployment_id,source_sha,profile_sha256,origin,database_identity,created_at,expires_at,scope) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)', [runId,familyId,target.projectId,target.deploymentId,target.sourceSha,target.profileSha256,target.origin,target.databaseIdentity,now,now+1800000,'app']);
    await tx.execute("INSERT INTO app_users(id,family_id,created_at,identity_kind,verification_run_id) VALUES($1,$2,$3,'verification',$4)", [memberId,familyId,now,runId]);
    await tx.execute('INSERT INTO verification_capabilities(digest,run_id,member_id,created_at,expires_at) VALUES($1,$2,$3,$4,$5)', [capabilityDigest(capability),runId,memberId,now,now+300000]);
  });
  return { fixture, db, target, familyId, runId, memberId, capability, async close() { await db.close(); await fixture.cleanup(); } };
}
