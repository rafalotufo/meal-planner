import 'server-only';
import { openDatabase, validateDatabasePath, type FamilyDatabase } from './db/connection';
let database: FamilyDatabase | undefined;
export function getDatabase() {
  database ??= openDatabase(validateDatabasePath(process.env.DATABASE_PATH));
  return database;
}
