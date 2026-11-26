import assert from 'node:assert/strict';
import { test } from 'node:test';
import { provisionFamily } from '../../lib/family-store.ts';
import { openDatabase } from '../../lib/db/connection.ts';
import { saveMenuRecipeUrl, retryMenuRecipeCuration, claimMenuRecipeCuration, completeMenuRecipeCuration, listMenuRecipes, removeMenuRecipe, saveMenuRecipe, updateMenuRecipeCategory, failMenuRecipeCuration } from '../../lib/menu/store.ts';
import { restrictedMenuDatabase } from './database.ts';

const identity = { googleSubject: 'curation-store-member', email: 'curation.member@gmail.com', emailVerified: true as const };
const allowed = [identity.email];
const source = 'https://example.test/recipe';
const recipe = { title: 'Lemon beans', sourceUrl: source, imageUrl: null, summary: 'Beans with lemon.', time: null };

test('URL save commits a durable pending link, first-save dedupe and fenced same-entry completion', async () => {
  const fixture = await restrictedMenuDatabase(); const owner = await fixture.open(); let db = await openDatabase(fixture.runtimeUrl);
  try {
    await provisionFamily(owner, identity, allowed, false);
    const saved = await saveMenuRecipeUrl(db, identity, allowed, source, Date.now() + 60000);
    assert.equal(saved.created, true); assert.equal(saved.entry.curation.state, 'pending'); assert.ok(saved.generation);
    await db.close(); db = await openDatabase(fixture.runtimeUrl);
    assert.equal((await listMenuRecipes(db, identity, allowed)).entries[0].id, saved.entry.id);
    const duplicate = await saveMenuRecipeUrl(db, identity, allowed, source, Date.now() + 60000);
    assert.equal(duplicate.created, false); assert.equal(duplicate.generation, undefined);
    assert.deepEqual((await saveMenuRecipe(db, identity, allowed, recipe)).entry, saved.entry);
    const job = await claimMenuRecipeCuration(db, saved.entry.id, saved.generation!, allowed);
    assert.ok(job); assert.equal(await claimMenuRecipeCuration(db, saved.entry.id, saved.generation!, allowed), null);
    assert.equal(await completeMenuRecipeCuration(db, job, allowed, recipe), true);
    const ready = (await listMenuRecipes(db, identity, allowed)).entries[0];
    assert.equal(ready.id, saved.entry.id); assert.equal(ready.savedAt, saved.entry.savedAt);
    assert.deepEqual(ready.recipe, { ...recipe, category: null }); assert.deepEqual(ready.curation, { state: 'ready', retryable: false });
    assert.equal((await retryMenuRecipeCuration(db, identity, allowed, ready.id, Date.now() + 60000)).started, false);
  } finally { await db.close(); await owner.close(); await fixture.cleanup(); }
});

test('expired work is read-only interrupted; one retry wins and removed/re-saved entries resist stale workers', async () => {
  const fixture = await restrictedMenuDatabase(); const db = await fixture.open();
  try {
    await provisionFamily(db, identity, allowed, false);
    const saved = await saveMenuRecipeUrl(db, identity, allowed, source, Date.now() + 60000);
    const stale = await claimMenuRecipeCuration(db, saved.entry.id, saved.generation!, allowed); assert.ok(stale);
    await db.execute('UPDATE menu_recipe_curations SET expires_at=$1 WHERE entry_id=$2', [Date.now() - 1, saved.entry.id]);
    assert.equal((await listMenuRecipes(db, identity, allowed)).entries[0].curation.state, 'interrupted');
    assert.equal((await db.one<{ state: string }>('SELECT state FROM menu_recipe_curations WHERE entry_id=$1', [saved.entry.id]))?.state, 'processing');
    const retries = await Promise.all(Array.from({ length: 5 }, () => retryMenuRecipeCuration(db, identity, allowed, saved.entry.id, Date.now() + 60000)));
    assert.equal(retries.filter(r => r.started).length, 1);
    assert.equal(await completeMenuRecipeCuration(db, stale, allowed, recipe), false);
    const current = retries.find(r => r.started)!;
    const job = await claimMenuRecipeCuration(db, saved.entry.id, current.generation!, allowed); assert.ok(job);
    await removeMenuRecipe(db, identity, allowed, saved.entry.id);
    const replacement = await saveMenuRecipeUrl(db, identity, allowed, source, Date.now() + 60000);
    assert.notEqual(replacement.entry.id, saved.entry.id);
    assert.equal(await completeMenuRecipeCuration(db, job, allowed, recipe), false);
    assert.equal((await listMenuRecipes(db, identity, allowed)).entries[0].curation.state, 'pending');
  } finally { await db.close(); await fixture.cleanup(); }
});

test('expired credentials and current admission loss cannot authorize background effects or updates', async () => {
  const fixture = await restrictedMenuDatabase(); const db = await fixture.open();
  try {
    await provisionFamily(db, identity, allowed, false);
    await assert.rejects(saveMenuRecipeUrl(db, identity, allowed, source, Date.now() - 1), { status: 401 });
    const saved = await saveMenuRecipeUrl(db, identity, allowed, source, Date.now() + 60000);
    assert.equal(await claimMenuRecipeCuration(db, saved.entry.id, saved.generation!, []), null);
    const retried = await retryMenuRecipeCuration(db, identity, allowed, saved.entry.id, Date.now() + 60000);
    const job = await claimMenuRecipeCuration(db, saved.entry.id, retried.generation!, allowed); assert.ok(job);
    assert.equal(await completeMenuRecipeCuration(db, job, [], recipe), false);
    assert.equal((await listMenuRecipes(db, identity, allowed)).entries[0].curation.state, 'failed');
  } finally { await db.close(); await fixture.cleanup(); }
});


test('manual category corrections survive pending completion, failed retry and both serialization orders', async () => {
  const fixture = await restrictedMenuDatabase(); const owner = await fixture.open(); const db = await openDatabase(fixture.runtimeUrl);
  try {
    await provisionFamily(owner, identity, allowed, false);
    for (const correctionFirst of [true, false]) {
      const saved = await saveMenuRecipeUrl(db, identity, allowed, source + '/' + correctionFirst, Date.now() + 60000);
      const job = await claimMenuRecipeCuration(db, saved.entry.id, saved.generation!, allowed); assert.ok(job);
      if (correctionFirst) await updateMenuRecipeCategory(db, identity, allowed, saved.entry.id, 'veggie');
      assert.equal(await completeMenuRecipeCuration(db, job, allowed, { ...recipe, sourceUrl: job.sourceUrl, category: 'main' }), true);
      if (!correctionFirst) await updateMenuRecipeCategory(db, identity, allowed, saved.entry.id, 'veggie');
      assert.equal((await listMenuRecipes(db, identity, allowed)).entries.find(entry => entry.id === saved.entry.id)?.recipe.category, 'veggie');
    }
    const saved = await saveMenuRecipeUrl(db, identity, allowed, source + '/failed', Date.now() + 60000);
    await failMenuRecipeCuration(db, saved.entry.id, saved.generation!);
    await updateMenuRecipeCategory(db, identity, allowed, saved.entry.id, 'side');
    const retry = await retryMenuRecipeCuration(db, identity, allowed, saved.entry.id, Date.now() + 60000);
    const job = await claimMenuRecipeCuration(db, saved.entry.id, retry.generation!, allowed); assert.ok(job);
    assert.equal(await completeMenuRecipeCuration(db, job, allowed, { ...recipe, sourceUrl: job.sourceUrl, category: 'main' }), true);
    assert.equal((await listMenuRecipes(db, identity, allowed)).entries.find(entry => entry.id === saved.entry.id)?.recipe.category, 'side');
  } finally { await db.close(); await owner.close(); await fixture.cleanup(); }
});
