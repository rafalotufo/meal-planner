import { checkHistory, checkSchema, connectDatabase, repositoryMigrations } from './connection';
export function migrateDatabase(path: string) {
  const db = connectDatabase(path, true);
  try {
    const migrations = repositoryMigrations();
    db.transaction(() => {
      db.exec('CREATE TABLE IF NOT EXISTS __drizzle_migrations (id INTEGER PRIMARY KEY AUTOINCREMENT, hash TEXT NOT NULL, created_at INTEGER NOT NULL)');
      const applied = checkHistory(db, migrations, false);
      const record = db.prepare<[string, number]>('INSERT INTO __drizzle_migrations (hash, created_at) VALUES (?, ?)');
      for (const migration of migrations.slice(applied)) {
        for (const statement of migration.sql) db.exec(statement);
        record.run(migration.hash, migration.folderMillis);
      }
      checkSchema(db, migrations);
    }).immediate();
  } finally { db.close(); }
}
