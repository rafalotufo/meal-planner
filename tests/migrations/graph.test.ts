import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createHash } from 'node:crypto';
import { descriptorDigest, validateManifest, planMigrations, type MigrationDescriptor, type CompatibilityManifest } from '../../lib/db/migration-graph.ts';

const ids = ['5100caba-6518-4ad6-9675-7b52c2241091','6200caba-6518-4ad6-9675-7b52c2241092','7300caba-6518-4ad6-9675-7b52c2241093'];
function descriptor(i: number, dependencies: string[] = []): MigrationDescriptor {
  return { id: ids[i], file: `${ids[i]}.sql`, hash: createHash('sha256').update(String(i)).digest('hex'), dependsOn: dependencies };
}
function manifest(migrations = [descriptor(0), descriptor(1, [ids[0]])]): CompatibilityManifest {
  return { version: 1, migrations, required: migrations.map(row => row.id), independent: [], profiles: [{ applied: migrations.map(row => row.id), catalog: [], grants: {} }] };
}

test('dependency planner orders by dependencies rather than source list or timestamps', () => {
  const root = descriptor(0), leaf = descriptor(1, [root.id]);
  const contract = validateManifest(manifest([leaf, root]));
  assert.deepEqual(planMigrations(contract, new Set()).map(row => row.id), [root.id, leaf.id]);
  assert.deepEqual(planMigrations(contract, new Set([root.id])).map(row => row.id), [leaf.id]);
});
test('IDs, source files and legacy aliases cannot collide; changed dependency declarations change identity digest', () => {
  const root = descriptor(0), leaf = descriptor(1, [root.id]);
  assert.notEqual(descriptorDigest(leaf), descriptorDigest({ ...leaf, dependsOn: [] }));
  for (const migrations of [[root, { ...root, hash: 'a'.repeat(64) }], [root, { ...leaf, file: root.file }], [{ ...root, legacy: { id: 0, createdAt: 1 } }, { ...leaf, legacy: { id: 0, createdAt: 2 } }]]) {
    assert.throws(() => validateManifest(manifest(migrations)), /conflicting-identity/);
  }
});
test('missing dependencies and cycles are rejected before database access', () => {
  assert.throws(() => validateManifest(manifest([descriptor(1, [ids[0]])])), /missing-dependency/);
  assert.throws(() => validateManifest(manifest([descriptor(0, [ids[1]]), descriptor(1, [ids[0]])])), /dependency-cycle/);
});
test('independence requires exact reviewed descriptor digests for every incomparable pair', () => {
  const a = descriptor(0), b = descriptor(1), value = manifest([a, b]);
  assert.throws(() => validateManifest(value), /independence/);
  value.independent = [{ ids: [a.id, b.id], digests: [descriptorDigest(a), descriptorDigest(b)] }];
  assert.doesNotThrow(() => validateManifest(value));
  value.migrations[1] = { ...b, hash: 'c'.repeat(64) };
  assert.throws(() => validateManifest(value), /conflicting-identity/);
});
