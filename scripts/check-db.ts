import { connectDatabase, validateDatabaseUrl } from '../lib/db/connection';
import { validateDatabase } from '../lib/db/validation';
import { diagnostic } from '../lib/db/migration-graph';
async function main() {
  const db = connectDatabase(validateDatabaseUrl(process.env.DATABASE_URL).href);
  try { await db.readOnly(tx => validateDatabase(tx)); }
  finally { await db.close(); }
  console.log('PostgreSQL history, schema and runtime permissions are compatible.');
}
main().catch(error => { console.error(diagnostic(error).message); process.exitCode = 1; });
