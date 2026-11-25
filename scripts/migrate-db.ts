import { migrateDatabase } from '../lib/db/migrate';
import { validateDatabaseUrl, validateMigrationPair, connectDatabase } from '../lib/db/connection';
import { diagnostic } from '../lib/db/migration-graph';
import { validateDatabase } from '../lib/db/validation';
let committed = false;
async function main() {
  const owner = validateDatabaseUrl(process.env.MIGRATION_DATABASE_URL);
  const runtime = validateDatabaseUrl(process.env.DATABASE_URL);
  validateMigrationPair(owner, runtime);
  if (decodeURIComponent(runtime.username) !== 'mp_runtime') throw new Error('Invalid runtime role');
  await migrateDatabase(owner.href, { runtimeRole: 'mp_runtime' });
  committed = true;
  // Post-commit credential/connectivity smoke; it cannot undo a committed migration.
  const db = connectDatabase(runtime.href);
  try { await db.readOnly(tx => validateDatabase(tx)); }
  finally { await db.close(); }
  console.log('PostgreSQL migrations and runtime privileges completed.');
}
main().catch(error => {
  console.error(`${committed ? 'Migrations committed; runtime verification failed. ' : ''}${diagnostic(error).message}`);
  process.exitCode = 1;
});
