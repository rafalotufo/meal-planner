import assert from 'node:assert/strict';
import test from 'node:test';
import { parseRecipeSource } from '../lib/recipes/source.js';
import { sourceHtml, curated, response } from './recipe-brave-fixtures.js';
import { prepareCuration, curateRecipe } from '../lib/recipes/curation.js';
const url='https://recipes.example.com/chicken';
test('source extraction binds single recipe identity, title, ingredients, method and deterministic metadata',()=>{
  const parsed=parseRecipeSource(sourceHtml(),url);
  assert.equal(parsed.kind,'recipe');
  if(parsed.kind!=='recipe')return;
  assert.deepEqual(parsed.recipe.titles,['Crispy chicken']);
  assert.ok(parsed.recipe.ingredients.includes('2 chicken breasts'));
  assert.ok(parsed.recipe.method.includes('Coat chicken'));
  assert.deepEqual(parsed.recipe.time,{kind:'total',text:'30 minutes'});
  assert.equal(parsed.recipe.imageUrl,'https://images.example.com/chicken.jpg');
});
test('source rejects conflicting, ambiguous or unrelated recipe identities and embedded collection recipes',()=>{
  assert.equal(parseRecipeSource(sourceHtml('https://evil.example.com/other'),url).kind,'unsupported');
  assert.equal(parseRecipeSource(sourceHtml().replace('<h1>Crispy chicken</h1>','<h1>Chocolate cake</h1>'),url).kind,'unsupported');
  const collection=sourceHtml().replace('<h1>Crispy chicken</h1>','<h1>20 chicken recipes</h1>');
  assert.equal(parseRecipeSource(collection,url).kind,'collection');
  const multiple=sourceHtml().replace('"@type":"Recipe"','"@graph":[{"@type":"Recipe","name":"Other recipe"}],"@type":"Recipe"');
  assert.equal(parseRecipeSource(multiple,url).kind,'unsupported');
});
test('collection expansion only returns bounded safe content links, resolves relative URLs, ignores base and navigation',()=>{
  const html='<html><head><base href="https://evil.example.com"></head><body><nav><a href="/recipe/nav">Nav recipe</a></nav><main><h1>20 family recipes</h1><a href="/recipe/chicken">Chicken recipe</a><a href="https://127.0.0.1/x">Private recipe</a><a href="javascript:bad">Recipe</a><a href="#recipe">Recipe</a><a href="/login">Recipe account</a><a href="/recipe/chicken#top">Duplicate recipe</a>'+Array.from({length:20},(_,n)=>`<a href="/recipes/dish-${n}">Dinner recipe ${n}</a>`).join('')+'</main></body></html>';
  const parsed=parseRecipeSource(html,'https://recipes.example.com/family-recipes');
  assert.equal(parsed.kind,'collection');
  if(parsed.kind!=='collection')return;
  assert.equal(parsed.links.length,12);assert.equal(parsed.links[0],'https://recipes.example.com/recipe/chicken');
  assert.ok(parsed.links.every(x=>x.startsWith('https://recipes.example.com/')&&!x.includes('nav')));
});
test('parser fails closed on HTML/script/JSON-LD complexity and missing cooking information',()=>{
  for(const html of ['x'.repeat(1048577),'<div>'.repeat(257),'<script type="application/ld+json">'+JSON.stringify({x:'a'.repeat(262145)})+'</script>',sourceHtml().replace('recipeInstructions','unknownInstructions')]) {
    assert.equal(parseRecipeSource(html,url).kind,'unsupported');
  }
});

test('principal recipe H1 in an article header is captured without trusting the site header or its links',()=>{
 const html=sourceHtml().replace('<body><main><h1>','<body><header><h1>Site brand</h1><a href="/recipe/site-nav">Nav recipe</a></header><main><article><header><h1>').replace('</h1><h2>','</h1></header><h2>').replace('</main>','</article></main>');
 const parsed=parseRecipeSource(html,url);assert.equal(parsed.kind,'recipe');
 if(parsed.kind==='recipe')assert.deepEqual(parsed.recipe.titles,['Crispy chicken']);
 assert.equal(parseRecipeSource(html.replace('</article>','<header><h1>Other meal</h1></header></article>'),url).kind,'unsupported');
 assert.equal(parseRecipeSource(html.replace('<h1>Crispy chicken</h1>','<h1>Other meal</h1>'),url).kind,'unsupported');
 const collection=html.replace('<h1>Crispy chicken</h1>','<h1>20 family dinner recipes</h1>')+'<nav><a href="/recipe/other-nav">Recipe navigation</a></nav>';
 const found=parseRecipeSource(collection,url);assert.equal(found.kind,'collection');
 if(found.kind==='collection')assert.ok(found.links.every(x=>!x.includes('nav')));
});

test('Recipe instruction ItemList remains extractable and curatable while page ItemList remains a collection',async()=>{
 const html=sourceHtml().replace('"recipeInstructions":[','"recipeInstructions":{"@type":"ItemList","itemListElement":[').replace('],"totalTime"',']},"totalTime"');
 const parsed=parseRecipeSource(html,url);assert.equal(parsed.kind,'recipe');
 if(parsed.kind!=='recipe')throw new Error('Expected bound recipe evidence');
 assert.equal(parsed.recipe.method,'Coat chicken in breadcrumbs and bake until cooked through.');
 const prepared=prepareCuration(parsed.recipe,'crispy chicken','test-model');assert.ok(prepared);
 const card=await curateRecipe(parsed.recipe,prepared,{apiKey:'test-only-key',signal:new AbortController().signal,transport:async()=>Response.json(response(curated()))});
 assert.equal(card?.sourceUrl,url);assert.equal(card?.title,'Crispy chicken');
 const pageList='<script type="application/ld+json">'+JSON.stringify({'@type':'ItemList',itemListElement:[{'@type':'ListItem',item:{'@type':'Recipe',name:'Other chicken',url:'/recipe/other'}}]})+'</script>';
 const collection=parseRecipeSource(html.replace('</head>',pageList+'</head>'),url);
 assert.equal(collection.kind,'collection');
 if(collection.kind==='collection')assert.deepEqual(collection.links,['https://recipes.example.com/recipe/other']);
});
