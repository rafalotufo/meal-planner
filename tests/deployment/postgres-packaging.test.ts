import assert from 'node:assert/strict';
import { cp, mkdtemp, rm, symlink, access } from 'node:fs/promises';
import { resolve, basename } from 'node:path';
import { tmpdir } from 'node:os';
import { test } from 'node:test';
import { CookieJar } from '../auth/server.ts';
import { provision, signInWithGoogle } from '../auth/flow.ts';
import { post } from '../family/http.ts';
import { startCurationServer } from '../menu/curation-server.ts';

test('compiled protected proxy and routes work without source or migration files', async () => {
  const directory = await mkdtemp(resolve(tmpdir(), 'meal-packaged-runtime-'));
  try {
    await cp('.next', resolve(directory, '.next'), { recursive: true, filter: path => !['cache', 'dev'].includes(basename(path)) });
    await cp('package.json', resolve(directory, 'package.json'));
    await symlink(resolve('node_modules'), resolve(directory, 'node_modules'), 'dir');
    await assert.rejects(access(resolve(directory, 'drizzle')));
    await assert.rejects(access(resolve(directory, 'lib')));
    const fixture = await startCurationServer({ workingDirectory: directory });
    const server = fixture.server;
    try {
      const owner = new CookieJar();
      await signInWithGoogle(server.origin, owner);
      assert.equal((await owner.request(server.origin, '/onboarding')).status, 200, 'proxy must open PostgreSQL using bundled reviewed metadata');
      assert.equal((await provision(server.origin, owner)).status, 200);
      const home = await owner.request(server.origin, '/');
      assert.equal(home.status, 200);
      assert.match(await home.text(), /What would you like to eat this week\?/);
      assert.equal((await owner.request(server.origin, '/api/session')).status, 200);
      const recipe = { title: 'Packaged lemon pasta', sourceUrl: 'https://example.test/pasta', imageUrl: null, summary: 'Toss pasta with lemon.', time: null };
      const saved = await post(server.origin, owner, '/api/menu', recipe);
      assert.equal(saved.status, 200);
      const { entry } = await saved.json();
      const lookup = await post(server.origin, owner, '/api/menu?lookup=saved', { sourceUrls: [recipe.sourceUrl, 'https://example.test/not-saved'] });
      assert.equal(lookup.status, 200);
      assert.deepEqual(await lookup.json(), { savedSourceUrls: [recipe.sourceUrl] });
      const listed = await owner.request(server.origin, '/api/menu');
      assert.equal(listed.status, 200);
      assert.deepEqual(await listed.json(), { entries: [entry], nextCursor: null });
      const menu = await owner.request(server.origin, '/menu');
      assert.equal(menu.status, 200);
      assert.match(await menu.text(), /Packaged lemon pasta/);
      assert.equal((await post(server.origin, owner, `/api/menu/${entry.id}/remove`)).status, 200);
      assert.deepEqual(await (await owner.request(server.origin, '/api/menu')).json(), { entries: [], nextCursor: null });
      fixture.set('/packaged-curation', 'stall');
      const imported = await post(server.origin, owner, '/api/menu?import=url', { sourceUrl: fixture.source('/packaged-curation') });
      assert.equal(imported.status, 200);
      const pending = await imported.json();
      assert.equal(pending.entry.curation.state, 'pending');
      await fixture.waitForRequest('/packaged-curation');
      fixture.release('/packaged-curation');
      let ready = false;
      for (let attempt = 0; attempt < 100; attempt++) {
        const page = await (await owner.request(server.origin, '/api/menu')).json();
        if (page.entries[0]?.curation.state === 'ready') {
          assert.equal(page.entries[0].id, pending.entry.id);
          assert.equal(page.entries[0].recipe.title, 'Imported fixture recipe');
          ready = true; break;
        }
        await new Promise(resolve => setTimeout(resolve, 25));
      }
      assert.equal(ready, true, 'bundled parser/transport/store completes after the response without source or migration files');
    } finally { await fixture.stop(); }
  } finally { await rm(directory, { recursive: true, force: true }); }
});
