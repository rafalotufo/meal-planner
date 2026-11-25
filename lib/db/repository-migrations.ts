import { resolve } from 'node:path';
import { existsSync, readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { compatibility } from './compatibility';
import { StorageDiagnostic } from './migration-graph';
import expectedCatalog from '../../drizzle/postgresql/catalog.json';
import { readMigrationFiles } from 'drizzle-orm/migrator';
import { runtimeMigrations, validateMigrationMetadata } from './runtime-metadata';

// Explicit migration/build tooling only. The runtime imports bundled metadata.
export function repositoryMigrations(folder = resolve(process.cwd(), 'drizzle/postgresql'), expected: unknown = runtimeMigrations) {
  const catalog: unknown = JSON.parse(readFileSync(resolve(folder, 'catalog.json'), 'utf8'));
  if (JSON.stringify(catalog) !== JSON.stringify(expectedCatalog)) throw new Error('Reviewed runtime catalog is stale');
  const migrations = readMigrationFiles({ migrationsFolder: folder });
  const metadata = validateMigrationMetadata(migrations.map(({ hash, folderMillis }) => ({ hash, folderMillis })));
  if (JSON.stringify(metadata) !== JSON.stringify(validateMigrationMetadata(expected))) throw new Error('Reviewed runtime migration metadata is stale');
  return migrations;
}

export function repositorySources(folder = resolve(process.cwd(), 'drizzle/postgresql'), manifest = compatibility) {
  // Preserve the supported public loader for historical SQL/checksum evidence.
  const legacy = repositoryMigrations(folder);
  const sources = new Map<string,string>();
  for (const row of manifest.migrations) {
    const source = resolve(folder, row.file);
    if (!existsSync(source)) {
      if (manifest.required.includes(row.id)) throw new StorageDiagnostic('missing-dependency');
      continue;
    }
    const sql = readFileSync(source,'utf8');
    if (createHash('sha256').update(sql).digest('hex') !== row.hash || row.legacy && (legacy[row.legacy.id]?.hash !== row.hash || legacy[row.legacy.id]?.folderMillis !== row.legacy.createdAt)) throw new StorageDiagnostic('checksum-mismatch');
    sources.set(row.id,sql);
  }
  return sources;
}
