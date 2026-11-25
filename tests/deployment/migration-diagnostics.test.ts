import assert from 'node:assert/strict';
import { test } from 'node:test';
import { restrictedMenuDatabase } from '../menu/database.ts';
import { CookieJar, startServer } from '../auth/server.ts';
import { provision, signInWithGoogle } from '../auth/flow.ts';

test('protected HTTP faults conceal migration diagnostics and never repair changed history', async () => {
  const fixture=await restrictedMenuDatabase(),db=await fixture.open();
  let server=await startServer({DATABASE_URL:fixture.runtimeUrl},true);
  const jar=new CookieJar();
  try {
    await signInWithGoogle(server.origin,jar);
    assert.equal((await provision(server.origin,jar)).status,200);
    const secret=server.secret;
    await server.stop();
    await db.execute("UPDATE public.__drizzle_migrations SET hash=repeat('a',64) WHERE id=0");
    const before=await db.all('SELECT * FROM public.__drizzle_migrations ORDER BY id');
    server=await startServer({DATABASE_URL:fixture.runtimeUrl,BETTER_AUTH_SECRET:secret},true);
    for(const path of ['/api/session','/','/menu','/api/menu']) {
      const response=await jar.request(server.origin,path);
      assert.equal(response.status,503,path);
      const text=await response.text();
      assert.match(text,/unavailable/i);
      assert.doesNotMatch(text,/checksum-mismatch|database-ahead|incompatible-schema|__drizzle|postgresql:|mp_runtime|mp_test|Storage unavailable/);
      assert.match(response.headers.get('cache-control')??'',/private, no-store/);
    }
    assert.deepEqual(await db.all('SELECT * FROM public.__drizzle_migrations ORDER BY id'),before);
    assert.doesNotMatch(server.output(),/checksum-mismatch|postgresql:|descriptor_hash/);
  } finally {await server.stop();await db.close();await fixture.cleanup();}
});
