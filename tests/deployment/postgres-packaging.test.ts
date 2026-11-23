import assert from 'node:assert/strict';
import { cp, mkdtemp, rm, symlink, access } from 'node:fs/promises';
import { resolve, basename } from 'node:path';
import { tmpdir } from 'node:os';
import { test } from 'node:test';
import { CookieJar, startServer } from '../auth/server.ts';
import { provision, signInWithGoogle } from '../auth/flow.ts';

test('compiled protected proxy and routes work without source or migration files', async () => {
  const directory = await mkdtemp(resolve(tmpdir(), 'meal-packaged-runtime-'));
  try {
    await cp('.next', resolve(directory, '.next'), { recursive: true, filter: path => !['cache', 'dev'].includes(basename(path)) });
    await cp('package.json', resolve(directory, 'package.json'));
    await symlink(resolve('node_modules'), resolve(directory, 'node_modules'), 'dir');
    await assert.rejects(access(resolve(directory, 'drizzle')));
    await assert.rejects(access(resolve(directory, 'lib')));
    const server = await startServer({}, true, false, directory);
    try {
      const owner = new CookieJar();
      await signInWithGoogle(server.origin, owner);
      assert.equal((await owner.request(server.origin, '/onboarding')).status, 200, 'proxy must open PostgreSQL using bundled reviewed metadata');
      assert.equal((await provision(server.origin, owner)).status, 200);
      const home = await owner.request(server.origin, '/');
      assert.equal(home.status, 200);
      assert.match(await home.text(), /What would you like to cook/);
      assert.equal((await owner.request(server.origin, '/api/session')).status, 200);
    } finally { await server.stop(); }
  } finally { await rm(directory, { recursive: true, force: true }); }
});
