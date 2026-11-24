import { migrateDatabase } from '../lib/db/migrate';
import { connectDatabase, validateDatabaseUrl, validateMigrationPair } from '../lib/db/connection';
async function main() {
  const owner = validateDatabaseUrl(process.env.MIGRATION_DATABASE_URL);
  const runtime = validateDatabaseUrl(process.env.DATABASE_URL);
  validateMigrationPair(owner, runtime);
  await migrateDatabase(owner.href);
  const db = connectDatabase(owner.href);
  // Explicit migration operation only; never runs during startup/build/requests.
  const role = '"' + decodeURIComponent(runtime.username).replaceAll('"', '""') + '"';
  try {
    await db.execute(`GRANT SELECT ON __drizzle_migrations TO ${role}`);
    await db.execute(`GRANT SELECT, INSERT, UPDATE, DELETE ON families, app_users, family_invitations TO ${role}`);
    await db.execute(`GRANT SELECT, INSERT, DELETE ON menu_recipes TO ${role}`);
    await db.execute(`GRANT UPDATE (title, summary, image_url, time_kind, time_text) ON menu_recipes TO ${role}`);
    await db.execute(`GRANT SELECT, INSERT, UPDATE ON menu_recipe_curations TO ${role}`);
  } finally { await db.close(); }
  console.log('PostgreSQL migrations completed; runtime privileges applied.');
}
main().catch(() => { console.error('PostgreSQL migration failed; no credentials printed.'); process.exitCode = 1; });
