import assert from 'node:assert/strict';
import { test } from 'node:test';
import { isPublicRequest } from '../../lib/auth-policy.ts';
import { startServer } from './server.ts';

test('only exact icon pathnames with GET or HEAD are public', () => {
  for (const path of ['/icon.svg', '/favicon.ico']) {
    for (const method of ['GET', 'HEAD']) assert.equal(isPublicRequest(path, method), true, `${method} ${path}`);
    for (const method of ['POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']) assert.equal(isPublicRequest(path, method), false, `${method} ${path}`);
  }
  for (const path of ['/icons/private.svg', '/icon.svg/private', '/favicon.ico/private', '/private/icon.svg', '/icon.svgx', '/favicon.ico.bak', '/ICON.SVG', '/', '/family', '/api/family', '/api/recipes/search']) {
    for (const method of ['GET', 'HEAD', 'POST']) assert.equal(isPublicRequest(path, method), false, `${method} ${path}`);
  }
});

test('compiled public metadata and icon reads work without a reachable database', async () => {
  const app = await startServer({ DATABASE_URL: 'postgresql://mp_runtime:unused@127.0.0.1:1/unreachable' });
  try {
    const response = await fetch(`${app.origin}/sign-in`);
    assert.equal(response.status, 200);
    const html = await response.text();
    assert.match(html, /<title>Meal Planner<\/title>/);
    const links = [...html.matchAll(/<link\b[^>]*rel="icon"[^>]*>/g)].map(([tag]) => {
      const href = /\bhref="([^"]+)"/.exec(tag)?.[1];
      assert.ok(href);
      return new URL(href.replaceAll('&amp;', '&'), app.origin);
    });
    assert.equal(links.length, 2, 'root metadata advertises both local icon formats');
    assert.deepEqual(new Set(links.map(url => url.pathname)), new Set(['/icon.svg', '/favicon.ico']));
    for (const url of links) {
      assert.equal(url.origin, app.origin);
      const image = await fetch(url, { redirect: 'manual' });
      assert.equal(image.status, 200);
      assert.equal(image.headers.get('location'), null);
      assert.match(image.headers.get('x-content-type-options') ?? '', /nosniff/);
      const bytes = Buffer.from(await image.arrayBuffer());
      assert.ok(bytes.length > 100);
      if (url.pathname === '/icon.svg') {
        assert.match(image.headers.get('content-type') ?? '', /^image\/svg\+xml/);
        assert.match(bytes.toString(), /<svg\b[^>]*viewBox="0 0 64 64"/);
      } else {
        assert.match(image.headers.get('content-type') ?? '', /^image\/x-icon/);
        assert.deepEqual([...bytes.subarray(0, 6)], [0, 0, 1, 0, 2, 0]);
        assert.deepEqual([bytes[6], bytes[22]], [16, 32], 'ICO includes native 16px and 32px artwork');
      }
      const head = await fetch(url, { method: 'HEAD', redirect: 'manual' });
      assert.equal(head.status, 200);
      assert.equal((await head.arrayBuffer()).byteLength, 0);
      assert.equal(head.headers.get('content-type'), image.headers.get('content-type'));
      assert.equal((await fetch(url, { method: 'POST', redirect: 'manual' })).status, 401);
    }
    for (const path of ['/', '/family']) {
      const protectedPage = await fetch(`${app.origin}${path}`, { redirect: 'manual' });
      assert.equal(protectedPage.status, 307);
      assert.equal(new URL(protectedPage.headers.get('location') ?? '', app.origin).href, `${app.origin}/sign-in`);
    }
    assert.equal((await fetch(`${app.origin}/api/recipes/search`, { method: 'POST' })).status, 401);
  } finally { await app.stop(); }
});
