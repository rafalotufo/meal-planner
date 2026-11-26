import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { access, mkdtemp, readFile, rm, symlink } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { excludedFromUpload, exportUploadSource, uploadExclusions } from './upload-source.ts';
const exec=promisify(execFile);
test('scheduler and search deployment functions retain request cancellation support', async () => {
 const configuration=JSON.parse(await readFile('vercel.json','utf8'));
 assert.equal(configuration.functions['app/api/plans/generate/route.ts']?.supportsCancellation,true);
 assert.equal(configuration.functions['app/api/recipes/search/route.ts']?.supportsCancellation,true);
});
test('a clean Vercel source upload builds without excluded scripts or generated local policy',{timeout:240000},async()=>{
 const directory=await mkdtemp(join(tmpdir(),'meal-upload-build-'));
 try{
  const files=await exportUploadSource(directory);
  for(const name of ['scripts','tests','org','intent','.data','.env.local','.verification'])await assert.rejects(access(join(directory,name)),`${name} is absent before build`);
  assert.ok(files.includes('package.json'));assert.ok(files.includes('lib/verification/runtime.ts'));
  await symlink(resolve('node_modules'),join(directory,'node_modules'),'dir');
  const env:NodeJS.ProcessEnv={...process.env,NODE_ENV:'production',NEXT_TELEMETRY_DISABLED:'1',OPENAI_API_KEY:''};
  for(const key of Object.keys(env))if(/^(?:VERCEL_|VERIFICATION_|GOOGLE_CLIENT_|BETTER_AUTH_)/.test(key)||['DATABASE_URL','MIGRATION_DATABASE_URL','TEST_DATABASE_URL','CRON_SECRET','MEAL_PLAN_SCHEDULER_ENABLED','MEAL_PLAN_SCHEDULER_ORIGIN','MEAL_PLAN_DRAFT_DAY'].includes(key))delete env[key];
  let failure='';
  try{await exec('pnpm',['run','build'],{cwd:directory,env,timeout:180000,maxBuffer:4*1024*1024});}
  catch(error){const detail=error as{stdout?:string;stderr?:string};failure=`${detail.stdout??''}\n${detail.stderr??''}`;}
  assert.equal(failure,'',`clean source upload build failed:\n${failure.slice(-6000)}`);
  assert.deepEqual(JSON.parse(await readFile(join(directory,'.verification/build-manifest.json'),'utf8')),{enabled:false});
  await access(join(directory,'.next/BUILD_ID'));
 }finally{await rm(directory,{recursive:true,force:true,maxRetries:5,retryDelay:100});}
});
test('upload exclusions reject generated policy and unsupported ignore grammar',async()=>{
 const rules=uploadExclusions(await readFile('.vercelignore','utf8'));
 for(const path of ['.verification/build-manifest.json','scripts/verification-access.ts','.env.local','tests/verification/server.ts','.data/postgres/development.env','backup.sqlite-wal'])assert.equal(excludedFromUpload(path,rules),true,path);
 assert.throws(()=>uploadExclusions('!private\n'),/Unsupported/);
 assert.throws(()=>uploadExclusions('private/path\n'),/Unsupported/);
});
