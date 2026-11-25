import {createRequire} from 'node:module';
import {readFile,writeFile,mkdtemp,chmod,lstat,realpath} from 'node:fs/promises';
import {dirname,join} from 'node:path';
import {createHash} from 'node:crypto';
import {execFile as callbackExec,execFileSync} from 'node:child_process';
import {promisify} from 'node:util';
import {pathToFileURL} from 'node:url';
const exec=promisify(callbackExec),require=createRequire(process.cwd()+'/package.json'),{Client}=require('pg');
const {connectDatabase,catalogSignature,openDatabase,validateDatabaseUrl,validateMigrationPair}=await import(pathToFileURL(process.cwd()+'/lib/db/connection.ts'));
const {runtimeMigrations}=await import(pathToFileURL(process.cwd()+'/lib/db/runtime-metadata.ts'));
process.umask(0o077);
const fail=code=>{const e=new Error(code);e.auditCode=code;throw e;};
const oldSha='4eea4aa3496662f0e12133fd749fd193e6d4a291';
const oldMetadata=JSON.parse(execFileSync('git',['show',oldSha+':drizzle/postgresql/runtime-migrations.json'],{encoding:'utf8'}));
const oldCatalog=JSON.parse(execFileSync('git',['show',oldSha+':drizzle/postgresql/catalog.json'],{encoding:'utf8'}));
const owner=validateDatabaseUrl(process.env.MIGRATION_DATABASE_URL),runtime=validateDatabaseUrl(process.env.DATABASE_URL);validateMigrationPair(owner,runtime);
if(owner.hostname!=='127.0.0.1'||owner.pathname!=='/meal_planner_dev'||decodeURIComponent(owner.username)!=='mp_migrator'||decodeURIComponent(runtime.username)!=='mp_runtime')fail('unexpected-local-target');
const identity={host:owner.hostname,port:owner.port||'5432',database:owner.pathname.slice(1)};
const pgEnv={PATH:process.env.PATH,HOME:process.env.HOME,TMPDIR:process.env.TMPDIR,PGHOST:identity.host,PGPORT:identity.port,PGDATABASE:identity.database,PGUSER:decodeURIComponent(owner.username),PGPASSWORD:decodeURIComponent(owner.password),PGSSLMODE:'disable'};
const binary='/opt/homebrew/opt/postgresql@17/bin/';
const sha=value=>createHash('sha256').update(value).digest('hex');
async function ledger(client){return (await client.query('SELECT hash,created_at FROM __drizzle_migrations ORDER BY id')).rows.map(row=>({hash:row.hash,folderMillis:Number(row.created_at)}));}
async function fullLedger(client){return (await client.query('SELECT id,hash,created_at FROM __drizzle_migrations ORDER BY id')).rows.map(row=>({id:String(row.id),hash:row.hash,created_at:String(row.created_at)}));}
async function fingerprint(client,tables){const result={};for(const table of tables){if(!/^[a-z_]+$/.test(table))fail('unexpected-table-name');const r=await client.query(`SELECT count(*)::text AS count,md5(coalesce(string_agg(md5(row_to_json(t)::text),'' ORDER BY row_to_json(t)::text),'')) AS digest FROM "${table}" t`);result[table]=r.rows[0];}return result;}
async function checkOld(client){const peers=await client.query("SELECT count(*)::int AS count FROM pg_stat_activity WHERE datname=current_database() AND pid<>pg_backend_pid() AND backend_type='client backend'");if(peers.rows[0].count!==0)fail('native-database-has-other-active-clients');const rows=await ledger(client);if(JSON.stringify(rows)!==JSON.stringify(oldMetadata))fail('native-prefix-drift');const db=connectDatabase(owner.href);try{if(JSON.stringify(await catalogSignature(db))!==JSON.stringify(oldCatalog))fail('native-catalog-drift');}finally{await db.close();}return rows;}
async function verifyBackup(path){await exec(binary+'pg_restore',['--no-owner','--no-acl','--file=/dev/null',path],{env:pgEnv,maxBuffer:1048576});return sha(await readFile(path));}
async function main(){
 const mode=process.argv[2];if(!['prepare','apply'].includes(mode))fail('unexpected-mode');
 const client=new Client({connectionString:owner.href,query_timeout:12000});await client.connect();
 try{
  if(mode==='prepare'){
   await checkOld(client);
   const directory=await mkdtemp('/private/tmp/meal-planner-url-main-native-');await chmod(directory,0o700);
   const backup=directory+'/before-curation.dump',metadataFile=directory+'/audit.json';
   await client.query('BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY');
   const tables=(await client.query("SELECT tablename FROM pg_tables WHERE schemaname='public' AND tablename<>'__drizzle_migrations' ORDER BY tablename")).rows.map(v=>v.tablename);
   const before=await fingerprint(client,tables);const history=await ledger(client);const historyRows=await fullLedger(client);const snapshot=(await client.query('SELECT pg_export_snapshot() AS snapshot')).rows[0].snapshot;
   await exec(binary+'pg_dump',['--format=custom','--no-owner','--no-acl','--lock-wait-timeout=5s','--snapshot='+snapshot,'--file='+backup],{env:pgEnv,maxBuffer:1048576});
   await client.query('COMMIT');await chmod(backup,0o600);const backupSha=await verifyBackup(backup);
   await writeFile(metadataFile,JSON.stringify({target:identity,oldSource:oldSha,history,historyRows,tables,before,backup,backupSha,createdAt:new Date().toISOString(),applied:false},null,2)+'\n',{mode:0o600,flag:'wx'});
   console.log('Private native backup fully decoded/verified; metadata: '+metadataFile);return;
  }
  const metadataFile=process.argv[3],source=process.argv[4];if(!metadataFile?.startsWith('/private/tmp/meal-planner-url-main-native-')||!source?.match(/^[a-f0-9]{40}$/))fail('unexpected-cutover-input');
  const directory=dirname(metadataFile);if(!/^\/private\/tmp\/meal-planner-url-main-native-[A-Za-z0-9]+$/.test(directory)||metadataFile!==join(directory,'audit.json'))fail('unexpected-backup-directory');
  const folder=await lstat(directory);if(!folder.isDirectory()||folder.isSymbolicLink()||folder.uid!==process.getuid()||(folder.mode&0o777)!==0o700||await realpath(directory)!==directory)fail('unsafe-backup-directory');
  async function privateRegular(path){const info=await lstat(path);if(!info.isFile()||info.isSymbolicLink()||info.uid!==process.getuid()||(info.mode&0o777)!==0o600||await realpath(path)!==path)fail('unsafe-backup-file');}
  await privateRegular(metadataFile);
  const audit=JSON.parse(await readFile(metadataFile,'utf8'));if(JSON.stringify(audit.target)!==JSON.stringify(identity)||audit.applied)fail('unexpected-cutover-state');
  if(audit.backup!==join(directory,'before-curation.dump'))fail('unexpected-backup-path');await privateRegular(audit.backup);
  execFileSync('git',['diff','--exit-code',source,'--','app','lib','drizzle','scripts','tests'],{stdio:'pipe'});
  if(await verifyBackup(audit.backup)!==audit.backupSha)fail('backup-digest-mismatch');
  await checkOld(client);if(JSON.stringify(await fullLedger(client))!==JSON.stringify(audit.historyRows))fail('native-ledger-changed-since-backup');if(JSON.stringify(await fingerprint(client,audit.tables))!==JSON.stringify(audit.before))fail('native-data-changed-since-backup');
  if(runtimeMigrations.length!==5||JSON.stringify(runtimeMigrations.slice(0,4))!==JSON.stringify(oldMetadata))fail('candidate-prefix-mismatch');
  await exec(process.execPath,['--env-file=.env.local','--import','tsx','scripts/migrate-db.ts'],{env:{...process.env,OPENAI_API_KEY:''},maxBuffer:1048576});
  const finalRows=await fullLedger(client);if(JSON.stringify(finalRows.slice(0,4))!==JSON.stringify(audit.historyRows))fail('post-migration-original-ledger-row-drift');const current=await ledger(client);if(JSON.stringify(current)!==JSON.stringify(runtimeMigrations))fail('post-migration-history-mismatch');
  if(JSON.stringify(await fingerprint(client,audit.tables))!==JSON.stringify(audit.before))fail('post-migration-data-drift');
  const db=await openDatabase(runtime.href);await db.close();
  audit.applied=true;audit.reviewedSource=source;audit.completedAt=new Date().toISOString();audit.finalHistory=current;audit.existingDataUnchanged=true;audit.runtimeCompatible=true;
  await writeFile(metadataFile,JSON.stringify(audit,null,2)+'\n',{mode:0o600});
  console.log('Native additive migration applied. Existing data and original four ledger records are unchanged; runtime schema is compatible.');console.log('Private backup retained: '+audit.backup);
 }finally{try{await client.query('ROLLBACK');}catch{}await client.end();}
}
main().catch(error=>{console.error('Native cutover refused:',error?.auditCode||error?.code||'operation-failed');process.exitCode=1;});
