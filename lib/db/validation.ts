import type { FamilyDatabase } from './connection';
import { catalogSignature } from './connection';
import { compatibility } from './compatibility';
import { descriptorDigest, profileFor, validateManifest, StorageDiagnostic, type CompatibilityManifest, type SchemaProfile } from './migration-graph';
import { checkSecurity } from './security';

export interface ValidationOptions { manifest?: CompatibilityManifest; ownerTooling?: boolean }
export const LEGACY_LEDGER = 'CREATE TABLE public.__drizzle_migrations (id integer PRIMARY KEY, hash text NOT NULL, created_at bigint NOT NULL)';
export const NATIVE_LEDGER = 'CREATE TABLE public.__app_migrations (id uuid PRIMARY KEY, hash text NOT NULL, descriptor_hash text NOT NULL)';
export async function readHistory(db: FamilyDatabase, manifest: CompatibilityManifest) {
  const applied = new Set<string>();
  const present = await db.one<{ legacy: string | null; native: string | null }>("SELECT to_regclass('public.__drizzle_migrations')::text AS legacy, to_regclass('public.__app_migrations')::text AS native");
  if (present?.legacy) {
    const rows = await db.all<{ id: number; hash: string; created_at: number }>('SELECT id, hash, created_at FROM public.__drizzle_migrations');
    for (const row of rows) {
      const descriptor = manifest.migrations.find(item => item.legacy?.id === row.id);
      if (!descriptor) throw new StorageDiagnostic('database-ahead');
      if (descriptor.legacy!.createdAt !== row.created_at) throw new StorageDiagnostic('conflicting-identity');
      if (descriptor.hash !== row.hash) throw new StorageDiagnostic('checksum-mismatch');
      applied.add(descriptor.id);
    }
  }
  if (present?.native) {
    const rows = await db.all<{ id: string; hash: string; descriptor_hash: string }>('SELECT id, hash, descriptor_hash FROM public.__app_migrations');
    for (const row of rows) {
      const descriptor = manifest.migrations.find(item => item.id === row.id);
      if (!descriptor) throw new StorageDiagnostic('database-ahead');
      if (descriptor.legacy || applied.has(row.id)) throw new StorageDiagnostic('conflicting-identity');
      if (descriptor.hash !== row.hash) throw new StorageDiagnostic('checksum-mismatch');
      if (descriptorDigest(descriptor) !== row.descriptor_hash) throw new StorageDiagnostic('conflicting-identity');
      applied.add(row.id);
    }
  }
  for (const descriptor of manifest.migrations.filter(row => applied.has(row.id))) if (descriptor.dependsOn.some(id => !applied.has(id))) throw new StorageDiagnostic('missing-dependency');
  return { applied, legacy: Boolean(present?.legacy), native: Boolean(present?.native) };
}
export async function checkLedgers(db: FamilyDatabase, presence: { legacy: boolean; native: boolean }) {
  for (const [name, columns] of [
    ['__drizzle_migrations', [['id','integer'],['hash','text'],['created_at','bigint']]],
    ['__app_migrations', [['id','uuid'],['hash','text'],['descriptor_hash','text']]],
  ] as const) {
    if (!(name === '__drizzle_migrations' ? presence.legacy : presence.native)) continue;
    const actual = await db.all<{ name: string; type: string; required: boolean; extra: boolean }>(`SELECT a.attname AS name, format_type(a.atttypid,a.atttypmod) AS type, a.attnotnull AS required, (a.attidentity<>'' OR a.attgenerated<>'' OR d.oid IS NOT NULL) AS extra FROM pg_attribute a LEFT JOIN pg_attrdef d ON d.adrelid=a.attrelid AND d.adnum=a.attnum WHERE a.attrelid=$1::regclass AND a.attnum>0 AND NOT a.attisdropped ORDER BY a.attnum`, [`public.${name}`]);
    if (JSON.stringify(actual) !== JSON.stringify(columns.map(([name,type]) => ({name,type,required:true,extra:false})))) throw new StorageDiagnostic('incompatible-schema');
    const constraints = await db.all<{ name: string; definition: string }>('SELECT conname AS name, pg_get_constraintdef(oid) AS definition FROM pg_constraint WHERE conrelid=$1::regclass ORDER BY conname', [`public.${name}`]);
    if (JSON.stringify(constraints) !== JSON.stringify([{name:`${name}_pkey`,definition:'PRIMARY KEY (id)'}])) throw new StorageDiagnostic('incompatible-schema');
    const indexes = await db.all<{ name: string; definition: string }>('SELECT indexname AS name,indexdef AS definition FROM pg_indexes WHERE schemaname=$1 AND tablename=$2', ['public',name]);
    const expected = [{name:`${name}_pkey`,definition:`CREATE UNIQUE INDEX ${name}_pkey ON public.${name} USING btree (id)`}];
    if (JSON.stringify(indexes) !== JSON.stringify(expected)) throw new StorageDiagnostic('incompatible-schema');
  }
}
export async function validateSchema(db: FamilyDatabase, profile: SchemaProfile, presence: { legacy: boolean; native: boolean }, ownerTooling: boolean, requireGrants = !ownerTooling) {
  const actual = (await catalogSignature(db)).filter(row => !(row.name === '__app_migrations' || row.name === '__app_migrations_pkey' || row.name.startsWith('__app_migrations.')));
  if (JSON.stringify(actual) !== JSON.stringify(profile.catalog)) throw new StorageDiagnostic('incompatible-schema');
  await checkLedgers(db, presence);
  await checkSecurity(db, profile, presence, ownerTooling, requireGrants);
}
export async function validateDatabase(db: FamilyDatabase, options: ValidationOptions = {}) {
  const manifest = validateManifest(options.manifest ?? compatibility);
  await checkLedgerSafety(db);
  const history = await readHistory(db, manifest);
  const profile = profileFor(manifest, history.applied);
  await validateSchema(db, profile, history, options.ownerTooling === true);
}

// Inspect relation metadata before any row read: a view/RLS ledger could execute
// SQL with nontransactional effects even if final validation later rolls back.
export async function checkLedgerSafety(db: FamilyDatabase) {
  const ledgers = await db.all<{ name: string; unsafe: boolean }>(`SELECT c.relname AS name, (c.relkind<>'r' OR c.relrowsecurity OR c.relforcerowsecurity OR pg_get_userbyid(c.relowner)<>CASE WHEN current_database() ~ '^mp_test_[a-f0-9]{24}$' AND (SELECT pg_get_userbyid(datdba) FROM pg_database WHERE datname=current_database())='mp_test' THEN 'mp_test' ELSE 'mp_migrator' END OR EXISTS (SELECT 1 FROM pg_trigger WHERE tgrelid=c.oid) OR EXISTS (SELECT 1 FROM pg_policy WHERE polrelid=c.oid) OR EXISTS (SELECT 1 FROM pg_rewrite WHERE ev_class=c.oid)) AS unsafe FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname='public' AND c.relname IN ('__drizzle_migrations','__app_migrations')`);
  if (ledgers.some(row => row.unsafe)) throw new StorageDiagnostic('incompatible-schema');
  await checkLedgers(db, { legacy: ledgers.some(row => row.name === '__drizzle_migrations'), native: ledgers.some(row => row.name === '__app_migrations') });
}
