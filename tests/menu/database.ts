import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { parseEnv } from 'node:util';
import { readFile } from 'node:fs/promises';
import { connectDatabase, validateDatabaseUrl, validateMigrationPair } from '../../lib/db/connection.ts';
import { testDatabase } from '../family/database.ts';
import { restoreBackup } from '../family/postgres-backup.ts';

const exec = promisify(execFile);
export async function restrictedMenuDatabase(restoreFrom?: string) {
  const configuration = parseEnv(await readFile('.data/postgres/development.env', 'utf8'));
  const runtime = validateDatabaseUrl(configuration.DATABASE_URL);
  if (runtime.hostname !== '127.0.0.1' || runtime.username !== 'mp_runtime' || runtime.pathname !== '/meal_planner_dev') throw new Error('Expected private native runtime role');
  const fixture = await testDatabase(restoreFrom === undefined);
  const owner = validateDatabaseUrl(fixture.url);
  const name = owner.pathname.slice(1);
  if (!/^mp_test_[a-f0-9]{24}$/.test(name)) { await fixture.cleanup(); throw new Error('Expected owned random test database'); }
  runtime.pathname = owner.pathname;
  const db = connectDatabase(owner.href);
  try {
    if (restoreFrom !== undefined) await restoreBackup(restoreFrom, fixture.url);
    validateMigrationPair(owner, runtime);
    await db.execute(`GRANT CONNECT ON DATABASE "${name}" TO mp_runtime`);
    // Fresh databases inherit PUBLIC TEMP. Mirror the approved runtime deny
    // inside this owned disposable database; mp_test keeps owner privileges.
    await db.execute(`REVOKE TEMP ON DATABASE "${name}" FROM PUBLIC,mp_runtime`);
    await db.execute('REVOKE ALL ON SCHEMA public FROM PUBLIC');
    await db.execute('GRANT USAGE ON SCHEMA public TO mp_runtime');
    // Exercise the actual explicit migration/grant tool with disposable URLs.
    // Credentials are passed only in the private child environment, never argv.
    await exec(process.execPath, ['--import', 'tsx', 'scripts/migrate-db.ts'], {
      env: { ...process.env, MIGRATION_DATABASE_URL: owner.href, DATABASE_URL: runtime.href, OPENAI_API_KEY: '' },
    });
  } catch { await fixture.cleanup(); throw new Error('Disposable runtime grants failed'); }
  finally { await db.close(); }
  return { ...fixture, runtimeUrl: runtime.href };
}
