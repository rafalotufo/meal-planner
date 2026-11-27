import assert from 'node:assert/strict';
import { test } from 'node:test';
import { randomUUID, createHash } from 'node:crypto';
import { compatibility } from '../../lib/db/compatibility.ts';
import { repositorySources } from '../../lib/db/repository-migrations.ts';
import { migrateDatabase } from '../../lib/db/migrate.ts';
import { openDatabase, connectDatabase as connectDatabaseForTooling } from '../../lib/db/connection.ts';
import { descriptorDigest, diagnostic, type CompatibilityManifest, type MigrationDescriptor } from '../../lib/db/migration-graph.ts';
import { testDatabase } from '../family/database.ts';
import { restrictedMenuDatabase } from '../menu/database.ts';

function nativeContract(sql: string) {
  const manifest: CompatibilityManifest = structuredClone(compatibility);
  const row: MigrationDescriptor = { id: randomUUID(), file: '', hash: createHash('sha256').update(sql).digest('hex'), dependsOn: [...manifest.required] };
  row.file = `${row.id}.sql`;
  manifest.migrations.push(row); manifest.required.push(row.id);
  manifest.profiles.push({ ...structuredClone(manifest.profiles.at(-1)!), applied: [...manifest.required] });
  const sources = repositorySources(); sources.set(row.id, sql);
  return { manifest, sources, row };
}
test('native identities record executed SQL only, repeat/concurrent safely and reject changed checksum/digest', async () => {
  const fixture = await testDatabase(); const db = await fixture.open();
  const contract = nativeContract('SELECT 1;');
  try {
    const legacy = await db.all('SELECT * FROM public.__drizzle_migrations ORDER BY id');
    const nativeBefore = await db.all('SELECT * FROM public.__app_migrations ORDER BY id');
    await Promise.all([migrateDatabase(fixture.url, contract), migrateDatabase(fixture.url, contract)]);
    assert.deepEqual(await db.all('SELECT * FROM public.__drizzle_migrations ORDER BY id'), legacy);
    assert.deepEqual(await db.all('SELECT * FROM public.__app_migrations ORDER BY id'), [...nativeBefore, { id: contract.row.id, hash: contract.row.hash, descriptor_hash: descriptorDigest(contract.row) }].sort((a,b)=>String(a.id).localeCompare(String(b.id))));
    const knownButUnapproved=structuredClone(contract.manifest); knownButUnapproved.required=[...compatibility.required]; knownButUnapproved.profiles=structuredClone(compatibility.profiles);
    await assert.rejects(migrateDatabase(fixture.url,{...contract,manifest:knownButUnapproved}),/database-ahead/);
    await db.execute("UPDATE public.__app_migrations SET descriptor_hash=repeat('a',64) WHERE id=$1", [contract.row.id]);
    await assert.rejects(migrateDatabase(fixture.url, contract), /conflicting-identity/);
    await db.execute('UPDATE public.__app_migrations SET descriptor_hash=$1,hash=$2 WHERE id=$3', [descriptorDigest(contract.row),'b'.repeat(64),contract.row.id]);
    await assert.rejects(migrateDatabase(fixture.url, contract), /checksum-mismatch/);
    await assert.rejects(migrateDatabase(fixture.url), /database-ahead/);
  } finally { await db.close(); await fixture.cleanup(); }
});
test('failed native SQL rolls back both schema and newly-created ledger', async () => {
  const fixture = await testDatabase(false); const db = connectDatabaseForTooling(fixture.url);
  const historical = structuredClone(compatibility);
  historical.migrations = historical.migrations.filter(row => row.legacy); historical.required = historical.migrations.map(row => row.id);
  historical.profiles = historical.profiles.filter(row => row.applied.every(id => historical.required.includes(id)));
  await migrateDatabase(fixture.url, {manifest:historical,sources:repositorySources()});
  const contract = nativeContract('CREATE TABLE public.rollback_probe (id integer);\n--> statement-breakpoint\nSELECT 1/0;');
  try {
    const before = await db.all('SELECT * FROM public.__drizzle_migrations ORDER BY id');
    await assert.rejects(migrateDatabase(fixture.url, contract), /execution-failure/);
    assert.deepEqual(await db.one("SELECT to_regclass('public.rollback_probe')::text AS probe,to_regclass('public.__app_migrations')::text AS ledger"), {probe:null,ledger:null});
    assert.deepEqual(await db.all('SELECT * FROM public.__drizzle_migrations ORDER BY id'), before);
  } finally { await db.close(); await fixture.cleanup(); }
});

for (const [name, sql] of [
  ['function', "CREATE FUNCTION public.unreviewed() RETURNS integer LANGUAGE SQL SECURITY DEFINER AS 'SELECT 1'"],
  ['disabled trigger', "CREATE FUNCTION public.unreviewed() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RETURN NEW; END $$; CREATE TRIGGER unreviewed BEFORE INSERT ON public.app_users FOR EACH ROW EXECUTE FUNCTION public.unreviewed(); ALTER TABLE public.app_users DISABLE TRIGGER unreviewed"],
  ['rewrite rule', 'CREATE RULE unreviewed_delete AS ON DELETE TO public.menu_recipes DO INSTEAD NOTHING'],
  ['RLS', 'ALTER TABLE public.app_users ENABLE ROW LEVEL SECURITY; ALTER TABLE public.app_users FORCE ROW LEVEL SECURITY'],
  ['policy', "CREATE POLICY unreviewed ON public.app_users AS RESTRICTIVE FOR SELECT USING (false)"],
  ['unvalidated constraint', 'ALTER TABLE public.app_users ADD CONSTRAINT extra_guard CHECK (created_at>=0) NOT VALID'],
  ['ordinary column option', 'ALTER TABLE public.app_users ALTER COLUMN google_subject SET (n_distinct=42)'],
  ['collation', 'ALTER TABLE public.app_users ALTER COLUMN google_subject TYPE text COLLATE "C"'],
  ['domain', 'CREATE DOMAIN public.unexplained AS text'],
  ['absent native ledger PK lookalike', 'DROP TABLE public.__app_migrations; CREATE INDEX __app_migrations_pkey ON public.menu_recipes(family_id)'],
  ['quoted ledger-prefix index', 'CREATE UNIQUE INDEX "__app_migrations.hidden" ON public.menu_recipes(family_id)'],
  ['quoted ledger-prefix table', 'CREATE TABLE public."__app_migrations.hidden" (id integer)'],
  ['prefix lookalike', 'CREATE TABLE public.__app_migrations_backdoor (id integer)'],
  ['PUBLIC grant', 'GRANT SELECT ON public.app_users TO PUBLIC'],
  ['column grant', 'GRANT UPDATE(source_url) ON public.menu_recipes TO mp_runtime'],
  ['grant option', 'GRANT SELECT ON public.app_users TO mp_runtime WITH GRANT OPTION'],
  ['ledger write grant', 'GRANT INSERT ON public.__drizzle_migrations TO mp_runtime'],
  ['default grant', 'ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO mp_runtime'],
] as const) {
  test(`unapproved ${name} rejected by readonly runtime and explicit migration without repair`, async () => {
    const fixture = await restrictedMenuDatabase(); const db = await fixture.open();
    try {
      await db.execute(sql);
      await assert.rejects(openDatabase(fixture.runtimeUrl), {message:'Storage unavailable'});
      await assert.rejects(migrateDatabase(fixture.url));
    } finally { await db.close(); await fixture.cleanup(); }
  });
}
test('ledger view rejected before nontransactional sequence effects', async () => {
  const fixture = await testDatabase(); const db = await fixture.open();
  try {
    await db.execute("ALTER TABLE public.__drizzle_migrations RENAME TO original_ledger; CREATE SEQUENCE public.ledger_probe; CREATE VIEW public.__drizzle_migrations AS SELECT nextval('public.ledger_probe')::integer AS id,hash,created_at FROM public.original_ledger");
    await assert.rejects(migrateDatabase(fixture.url), /incompatible-schema/);
    assert.equal((await db.one<{is_called:boolean}>('SELECT is_called FROM public.ledger_probe'))?.is_called,false);
  } finally { await db.close(); await fixture.cleanup(); }
});
test('older required profile reads and writes approved newer schema with restricted role; runtime never migrates', async () => {
  const fixture = await restrictedMenuDatabase(); const owner = await fixture.open();
  const older = structuredClone(compatibility); older.required.pop();
  try {
    const before = await owner.all('SELECT * FROM public.__drizzle_migrations ORDER BY id');
    const nativeBefore = await owner.all('SELECT * FROM public.__app_migrations ORDER BY id');
    const db = await openDatabase(fixture.runtimeUrl, {manifest:older});
    try {
      const family = randomUUID(), user = randomUUID(), menu = randomUUID(), week = randomUUID();
      await db.transaction(async tx => {
        await tx.execute('INSERT INTO public.families VALUES ($1,1)',[family]);
        await tx.execute("INSERT INTO public.app_users (id,google_subject,verified_email,family_id,created_at) VALUES ($1,$2,'older@example.test',$3,1)",[user,randomUUID(),family]);
        await tx.execute("INSERT INTO public.menu_recipes (id,family_id,source_url,title,summary,saved_at) VALUES ($1,$2,'https://example.test/older','Older recipe','Cook.',1)",[menu,family]);
        await tx.execute("INSERT INTO public.meal_plan_weeks (id,family_id,week_start,meals,created_at) VALUES ($1,$2,'2026-11-29',$3,1)",[week,family,JSON.stringify([{title:'Older recipe',sourceUrl:'https://example.test/older',imageUrl:null,summary:'Cook.',time:null}])]);
      });
      assert.equal((await db.one<{id:string}>('SELECT id FROM public.menu_recipes WHERE id=$1',[menu]))?.id,menu);
      assert.equal((await db.one<{id:string}>('SELECT id FROM public.meal_plan_weeks WHERE id=$1',[week]))?.id,week);
      await assert.rejects(db.one("INSERT INTO public.families VALUES ('readonly-one',1) RETURNING id"), {code:'25006'});
      await db.transaction(async tx => { assert.equal((await tx.one<{id:string}>("INSERT INTO public.families VALUES ('explicit-returning',1) RETURNING id"))?.id,'explicit-returning'); });
    } finally { await db.close(); }
    assert.deepEqual(await owner.all('SELECT * FROM public.__drizzle_migrations ORDER BY id'),before);
    assert.deepEqual(await owner.all('SELECT * FROM public.__app_migrations ORDER BY id'),nativeBefore);
    await assert.rejects(openDatabase(fixture.url), {message:'Storage unavailable'}, 'runtime cannot auto-detect owner bypass');
  } finally { await owner.close(); await fixture.cleanup(); }
});
test('diagnostics expose only closed reason codes without raw connection errors', () => {
  for (const [code,reason] of [['ECONNREFUSED','connection-failure'],['42501','permission-failure'],['XX000','execution-failure']]) {
    const message=diagnostic({code,message:'postgresql://secret:credential@private/database'}).message;
    assert.match(message,new RegExp(reason)); assert.doesNotMatch(message,/secret|credential|private|database\//);
  }
});

test('older migration-requirement application with semantic curation backport excludes unready plan inputs', async () => {
  const { provisionFamily } = await import('../../lib/family-store.ts');
  const { saveMenuRecipe, saveMenuRecipeUrl } = await import('../../lib/menu/store.ts');
  const { generateDuePlans } = await import('../../lib/plans/generate.ts');
  const { readPlans, actOnPlan } = await import('../../lib/plans/store.ts');
  const fixture=await restrictedMenuDatabase(), older=structuredClone(compatibility); older.required.pop();
  const db=await openDatabase(fixture.runtimeUrl,{manifest:older});
  const identity={googleSubject:'compatible-older-profile',email:'older.profile@gmail.com',emailVerified:true as const};
  const allowed=[identity.email],now=new Date('2026-11-26T14:00:00Z');
  try {
    await provisionFamily(db,identity,allowed,false);
    const pending=await saveMenuRecipeUrl(db,identity,allowed,'https://example.test/pending-older',Date.now()+60000);
    await saveMenuRecipe(db,identity,allowed,{title:'Ready recipe',sourceUrl:'https://example.test/ready-older',imageUrl:null,summary:'Cook.',time:null,category:'main'});
    await generateDuePlans(db,allowed,'Thursday',now);
    const plan=(await readPlans(db,identity,allowed,{},now)).plan!;
    assert.deepEqual(plan.meals.map(row=>row.sourceUrl),['https://example.test/ready-older']);
    await assert.rejects(actOnPlan(db,identity,allowed,plan.id,{action:'suggest',revision:1,day:0,menuRecipeId:pending.entry.id},now),{status:409});
  } finally { await db.close();await fixture.cleanup(); }
});

test('database CREATE grant and unsupported collation object are rejected', async () => {
  for (const mutate of [async (db: Awaited<ReturnType<typeof openDatabase>>, url:string) => {
    const name=new URL(url).pathname.slice(1); assert.match(name,/^mp_test_[a-f0-9]{24}$/);
    await db.execute(`GRANT CREATE ON DATABASE "${name}" TO mp_runtime`);
  },async (db: Awaited<ReturnType<typeof openDatabase>>) => { await db.execute('CREATE COLLATION public.unreviewed FROM "C"'); }]) {
    const fixture=await restrictedMenuDatabase(),db=await fixture.open();
    try { await mutate(db,fixture.url); await assert.rejects(openDatabase(fixture.runtimeUrl),{message:'Storage unavailable'}); await assert.rejects(migrateDatabase(fixture.url)); }
    finally {await db.close();await fixture.cleanup();}
  }
});

test('native SQL dependencies execute CREATE before dependent INSERT despite reverse manifest order', async () => {
  const fixture=await testDatabase(),db=await fixture.open();
  const manifest=structuredClone(compatibility),sources=repositorySources();
  const parentSql='CREATE TABLE public.native_parent (id integer PRIMARY KEY);',childSql='INSERT INTO public.native_parent VALUES (7);';
  const parent: MigrationDescriptor={id:randomUUID(),file:'',hash:createHash('sha256').update(parentSql).digest('hex'),dependsOn:[...manifest.required]};parent.file=`${parent.id}.sql`;
  const child: MigrationDescriptor={id:randomUUID(),file:'',hash:createHash('sha256').update(childSql).digest('hex'),dependsOn:[parent.id]};child.file=`${child.id}.sql`;
  manifest.migrations.push(child,parent);manifest.required.push(child.id,parent.id);
  const profile=structuredClone(manifest.profiles.at(-1)!);
  profile.applied=[...manifest.required];profile.grants.native_parent=['SELECT'];
  profile.catalog.push(
    {kind:'column',name:'native_parent.id',definition:'integer:true:'},
    {kind:'constraint',name:'native_parent.native_parent_pkey',definition:'PRIMARY KEY (id)'},
    {kind:'index',name:'native_parent_pkey',definition:'CREATE UNIQUE INDEX native_parent_pkey ON public.native_parent USING btree (id)'},
    {kind:'relation',name:'native_parent',definition:'r:false:false'},
    {kind:'relation',name:'native_parent_pkey',definition:'i:false:false'},
  );
  profile.catalog.sort((a,b)=>a.kind===b.kind?(a.name<b.name?-1:a.name>b.name?1:0):(a.kind<b.kind?-1:1));
  manifest.profiles.push(profile);sources.set(parent.id,parentSql);sources.set(child.id,childSql);
  try {
    await migrateDatabase(fixture.url,{manifest,sources});
    assert.deepEqual(await db.all('SELECT * FROM public.native_parent'),[{id:7}]);
    assert.equal((await db.one<{n:number}>('SELECT count(*) AS n FROM public.__app_migrations'))?.n,compatibility.migrations.filter(row=>!row.legacy).length+2);
    await migrateDatabase(fixture.url,{manifest,sources});
    assert.deepEqual(await db.all('SELECT * FROM public.native_parent'),[{id:7}]);
    const opened=await openDatabase(fixture.url,{manifest,ownerTooling:true});await opened.close();
  } finally {await db.close();await fixture.cleanup();}
});

test('read-only diagnostic command sanitizes connection, checksum and permission failures', async () => {
  const {spawnSync}=await import('node:child_process');
  const fixture=await restrictedMenuDatabase(),db=await fixture.open();
  try {
    const run=(url:string)=>spawnSync(process.execPath,['--import','tsx','scripts/check-db.ts'],{env:{...process.env,DATABASE_URL:url},encoding:'utf8'});
    let result=run('postgresql://sensitive:credential@127.0.0.1:1/unavailable');
    assert.equal(result.status,1);assert.match(result.stderr,/connection-failure/);assert.doesNotMatch(result.stderr,/sensitive|credential|127\.0\.0\.1|ECONNREFUSED/);
    const before=await db.all('SELECT * FROM public.__drizzle_migrations ORDER BY id');
    result=run(fixture.runtimeUrl);assert.equal(result.status,0);assert.equal(result.stderr,'');
    assert.deepEqual(await db.all('SELECT * FROM public.__drizzle_migrations ORDER BY id'),before);
    await db.execute('REVOKE SELECT ON public.app_users FROM mp_runtime');
    result=run(fixture.runtimeUrl);assert.equal(result.status,1);assert.match(result.stderr,/permission-failure/);
    await db.execute('GRANT SELECT ON public.app_users TO mp_runtime');
    await db.execute("UPDATE public.__drizzle_migrations SET hash=repeat('f',64) WHERE id=0");
    result=run(fixture.runtimeUrl);assert.equal(result.status,1);assert.match(result.stderr,/checksum-mismatch/);
  } finally {await db.close();await fixture.cleanup();}
});


test('applied child without its recorded prerequisite fails missing-dependency', async () => {
  const fixture=await testDatabase(),db=await fixture.open();
  try {
    await db.execute('DELETE FROM public.__drizzle_migrations WHERE id=2');
    await assert.rejects(migrateDatabase(fixture.url),/missing-dependency/);
    await assert.rejects(openDatabase(fixture.url,{ownerTooling:true}),{message:'Storage unavailable'});
  } finally {await db.close();await fixture.cleanup();}
});

test('safe local search path prevents temporary table shadowing and standalone failures roll back', async () => {
  const fixture=await restrictedMenuDatabase(),db=await openDatabase(fixture.runtimeUrl),owner=await fixture.open();
  try {
    const target=await owner.one<{name:string;owner:string;actor:string}>('SELECT current_database() AS name,pg_get_userbyid(datdba) AS owner,current_user AS actor FROM pg_database WHERE datname=current_database()');
    assert.ok(target);assert.match(target.name,/^mp_test_[a-f0-9]{24}$/);assert.equal(target.owner,'mp_test');assert.equal(target.actor,'mp_test');
    const tempAllowed=async()=>(await db.one<{allowed:boolean}>("SELECT has_database_privilege(current_user,current_database(),'TEMP') AS allowed"))?.allowed;
    assert.equal(await tempAllowed(),false,'ordinary restricted runtime has no TEMP');
    // Deliberately arrange only this owned attack fixture's capability, then
    // restore denial even if the shadowing assertions fail. No shared ACL changes.
    await owner.execute(`GRANT TEMP ON DATABASE "${target.name}" TO mp_runtime`);
    try {
      await db.transaction(async tx=>{
        await tx.execute('CREATE TEMPORARY TABLE app_users (unexpected text) ON COMMIT DROP');
        assert.deepEqual(await tx.all('SELECT google_subject FROM app_users'),[],'public application table precedes pg_temp');
        assert.equal((await tx.one<{path:string}>("SELECT current_setting('search_path') AS path"))?.path,'pg_catalog, public, pg_temp');
      });
    } finally {
      await owner.execute(`REVOKE TEMP ON DATABASE "${target.name}" FROM mp_runtime`);
      assert.equal(await tempAllowed(),false,'owned attack fixture restores runtime TEMP denial');
    }
    await assert.rejects(db.execute("INSERT INTO public.families VALUES ('atomic-failure',1); SELECT 1/0"),{code:'22012'});
    assert.equal(await db.one("SELECT id FROM public.families WHERE id='atomic-failure'"),undefined);
  } finally {await db.close();await owner.close();await fixture.cleanup();}
});


test('postcommit runtime credential failure reports committed stage and sanitized permission reason', async () => {
  const {spawnSync}=await import('node:child_process');
  const fixture=await testDatabase(false),db=connectDatabaseForTooling(fixture.url);
  try {
    const runtime=new URL(fixture.url);runtime.username='mp_runtime';runtime.password=randomUUID();
    const result=spawnSync(process.execPath,['--import','tsx','scripts/migrate-db.ts'],{env:{...process.env,MIGRATION_DATABASE_URL:fixture.url,DATABASE_URL:runtime.href,OPENAI_API_KEY:''},encoding:'utf8'});
    assert.equal(result.status,1);assert.equal(result.stdout,'');
    assert.match(result.stderr,/Migrations committed; runtime verification failed/);assert.match(result.stderr,/permission-failure/);
    assert.doesNotMatch(result.stderr,/sensitive-wrong|postgresql:|28P01|password authentication failed|mp_runtime/);
    assert.equal((await db.one<{n:number}>('SELECT count(*) AS n FROM public.__drizzle_migrations'))?.n,5,'schema and ledger committed before credential smoke');
  } finally {await db.close();await fixture.cleanup();}
});
