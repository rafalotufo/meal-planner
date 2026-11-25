import { createHash } from 'node:crypto';

export type StorageReason = 'database-ahead' | 'missing-dependency' | 'checksum-mismatch' | 'conflicting-identity' | 'dependency-cycle' | 'incompatible-schema' | 'connection-failure' | 'permission-failure' | 'execution-failure';
export class StorageDiagnostic extends Error {
  constructor(readonly reason: StorageReason) { super(`PostgreSQL ${reason}; consult the migration adoption guide.`); }
}
export function diagnostic(error: unknown): StorageDiagnostic {
  if (error instanceof StorageDiagnostic) return error;
  const code = error && typeof error === 'object' && 'code' in error ? String(error.code) : '';
  return new StorageDiagnostic(code === '42501' || code === '28P01' || code === '28000' ? 'permission-failure' : /^(08|57P0[123]|ECONN|ENOTFOUND|ETIMEDOUT|EPERM|EAI_AGAIN|ENETUNREACH|EHOSTUNREACH|CERT_|UNABLE_TO_VERIFY_|SELF_SIGNED_|DEPTH_ZERO_SELF_SIGNED_|ERR_TLS)/.test(code) ? 'connection-failure' : 'execution-failure');
}
export interface CatalogRow { kind: string; name: string; definition: string }
export interface MigrationDescriptor { id: string; file: string; hash: string; dependsOn: string[]; legacy?: { id: number; createdAt: number } }
export interface SchemaProfile { applied: string[]; catalog: CatalogRow[]; grants: Record<string, string[]> }
export interface CompatibilityManifest { version: 1; migrations: MigrationDescriptor[]; required: string[]; independent: { ids: string[]; digests: string[] }[]; profiles: SchemaProfile[] }
const uuid = /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/;
const sha = /^[a-f0-9]{64}$/;
const sameSet = (a: readonly string[], b: readonly string[]) => a.length === b.length && [...a].sort().every((id, i) => id === [...b].sort()[i]);
export function descriptorDigest(row: MigrationDescriptor) {
  return createHash('sha256').update(JSON.stringify({ id: row.id, file: row.file, hash: row.hash, dependsOn: [...row.dependsOn].sort(), legacy: row.legacy ?? null })).digest('hex');
}
function fail(reason: StorageReason): never { throw new StorageDiagnostic(reason); }
export function validateManifest(value: CompatibilityManifest): CompatibilityManifest {
  if (!value || value.version !== 1 || !Array.isArray(value.migrations) || !Array.isArray(value.required) || !Array.isArray(value.independent) || !Array.isArray(value.profiles)) fail('conflicting-identity');
  const ids = new Map<string, MigrationDescriptor>(), files = new Set<string>(), aliases = new Set<number>(), times = new Set<number>();
  for (const row of value.migrations) {
    if (!row || !uuid.test(row.id) || !sha.test(row.hash) || !/^[a-zA-Z0-9_-]+\.sql$/.test(row.file) || !Array.isArray(row.dependsOn) || row.dependsOn.some(id => !uuid.test(id)) || new Set(row.dependsOn).size !== row.dependsOn.length || ids.has(row.id) || files.has(row.file)) fail('conflicting-identity');
    if (row.legacy) {
      if (!Number.isSafeInteger(row.legacy.id) || row.legacy.id < 0 || !Number.isSafeInteger(row.legacy.createdAt) || row.legacy.createdAt < 0 || aliases.has(row.legacy.id) || times.has(row.legacy.createdAt)) fail('conflicting-identity');
      aliases.add(row.legacy.id); times.add(row.legacy.createdAt);
    } else if (row.file !== `${row.id}.sql`) fail('conflicting-identity');
    ids.set(row.id, row); files.add(row.file);
  }
  const ancestors = new Map<string, Set<string>>(), visiting = new Set<string>();
  function visit(id: string): Set<string> {
    if (visiting.has(id)) fail('dependency-cycle');
    if (ancestors.has(id)) return ancestors.get(id)!;
    const row = ids.get(id); if (!row) fail('missing-dependency');
    visiting.add(id); const result = new Set<string>();
    for (const dep of row.dependsOn) { result.add(dep); for (const ancestor of visit(dep)) result.add(ancestor); }
    visiting.delete(id); ancestors.set(id, result); return result;
  }
  for (const id of ids.keys()) visit(id);
  const pairs = new Set<string>();
  for (const pair of value.independent) {
    if (!pair || pair.ids.length !== 2 || pair.digests.length !== 2 || pair.ids[0] === pair.ids[1]) fail('conflicting-identity');
    const [a,b] = pair.ids.map(id => ids.get(id));
    if (!a || !b || pair.digests[0] !== descriptorDigest(a) || pair.digests[1] !== descriptorDigest(b) || ancestors.get(a.id)!.has(b.id) || ancestors.get(b.id)!.has(a.id)) fail('conflicting-identity');
    const key = [...pair.ids].sort().join(':'); if (pairs.has(key)) fail('conflicting-identity'); pairs.add(key);
  }
  function checkSet(applied: string[]) {
    if (!Array.isArray(applied) || new Set(applied).size !== applied.length) fail('conflicting-identity');
    for (const id of applied) {
      const row = ids.get(id); if (!row || row.dependsOn.some(dep => !applied.includes(dep))) fail('missing-dependency');
      for (const other of applied) {
        if (other === id || ancestors.get(id)!.has(other) || ancestors.get(other)!.has(id)) continue;
        if (!pairs.has([id,other].sort().join(':'))) throw new Error('Reviewed independence declaration required');
      }
    }
  }
  checkSet(value.required);
  const sets = new Set<string>();
  for (const profile of value.profiles) {
    checkSet(profile.applied);
    const key = [...profile.applied].sort().join(':'); if (sets.has(key)) fail('conflicting-identity'); sets.add(key);
    if (!Array.isArray(profile.catalog) || !profile.grants || Object.getPrototypeOf(profile.grants) !== Object.prototype || profile.catalog.some(row => !row || typeof row.kind !== 'string' || typeof row.name !== 'string' || typeof row.definition !== 'string') || Object.entries(profile.grants).some(([name, grants]) => !/^[a-z_]+(?:\.[a-z_]+)?$/.test(name) || !Array.isArray(grants) || grants.some(grant => !['SELECT','INSERT','UPDATE','DELETE'].includes(grant)) || new Set(grants).size !== grants.length)) fail('incompatible-schema');
  }
  return value;
}
export function profileFor(manifest: CompatibilityManifest, applied: ReadonlySet<string>, complete = true): SchemaProfile {
  if (complete && manifest.required.some(id => !applied.has(id))) fail('missing-dependency');
  const profile = manifest.profiles.find(row => sameSet(row.applied, [...applied]));
  if (!profile) fail('database-ahead'); return profile;
}
export function planMigrations(manifest: CompatibilityManifest, applied: ReadonlySet<string>): MigrationDescriptor[] {
  const done = new Set(applied), pending = new Set(manifest.required.filter(id => !done.has(id))), result: MigrationDescriptor[] = [];
  for (const id of applied) { const row = manifest.migrations.find(row => row.id === id); if (!row) fail('database-ahead'); if (row.dependsOn.some(id => !applied.has(id))) fail('missing-dependency'); }
  while (pending.size) {
    const next = manifest.migrations.filter(row => pending.has(row.id) && row.dependsOn.every(id => done.has(id))).sort((a,b) => a.id.localeCompare(b.id))[0];
    if (!next) fail('missing-dependency'); result.push(next); pending.delete(next.id); done.add(next.id);
  }
  profileFor(manifest, done); return result;
}
