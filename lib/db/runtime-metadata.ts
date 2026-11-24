import committedMigrations from '../../drizzle/postgresql/runtime-migrations.json';

export interface MigrationMetadata { hash: string; folderMillis: number }
export function validateMigrationMetadata(value: unknown): MigrationMetadata[] {
  if (!Array.isArray(value) || !value.length) throw new Error('Storage unavailable');
  let previous = -1;
  return value.map((row: unknown) => {
    if (!row || typeof row !== 'object' || !('hash' in row) || !('folderMillis' in row) ||
        Object.keys(row).length !== 2 || typeof row.hash !== 'string' || !/^[a-f0-9]{64}$/.test(row.hash) ||
        typeof row.folderMillis !== 'number' || !Number.isSafeInteger(row.folderMillis) || row.folderMillis <= previous) throw new Error('Storage unavailable');
    previous = row.folderMillis;
    return { hash: row.hash, folderMillis: row.folderMillis };
  });
}
export const runtimeMigrations = validateMigrationMetadata(committedMigrations);
