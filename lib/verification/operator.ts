import { randomUUID } from 'node:crypto';
import { constants } from 'node:fs';
import { open, realpath, stat, unlink } from 'node:fs/promises';
import { dirname, isAbsolute, resolve } from 'node:path';
import type { FamilyDatabase } from '../db/connection';
import type { VerificationTarget } from './target';
import { capabilityDigest, newCredential, uuidPattern } from './cookies';
export interface VerificationHandoff { runId: string; familyId: string; expiresAt: number; members: { memberId: string; capability: string }[] }
export async function issueVerificationRun(db: FamilyDatabase, target: VerificationTarget, scope: 'app' | 'collaboration', now = Date.now()): Promise<VerificationHandoff> {
  if (!['app','collaboration'].includes(scope)) throw new Error('Invalid verification scope');
  const runId=randomUUID(), familyId=randomUUID(), expiresAt=now+1800000;
  const members=Array.from({length:scope==='collaboration'?2:1},()=>({memberId:randomUUID(),capability:newCredential()}));
  await db.transaction(async tx => {
    await tx.execute("INSERT INTO families(id,created_at,identity_kind) VALUES($1,$2,'verification')",[familyId,now]);
    await tx.execute('INSERT INTO verification_runs(id,family_id,project_id,deployment_id,source_sha,profile_sha256,origin,database_identity,created_at,expires_at,scope) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)',[runId,familyId,target.projectId,target.deploymentId,target.sourceSha,target.profileSha256,target.origin,target.databaseIdentity,now,expiresAt,scope]);
    for (const member of members) {
      await tx.execute("INSERT INTO app_users(id,family_id,created_at,identity_kind,verification_run_id) VALUES($1,$2,$3,'verification',$4)",[member.memberId,familyId,now,runId]);
      await tx.execute('INSERT INTO verification_capabilities(digest,run_id,member_id,created_at,expires_at) VALUES($1,$2,$3,$4,$5)',[capabilityDigest(member.capability),runId,member.memberId,now,now+300000]);
    }
  });
  return {runId,familyId,expiresAt,members};
}
export async function writeHandoff(path: string, value: VerificationHandoff) {
  const parent=dirname(resolve(path));
  if (!isAbsolute(path) || await realpath(parent)!==parent) throw new Error('Private absolute output path required');
  const info=await stat(parent);
  if (!info.isDirectory() || (info.mode&0o077)!==0 || info.uid!==process.getuid?.()) throw new Error('Private owner-only output directory required');
  const file=await open(path,constants.O_WRONLY|constants.O_CREAT|constants.O_EXCL|constants.O_NOFOLLOW,0o600);
  try { await file.writeFile(JSON.stringify(value)+'\n'); await file.sync(); }
  catch(error) { await file.close(); await unlink(path); throw error; }
  await file.close();
}
async function ownedRun(db: FamilyDatabase, runId: string, target: VerificationTarget) {
  if (!uuidPattern.test(runId)) throw new Error('Verification run unavailable');
  const row=await db.one<{familyId:string}>('SELECT r.family_id AS "familyId" FROM verification_runs r JOIN families f ON f.id=r.family_id WHERE r.id=$1 AND r.project_id=$2 AND r.deployment_id=$3 AND r.source_sha=$4 AND r.profile_sha256=$5 AND r.origin=$6 AND r.database_identity=$7 AND f.identity_kind=\'verification\'',[runId,target.projectId,target.deploymentId,target.sourceSha,target.profileSha256,target.origin,target.databaseIdentity]);
  if(!row) throw new Error('Verification run unavailable');
  return row;
}
export async function revokeVerificationRun(db: FamilyDatabase, runId: string, target: VerificationTarget) {
  await db.transaction(async tx=>{await ownedRun(tx,runId,target); await tx.execute('UPDATE verification_runs SET revoked_at=COALESCE(revoked_at,$2) WHERE id=$1',[runId,Date.now()]);});
}
export async function cleanupVerificationRun(db: FamilyDatabase, runId: string, target: VerificationTarget) {
  await revokeVerificationRun(db,runId,target);
  return db.transaction(async tx=>{
    const {familyId}=await ownedRun(tx,runId,target);
    const unsafe=await tx.one<{n:number}>(`SELECT (SELECT count(*) FROM app_users WHERE family_id=$1 AND (identity_kind<>'verification' OR verification_run_id IS DISTINCT FROM $2))+(SELECT count(*) FROM family_invitations WHERE family_id=$1)+(SELECT count(*) FROM menu_recipe_curations c JOIN menu_recipes m ON m.id=c.entry_id WHERE m.family_id=$1)+(SELECT count(*) FROM meal_plan_approvals a JOIN app_users u ON u.id=a.user_id JOIN meal_plan_weeks p ON p.id=a.plan_id WHERE u.family_id=$1 AND p.family_id<>$1)+(SELECT count(*) FROM meal_plan_suggestions s JOIN app_users u ON u.id=s.user_id JOIN meal_plan_weeks p ON p.id=s.plan_id WHERE u.family_id=$1 AND p.family_id<>$1) AS n`,[familyId,runId]);
    if(!unsafe || unsafe.n!==0) throw new Error('Verification ownership mismatch');
    await tx.execute('DELETE FROM meal_plan_approvals WHERE plan_id IN (SELECT id FROM meal_plan_weeks WHERE family_id=$1)',[familyId]);
    await tx.execute('DELETE FROM meal_plan_suggestions WHERE plan_id IN (SELECT id FROM meal_plan_weeks WHERE family_id=$1)',[familyId]);
    await tx.execute('DELETE FROM meal_plan_weeks WHERE family_id=$1',[familyId]);
    await tx.execute('DELETE FROM menu_recipes WHERE family_id=$1',[familyId]);
    await tx.execute('DELETE FROM verification_sessions WHERE run_id=$1',[runId]);
    await tx.execute('DELETE FROM verification_capabilities WHERE run_id=$1',[runId]);
    await tx.execute('DELETE FROM app_users WHERE family_id=$1 AND verification_run_id=$2',[familyId,runId]);
    await tx.execute('DELETE FROM verification_runs WHERE id=$1',[runId]);
    await tx.execute('DELETE FROM families WHERE id=$1 AND identity_kind=\'verification\'',[familyId]);
    return {cleaned:true as const,runId};
  });
}
