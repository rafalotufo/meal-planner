import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createHash, randomUUID } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { compatibility } from '../../lib/db/compatibility.ts';
import { migrateDatabase } from '../../lib/db/migrate.ts';
import { openDatabase, connectDatabase } from '../../lib/db/connection.ts';
import { repositorySources } from '../../lib/db/repository-migrations.ts';
import { testDatabase } from '../family/database.ts';
import { restrictedMenuDatabase } from '../menu/database.ts';

const migrationId = 'fe5c2ee0-bf7f-464e-93be-2d654b4001e8';
function historicalManifest() {
  const old = structuredClone(compatibility);
  old.migrations = old.migrations.filter(row => row.id !== migrationId);
  old.required = old.required.filter(id => id !== migrationId);
  old.profiles = old.profiles.filter(row => !row.applied.includes(migrationId));
  return old;
}
async function seedRun(db: ReturnType<typeof connectDatabase>) {
  const familyId = randomUUID(), runId = randomUUID(), memberId = randomUUID(), now = Date.now();
  await db.execute("INSERT INTO families(id,created_at,identity_kind) VALUES($1,$2,'verification')", [familyId, now]);
  await db.execute("INSERT INTO verification_runs(id,family_id,project_id,deployment_id,source_sha,profile_sha256,origin,database_identity,created_at,expires_at,scope) VALUES($1,$2,'test-project','test-deployment',$3,$4,'https://staging.example.test',$4,$5,$6,'app')", [runId, familyId, 'a'.repeat(40), 'b'.repeat(64), now, now + 1800000]);
  await db.execute("INSERT INTO app_users(id,family_id,created_at,identity_kind,verification_run_id) VALUES($1,$2,$3,'verification',$4)", [memberId, familyId, now, runId]);
  return { familyId, runId, memberId, now };
}

test('verification migration is one immutable native descriptor after both terminal migrations', async () => {
  const row = compatibility.migrations.find(row => row.id === migrationId);
  assert.ok(row, 'approved verification migration must be present');
  assert.equal(row.file, `${migrationId}.sql`);
  assert.equal(row.legacy, undefined);
  assert.deepEqual([...row.dependsOn].sort(), ['1f2a959a-4e7b-44dd-bc5a-6c6f2361cb07', 'e81c2de0-8b02-4136-b06b-a13b31ea304e'].sort());
  assert.equal(createHash('sha256').update(await readFile(`drizzle/postgresql/${row.file}`)).digest('hex'), row.hash);
});

test('verification upgrade preserves historical ledger and Google data; repeat/concurrent runs are stable', async () => {
  const fixture = await testDatabase(false), db = connectDatabase(fixture.url);
  try {
    await migrateDatabase(fixture.url, { manifest: historicalManifest(), sources: repositorySources() });
    await db.execute("INSERT INTO families(id,created_at) VALUES('preserved-family',1)");
    await db.execute("INSERT INTO app_users(id,google_subject,verified_email,family_id,created_at) VALUES('preserved-user','preserved-subject','preserved@example.test','preserved-family',1)");
    const ledger = await db.all('SELECT * FROM __drizzle_migrations ORDER BY id');
    await Promise.all([migrateDatabase(fixture.url), migrateDatabase(fixture.url)]);
    assert.deepEqual(await db.all('SELECT * FROM __drizzle_migrations ORDER BY id'), ledger);
    assert.deepEqual(await db.one('SELECT id,google_subject,verified_email,family_id,identity_kind,verification_run_id FROM app_users WHERE id=$1', ['preserved-user']), { id: 'preserved-user', google_subject: 'preserved-subject', verified_email: 'preserved@example.test', family_id: 'preserved-family', identity_kind: 'google', verification_run_id: null });
    assert.equal((await db.one<{ n: number }>('SELECT count(*)::integer AS n FROM __app_migrations WHERE id=$1', [migrationId]))?.n, 1);
    await assert.rejects(openDatabase(fixture.url, { manifest: historicalManifest(), ownerTooling: true }), { message: 'Storage unavailable' });
  } finally { await db.close(); await fixture.cleanup(); }
});

test('verification schema rejects Google-null bypass, mixed household kinds and cross-run credentials', async () => {
  const fixture = await testDatabase(), db = await fixture.open();
  try {
    const a = await seedRun(db), b = await seedRun(db);
    await assert.rejects(db.execute("INSERT INTO app_users(id,family_id,created_at) VALUES($1,$2,1)", [randomUUID(), a.familyId]));
    await assert.rejects(db.execute("INSERT INTO app_users(id,family_id,created_at,identity_kind,verification_run_id,google_subject) VALUES($1,$2,1,'verification',$3,'fake-google')", [randomUUID(), a.familyId, a.runId]));
    await assert.rejects(db.execute("INSERT INTO app_users(id,family_id,created_at,identity_kind,verification_run_id) VALUES($1,$2,1,'verification',$3)", [randomUUID(), a.familyId, b.runId]));
    await assert.rejects(db.execute("INSERT INTO app_users(id,family_id,created_at,google_subject,verified_email) VALUES($1,$2,1,'subject','allowed@example.test')", [randomUUID(), a.familyId]));
    await assert.rejects(db.execute('INSERT INTO verification_capabilities(digest,run_id,member_id,created_at,expires_at) VALUES($1,$2,$3,$4,$5)', ['a'.repeat(64), a.runId, b.memberId, a.now, a.now + 1000]));
    await assert.rejects(db.execute('INSERT INTO verification_sessions(digest,run_id,member_id,created_at,expires_at) VALUES($1,$2,$3,$4,$5)', ['a'.repeat(64), a.runId, b.memberId, a.now, a.now + 1000]));
    await assert.rejects(db.execute('INSERT INTO verification_capabilities(digest,run_id,member_id,created_at,expires_at) VALUES($1,$2,$3,$4,$5)', ['a'.repeat(64), a.runId, a.memberId, a.now, a.now + 300001]));
    await assert.rejects(db.execute('INSERT INTO verification_sessions(digest,run_id,member_id,created_at,expires_at) VALUES($1,$2,$3,$4,$5)', ['a'.repeat(64), a.runId, a.memberId, a.now, a.now + 900001]));
    await db.execute('INSERT INTO verification_capabilities(digest,run_id,member_id,created_at,expires_at) VALUES($1,$2,$3,$4,$5)', ['a'.repeat(64), a.runId, a.memberId, a.now, a.now + 1000]);
  } finally { await db.close(); await fixture.cleanup(); }
});

test('runtime cannot create or retag verification members and only receives reviewed column privileges', async () => {
  const fixture = await restrictedMenuDatabase(), owner = await fixture.open(), runtime = await openDatabase(fixture.runtimeUrl);
  try {
    const a = await seedRun(owner);
    for (const [sql, values] of [
      ["INSERT INTO families(id,created_at,identity_kind) VALUES($1,1,'verification')", [randomUUID()]],
      ["INSERT INTO app_users(id,family_id,created_at,identity_kind,verification_run_id) VALUES($1,$2,1,'verification',$3)", [randomUUID(), a.familyId, a.runId]],
      ["UPDATE app_users SET identity_kind='google' WHERE id=$1", [a.memberId]],
      ['UPDATE verification_runs SET revoked_at=$1 WHERE id=$2', [Date.now(), a.runId]],
    ] as const) await assert.rejects(runtime.execute(sql, values));
    await runtime.execute("INSERT INTO families(id,created_at) VALUES('runtime-google',1)");
    await runtime.execute("INSERT INTO app_users(id,google_subject,verified_email,family_id,created_at) VALUES('runtime-google','runtime-subject','runtime@example.test','runtime-google',1)");
    await runtime.execute("UPDATE app_users SET verified_email='changed@example.test' WHERE id='runtime-google'");
    await assert.rejects(runtime.execute("UPDATE app_users SET google_subject='different' WHERE id='runtime-google'"));
    await owner.execute('GRANT INSERT ON app_users TO mp_runtime');
    await assert.rejects(openDatabase(fixture.runtimeUrl), { message: 'Storage unavailable' });
  } finally { await runtime.close(); await owner.close(); await fixture.cleanup(); }
});

test('failed native verification execution preserves pre-upgrade catalog and historical rows', async () => {
  const fixture = await testDatabase(false), db = connectDatabase(fixture.url);
  try {
    const old = historicalManifest();
    await migrateDatabase(fixture.url, { manifest: old, sources: repositorySources() });
    const manifest = structuredClone(compatibility), sources = repositorySources();
    const descriptor = manifest.migrations.find(row => row.id === migrationId)!;
    const broken = `${sources.get(migrationId)}\n--> statement-breakpoint\nSELECT 1/0;`;
    descriptor.hash = createHash('sha256').update(broken).digest('hex'); sources.set(migrationId, broken);
    const ledger = await db.all('SELECT * FROM __drizzle_migrations ORDER BY id');
    await assert.rejects(migrateDatabase(fixture.url, { manifest, sources }));
    assert.deepEqual(await db.all('SELECT * FROM __drizzle_migrations ORDER BY id'), ledger);
    assert.equal((await db.one<{ absent: boolean }>("SELECT to_regclass('public.verification_runs') IS NULL AS absent"))?.absent, true);
    const opened = await openDatabase(fixture.url, { manifest: old, ownerTooling: true }); await opened.close();
  } finally { await db.close(); await fixture.cleanup(); }
});
