import Database from 'better-sqlite3';
import { basename, dirname, isAbsolute, relative, resolve, sep } from 'node:path';
import { lstatSync, realpathSync } from 'node:fs';
import { readMigrationFiles } from 'drizzle-orm/migrator';

export const migrationsFolder = () => resolve(process.cwd(), 'drizzle');
function physicalPath(path: string): string {
  let ancestor = resolve(path); const suffix: string[] = [];
  for (;;) {
    try { lstatSync(ancestor); break; }
    catch (error) {
      if (!(error instanceof Error) || !('code' in error) || error.code !== 'ENOENT') throw error;
      suffix.unshift(basename(ancestor));
      const parent = dirname(ancestor);
      if (parent === ancestor) throw new Error('Storage unavailable');
      ancestor = parent;
    }
  }
  return resolve(realpathSync(ancestor), ...suffix);
}
function inside(path: string, root: string) {
  const child = relative(root, path);
  return child === '' || child !== '..' && !child.startsWith(`..${sep}`) && !isAbsolute(child);
}
export function validateDatabasePath(path: string | undefined): string {
  if (!path || !isAbsolute(path) || path.trim() !== path) throw new Error('Storage unavailable');
  const lexical = resolve(path); const physical = physicalPath(path);
  for (const directory of ['public', '.next', 'static']) {
    const root = resolve(process.cwd(), directory);
    if (inside(lexical, root) || inside(physical, physicalPath(root))) throw new Error('Storage unavailable');
  }
  return path;
}
export function connectDatabase(path: string, create = false) {
  const client = new Database(validateDatabasePath(path), { fileMustExist: !create, timeout: 5000 });
  try {
    client.pragma('foreign_keys = ON');
    client.pragma('journal_mode = WAL');
    return client;
  } catch (error) { client.close(); throw error; }
}
export type FamilyDatabase = Database.Database;
export type Migration = ReturnType<typeof readMigrationFiles>[number];
export function repositoryMigrations() {
  const migrations = readMigrationFiles({ migrationsFolder: migrationsFolder() });
  if (!migrations.length || migrations.some((m, i) => i > 0 && m.folderMillis <= migrations[i - 1].folderMillis)) throw new Error('Storage unavailable');
  return migrations;
}
export function checkHistory(db: FamilyDatabase, expected: Migration[], complete: boolean) {
  const rows = db.prepare<[], { hash: string; created_at: number }>('SELECT hash, created_at FROM __drizzle_migrations ORDER BY id').all();
  if (rows.length > expected.length || complete && rows.length !== expected.length || rows.some((row, i) => row.hash !== expected[i].hash || row.created_at !== expected[i].folderMillis)) throw new Error('Storage unavailable');
  return rows.length;
}
export function checkSchema(db: FamilyDatabase, migrations: Migration[]) {
  // Build only an isolated in-memory expectation. Never apply or repair persistent
  // application schema on an ordinary request.
  const reference = new Database(':memory:');
  const schema = (client: FamilyDatabase) => client.prepare<[], { name: string; type: string; sql: string }>("SELECT name, type, sql FROM sqlite_master WHERE name NOT LIKE 'sqlite_%' AND name != '__drizzle_migrations' ORDER BY type, name").all();
  try {
    for (const migration of migrations) for (const statement of migration.sql) reference.exec(statement);
    if (JSON.stringify(schema(db)) !== JSON.stringify(schema(reference))) throw new Error('Storage unavailable');
  } finally { reference.close(); }
}
export function openDatabase(path: string) {
  const db = connectDatabase(path);
  try {
    const expected = repositoryMigrations();
    checkHistory(db, expected, true);
    checkSchema(db, expected);
    return db;
  } catch (error) { db.close(); throw error; }
}
