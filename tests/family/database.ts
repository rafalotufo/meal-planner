import { randomBytes } from 'node:crypto';
import { parseEnv } from 'node:util';
import { readFile } from 'node:fs/promises';
import { Client } from 'pg';
import { migrateDatabase } from '../../lib/db/migrate.ts';
import { openDatabase, validateDatabaseUrl } from '../../lib/db/connection.ts';

export async function testAdminUrl() {
  const config = process.env.TEST_DATABASE_URL ?? parseEnv(await readFile('.data/postgres/development.env', 'utf8')).TEST_DATABASE_URL;
  const url = validateDatabaseUrl(config);
  if (url.hostname !== '127.0.0.1' || url.username !== 'mp_test' || url.pathname !== '/postgres') throw new Error('Tests require the dedicated loopback test role');
  return url;
}
export async function testDatabase(migrate = true) {
  const adminUrl = await testAdminUrl();
  const name = `mp_test_${randomBytes(12).toString('hex')}`;
  const admin = new Client({ connectionString: adminUrl.href }); await admin.connect();
  try { await admin.query(`CREATE DATABASE "${name}"`); await admin.query(`REVOKE CONNECT ON DATABASE "${name}" FROM PUBLIC`); }
  finally { await admin.end(); }
  const url = new URL(adminUrl); url.pathname = `/${name}`;
  async function cleanup() {
    const client = new Client({ connectionString: adminUrl.href }); await client.connect();
    try {
      const row = await client.query<{ owner: string }>('SELECT pg_get_userbyid(datdba) AS owner FROM pg_database WHERE datname=$1', [name]);
      if (!row.rowCount) return;
      if (row.rows[0].owner !== 'mp_test' || !/^mp_test_[a-f0-9]{24}$/.test(name)) throw new Error('Refusing unsafe test cleanup');
      // Runtime role backends can briefly outlive a closed child/pool. The test
      // role cannot terminate them; wait for disconnect rather than elevating.
      for (let attempt = 0; ; attempt++) {
        try { await client.query(`DROP DATABASE "${name}" WITH (FORCE)`); break; }
        catch (error) {
          const code = error && typeof error === 'object' && 'code' in error ? error.code : '';
          if (!['42501','55006'].includes(String(code)) || attempt >= 30) throw new Error('Owned disposable database cleanup did not finish');
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }
    } finally { await client.end(); }
  }
  try { if (migrate) await migrateDatabase(url.href); }
  catch (error) { await cleanup(); throw error; }
  return { url: url.href, open: () => openDatabase(url.href, { ownerTooling: true }), cleanup };
}
