import 'server-only';
import { openDatabase, validateDatabaseUrl, type FamilyDatabase } from './db/connection';
let database: Promise<FamilyDatabase> | undefined;
export function getDatabase() {
  database ??= openDatabase(validateDatabaseUrl(process.env.DATABASE_URL).href).catch((error: unknown) => { database = undefined; throw error; });
  return database;
}
