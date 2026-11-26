import assert from 'node:assert/strict';
import { cp, mkdtemp, readFile, writeFile, rm } from 'node:fs/promises';
import { resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { test } from 'node:test';
import { compatibility } from '../../lib/db/compatibility.ts';
import { repositorySources } from '../../lib/db/repository-migrations.ts';
import { createHash } from 'node:crypto';
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
  assert.throws(() => repositoryMigrations(undefined, [...runtimeMigrations, {...runtimeMigrations[0],folderMillis:runtimeMigrations.at(-1)!.folderMillis+1}]), /stale/);
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


test('category runtime bundles the new immutable identity and preserves all five historical migration records', () => {
 const id='6e36359b-9b16-4642-a487-e4e5411ce477';
 assert.equal(compatibility.required.length,8);assert.ok(compatibility.required.includes(id));
 const descriptor=compatibility.migrations.find(row=>row.id===id);assert.ok(descriptor);
 assert.deepEqual(descriptor.dependsOn,['557e80b6-f30b-452e-b563-12cff07158a5']);
 assert.equal(descriptor.legacy,undefined);
 const source=repositorySources().get(id);assert.ok(source);
 assert.equal(createHash('sha256').update(source).digest('hex'),descriptor.hash);
 assert.equal(repositoryMigrations().length,5);
 const profile=compatibility.profiles.find(row=>row.applied.length===8);assert.ok(profile);
 assert.deepEqual(profile.grants['menu_recipes'],['SELECT','INSERT','DELETE']);
 assert.deepEqual(profile.grants['menu_recipes.category'],['UPDATE']);
 assert.deepEqual(profile.grants['menu_recipes.category_overridden'],['UPDATE']);
});
