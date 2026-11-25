import assert from 'node:assert/strict';
import { test } from 'node:test';
import { validateAttributeOptions } from '../../lib/db/attribute-options.ts';

test('NULL and exact empty arrays remain valid with either known relation class',()=>{
  for(const hasRowType of [true,false]) for(const options of [null,[]]) assert.doesNotThrow(()=>validateAttributeOptions(options,hasRowType));
});
test('only canonical positive unsigned64 marker values are accepted on row-typed relations',()=>{
  for(const value of ['1','2','9007199254740992','18446744073709551615']) assert.doesNotThrow(()=>validateAttributeOptions([`pg_attver=${value}`],true));
  assert.throws(()=>validateAttributeOptions(['pg_attver=1'],false),/incompatible-schema/);
});
test('marker parsing rejects malformed, noncanonical, overflowing or unbounded strings',()=>{
  for(const value of ['', 'pg_attver=', 'pg_attver=0','pg_attver=00','pg_attver=01','pg_attver=+1','pg_attver=-1','pg_attver=1.0','pg_attver=1e3','pg_attver=0x1','pg_attver=0/1','pg_attver=18446744073709551616','pg_attver='+'9'.repeat(21),'pg_attver='+'1'.repeat(10000),'pg_attver=١','pg_attver=１',' pg_attver=1','pg_attver= 1','pg_attver=1 ','pg_attver=1\t','pg_attver=1\n','pg_attver=1\r\n','pg_attver=1\u2028','pg_attver=1\u2029','pg_attver=1\0','PG_ATTVER=1']) {
    assert.throws(()=>validateAttributeOptions([value],true),/incompatible-schema/,JSON.stringify(value.slice(0,50)));
  }
});
test('ordinary options and all other internal-looking keys fail closed',()=>{
  for(const options of [['n_distinct=42'],['n_distinct_inherited=42'],['pg_other=1'],['pg_attver_other=1'],['pg_attver=1','n_distinct=42'],['pg_attver=1','pg_attver=2'],['pg_attver=1','pg_attver=1']]) {
    assert.throws(()=>validateAttributeOptions(options,true),/incompatible-schema/);
  }
});
test('malformed arrays, elements and property shapes are rejected',()=>{
  const sparse=new Array(1);
  const extra=Object.assign(['pg_attver=1'],{extra:true});
  const emptyExtra=Object.assign([],{extra:true});
  const symbolExtra=['pg_attver=1'];Object.defineProperty(symbolExtra,Symbol('extra'),{value:true});
  const nonenumerable=['pg_attver=1'];Object.defineProperty(nonenumerable,'extra',{value:true});
  const accessor: unknown[]=[];Object.defineProperty(accessor,'0',{get:()=>{throw new Error('Getter must not execute');},enumerable:true});
  class CustomArray extends Array<unknown> {}
  for(const options of [undefined,{},'pg_attver=1',1,true,sparse,[null],[1],[['pg_attver=1']],extra,emptyExtra,symbolExtra,nonenumerable,accessor,new CustomArray('pg_attver=1')]) {
    assert.throws(()=>validateAttributeOptions(options,true),/incompatible-schema/);
  }
});
test('relation binding must be an actual boolean even for NULL or empty options',()=>{
  for(const value of [undefined,null,0,1,'true','false',{}]) for(const options of [null,[],['pg_attver=1']]) {
    assert.throws(()=>validateAttributeOptions(options,value as boolean),/incompatible-schema/);
  }
});
