// Real isolated Chrome + authenticated menu storage. Only Google/search/image and deliberate lookup failures are fixtures.
import assert from 'node:assert/strict';
import { openChrome } from '../auth/chrome.ts';
import { startServer } from '../auth/server.ts';
import { restrictedMenuDatabase } from './database.ts';
import type { Recipe } from '../../lib/recipes/types';
const fixture=await restrictedMenuDatabase();
let browser:Awaited<ReturnType<typeof openChrome>>|undefined;
let server:Awaited<ReturnType<typeof startServer>>|undefined;
try{
 browser=await openChrome();server=await startServer({DATABASE_URL:fixture.runtimeUrl},true);
 const recipes:Recipe[]=Array.from({length:12},(_,i)=>({title:`Family chicken ${i+1}`,sourceUrl:`https://recipes.example.com/meal-${i+1}`,imageUrl:'https://images.recipe-fixture.test/photo.svg',summary:'Coat the chicken and bake until cooked through.',time:{kind:'total',text:`${20+i} minutes`}}));
 await browser.google(server.origin,'test-code');await browser.recipes(server.origin,recipes);
 await browser.navigate(`${server.origin}/sign-in`);await browser.click('button');
 await browser.waitFor("location.pathname==='/' && Boolean(document.querySelector('#recipe-query'))",'member home');
 async function search(text:string){await browser!.click('#recipe-query');await browser!.send('Input.insertText',{text});await browser!.click('button[type="submit"]');await browser!.waitFor("document.querySelectorAll('[data-save-recipe]').length===12",'twelve recipe cards');}
 const buttons="Array.from(document.querySelectorAll('[data-save-recipe]'))";
 browser.failNext('/api/menu?lookup=saved',503,200,1);
 await search('family chicken');
 await browser.waitFor(`${buttons}.slice(0,6).every(x=>x.textContent.trim()==='Add to menu') && ${buttons}.slice(6).every(x=>x.textContent.trim()==='Retry checking menu')`,'second chunk fails closed independently');
 const lookupBodies=browser.requestDetails.filter(x=>new URL(x.url).search==='?lookup=saved').map(x=>JSON.parse(x.postData??'{}'));
 assert.equal(lookupBodies.length,2);assert.ok(lookupBodies.every(x=>Array.isArray(x.sourceUrls)&&x.sourceUrls.length===6));
 await browser.click('article:nth-child(7) [data-save-recipe]');
 await browser.waitFor(`${buttons}.every(x=>x.textContent.trim()==='Add to menu')`,'retry establishes membership for all twelve');
 await browser.click('article:nth-child(7) [data-save-recipe]');
 await browser.waitFor(`${buttons}[6]?.textContent.trim()==='Added to menu'`,'seventh recipe saved');
 await browser.click('article:nth-child(12) [data-save-recipe]');
 await browser.waitFor(`${buttons}[11]?.textContent.trim()==='Added to menu'`,'twelfth recipe saved');
 for(const width of [390,1440]){await browser.viewport(width);await browser.screenshot(`org/reviews/brave-parallel-search-${width}.png`);}
 // An out-of-chunk source must not mark any unknown second-chunk member available.
 browser.replyNext('/api/menu?lookup=saved',200,{savedSourceUrls:[recipes[0].sourceUrl]},100,1);
 await browser.click('#search-heading-1');await browser.click('#search-heading-1');
 await browser.waitFor(`${buttons}[7]?.textContent.trim()==='Retry checking menu'`,'cross-chunk response rejected');
 assert.equal(await browser.evaluate(`${buttons}[6]?.textContent.trim()`),'Added to menu','known saved membership preserved after lookup failure');
 // A lookup snapshot in flight cannot overwrite a successful save in another completed chunk.
 browser.replyNext('/api/menu?lookup=saved',200,{savedSourceUrls:[]},800,1);
 await browser.click('article:nth-child(8) [data-save-recipe]');
 await browser.waitFor(`${buttons}[0]?.textContent.trim()==='Add to menu'`,'first chunk ready while second waits');
 await browser.click('article:nth-child(1) [data-save-recipe]');
 await browser.waitFor(`${buttons}[0]?.textContent.trim()==='Added to menu' && ${buttons}[7]?.textContent.trim()==='Add to menu'`,'save survives later chunk completion');
 // Closing the active panel aborts both owned chunk requests and stale responses cannot update new selection.
 const lookupsBefore=browser.requestDetails.filter(x=>new URL(x.url).search==='?lookup=saved').length;
 browser.replyNext('/api/menu?lookup=saved',200,{savedSourceUrls:[]},5000);
 await browser.click('#search-heading-1');await browser.click('#search-heading-1');
 for(let i=0;i<100&&browser.requestDetails.filter(x=>new URL(x.url).search==='?lookup=saved').length<lookupsBefore+2;i++)await new Promise(resolve=>setTimeout(resolve,10));
 assert.ok(browser.requestDetails.filter(x=>new URL(x.url).search==='?lookup=saved').length>=lookupsBefore+2,'reopened panel starts both lookups');
 await browser.click('#search-heading-1');
 await browser.waitFor("document.querySelector('#search-heading-1').getAttribute('aria-expanded')==='false'",'panel closed');
 for(let i=0;i<100&&!browser.abortedFixtures.includes(server.origin+'/api/menu?lookup=saved');i++)await new Promise(resolve=>setTimeout(resolve,10));
 assert.ok(browser.abortedFixtures.includes(server.origin+'/api/menu?lookup=saved'),'selection cleanup aborts pending owned lookup');
 await browser.click('#search-heading-1');
 await browser.waitFor(`${buttons}[0]?.textContent.trim()==='Added to menu' && ${buttons}[6]?.textContent.trim()==='Added to menu' && ${buttons}[11]?.textContent.trim()==='Added to menu'`,'fresh lookup reconciles saved recipes');
 await browser.click('[role="group"] button[aria-pressed="false"]');
 await browser.waitFor("document.querySelector('[role=group] button[aria-pressed=true]')?.textContent.includes('25')",'quick filter selected');
 assert.equal(await browser.evaluate("document.querySelectorAll('article').length"),6);
 await browser.click('[role="group"] button');
 assert.equal(await browser.evaluate("document.querySelectorAll('article').length"),12);
 await browser.send('Input.dispatchKeyEvent',{type:'keyDown',key:'Tab',code:'Tab',windowsVirtualKeyCode:9});await browser.send('Input.dispatchKeyEvent',{type:'keyUp',key:'Tab',code:'Tab',windowsVirtualKeyCode:9});
 assert.equal(await browser.evaluate("document.activeElement?.matches(':focus-visible')"),true,'keyboard focus visible');
 const unexpected=browser.errors.filter(x=>!x.includes('503'));
 assert.deepEqual(unexpected,[]);
 console.log('Brave twelve-card Chrome QA passed at390/1440: chunks, seventh/twelfth saves, retry, out-of-chunk data, save reconciliation, selection abort, filters and focus.');
}finally{
 const stops=await Promise.allSettled([server?.stop(),browser?.close()]);
 await fixture.cleanup();for(const result of stops)if(result.status==='rejected')throw result.reason;
}
