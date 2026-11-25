import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, stat, readFile, rm, realpath } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { testDatabase } from '../family/database.ts';
import { issueVerificationRun, writeHandoff, revokeVerificationRun, cleanupVerificationRun } from '../../lib/verification/operator.ts';
import type { VerificationTarget } from '../../lib/verification/target.ts';
const target: VerificationTarget = { projectId:'prj_test',deploymentId:'dpl_test',sourceSha:'a'.repeat(40),profileSha256:'b'.repeat(64),origin:'https://meal-planner-staging-rafalotufos.vercel.app',databaseIdentity:'c'.repeat(64) };
test('operator issues isolated run and private handoff, refuses overwrite, then revokes and cleans only owned data', async () => {
  const fixture=await testDatabase(), db=await fixture.open(), dir=await realpath(await mkdtemp(join(tmpdir(),'mp-verification-')));
  try {
    const issued=await issueVerificationRun(db,target,'collaboration'); assert.equal(issued.members.length,2);
    const path=join(dir,'handoff.json'); await writeHandoff(path,issued);
    assert.equal((await stat(path)).mode & 0o777,0o600); assert.equal(JSON.parse(await readFile(path,'utf8')).runId,issued.runId);
    await assert.rejects(writeHandoff(path,issued));
    await revokeVerificationRun(db,issued.runId,target);
    await cleanupVerificationRun(db,issued.runId,target);
    assert.equal((await db.one<{n:number}>('SELECT count(*)::integer AS n FROM families'))?.n,0);
  } finally { await db.close(); await fixture.cleanup(); await rm(dir,{recursive:true,force:true}); }
});
test('fixed reviewed seed is opt-in and scoped to the issued household, including cleanup preservation',async()=>{
 const fixture=await testDatabase(),db=await fixture.open();try{
  const empty=await issueVerificationRun(db,target,'app');
  assert.equal((await db.one<{n:number}>('SELECT count(*)::integer AS n FROM menu_recipes WHERE family_id=$1',[empty.familyId]))?.n,0);
  const seeded=await issueVerificationRun(db,target,'app',Date.now(),true);
  assert.equal((await db.one<{n:number}>('SELECT count(*)::integer AS n FROM menu_recipes WHERE family_id=$1',[seeded.familyId]))?.n,2);
  assert.equal((await db.one<{n:number}>('SELECT count(*)::integer AS n FROM meal_plan_weeks WHERE family_id=$1',[seeded.familyId]))?.n,1);
  const plan=await db.one<{id:string}>('SELECT id FROM meal_plan_weeks WHERE family_id=$1',[seeded.familyId]);assert.ok(plan);
  await db.execute('INSERT INTO meal_plan_approvals(plan_id,user_id,revision,created_at) VALUES($1,$2,1,$3)',[plan.id,empty.members[0].memberId,Date.now()]);
  await assert.rejects(cleanupVerificationRun(db,seeded.runId,target),/Verification ownership mismatch/);
  await db.execute('DELETE FROM meal_plan_approvals WHERE plan_id=$1 AND user_id=$2',[plan.id,empty.members[0].memberId]);
  await cleanupVerificationRun(db,seeded.runId,target);
  assert.equal((await db.one<{n:number}>('SELECT count(*)::integer AS n FROM verification_runs WHERE id=$1',[empty.runId]))?.n,1);
  assert.equal((await db.one<{n:number}>('SELECT count(*)::integer AS n FROM families WHERE id=$1',[seeded.familyId]))?.n,0);
 }finally{await db.close();await fixture.cleanup();}
});
