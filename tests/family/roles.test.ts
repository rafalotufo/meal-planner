import assert from 'node:assert/strict';
import { test } from 'node:test';
import { parseEnv } from 'node:util';
import { readFile } from 'node:fs/promises';
import { Client } from 'pg';
import { testAdminUrl } from './database.ts';
import { restrictedMenuDatabase } from '../menu/database.ts';

test('native runtime is DML-only and test credentials cannot access development data', async () => {
  const configuration = parseEnv(await readFile('.data/postgres/development.env', 'utf8'));
  assert.ok(configuration.DATABASE_URL);
  const url = new URL(configuration.DATABASE_URL);
  assert.equal(url.hostname, '127.0.0.1'); assert.equal(url.username, 'mp_runtime'); assert.equal(url.pathname, '/meal_planner_dev');
  const fixture = await restrictedMenuDatabase();
  const runtime = new Client({ connectionString: fixture.runtimeUrl }); await runtime.connect();
  try {
    const role = await runtime.query<{ rolsuper: boolean; rolcreatedb: boolean; rolcreaterole: boolean }>('SELECT rolsuper, rolcreatedb, rolcreaterole FROM pg_roles WHERE rolname=current_user');
    assert.deepEqual(role.rows[0], {rolsuper:false,rolcreatedb:false,rolcreaterole:false});
    await runtime.query('SELECT hash FROM __drizzle_migrations');
    await assert.rejects(() => runtime.query('CREATE TABLE public.forbidden (id text)'), {code:'42501'});
    await assert.rejects(() => runtime.query("UPDATE __drizzle_migrations SET hash='forbidden'"), {code:'42501'});
    await assert.rejects(() => runtime.query('CREATE DATABASE mp_test_forbidden'), {code:'42501'});
    const permission = await runtime.query<{ ok: boolean }>("SELECT has_table_privilege(current_user, 'app_users', 'SELECT, INSERT, UPDATE, DELETE') AS ok");
    assert.equal(permission.rows[0].ok, true);
  } finally { await runtime.end(); await fixture.cleanup(); }
  const testUrl = await testAdminUrl(); testUrl.pathname='/meal_planner_dev';
  const denied = new Client({connectionString:testUrl.href});
  try { await assert.rejects(() => denied.connect(), {code:'42501'}); } finally { await denied.end(); }
});
