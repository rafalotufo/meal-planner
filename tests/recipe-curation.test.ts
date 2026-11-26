import assert from 'node:assert/strict';
import test from 'node:test';
import { prepareCuration, curateRecipe } from '../lib/recipes/curation.js';
import { parseRecipeSource } from '../lib/recipes/source.js';
import { sourceHtml, curated, response } from './recipe-brave-fixtures.js';
function source(){const parsed=parseRecipeSource(sourceHtml(),'https://recipes.example.com/chicken');assert.equal(parsed.kind,'recipe');if(parsed.kind!=='recipe')throw new Error('fixture');return parsed.recipe;}
test('curator uses strict tool-free source-bound output and preserves full query and deterministic metadata',async()=>{
 const query='chicken '+ 'with no mushrooms '.repeat(40);
 const prepared=prepareCuration(source(),query,'configured-model');assert.ok(prepared);
 let calls=0;
 const transport:typeof fetch=async(url,init)=>{calls++;assert.equal(String(url),'https://api.openai.com/v1/responses');assert.equal(init?.redirect,'error');const body=JSON.parse(String(init?.body));assert.equal(body.model,'configured-model');assert.equal(body.store,false);assert.equal(body.tools,undefined);assert.equal(body.max_output_tokens,1200);assert.equal(JSON.parse(body.input).query,query);assert.equal(body.text.format.strict,true);return Response.json(response(curated()));};
 const card=await curateRecipe(source(),prepared!,{apiKey:'test-only-key',signal:new AbortController().signal,transport});
 assert.equal(card?.sourceUrl,source().sourceUrl);assert.deepEqual(card?.time,{kind:'total',text:'30 minutes'});assert.equal(calls,1);
});
test('category is required in the strict response schema and uses only the existing source response', async () => {
 const prepared=prepareCuration(source(),'vegetarian main dish','model')!;
 const body=JSON.parse(prepared.body);
 assert.ok(body.text.format.schema.required.includes('category'));
 assert.deepEqual(body.text.format.schema.properties.category.enum,['main','side','veggie',null]);
 assert.match(body.instructions,/vegetarian entr/i);
 for(const category of ['main','side','veggie',null]) {
  let calls=0;
  const card=await curateRecipe(source(),prepared,{apiKey:'test-only-key',signal:new AbortController().signal,transport:async()=>{calls++;return Response.json(response(curated({category})));}});
  assert.equal(card?.category,category);assert.equal(calls,1);
 }
});
test('invalid category alone preserves a grounded card as unclassified; missing fields and bad rejection fail',async()=>{
 for(const category of ['vegetarian',1,{},['main'],undefined]) {
  const value=curated({category});
  const call=()=>curateRecipe(source(),prepareCuration(source(),'chicken','model')!,{apiKey:'test-only-key',signal:new AbortController().signal,transport:async()=>Response.json(response(value))});
  if(category===undefined) await assert.rejects(call,/SEARCH_FAILED/);
  else {const card=await call();assert.equal(card?.category,null);assert.equal(card?.title,'Crispy chicken');}
 }
 await assert.rejects(curateRecipe(source(),prepareCuration(source(),'chicken','model')!,{apiKey:'test-only-key',signal:new AbortController().signal,transport:async()=>Response.json(response(curated({accepted:false,title:null,summary:null,methodExcerpt:null,ingredientExcerpt:null,category:'main'})))}),/SEARCH_FAILED/);
});
test('curation preserves parent abort before and after the response without another call',async()=>{
 for(const before of [true,false]) {
  const controller=new AbortController();const reason=new Error('parent stopped');let calls=0;
  if(before) controller.abort(reason);
  await assert.rejects(curateRecipe(source(),prepareCuration(source(),'chicken','model')!,{apiKey:'test-only-key',signal:controller.signal,transport:async()=>{calls++;controller.abort(reason);return Response.json(response(curated()));}}),error=>error===reason);
  assert.equal(calls,before?0:1);
 }
});
test('curation rejects unsupported quotes/titles/refusals/incomplete/schema and never retries',async()=>{
 for(const value of [response(curated({title:'Other recipe'})),response(curated({methodExcerpt:'Invented fry method'})),response(curated({ingredientExcerpt:'3 beef patties'})),response(curated({sourceUrl:'https://evil.example.com'})),response(curated(),'incomplete'),{status:'completed',output:[{type:'message',content:[{type:'refusal'}]}]}]){
  let calls=0;await assert.rejects(curateRecipe(source(),prepareCuration(source(),'chicken','model')!,{apiKey:'test-only-key',signal:new AbortController().signal,transport:async()=>{calls++;return Response.json(value);}}),/SEARCH_FAILED/);assert.equal(calls,1);
 }
});
test('explicit rejection returns null; encoded payload limits prevent oversized paid work',async()=>{
 const value=curated({accepted:false,reason:'Not the requested dish.',title:null,summary:null,methodExcerpt:null,ingredientExcerpt:null});
 assert.equal(await curateRecipe(source(),prepareCuration(source(),'chicken','model')!,{apiKey:'test-only-key',signal:new AbortController().signal,transport:async()=>Response.json(response(value))}),null);
 assert.equal(prepareCuration({...source(),context:'😀'.repeat(20000)},'chicken','model'),null);
});
