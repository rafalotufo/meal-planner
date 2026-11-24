// Explicit owner-authorized provisioning for the two recorded NEW Neon projects.
// Never invoked by application startup/build. No deployment or destructive reset.
import { readFile, writeFile, lstat, realpath, rename } from 'node:fs/promises';
import { resolve } from 'node:path';
import { randomBytes } from 'node:crypto';
import { TLSSocket } from 'node:tls';
import assert from 'node:assert/strict';
import { Client } from 'pg';
import { connectDatabase, openDatabase, validateDatabaseUrl, validateMigrationPair } from '../lib/db/connection';
import { migrateDatabase } from '../lib/db/migrate';
interface Resource { projectId: string; branchId: string; host: string; database: string; name: string }
interface Bootstrap { environment: string; projectId: string; branchId: string; host: string; connection: string }
interface Credentials { projectId: string; branchId: string; migrator: string; runtime: string }
let stage = 'input';
async function privateFile(path: string, exists = true) {
  const directory = resolve('.data/neon'); const info = await lstat(directory);
  assert.ok(info.isDirectory() && !info.isSymbolicLink() && info.uid === process.getuid?.() && (info.mode & 0o077) === 0 && await realpath(directory) === directory);
  try {
    const file = await lstat(path);
    assert.ok(file.isFile() && !file.isSymbolicLink() && file.uid === process.getuid?.() && (file.mode & 0o077) === 0 && await realpath(path) === resolve(path));
  } catch (error) { if (exists || !(error instanceof Error) || !('code' in error) || error.code !== 'ENOENT') throw error; }
}
function tls(client: Client) {
  const connection: unknown = Reflect.get(client, 'connection');
  assert.ok(connection && typeof connection === 'object');
  const socket: unknown = Reflect.get(connection, 'stream');
  assert.ok(socket instanceof TLSSocket && socket.encrypted && socket.authorized);
}
async function main() {
  const environment = process.argv[2]; const action = process.argv[3];
  assert.ok(['preview','production'].includes(environment) && ['provision','verify'].includes(action));
  const resources = JSON.parse(await readFile('intent/postgresql-persistence/hosted-resources.json','utf8')) as Record<string, Resource>;
  const resource = resources[environment];
  assert.ok(resource && resource.name === `meal-planner-${environment}` && resource.database === 'meal_planner' && resource.host.endsWith('.c-15.us-east-1.aws.neon.tech'));
  const bootstrapPath = `.data/neon/${environment}.bootstrap.json`;
  await privateFile(bootstrapPath);
  const bootstrap = JSON.parse(await readFile(bootstrapPath,'utf8')) as Bootstrap;
  const adminUrl = validateDatabaseUrl(bootstrap.connection);
  // Neon may return its pooled default. Normalize only the recorded endpoint pair.
  if (adminUrl.hostname === resource.host.replace('.c-15.', '-pooler.c-15.')) adminUrl.hostname = resource.host;
  assert.ok(bootstrap.environment === environment && bootstrap.projectId === resource.projectId && bootstrap.branchId === resource.branchId && bootstrap.host === resource.host);
  assert.ok(adminUrl.hostname === resource.host && adminUrl.pathname === '/meal_planner' && adminUrl.username === 'neondb_owner');
  const credentialsPath = `.data/neon/${environment}.credentials.json`;
  await privateFile(credentialsPath, false);
  let credentials: Credentials; let fresh = false;
  try { credentials = JSON.parse(await readFile(credentialsPath,'utf8')) as Credentials; }
  catch (error) {
    if (action !== 'provision' || !(error instanceof Error) || !('code' in error) || error.code !== 'ENOENT') throw error;
    credentials = { projectId: resource.projectId, branchId: resource.branchId, migrator: randomBytes(32).toString('hex'), runtime: randomBytes(32).toString('hex') };
    await writeFile(credentialsPath, JSON.stringify(credentials), {mode:0o600,flag:'wx'}); fresh = true;
  }
  assert.ok(credentials.projectId === resource.projectId && credentials.branchId === resource.branchId && /^[a-f0-9]{64}$/.test(credentials.migrator) && /^[a-f0-9]{64}$/.test(credentials.runtime) && credentials.migrator !== credentials.runtime);
  const ownerUrl = new URL(adminUrl); ownerUrl.username = 'mp_migrator'; ownerUrl.password = credentials.migrator;
  const runtimeUrl = new URL(adminUrl); runtimeUrl.username = 'mp_runtime'; runtimeUrl.password = credentials.runtime; runtimeUrl.hostname = runtimeUrl.hostname.replace('.c-15.', '-pooler.c-15.');
  validateMigrationPair(ownerUrl, runtimeUrl);
  if (action === 'provision') {
    stage = 'bootstrap'; const admin = new Client({connectionString:adminUrl.href,connectionTimeoutMillis:10000,query_timeout:15000}); await admin.connect();
    try {
      tls(admin);
      const tables = await admin.query<{ tablename: string }>("SELECT tablename FROM pg_tables WHERE schemaname='public'");
      assert.ok(tables.rows.every(r => ['families','app_users','family_invitations','menu_recipes','__drizzle_migrations'].includes(r.tablename)));
      if (fresh) assert.equal(tables.rowCount, 0);
      await admin.query('BEGIN');
      try {
        await admin.query('SELECT pg_advisory_xact_lock(73462902)');
        for (const [name,password] of [['mp_migrator',credentials.migrator],['mp_runtime',credentials.runtime]] as const) {
          const found = await admin.query('SELECT 1 FROM pg_roles WHERE rolname=$1',[name]);
          if (fresh) assert.equal(found.rowCount,0);
          if (!found.rowCount) await admin.query(`CREATE ROLE ${name} LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS PASSWORD '${password}'`);
        }
        await admin.query('REVOKE ALL ON DATABASE meal_planner FROM PUBLIC');
        await admin.query('GRANT CONNECT ON DATABASE meal_planner TO mp_migrator,mp_runtime');
        await admin.query('REVOKE ALL ON SCHEMA public FROM PUBLIC');
        await admin.query('GRANT USAGE,CREATE ON SCHEMA public TO mp_migrator');
        await admin.query('GRANT USAGE ON SCHEMA public TO mp_runtime');
        await admin.query('COMMIT');
      } catch (error) { await admin.query('ROLLBACK'); throw error; }
    } finally { await admin.end(); }
    stage = 'migration'; await migrateDatabase(ownerUrl.href);
    const owner = connectDatabase(ownerUrl.href);
    try {
      await owner.execute('GRANT SELECT ON __drizzle_migrations TO mp_runtime');
      await owner.execute('GRANT SELECT,INSERT,UPDATE,DELETE ON families,app_users,family_invitations TO mp_runtime');
      await owner.execute('GRANT SELECT,INSERT,DELETE ON menu_recipes TO mp_runtime');
    } finally { await owner.close(); }
  }
  stage = 'verify'; const runtime = new Client({connectionString:runtimeUrl.href,connectionTimeoutMillis:10000,query_timeout:15000}); await runtime.connect();
  try {
    tls(runtime);
    const role = await runtime.query("SELECT rolsuper,rolcreatedb,rolcreaterole,rolreplication,rolbypassrls FROM pg_roles WHERE rolname=current_user");
    assert.deepEqual(role.rows[0], {rolsuper:false,rolcreatedb:false,rolcreaterole:false,rolreplication:false,rolbypassrls:false});
    const ownerFlags = await runtime.query("SELECT rolsuper,rolcreatedb,rolcreaterole,rolreplication,rolbypassrls FROM pg_roles WHERE rolname='mp_migrator'");
    assert.deepEqual(ownerFlags.rows[0], {rolsuper:false,rolcreatedb:false,rolcreaterole:false,rolreplication:false,rolbypassrls:false});
    const privilege = await runtime.query(`SELECT
      has_schema_privilege(current_user,'public','CREATE') AS schema_create,
      has_database_privilege(current_user,current_database(),'CREATE') AS database_create,
      has_table_privilege(current_user,'__drizzle_migrations','INSERT,UPDATE,DELETE,TRUNCATE') AS history_write,
      (SELECT bool_and(has_table_privilege(current_user,t,p)) FROM unnest(ARRAY['families','app_users','family_invitations']) t CROSS JOIN unnest(ARRAY['SELECT','INSERT','UPDATE','DELETE']) p) AS domain_access,
      (SELECT bool_and(has_table_privilege(current_user,'menu_recipes',p)) FROM unnest(ARRAY['SELECT','INSERT','DELETE']) p) AS menu_access,
      has_table_privilege(current_user,'menu_recipes','UPDATE,TRUNCATE') AS menu_forbidden,
      pg_has_role(current_user,'neon_superuser','USAGE') AS neon_admin,
      pg_has_role(current_user,'mp_migrator','MEMBER') AS migrator_member`);
    assert.deepEqual(privilege.rows[0],{schema_create:false,database_create:false,history_write:false,domain_access:true,menu_access:true,menu_forbidden:false,neon_admin:false,migrator_member:false});
    const memberships = await runtime.query("SELECT count(*)::int AS n FROM pg_auth_members m JOIN pg_roles r ON r.oid=m.member WHERE r.rolname IN ('mp_runtime','mp_migrator')");
    assert.equal(memberships.rows[0].n,0);
    const migrationAdmin = await runtime.query("SELECT pg_has_role('mp_migrator','neon_superuser','USAGE') AS neon_admin,pg_has_role('mp_migrator','neondb_owner','MEMBER') AS bootstrap_member");
    assert.deepEqual(migrationAdmin.rows[0],{neon_admin:false,bootstrap_member:false});
    const ownership = await runtime.query("SELECT tablename,tableowner FROM pg_tables WHERE schemaname='public' ORDER BY tablename");
    assert.deepEqual(Object.fromEntries(ownership.rows.map(row=>[row.tablename,row.tableowner])),Object.fromEntries(['__drizzle_migrations','app_users','families','family_invitations','menu_recipes'].map(tablename=>[tablename,'mp_migrator'])));
    // This original provisioning verifier expects empty targets. It is not a
    // future populated-data migration runbook and requires separate authority.
    const counts = await runtime.query("SELECT (SELECT count(*) FROM families)::int AS families,(SELECT count(*) FROM app_users)::int AS users,(SELECT count(*) FROM family_invitations)::int AS invitations,(SELECT count(*) FROM menu_recipes)::int AS recipes");
    assert.deepEqual(counts.rows[0],{families:0,users:0,invitations:0,recipes:0});
    console.log(JSON.stringify({environment,projectId:resource.projectId,tls:'verified',restrictedRole:true,emptyDomainTables:true}));
  } finally { await runtime.end(); }
  for (const connection of [ownerUrl.href, runtimeUrl.href]) { const db=await openDatabase(connection); await db.close(); }
  const envPath = `.data/neon/${environment}.env`;
  await privateFile(envPath,false);
  const temporary = `${envPath}.${randomBytes(12).toString('hex')}`;
  await writeFile(temporary,`DATABASE_URL=${runtimeUrl.href}\nMIGRATION_DATABASE_URL=${ownerUrl.href}\n`,{mode:0o600,flag:'wx'});
  await rename(temporary,envPath);
  console.log(`${environment}: exact schema/history and direct/pooled access verified; private credentials saved.`);
}
main().catch((error: unknown) => {
  const code = error && typeof error === 'object' && 'code' in error && typeof error.code === 'string' ? error.code : 'VALIDATION';
  console.error(JSON.stringify({stage,code,error:'Hosted operation failed; credentials omitted'}));process.exitCode=1;
});
