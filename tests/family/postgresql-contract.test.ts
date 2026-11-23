import assert from 'node:assert/strict';
import { test } from 'node:test';
import { validateDatabaseUrl, validateMigrationPair } from '../../lib/db/connection.ts';

test('PostgreSQL configuration fails closed and remote URLs require verified TLS', () => {
  for (const value of [undefined, '', '/tmp/family.sqlite', 'sqlite://file', 'postgresql://user:password@example.test/db', 'postgresql://user:password@example.test/db?sslmode=disable', 'postgresql://user:password@example.test/db?sslmode=verify-full&sslmode=disable', 'postgresql://user:password@example.test/db?sslmode=disable&sslmode=verify-full']) assert.throws(() => validateDatabaseUrl(value));
  assert.equal(validateDatabaseUrl('postgresql://user:password@127.0.0.1:5432/db').hostname, '127.0.0.1');
  assert.equal(validateDatabaseUrl('postgresql://user:password@example.test/db?sslmode=verify-full').hostname, 'example.test');
});

test('migration endpoint validation accepts Neon direct/pooler pairs and rejects unrelated databases', () => {
  const owner = validateDatabaseUrl('postgresql://owner:password@ep-family.region.aws.neon.tech/meal?sslmode=verify-full');
  const runtime = validateDatabaseUrl('postgresql://runtime:password@ep-family-pooler.region.aws.neon.tech/meal?sslmode=verify-full');
  assert.doesNotThrow(() => validateMigrationPair(owner, runtime));
  for (const field of ['hostname','pathname','port','username'] as const) {
    const changed = new URL(runtime);
    if (field === 'username') changed.username = owner.username;
    else if (field === 'hostname') changed.hostname = 'ep-unrelated-pooler.region.aws.neon.tech';
    else if (field === 'pathname') changed.pathname = '/other';
    else changed.port = '5433';
    assert.throws(() => validateMigrationPair(owner, changed));
  }
});
