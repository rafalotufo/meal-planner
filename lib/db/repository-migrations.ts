import { resolve } from 'node:path';
import { readFileSync } from 'node:fs';
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
