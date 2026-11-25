import { createHash } from 'node:crypto';
import { repositorySources } from './repository-migrations';
import { connectDatabase } from './connection';
import { compatibility } from './compatibility';
import { descriptorDigest, diagnostic, planMigrations, profileFor, validateManifest, StorageDiagnostic, type CompatibilityManifest } from './migration-graph';
import { LEGACY_LEDGER, NATIVE_LEDGER, readHistory, validateSchema, checkLedgerSafety } from './validation';
import { applyRuntimeGrants } from './security';

export interface MigrationOptions { manifest?: CompatibilityManifest; sources?: ReadonlyMap<string,string>; runtimeRole?: 'mp_runtime' }
export async function migrateDatabase(url: string, options: MigrationOptions = {}) {
  const manifest = validateManifest(options.manifest ?? compatibility);
  const sources = options.sources ?? repositorySources();
  // Validate every source that this checkout may execute before connecting.
  for (const descriptor of manifest.migrations.filter(row => manifest.required.includes(row.id))) {
    const source = sources.get(descriptor.id);
    if (source === undefined) throw new StorageDiagnostic('missing-dependency');
    if (createHash('sha256').update(source).digest('hex') !== descriptor.hash) throw new StorageDiagnostic('checksum-mismatch');
  }
  const db = connectDatabase(url);
  try {
    await db.transaction(async tx => {
      await checkLedgerSafety(tx);
      let history = await readHistory(tx, manifest);
      await validateSchema(tx, profileFor(manifest, history.applied, false), history, true, false);
      const pending = planMigrations(manifest, history.applied);
      if (!history.legacy && pending.some(row => row.legacy)) { await tx.execute(LEGACY_LEDGER); history = { ...history, legacy: true }; }
      if (!history.native && pending.some(row => !row.legacy)) { await tx.execute(NATIVE_LEDGER); history = { ...history, native: true }; }
      await tx.execute('SET LOCAL search_path = public, pg_catalog, pg_temp');
      for (const row of pending) {
        for (const sql of sources.get(row.id)!.split('--> statement-breakpoint')) if (sql.trim()) await tx.execute(sql);
        if (row.legacy) await tx.execute('INSERT INTO public.__drizzle_migrations (id,hash,created_at) VALUES ($1,$2,$3)', [row.legacy.id,row.hash,row.legacy.createdAt]);
        else await tx.execute('INSERT INTO public.__app_migrations (id,hash,descriptor_hash) VALUES ($1,$2,$3)', [row.id,row.hash,descriptorDigest(row)]);
      }
      await tx.execute('SET LOCAL search_path = pg_catalog, public, pg_temp');
      history = await readHistory(tx, manifest);
      const profile = profileFor(manifest, history.applied);
      // Never repair dangerous pre-existing grants. Preflight checked those.
      if (options.runtimeRole === 'mp_runtime') await applyRuntimeGrants(tx, profile, history);
      await validateSchema(tx, profile, history, true, options.runtimeRole === 'mp_runtime');
    }, 73462902);
  } catch (error) { throw diagnostic(error); }
  finally { await db.close(); }
}
