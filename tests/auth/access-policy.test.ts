import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { isAllowedGoogleUser } from '../../lib/google-access.ts';

const member = { email: 'member.name@gmail.com', emailVerified: true };
test('access requires a verified exact configured Gmail identity', () => {
  assert.equal(isAllowedGoogleUser(member, ['member.name@gmail.com']), true);
  assert.equal(isAllowedGoogleUser({ ...member, email: 'member.name+tag@gmail.com' }, ['member.name+tag@gmail.com']), true);
  assert.equal(isAllowedGoogleUser({ ...member, email: ' MEMBER.NAME@GMAIL.COM ' }, [' member.name@gmail.com ']), true);
  for (const user of [null, {}, { ...member, emailVerified: false }, { ...member, emailVerified: 'true' }, { ...member, email: 'other@gmail.com' }, { ...member, email: 'member.name@googlemail.com' }, { ...member, email: 'member.name@gmail.com.evil' }, { ...member, email: 'member.name+alias@gmail.com' }, { ...member, email: 'membername@gmail.com' }]) {
    assert.equal(isAllowedGoogleUser(user, ['member.name@gmail.com']), false);
  }
});
test('empty policy denies everyone and malformed configuration is unavailable', () => {
  assert.equal(isAllowedGoogleUser(member, []), false);
  assert.equal(isAllowedGoogleUser(member, ['other@gmail.com']), false);
  for (const list of [null, undefined, {}, [''], ['member.name@gmail.com', null], ['member.name@example.com'], ['member.name@gmail.com', 'bad-value'], ['member.name@gmail.com', 'bad;value@gmail.com'], ['member.name@gmail.com', '.member@gmail.com'], ['member.name@gmail.com', 'member..name@gmail.com'], ['member.name@gmail.com', 'member.@gmail.com']]) {
    assert.throws(() => isAllowedGoogleUser(member, list), /Authentication unavailable/);
  }
});

test('configured addresses are absent from browser build assets', async () => {
  const configured: unknown = JSON.parse(await readFile(new URL('../../lib/allowed-google-emails.json', import.meta.url), 'utf8'));
  assert.ok(Array.isArray(configured));
  const allowed = configured.map((value: unknown) => { assert.ok(typeof value === 'string'); return value; });
  const root = new URL('../../.next/static/', import.meta.url);
  for (const name of await readdir(root, { recursive: true, withFileTypes: true })) {
    if (!name.isFile()) continue;
    const content = await readFile(join(name.parentPath, name.name), 'utf8');
    assert.equal(allowed.some((email) => content.includes(email)), false, 'server eligibility list must not be bundled for browsers');
  }
});
