import assert from 'node:assert/strict';
import { test } from 'node:test';
import { Parser } from 'htmlparser2';
import { CookieJar, startServer } from './server.ts';
import { provision, signInWithGoogle } from './flow.ts';

function assertSharedPage(html: string) {
  const counts = { header: 0, main: 0, h1: 0 };
  const links: string[] = [];
  let inHeader = false;
  let primaryNavigation = false;
  const parser = new Parser({
    onopentag(name, attributes) {
      if (name === 'header' || name === 'main' || name === 'h1') counts[name]++;
      if (name === 'header') inHeader = true;
      if (inHeader && name === 'nav' && attributes['aria-label'] === 'Primary') primaryNavigation = true;
      if (inHeader && name === 'a') links.push(attributes.href);
    },
    onclosetag(name) { if (name === 'header') inHeader = false; },
  });
  parser.end(html);
  assert.deepEqual(counts, { header: 1, main: 1, h1: 1 });
  assert.equal(primaryNavigation, true, 'common labelled primary navigation');
  assert.deepEqual(links, ['/', '/', '/menu', '/family']);
}

test('public pages share the header without database access while protected pages keep their guards', async () => {
  const server = await startServer({ DATABASE_URL: 'postgresql://unreachable:fixture@127.0.0.1:1/unreachable' });
  try {
    for (const path of ['/sign-in', '/invite']) {
      const response = await fetch(`${server.origin}${path}`);
      assert.equal(response.status, 200, path);
      assertSharedPage(await response.text());
    }
    for (const path of ['/', '/family', '/menu']) {
      const response = await fetch(`${server.origin}${path}`, { redirect: 'manual' });
      assert.equal(response.status, 307);
      assert.equal(new URL(response.headers.get('location')!, server.origin).pathname, '/sign-in');
    }
  } finally { await server.stop(); }
});

test('authenticated home and family retain one page landmark and common navigation', async () => {
  const server = await startServer({}, true);
  try {
    const owner = new CookieJar();
    await signInWithGoogle(server.origin, owner);
    assert.equal((await provision(server.origin, owner)).status, 200);
    for (const path of ['/', '/family', '/menu']) {
      const response = await owner.request(server.origin, path);
      assert.equal(response.status, 200, path);
      assertSharedPage(await response.text());
    }
  } finally { await server.stop(); }
});
