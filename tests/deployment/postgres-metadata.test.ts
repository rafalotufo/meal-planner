import assert from 'node:assert/strict';
import { cp, mkdtemp, readFile, writeFile, rm } from 'node:fs/promises';
import { resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { test } from 'node:test';
import { repositoryMigrations } from '../../lib/db/repository-migrations.ts';
import { runtimeMigrations, validateMigrationMetadata } from '../../lib/db/runtime-metadata.ts';

async function copyMigrations(action: (folder: string) => Promise<void>) {
  const folder = await mkdtemp(resolve(tmpdir(), 'meal-metadata-'));
  try { await cp('drizzle/postgresql', folder, { recursive: true }); await action(folder); }
  finally { await rm(folder, { recursive: true, force: true }); }
}
test('bundled migration metadata exactly matches the public loader SQL and journal', () => {
  assert.deepEqual(repositoryMigrations().map(({hash, folderMillis}) => ({hash, folderMillis})), runtimeMigrations);
});
test('changed SQL is rejected without regenerating reviewed runtime metadata', async () => {
  await copyMigrations(async folder => {
    const file = resolve(folder, '0000_family.sql');
    await writeFile(file, `${await readFile(file, 'utf8')}\n-- changed source\n`);
    assert.throws(() => repositoryMigrations(folder), /stale/);
  });
});
test('changed journal timestamps are rejected before migration opens a database', async () => {
  await copyMigrations(async folder => {
    const file = resolve(folder, 'meta/_journal.json');
    const journal: {entries: {when: number}[]} = JSON.parse(await readFile(file, 'utf8'));
    journal.entries[0].when++;
    await writeFile(file, JSON.stringify(journal));
    assert.throws(() => repositoryMigrations(folder), /stale/);
  });
});
test('empty malformed reordered and stale runtime manifests fail closed', () => {
  for (const value of [[], null, [{hash: 'invalid', folderMillis: 1}], [{hash: 'a'.repeat(64), folderMillis: Number.MAX_SAFE_INTEGER + 1}], [{hash:'a'.repeat(64),folderMillis:2},{hash:'b'.repeat(64),folderMillis:1}], [{hash:'a'.repeat(64),folderMillis:1,extra:true}]]) {
    assert.throws(() => validateMigrationMetadata(value));
  }
  assert.throws(() => repositoryMigrations(undefined, [{hash:'a'.repeat(64),folderMillis:runtimeMigrations[0].folderMillis}]), /stale/);
  assert.throws(() => repositoryMigrations(undefined, [...runtimeMigrations, {...runtimeMigrations[0],folderMillis:runtimeMigrations[0].folderMillis+1}]), /stale/);
});

test('changed catalog is rejected without opening or repairing a database', async () => {
  await copyMigrations(async folder => {
    const file = resolve(folder, 'catalog.json');
    const catalog: unknown[] = JSON.parse(await readFile(file, 'utf8'));
    catalog.pop();
    await writeFile(file, JSON.stringify(catalog));
    assert.throws(() => repositoryMigrations(folder), /catalog is stale/);
  });
});
