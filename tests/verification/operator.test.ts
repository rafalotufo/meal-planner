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
