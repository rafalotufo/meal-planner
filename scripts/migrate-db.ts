import { migrateDatabase } from '../lib/db/migrate';
import { validateDatabasePath } from '../lib/db/connection';
migrateDatabase(validateDatabasePath(process.env.DATABASE_PATH));
console.log('Database migrations completed.');
