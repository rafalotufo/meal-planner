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
test('expired pool acquisition never runs a callback after a connection becomes available', async()=>{
 const fixture=await testDatabase(false);const {Pool}=await import('pg');const {FamilyDatabase}=await import('../../lib/db/connection.ts');const pool=new Pool({connectionString:fixture.url,max:1});const db=new FamilyDatabase(pool);const held=await pool.connect();let invoked=false;
 try{await assert.rejects(db.verificationTransaction(Date.now()+100,async()=>{invoked=true;}),/Verification deadline/);held.release();await new Promise(resolve=>setTimeout(resolve,100));assert.equal(invoked,false);await db.verificationTransaction(Date.now()+1000,tx=>tx.execute('SELECT 1'));}
 finally{await db.close();await fixture.cleanup();}
});
test('advisory wait expiry and delayed JavaScript cannot retain locks or issue later writes',async()=>{
 const fixture=await testDatabase(false),db=connectDatabase(fixture.url),other=connectDatabase(fixture.url);
 try{
  await db.execute('CREATE TABLE public.deadline_probe(id integer PRIMARY KEY)');
  let release:()=>void=()=>{};let acquired:()=>void=()=>{};const ready=new Promise<void>(resolve=>{acquired=resolve;});
  const holding=db.transaction(async()=>{acquired();await new Promise<void>(resolve=>{release=resolve;});});await ready;
  await assert.rejects(other.verificationTransaction(Date.now()+100,tx=>tx.execute('INSERT INTO public.deadline_probe VALUES(1)')),/Verification deadline/);release();await holding;
  await assert.rejects(other.verificationTransaction(Date.now()+100,async tx=>{await new Promise(resolve=>setTimeout(resolve,250));await tx.execute('INSERT INTO public.deadline_probe VALUES(2)');}),/Verification deadline/);
  await new Promise(resolve=>setTimeout(resolve,300));assert.equal((await db.one<{count:number}>('SELECT count(*)::integer AS count FROM public.deadline_probe'))?.count,0);
  await other.verificationTransaction(Date.now()+1000,tx=>tx.execute('INSERT INTO public.deadline_probe VALUES(3)'));
 }finally{await other.close();await db.close();await fixture.cleanup();}
});
