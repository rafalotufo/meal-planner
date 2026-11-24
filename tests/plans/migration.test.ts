import assert from 'node:assert/strict';
import { test } from 'node:test';
import { randomUUID } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { testDatabase } from '../family/database.ts';
import { restrictedMenuDatabase } from '../menu/database.ts';
import { connectDatabase, openDatabase } from '../../lib/db/connection.ts';
import { migrateDatabase } from '../../lib/db/migrate.ts';
test('weekly schema constraints, exact runtime privileges and disposable rollback', async()=>{
 const fixture=await restrictedMenuDatabase();const db=await fixture.open();const runtime=await openDatabase(fixture.runtimeUrl);
 try{
  const family=randomUUID(),id=randomUUID();await db.execute('INSERT INTO families VALUES ($1,$2)',[family,1]);
  const meals=JSON.stringify(Array(7).fill({title:'Dinner',summary:'Cook.',sourceUrl:'https://example.test/',imageUrl:null,time:null}));
  const insert=(week:string,revision:number,status:string,finalizedAt:number|null,content=meals)=>runtime.execute('INSERT INTO meal_plan_weeks (id,family_id,week_start,revision,status,meals,created_at,finalized_at) VALUES ($1,$2,$3,$4,$5,$6,1,$7)',[randomUUID(),family,week,revision,status,content,finalizedAt]);
  await runtime.execute('INSERT INTO meal_plan_weeks (id,family_id,week_start,meals,created_at) VALUES ($1,$2,$3,$4,1)',[id,family,'2026-11-29',meals]);
  await assert.rejects(insert('2026-11-29',1,'draft',null),{code:'23505'});
  for(const args of [['2026-11-30',1,'draft',null],['2026-12-06',0,'draft',null],['2026-12-06',1,'final',null],['2026-12-06',1,'draft',2],['2026-12-06',1,'draft',null,'[]']] as const) await assert.rejects(insert(args[0],args[1],args[2],args[3],args[4]));
  await runtime.execute('UPDATE meal_plan_weeks SET revision=revision WHERE id=$1',[id]);
  for(const sql of ['DELETE FROM meal_plan_weeks','TRUNCATE meal_plan_weeks','DELETE FROM meal_plan_suggestions','CREATE TABLE denied_weekly (id text)',"UPDATE __drizzle_migrations SET hash='bad'"]) await assert.rejects(runtime.execute(sql),{code:'42501'});
 }finally{await runtime.close();await db.close();await fixture.cleanup();}
 const rollback=await testDatabase();const owner=connectDatabase(rollback.url);
 try{await owner.execute(await readFile('drizzle/postgresql/rollback-plans-test.sql','utf8'));await owner.execute(await readFile('drizzle/postgresql/rollback-menu-test.sql','utf8'));await owner.execute(await readFile('drizzle/postgresql/rollback-initial.sql','utf8'));assert.deepEqual(await owner.all("SELECT tablename FROM pg_tables WHERE schemaname='public'"),[]);await migrateDatabase(rollback.url);}
 finally{await owner.close();await rollback.cleanup();}
});
