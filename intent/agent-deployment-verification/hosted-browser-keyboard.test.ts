import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdtemp,readFile,realpath,rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { keyboardEvent } from './hosted-browser.ts';
interface Message{id?:number;error?:unknown;result?:unknown;method?:string;params?:{requestId?:string}}
test('owned offline Chrome activates a valid native form through the Enter sequence',{timeout:60000},async()=>{
 const profile=await realpath(await mkdtemp(join(tmpdir(),'mp-offline-keyboard-')));
 const child=spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',['--headless=new','--remote-debugging-port=0',`--user-data-dir=${profile}`,'--no-first-run','--no-default-browser-check','--disable-background-networking','--disable-sync','about:blank'],{stdio:'ignore'});
 let socket:WebSocket|undefined;
 try{
  let port='';for(let i=0;i<100;i++){try{port=(await readFile(join(profile,'DevToolsActivePort'),'utf8')).split('\n')[0];break;}catch{await new Promise(resolve=>setTimeout(resolve,100));}}assert.match(port,/^\d+$/);
  const target=await(await fetch(`http://127.0.0.1:${port}/json/new?about:blank`,{method:'PUT',signal:AbortSignal.timeout(5000)})).json()as{webSocketDebuggerUrl:string};socket=new WebSocket(target.webSocketDebuggerUrl);await new Promise<void>((resolve,reject)=>{socket!.addEventListener('open',()=>resolve(),{once:true});socket!.addEventListener('error',()=>reject(new Error('Offline browser unavailable')),{once:true});});
  let next=0,blocked=0;const pending=new Map<number,{resolve(value:unknown):void;reject(error:Error):void;timer:ReturnType<typeof setTimeout>}>();
  function send<T=unknown>(method:string,params:Record<string,unknown>={}):Promise<T>{return new Promise((resolve,reject)=>{const id=++next,timer=setTimeout(()=>{pending.delete(id);reject(new Error('Offline command deadline'));},5000);pending.set(id,{resolve:value=>resolve(value as T),reject,timer});socket!.send(JSON.stringify({id,method,params}));});}
  socket.addEventListener('message',event=>{const message=JSON.parse(String(event.data))as Message;if(message.id){const item=pending.get(message.id);if(item){clearTimeout(item.timer);pending.delete(message.id);if(message.error)item.reject(new Error('Offline protocol failure'));else item.resolve(message.result);}}if(message.method==='Fetch.requestPaused'&&message.params?.requestId){blocked++;void send('Fetch.failRequest',{requestId:message.params.requestId,errorReason:'Aborted'}).catch(()=>{});}});
  await send('Page.enable');await send('Runtime.enable');await send('Fetch.enable',{patterns:[{urlPattern:'http*',requestStage:'Request'}]});
  async function evaluate<T>(expression:string){const value=await send<{result:{value:T}}>('Runtime.evaluate',{expression,returnByValue:true});return value.result.value;}
  const html='<form onsubmit="event.preventDefault();window.submissions=(window.submissions||0)+1"><input id="run" required><input id="credential" type="password" required><button>Submit</button></form>';
  await send('Page.navigate',{url:`data:text/html,${encodeURIComponent(html)}`});for(let i=0;i<100&&!await evaluate<boolean>("Boolean(document.querySelector('#run'))");i++)await new Promise(resolve=>setTimeout(resolve,50));
  await send('Input.dispatchKeyEvent',{type:'keyDown',key:'Tab',code:'Tab',windowsVirtualKeyCode:9});await send('Input.dispatchKeyEvent',{type:'keyUp',key:'Tab',code:'Tab',windowsVirtualKeyCode:9});await send('Input.insertText',{text:'dummy-run'});
  await send('Input.dispatchKeyEvent',{type:'keyDown',key:'Tab',code:'Tab',windowsVirtualKeyCode:9});await send('Input.dispatchKeyEvent',{type:'keyUp',key:'Tab',code:'Tab',windowsVirtualKeyCode:9});await send('Input.insertText',{text:'dummy-not-a-real-credential'});
  await send('Input.dispatchKeyEvent',{type:'keyDown',key:'Tab',code:'Tab',windowsVirtualKeyCode:9});await send('Input.dispatchKeyEvent',{type:'keyUp',key:'Tab',code:'Tab',windowsVirtualKeyCode:9});
  assert.equal(await evaluate<boolean>("document.querySelector('form').checkValidity()&&document.activeElement.tagName==='BUTTON'&&document.hasFocus()"),true);
  await send('Input.dispatchKeyEvent',keyboardEvent('keyDown','Enter','Enter',13));await send('Input.dispatchKeyEvent',keyboardEvent('keyUp','Enter','Enter',13));
  await new Promise(resolve=>setTimeout(resolve,100));assert.equal(await evaluate<number>('window.submissions||0'),1);assert.equal(blocked,0);
 }finally{socket?.close();if(child.exitCode===null&&child.signalCode===null){const exit=new Promise<void>(resolve=>child.once('exit',()=>resolve()));child.kill('SIGTERM');await exit;}await rm(profile,{recursive:true,force:true,maxRetries:5,retryDelay:100});}
});
