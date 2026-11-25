import { migrateDatabase } from '../lib/db/migrate';
import { validateDatabaseUrl, validateMigrationPair, openDatabase } from '../lib/db/connection';
import { diagnostic } from '../lib/db/migration-graph';
async function main() {
  const owner = validateDatabaseUrl(process.env.MIGRATION_DATABASE_URL);
  const runtime = validateDatabaseUrl(process.env.DATABASE_URL);
  validateMigrationPair(owner, runtime);
  if (decodeURIComponent(runtime.username) !== 'mp_runtime') throw new Error('Invalid runtime role');
  await migrateDatabase(owner.href, { runtimeRole: 'mp_runtime' });
  // Post-commit credential/connectivity smoke; it cannot undo a committed migration.
  const db = await openDatabase(runtime.href); await db.close();
  console.log('PostgreSQL migrations and runtime privileges completed.');
}
main().catch(error => { console.error(diagnostic(error).message); process.exitCode = 1; });
