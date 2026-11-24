import { repositoryMigrations } from './repository-migrations';
import { checkHistory, checkSchema, connectDatabase } from './connection';
export async function migrateDatabase(url: string) {
  const migrations = repositoryMigrations();
  const db = connectDatabase(url);
  try {
    await db.transaction(async (transaction) => {
      await transaction.execute('CREATE TABLE IF NOT EXISTS __drizzle_migrations (id integer PRIMARY KEY, hash text NOT NULL, created_at bigint NOT NULL)');
      const applied = await checkHistory(transaction, migrations, false);
      for (const [index, migration] of migrations.entries()) {
        if (index < applied) continue;
        for (const statement of migration.sql) await transaction.execute(statement);
        await transaction.execute('INSERT INTO __drizzle_migrations (id, hash, created_at) VALUES ($1,$2,$3)', [index, migration.hash, migration.folderMillis]);
      }
      await checkSchema(transaction);
    }, 73462902);
  } finally { await db.close(); }
}
