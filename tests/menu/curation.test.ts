import assert from 'node:assert/strict';
import { test } from 'node:test';
import { provisionFamily } from '../../lib/family-store.ts';
import { createMenuCurator, registerMenuCuration } from '../../lib/menu/curation.ts';
import { listMenuRecipes, saveMenuRecipeUrl } from '../../lib/menu/store.ts';
import { restrictedMenuDatabase } from './database.ts';
const identity = { googleSubject: 'curation-worker', email: 'worker@gmail.com', emailVerified: true as const }, allowed = [identity.email];
const html = '<script type="application/ld+json">{"@type":"Recipe","name":"Lemon beans","description":"Cook beans."}</script>';

test('worker parses source metadata and releases capacity after failed acquisition', async () => {
  const fixture = await restrictedMenuDatabase(); const db = await fixture.open();
  try {
    await provisionFamily(db, identity, allowed, false);
    const curator = createMenuCurator({ loadHtml: async source => source.endsWith('/fail') ? null : html });
    const failed = await saveMenuRecipeUrl(db, identity, allowed, 'https://example.test/fail', Date.now() + 60000);
    assert.equal(await curator(db, failed.entry.id, failed.generation!, allowed), false);
    const saved = await saveMenuRecipeUrl(db, identity, allowed, 'https://example.test/ready', Date.now() + 60000);
    assert.equal(await curator(db, saved.entry.id, saved.generation!, allowed), true);
    const entries = (await listMenuRecipes(db, identity, allowed)).entries;
    assert.equal(entries.find(e => e.id === failed.entry.id)?.curation.state, 'failed');
    assert.equal(entries.find(e => e.id === saved.entry.id)?.recipe.title, 'Lemon beans');
  } finally { await db.close(); await fixture.cleanup(); }
});

test('two non-waiting worker slots bound publisher effects; a late admission loss blocks metadata update', async () => {
  const fixture = await restrictedMenuDatabase(); const db = await fixture.open();
  try {
    await provisionFamily(db, identity, allowed, false);
    const tasks = await Promise.all([0, 1, 2].map(i => saveMenuRecipeUrl(db, identity, allowed, `https://example.test/${i}`, Date.now() + 60000)));
    let release!: () => void, entered = 0;
    const barrier = new Promise<void>(resolve => { release = resolve; });
    const curator = createMenuCurator({ loadHtml: async () => { entered++; await barrier; return html; } });
    const running = tasks.slice(0, 2).map(t => curator(db, t.entry.id, t.generation!, allowed));
    while (entered < 2) await new Promise(resolve => setTimeout(resolve, 5));
    assert.equal(await curator(db, tasks[2].entry.id, tasks[2].generation!, allowed), false);
    assert.equal(entered, 2);
    await db.execute('UPDATE app_users SET verified_email=$1 WHERE google_subject=$2', ['changed@gmail.com', identity.googleSubject]);
    release();
    assert.deepEqual(await Promise.all(running), [false, false]);
    assert.equal((await db.one<{ n: number }>("SELECT count(*) AS n FROM menu_recipe_curations WHERE state='failed'"))?.n, 3);
  } finally { await db.close(); await fixture.cleanup(); }
});

test('worker deadline abort is propagated instead of accepted as unavailable metadata, and capacity is reusable', async () => {
  const fixture = await restrictedMenuDatabase(); const db = await fixture.open();
  try {
    await provisionFamily(db, identity, allowed, false);
    const curator = createMenuCurator({ loadHtml: async (source, { signal }) => {
      if (source.endsWith('/ready-after-abort')) return html;
      return new Promise<null>(resolve => signal.addEventListener('abort', () => resolve(null), { once: true }));
    } });
    const expiring = await saveMenuRecipeUrl(db, identity, allowed, 'https://example.test/abort', Date.now() + 250);
    await assert.rejects(curator(db, expiring.entry.id, expiring.generation!, allowed), { name: 'TimeoutError' });
    const recovered = await saveMenuRecipeUrl(db, identity, allowed, 'https://example.test/ready-after-abort', Date.now() + 60000);
    assert.equal(await curator(db, recovered.entry.id, recovered.generation!, allowed), true);
    assert.equal((await listMenuRecipes(db, identity, allowed)).entries.find(e => e.id === expiring.entry.id)?.curation.state, 'failed');
  } finally { await db.close(); await fixture.cleanup(); }
});


test('post-commit registration failure retains the saved entry and exposes explicit Retry', async () => {
  const fixture = await restrictedMenuDatabase(); const db = await fixture.open();
  try {
    await provisionFamily(db, identity, allowed, false);
    const saved = await saveMenuRecipeUrl(db, identity, allowed, 'https://example.test/registration', Date.now() + 60000);
    await registerMenuCuration(saved.entry.id, saved.generation!, () => { throw new Error('Registration unavailable'); }, async () => db, allowed);
    const entry = (await listMenuRecipes(db, identity, allowed)).entries[0];
    assert.equal(entry.id, saved.entry.id);
    assert.equal(entry.recipe.sourceUrl, saved.entry.recipe.sourceUrl);
    assert.deepEqual(entry.curation, { state: 'failed', retryable: true });
  } finally { await db.close(); await fixture.cleanup(); }
});
