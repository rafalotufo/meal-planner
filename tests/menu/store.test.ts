import assert from 'node:assert/strict';
import { test } from 'node:test';
import { randomUUID } from 'node:crypto';
import { provisionFamily } from '../../lib/family-store.ts';
import { openDatabase, type FamilyDatabase } from '../../lib/db/connection.ts';
import { listMenuRecipes, removeMenuRecipe, saveMenuRecipe } from '../../lib/menu/store.ts';
import { restrictedMenuDatabase } from './database.ts';

const identity = { googleSubject: 'menu-store-member', email: 'menu.test.member@gmail.com', emailVerified: true as const };
const allowed = [identity.email];
const recipe = { title: 'Lemon chickpeas', sourceUrl: 'https://example.test/recipe#method', imageUrl: 'https://images.example.test/photo.jpg', summary: 'Warm chickpeas and add lemon.', time: { kind: 'total' as const, text: '20 minutes' } };

test('saved snapshots survive a fresh runtime connection, retain their first values and deduplicate concurrent saves', async () => {
  const fixture = await restrictedMenuDatabase(); const owner = await fixture.open();
  let db = await openDatabase(fixture.runtimeUrl);
  try {
    await provisionFamily(owner, identity, allowed, false);
    const first = await saveMenuRecipe(db, identity, allowed, recipe);
    assert.equal(first.created, true);
    assert.equal(first.entry.recipe.sourceUrl, 'https://example.test/recipe');
    assert.equal(first.entry.recipe.imageUrl, recipe.imageUrl);
    await db.close(); db = await openDatabase(fixture.runtimeUrl);
    const duplicates = await Promise.all(Array.from({ length: 8 }, () => saveMenuRecipe(db, identity, allowed, { ...recipe, title: 'Changed text', imageUrl: null })));
    for (const saved of duplicates) { assert.equal(saved.created, false); assert.deepEqual(saved.entry, first.entry); }
    assert.deepEqual(await listMenuRecipes(db, identity, allowed), { entries: [first.entry], nextCursor: null });
    assert.deepEqual(await removeMenuRecipe(db, identity, allowed, first.entry.id), { removed: true });
    assert.deepEqual(await removeMenuRecipe(db, identity, allowed, first.entry.id), { removed: true });
    const replacement = await saveMenuRecipe(db, identity, allowed, recipe);
    assert.notEqual(replacement.entry.id, first.entry.id);
    await removeMenuRecipe(db, identity, allowed, first.entry.id);
    assert.deepEqual((await listMenuRecipes(db, identity, allowed)).entries, [replacement.entry]);
  } finally { await db.close(); await owner.close(); await fixture.cleanup(); }
});

test('every saved recipe remains reachable beyond 200 without count limits and deleted cursor rows remain valid positions', async () => {
  const fixture = await restrictedMenuDatabase(); const owner = await fixture.open(); const db = await openDatabase(fixture.runtimeUrl);
  try {
    await provisionFamily(owner, identity, allowed, false);
    const ids = new Set<string>();
    for (let index = 0; index < 203; index++) ids.add((await saveMenuRecipe(db, identity, allowed, { ...recipe, sourceUrl: `https://example.test/recipe/${index}` })).entry.id);
    const first = await listMenuRecipes(db, identity, allowed);
    assert.equal(first.entries.length, 50); assert.ok(first.nextCursor);
    const visited = new Set(first.entries.map(entry => entry.id));
    const boundary = first.entries.at(-1)!;
    await removeMenuRecipe(db, identity, allowed, boundary.id);
    let cursor: string | null = first.nextCursor;
    const sizes = [50];
    while (cursor) {
      const page = await listMenuRecipes(db, identity, allowed, cursor);
      sizes.push(page.entries.length);
      for (const entry of page.entries) { assert.equal(visited.has(entry.id), false); visited.add(entry.id); }
      cursor = page.nextCursor;
    }
    assert.deepEqual(sizes, [50, 50, 50, 50, 3]);
    assert.deepEqual(visited, ids);
    assert.equal((await owner.one<{ n: number }>('SELECT count(*) AS n FROM menu_recipes'))?.n, 202);
  } finally { await db.close(); await owner.close(); await fixture.cleanup(); }
});

test('invalid positions/snapshots cannot write and a transaction failure rolls removal back', async () => {
  const fixture = await restrictedMenuDatabase(); const db = await fixture.open();
  try {
    await provisionFamily(db, identity, allowed, false);
    await assert.rejects(saveMenuRecipe(db, identity, allowed, { ...recipe, familyId: randomUUID() }), { status: 400 });
    await assert.rejects(listMenuRecipes(db, identity, allowed, 'bad cursor'), { status: 400 });
    await assert.rejects(removeMenuRecipe(db, identity, allowed, 'bad-id'), { status: 400 });
    assert.equal((await db.one<{ n: number }>('SELECT count(*) AS n FROM menu_recipes'))?.n, 0);
    const saved = await saveMenuRecipe(db, identity, allowed, recipe);
    const failing = Object.create(db) as FamilyDatabase;
    failing.transaction = action => db.transaction(async tx => { await action(tx); throw new Error('test rollback'); });
    await assert.rejects(removeMenuRecipe(failing, identity, allowed, saved.entry.id), /test rollback/);
    assert.equal((await listMenuRecipes(db, identity, allowed)).entries[0].id, saved.entry.id);
    await db.execute('UPDATE menu_recipes SET source_url=$1 WHERE id=$2', ['javascript:alert(1)', saved.entry.id]);
    await assert.rejects(listMenuRecipes(db, identity, allowed), /Storage unavailable/);
  } finally { await db.close(); await fixture.cleanup(); }
});
