import { test } from 'node:test';
import assert from 'node:assert/strict';
import { testDatabase } from '../family/database.ts';
import { connectDatabase } from '../../lib/db/connection.ts';
test('deadline destroys pending transaction, prevents delayed writes and returns its lock', async () => {
  const fixture = await testDatabase(false);
  const db = connectDatabase(fixture.url);
  try {
    await db.execute('CREATE TABLE public.deadline_probe (id integer PRIMARY KEY)');
    const started = Date.now();
    await assert.rejects(db.verificationTransaction(Date.now() + 150, async tx => {
      await tx.execute('INSERT INTO public.deadline_probe VALUES (1)');
      await tx.execute('SELECT pg_sleep(1)');
      await tx.execute('INSERT INTO public.deadline_probe VALUES (2)');
    }), /Verification deadline/);
    assert.ok(Date.now() - started < 1000);
    await new Promise(resolve => setTimeout(resolve, 1100));
    assert.equal((await db.one<{ count: number }>('SELECT count(*)::integer AS count FROM public.deadline_probe'))?.count, 0);
    await db.verificationTransaction(Date.now() + 1000, tx => tx.execute('INSERT INTO public.deadline_probe VALUES (3)'));
    assert.equal((await db.one<{ count: number }>('SELECT count(*)::integer AS count FROM public.deadline_probe'))?.count, 1);
  } finally { await db.close(); await fixture.cleanup(); }
});
