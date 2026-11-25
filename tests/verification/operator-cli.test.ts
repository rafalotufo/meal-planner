import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { mkdtemp, writeFile, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { databaseIdentity } from '../../lib/verification/target.ts';
import hosted from '../../intent/postgresql-persistence/hosted-resources.json';
const exec=promisify(execFile);
test('operator CLI rejects Production and stale inspection records before any database connection, without credential output',async()=>{
 const dir=await mkdtemp(join(tmpdir(),'mp-operator-refusal-'));const recordPath=join(dir,'record.json');
 const url=`postgres://operator:fixture-only@${hosted.production.host}/${hosted.production.database}?sslmode=verify-full`;
 const target={projectId:'prj_ntxXnJAVA977jHjLNDR7xJuwSx4V',deploymentId:'dpl_fixture',sourceSha:'a'.repeat(40),profileSha256:'b'.repeat(64),origin:'https://meal-planner-staging-rafalotufos.vercel.app',databaseIdentity:databaseIdentity(url)};
 try{
  for(const record of [{environment:'production',inspectedAt:Date.now(),target},{environment:'preview',inspectedAt:Date.now(),target},{environment:'preview',inspectedAt:Date.now()-700000,target}]){
   await writeFile(recordPath,JSON.stringify(record));
   await assert.rejects(exec(process.execPath,['--import','tsx','scripts/verification-access.ts','issue','--record',recordPath,'--output',join(dir,'handoff.json'),'--scope','app'],{env:{...process.env,VERIFICATION_OPERATOR_DATABASE_URL:url},timeout:5000}),error=>{
    assert.ok(error&&typeof error==='object'&&'stderr'in error&&'stdout'in error);assert.equal(String(error.stdout),'');assert.equal(String(error.stderr).trim(),'Verification operation refused or unavailable');return true;
   });
  }
 }finally{await rm(dir,{recursive:true,force:true});}
});
