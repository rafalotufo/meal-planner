import assert from 'node:assert/strict';
import { test } from 'node:test';
import { Client } from 'pg';
import { connectDatabase } from '../../lib/db/connection.ts';
import { testDatabase, testAdminUrl } from './database.ts';

test('Fluid request lifetime covers idle PostgreSQL cleanup after transaction success and rollback', async () => {
  const fixture = await testDatabase();
  const contextKey = Symbol.for('@vercel/request-context');
  const previous = Reflect.get(globalThis, contextKey);
  const previousUrl = process.env.VERCEL_URL; const previousRegion = process.env.VERCEL_REGION;
  const pending: Promise<unknown>[] = [];
  Reflect.set(globalThis, contextKey, { get: () => ({ waitUntil: (promise: Promise<unknown>) => { pending.push(promise); } }) });
  process.env.VERCEL_URL = 'fixture.vercel.app'; process.env.VERCEL_REGION = 'iad1';
  const db = connectDatabase(fixture.url);
  const admin = new Client({connectionString:(await testAdminUrl()).href}); await admin.connect();
  try {
    await db.transaction(async tx => { assert.equal((await tx.one<{n:number}>('SELECT 1::int AS n'))?.n,1); });
    const failure = new Error('rollback-fixture');
    await assert.rejects(db.transaction(async () => { throw failure; }), error => error === failure);
    assert.ok(pending.length >= 2, 'successful and rolled-back transactions both register request lifetime work');
    const database = new URL(fixture.url).pathname.slice(1);
    const count = async () => (await admin.query<{n:number}>('SELECT count(*)::int AS n FROM pg_stat_activity WHERE datname=$1',[database])).rows[0].n;
    assert.ok(await count() > 0);
    await Promise.all(pending);
    assert.equal(await count(),0,'idle backend connections close before Fluid lifetime promises settle');
  } finally {
    if (previous === undefined) Reflect.deleteProperty(globalThis,contextKey); else Reflect.set(globalThis,contextKey,previous);
    if (previousUrl === undefined) delete process.env.VERCEL_URL; else process.env.VERCEL_URL=previousUrl;
    if (previousRegion === undefined) delete process.env.VERCEL_REGION; else process.env.VERCEL_REGION=previousRegion;
    await db.close(); await admin.end(); await fixture.cleanup();
  }
});
