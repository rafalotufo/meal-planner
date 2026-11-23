import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { migrateDatabase } from '../../lib/db/migrate.ts';
import { openDatabase } from '../../lib/db/connection.ts';
export async function testDatabase() {
  const directory = await mkdtemp(join(tmpdir(), 'meal-family-'));
  const path = join(directory, 'family.sqlite');
  migrateDatabase(path);
  return { path, open: () => openDatabase(path), cleanup: () => rm(directory, { recursive: true, force: true }) };
}
