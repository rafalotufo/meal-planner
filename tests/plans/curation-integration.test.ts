import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { test } from 'node:test';
import { readMigrationFiles } from 'drizzle-orm/migrator';
import { provisionFamily } from '../../lib/family-store.ts';
import { connectDatabase, openDatabase } from '../../lib/db/connection.ts';
import { migrateDatabase } from '../../lib/db/migrate.ts';
import { saveMenuRecipe, saveMenuRecipeUrl, claimMenuRecipeCuration, completeMenuRecipeCuration, listMenuRecipes } from '../../lib/menu/store.ts';
import { generateDuePlans } from '../../lib/plans/generate.ts';
import { actOnPlan, readPlans } from '../../lib/plans/store.ts';
import { testDatabase } from '../family/database.ts';
const identity = { googleSubject: 'combined-curation-plans', email: 'combined.member@gmail.com', emailVerified: true as const };
const allowed = [identity.email], now = new Date('2026-11-26T14:00:00Z');
const recipe = (name: string) => ({ title: name, sourceUrl: `https://example.test/${name}`, imageUrl: null, summary: 'Retained recipe details.', time: null });
const mainPrefix = [
  { hash: '22463e304a25ab4d43ded59a017f476ffc651e37f9c966903cc1bcc934afb597', folderMillis: 1795450000000 },
  { hash: '5b984dc2492fb0bfd85c7ee46620ad61c819c81da6db606620b1fb244be52ddd', folderMillis: 1795530000000 },
  { hash: 'f6a77d005618de16b22350df733f35674fc301ef638aa087ae5654efbfea035b', folderMillis: 1795620000000 },
  { hash: '1e8f7dc3ba0e3fc4912763e42f1677183b7ece0d88788942f397dda3e9b7d447', folderMillis: 1795706400000 },
];

test('main four-migration data/history upgrades additively to curation without changing existing rows', async () => {
  const fixture = await testDatabase(false), db = connectDatabase(fixture.url);
  try {
    const migrations = readMigrationFiles({ migrationsFolder: 'drizzle/postgresql' });
    assert.deepEqual(migrations.slice(0, 4).map(({ hash, folderMillis }) => ({ hash, folderMillis })), mainPrefix);
    assert.equal(migrations.length, 5); assert.ok(migrations[4].folderMillis > mainPrefix[3].folderMillis);
    await db.transaction(async tx => {
      await tx.execute('CREATE TABLE public.__drizzle_migrations (id integer PRIMARY KEY,hash text NOT NULL,created_at bigint NOT NULL)');
      await tx.execute('SET LOCAL search_path = public, pg_catalog, pg_temp');
      for (const [index, migration] of migrations.slice(0, 4).entries()) {
        for (const sql of migration.sql) await tx.execute(sql);
        await tx.execute('INSERT INTO __drizzle_migrations VALUES ($1,$2,$3)', [index, migration.hash, migration.folderMillis]);
      }
    }, 73462902);
    const family = randomUUID(), user = randomUUID(), plan = randomUUID(), menu = randomUUID();
    await db.execute('INSERT INTO families VALUES ($1,1)', [family]);
    await db.execute('INSERT INTO app_users (id,google_subject,verified_email,family_id,created_at) VALUES ($1,$2,$3,$4,1)', [user, identity.googleSubject, identity.email, family]);
    await db.execute('INSERT INTO menu_recipes (id,family_id,source_url,title,summary,saved_at) VALUES ($1,$2,$3,$4,$5,1)', [menu, family, recipe('existing').sourceUrl, 'Existing dinner', 'Keep these details.']);
    await db.execute('INSERT INTO family_invitations (id,family_id,created_by_user_id,recipient_email,token_hash,created_at,expires_at,status) VALUES ($1,$2,$3,$4,$5,1,1000,\'pending\')', [randomUUID(), family, user, 'invited@example.test', 'a'.repeat(64)]);
    await db.execute('INSERT INTO meal_plan_weeks (id,family_id,week_start,meals,created_at) VALUES ($1,$2,$3,$4,1)', [plan, family, '2026-11-29', JSON.stringify([recipe('existing')])]);
    await db.execute('INSERT INTO meal_plan_approvals (plan_id,user_id,revision,created_at) VALUES ($1,$2,1,1)', [plan, user]);
    await db.execute('INSERT INTO meal_plan_suggestions (id,plan_id,user_id,base_revision,day_index,menu_recipe_id,recipe,created_at) VALUES ($1,$2,$3,1,0,$4,$5,1)', [randomUUID(), plan, user, menu, JSON.stringify(recipe('suggested'))]);
    const tables = ['families', 'app_users', 'family_invitations', 'menu_recipes', 'meal_plan_weeks', 'meal_plan_approvals', 'meal_plan_suggestions', '__drizzle_migrations'];
    const before = await Promise.all(tables.map(table => db.all(`SELECT * FROM ${table}`)));
    await assert.rejects(openDatabase(fixture.url, { ownerTooling: true }), /Storage unavailable/);
    await migrateDatabase(fixture.url); await migrateDatabase(fixture.url);
    for (const [index, table] of tables.entries()) {
      const rows = await db.all(`SELECT * FROM ${table}${table === '__drizzle_migrations' ? ' WHERE id<4 ORDER BY id' : ''}`);
      assert.deepEqual(rows, before[index], table + ' rows preserved exactly');
    }
    assert.deepEqual(await db.all('SELECT * FROM menu_recipe_curations'), []);
    assert.equal((await db.one<{ n: number }>('SELECT count(*) AS n FROM __drizzle_migrations'))?.n, 5);
    const runtime = await openDatabase(fixture.url, { ownerTooling: true }); await runtime.close();
  } finally { await db.close(); await fixture.cleanup(); }
});

test('weekly generation excludes pending and failed links, then uses ready curation without regenerating a draft', async () => {
  const fixture = await testDatabase(), db = await fixture.open();
  try {
    await provisionFamily(db, identity, allowed, false);
    const pending = await saveMenuRecipeUrl(db, identity, allowed, recipe('pending').sourceUrl, Date.now() + 60000);
    const failed = await saveMenuRecipeUrl(db, identity, allowed, recipe('failed').sourceUrl, Date.now() + 60000);
    await db.execute("UPDATE menu_recipe_curations SET state='failed' WHERE entry_id=$1", [failed.entry.id]);
    assert.equal((await generateDuePlans(db, allowed, 'Thursday', now)).empty, 1, 'saved links alone are not curated dinners');
    const ready = await saveMenuRecipe(db, identity, allowed, recipe('legacy'));
    await generateDuePlans(db, allowed, 'Thursday', now);
    const original = (await readPlans(db, identity, allowed, {}, now)).plan!;
    assert.deepEqual(original.meals.map(meal => meal.sourceUrl), [ready.entry.recipe.sourceUrl]);
    const job = await claimMenuRecipeCuration(db, pending.entry.id, pending.generation!, allowed); assert.ok(job);
    assert.equal(await completeMenuRecipeCuration(db, job, allowed, recipe('pending')), true);
    await generateDuePlans(db, allowed, 'Thursday', now);
    assert.deepEqual((await readPlans(db, identity, allowed, {}, now)).plan, original, 'new metadata never silently regenerates an existing draft');
    await generateDuePlans(db, allowed, 'Thursday', new Date('2026-12-03T14:00:00Z'));
    const next = (await readPlans(db, identity, allowed, {}, new Date('2026-12-03T14:00:00Z'))).plan!;
    assert.deepEqual(new Set(next.meals.map(meal => meal.sourceUrl)), new Set([ready.entry.recipe.sourceUrl, pending.entry.recipe.sourceUrl]));
    assert.equal((await listMenuRecipes(db, identity, allowed)).entries.length, 3, 'unready links remain in the shared saved menu');
  } finally { await db.close(); await fixture.cleanup(); }
});

test('server suggestion and acceptance boundaries reject pending curation placeholders', async () => {
  const fixture = await testDatabase(), db = await fixture.open();
  try {
    const member = await provisionFamily(db, identity, allowed, false);
    await saveMenuRecipe(db, identity, allowed, recipe('legacy'));
    await generateDuePlans(db, allowed, 'Thursday', now);
    const plan = (await readPlans(db, identity, allowed, {}, now)).plan!;
    const pending = await saveMenuRecipeUrl(db, identity, allowed, recipe('pending').sourceUrl, Date.now() + 60000);
    await assert.rejects(actOnPlan(db, identity, allowed, plan.id, { action: 'suggest', revision: 1, day: 0, menuRecipeId: pending.entry.id }, now), { status: 409 });
    const user = await db.one<{ id: string }>('SELECT id FROM app_users WHERE google_subject=$1', [identity.googleSubject]); assert.ok(user); assert.ok(member);
    const suggestion = randomUUID();
    await db.execute('INSERT INTO meal_plan_suggestions (id,plan_id,user_id,base_revision,day_index,menu_recipe_id,recipe,created_at) VALUES ($1,$2,$3,1,0,$4,$5,1)', [suggestion, plan.id, user.id, pending.entry.id, JSON.stringify(pending.entry.recipe)]);
    await assert.rejects(actOnPlan(db, identity, allowed, plan.id, { action: 'accept', revision: 1, suggestionId: suggestion }, now), { status: 409 });
    assert.deepEqual((await readPlans(db, identity, allowed, {}, now)).plan, plan);
  } finally { await db.close(); await fixture.cleanup(); }
});
