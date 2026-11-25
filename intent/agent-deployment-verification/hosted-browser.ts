// Excluded operator/audit tooling. Application code never imports this helper.
import { spawn } from 'node:child_process';
import { mkdtemp, readFile, realpath, rm, stat, lstat, mkdir, writeFile } from 'node:fs/promises';
import { dirname, isAbsolute, join } from 'node:path';
import { tmpdir } from 'node:os';
import { credentialPattern, uuidPattern } from '../../lib/verification/cookies';
const canonical='https://meal-planner-staging-rafalotufos.vercel.app';
const fixedSource='19774c7cd8ae301682003838f083b9d825d5e56d';
interface Handoff {runId:string;familyId:string;expiresAt:number;members:{memberId:string;capability:string}[]}
interface PrivateInput {shareableUrl:string;handoffPath:string}
function record(value:unknown):value is Record<string,unknown>{return value!==null&&typeof value==='object'&&!Array.isArray(value);}
async function privateJson(path:string):Promise<unknown>{
 if(!isAbsolute(path)||await realpath(path)!==path)throw new Error('Private input invalid');
 const info=await lstat(path);if(!info.isFile()||info.size>8192||(info.mode&0o077)!==0||info.uid!==process.getuid?.())throw new Error('Private input invalid');
 return JSON.parse(await readFile(path,'utf8'));
}
export async function loadHostedInput(path:string,widthValue:string|undefined){
 if(!['390','1440'].includes(widthValue??''))throw new Error('Width invalid');
 const input=await privateJson(path);
 if(!record(input)||Object.keys(input).sort().join(',')!=='handoffPath,shareableUrl'||typeof input.shareableUrl!=='string'||input.shareableUrl.length>4096||typeof input.handoffPath!=='string')throw new Error('Private input invalid');
 const url=new URL(input.shareableUrl);
 if(url.protocol!=='https:'||url.username||url.password||url.hash||url.port||!(url.origin===canonical||/^meal-planner-[a-z0-9-]+-rafalotufos-projects\.vercel\.app$/.test(url.hostname)))throw new Error('Share target invalid');
 const handoff=await privateJson(input.handoffPath);
 if(!record(handoff)||Object.keys(handoff).sort().join(',')!=='expiresAt,familyId,members,runId'||typeof handoff.runId!=='string'||!uuidPattern.test(handoff.runId)||typeof handoff.familyId!=='string'||!uuidPattern.test(handoff.familyId)||typeof handoff.expiresAt!=='number'||!Number.isSafeInteger(handoff.expiresAt)||handoff.expiresAt<=Date.now()||handoff.expiresAt>Date.now()+1800000||!Array.isArray(handoff.members)||handoff.members.length!==1)throw new Error('Handoff invalid');
 const member:unknown=handoff.members[0];
 if(!record(member)||Object.keys(member).sort().join(',')!=='capability,memberId'||typeof member.memberId!=='string'||!uuidPattern.test(member.memberId)||typeof member.capability!=='string'||!credentialPattern.test(member.capability))throw new Error('Handoff invalid');
 return {input:input as unknown as PrivateInput,handoff:handoff as unknown as Handoff,width:Number(widthValue) as 390|1440};
}
export function keyboardEvent(type:'keyDown'|'keyUp',key:string,code:string,windowsVirtualKeyCode:number):Record<string,unknown>{
 return {type,key,code,windowsVirtualKeyCode,...(type==='keyDown'&&key==='Enter'?{text:'\r',unmodifiedText:'\r'}:{})};
}
export class HostedNetworkDiagnostics {
 private readonly scripts=new Set<string>();
 observe(id:string,url:string,type:string){
  this.scripts.delete(id);
  if(type==='Script'&&originCategory(url)==='vercel-live'&&this.scripts.size<64)this.scripts.add(id);
 }
 expectedCspFailure(id:string,reason:string|undefined){return reason==='csp'&&this.scripts.has(id);}
}
interface NetworkLog {origin:string;path:string;logout:boolean}
export function expectedLogoutNetworkLog(log:NetworkLog,seenSession401:boolean){return seenSession401&&log.logout&&log.origin==='canonical'&&log.path==='session';}
export function settleHostedNetworkLogs(observed:Observations){
 for(const log of observed.pendingNetworkLogs){if(expectedLogoutNetworkLog(log,observed.expectedSession401))observed.expectedLogoutLogs++;else browserFailure(observed,'log-network');}
 observed.pendingNetworkLogs=[];
}
interface ProtocolMessage {id?:number;error?:unknown;result?:unknown;method?:string;params?:{type?:string;requestId?:string;networkId?:string;resourceType?:string;request?:{url:string;method:string;headers?:Record<string,string>};response?:{url:string;status:number;headers?:Record<string,string>};redirectResponse?:{url:string;status:number;headers?:Record<string,string>};frame?:{parentId?:string};entry?:{level?:string;source?:string;url?:string;text?:string};args?:{value?:unknown}[];blockedReason?:string;errorText?:string}}
interface Observations {expectedSession401:boolean;expectedLogoutLogs:number;expectedPlatformCspFailures:number;pendingNetworkLogs:NetworkLog[];exchangeCount:number;exchangeStatus:number|null;nativeOrigin:boolean;entrySameOriginPolicy:boolean;logoutStatus:number|null;bootstrapStatus:number|null;platformAssetsBlocked:number;forbiddenRequests:number;browserErrors:number;browserVersion:string;errorCategories:Record<string,number>;httpFailures:{status:number;path:string}[];csp:{directive:string;origin:string}[]}
function originCategory(value:string|undefined){try{const origin=new URL(value??'').origin;return origin===canonical?'canonical':origin==='https://vercel.live'?'vercel-live':'other';}catch{return 'other';}}
function pathCategory(value:string){try{const url=new URL(value);if(url.origin!==canonical)return originCategory(value);return ({'/verification':'entry','/api/verification/session':'exchange','/api/auth/sign-out':'logout','/api/session':'session','/':'home','/family':'family','/menu':'menu','/plans':'plans','/sign-in':'sign-in'}as Record<string,string>)[url.pathname]??(url.pathname.startsWith('/_next/')?'app-static':'canonical-other');}catch{return 'other';}}
function browserFailure(observed:Observations,category:string){observed.browserErrors++;observed.errorCategories[category]=(observed.errorCategories[category]??0)+1;}
function classifyCsp(observed:Observations,textValue:unknown,url?:string){
 const text=typeof textValue==='string'?textValue.slice(0,4096):'';
 if(!/content[- ]security[- ]policy|violates.*(?:script-src|connect-src|frame-src|img-src|style-src|form-action)/i.test(text))return false;
 const directive=['form-action','script-src','connect-src','frame-src','img-src','style-src'].find(value=>text.includes(value))??'other';
 const knownPlatform=/https:\/\/vercel\.live(?:\/|['"\s])/i.test(text)||originCategory(url)==='vercel-live';
 if(observed.csp.length<12)observed.csp.push({directive,origin:knownPlatform?'vercel-live':originCategory(url)});
 if(knownPlatform&&directive!=='form-action'){observed.platformAssetsBlocked++;return true;}
 return false;
}
export function observeHostedResponse(message:ProtocolMessage,observed:Observations,logout:boolean){
 const response=message.method==='Network.responseReceived'?message.params?.response:message.method==='Network.requestWillBeSent'?message.params?.redirectResponse:undefined;
 if(!response)return;
 try{const url=new URL(response.url);if(url.origin===canonical){
  if(url.pathname==='/api/verification/session')observed.exchangeStatus=response.status;
  if(url.pathname==='/api/auth/sign-out')observed.logoutStatus=response.status;
  if(url.pathname==='/verification')observed.entrySameOriginPolicy=Object.entries(response.headers??{}).some(([key,value])=>key.toLowerCase()==='referrer-policy'&&value==='same-origin');
  if(logout&&url.pathname==='/api/session'&&response.status===401)observed.expectedSession401=true;
  if(response.status>=400&&!(logout&&url.pathname==='/api/session'&&response.status===401)){browserFailure(observed,'http-error');if(observed.httpFailures.length<24)observed.httpFailures.push({status:response.status,path:pathCategory(response.url)});}
 }}catch{browserFailure(observed,'response-metadata');}
}
async function openHostedChrome(shareOrigin:string,observed:Observations){
 const profile=await realpath(await mkdtemp(join(tmpdir(),'meal-hosted-chrome-')));
 const child=spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',['--headless=new','--remote-debugging-port=0','--remote-debugging-address=127.0.0.1',`--user-data-dir=${profile}`,'--no-proxy-server','--no-first-run','--no-default-browser-check','--disable-background-networking','--disable-sync','--disable-extensions','about:blank'],{stdio:'ignore'});
 let socket:WebSocket|undefined;let phase:'bootstrap'|'application'|'logout'='bootstrap';let nextId=0,navigations=0,closed=false;
 const pending=new Map<number,{resolve(value:unknown):void;reject(error:Error):void;timer:ReturnType<typeof setTimeout>}>();
 const expectedBlocked=new Set<string>();const diagnostics=new HostedNetworkDiagnostics();
 async function close(){
  if(closed)return;closed=true;
  for(const item of pending.values()){clearTimeout(item.timer);item.reject(new Error('Browser closed'));}pending.clear();socket?.close();
  if(child.exitCode===null&&child.signalCode===null){const exited=new Promise<void>(resolve=>child.once('exit',()=>resolve()));child.kill('SIGTERM');let timer:ReturnType<typeof setTimeout>|undefined;await Promise.race([exited,new Promise<void>(resolve=>{timer=setTimeout(()=>{child.kill('SIGKILL');resolve();},5000);})]);clearTimeout(timer);await exited;}
  await rm(profile,{recursive:true,force:true,maxRetries:5,retryDelay:100});
 }
 function send<T=unknown>(method:string,params:Record<string,unknown>={}):Promise<T>{
  if(closed||!socket||socket.readyState!==WebSocket.OPEN)return Promise.reject(new Error('Browser unavailable'));
  return new Promise((resolve,reject)=>{const id=++nextId;const timer=setTimeout(()=>{pending.delete(id);reject(new Error('Browser command deadline'));},10000);pending.set(id,{resolve:value=>resolve(value as T),reject,timer});socket!.send(JSON.stringify({id,method,params}));});
 }
 try{
  let port='';for(let attempt=0;attempt<100;attempt++){try{port=(await readFile(join(profile,'DevToolsActivePort'),'utf8')).split('\n')[0];break;}catch{await new Promise(resolve=>setTimeout(resolve,100));}}
  if(!/^\d{1,5}$/.test(port))throw new Error('Browser startup failed');
  const response=await fetch(`http://127.0.0.1:${port}/json/new?about:blank`,{method:'PUT',signal:AbortSignal.timeout(5000)});const target:unknown=await response.json();
  if(!record(target)||typeof target.webSocketDebuggerUrl!=='string'||!target.webSocketDebuggerUrl.startsWith(`ws://127.0.0.1:${port}/`))throw new Error('Browser target invalid');
  socket=new WebSocket(target.webSocketDebuggerUrl);await new Promise<void>((resolve,reject)=>{const timer=setTimeout(()=>reject(new Error('Browser startup deadline')),5000);socket!.addEventListener('open',()=>{clearTimeout(timer);resolve();},{once:true});socket!.addEventListener('error',()=>{clearTimeout(timer);reject(new Error('Browser startup failed'));},{once:true});});
  socket.addEventListener('message',event=>{
   const text=String(event.data);if(text.length>1048576){browserFailure(observed,'protocol-size');return;}let message:ProtocolMessage;try{message=JSON.parse(text) as ProtocolMessage;}catch{browserFailure(observed,'protocol-json');return;}
   if(message.id){const item=pending.get(message.id);if(item){pending.delete(message.id);clearTimeout(item.timer);if(message.error)item.reject(new Error('Browser protocol failure'));else item.resolve(message.result);}}
   const p=message.params;
   if(message.method==='Page.frameNavigated'&&p?.frame&&!p.frame.parentId)navigations++;
   if(message.method==='Fetch.requestPaused'&&p?.request&&p.requestId){
    let allowed=false,platformAsset=false;try{
     const url=new URL(p.request.url);platformAsset=url.origin==='https://vercel.live'&&p.resourceType!=='Document';
     allowed=url.protocol==='https:'&&(url.origin===canonical||(phase==='bootstrap'&&url.origin===shareOrigin));
     if(url.origin===canonical){
      if(url.pathname==='/api/recipes/search'||(url.pathname.startsWith('/api/auth/')&&!(phase==='logout'&&url.pathname==='/api/auth/sign-out'&&p.request.method==='POST')))allowed=false;
      if(!['GET','HEAD'].includes(p.request.method)){
       const exchange=phase==='application'&&url.pathname==='/api/verification/session'&&p.request.method==='POST'&&observed.exchangeCount===0;
       const logout=phase==='logout'&&url.pathname==='/api/auth/sign-out'&&p.request.method==='POST';
       if(!exchange&&!logout)allowed=false;
       if(exchange&&allowed){observed.exchangeCount++;observed.nativeOrigin=Object.entries(p.request.headers??{}).some(([key,value])=>key.toLowerCase()==='origin'&&value===canonical);}
      }
     }else if(!['GET','HEAD'].includes(p.request.method))allowed=false;
    }catch{allowed=false;}
    if(!allowed){if(platformAsset){observed.platformAssetsBlocked++;if(p.networkId)expectedBlocked.add(p.networkId);}else observed.forbiddenRequests++;}
    void send(allowed?'Fetch.continueRequest':'Fetch.failRequest',allowed?{requestId:p.requestId}:{requestId:p.requestId,errorReason:'Aborted'}).catch(()=>{if(!closed)browserFailure(observed,'protocol-intercept');});
   }
   if(message.method==='Network.requestWillBeSent'&&p?.request&&p.requestId)diagnostics.observe(p.requestId,p.request.url,p.type??'');
   observeHostedResponse(message,observed,phase==='logout');
   if(phase==='bootstrap'&&message.method==='Network.responseReceived'&&p?.type==='Document'&&p.response)observed.bootstrapStatus=p.response.status;
   if(message.method==='Runtime.exceptionThrown')browserFailure(observed,'runtime-exception');
   if(message.method==='Runtime.consoleAPICalled'&&['error','warning','warn'].includes(p?.type??'')){const platform=p?.args?.some(arg=>classifyCsp(observed,arg.value))??false;if(!platform)browserFailure(observed,'console-'+(p?.type==='error'?'error':'warning'));}
   if(message.method==='Network.loadingFailed'&&p?.errorText!=='net::ERR_ABORTED'&&!expectedBlocked.has(p?.requestId??'')){
    if(diagnostics.expectedCspFailure(p?.requestId??'',p?.blockedReason)){observed.platformAssetsBlocked++;observed.expectedPlatformCspFailures++;}
    else browserFailure(observed,p?.blockedReason==='csp'?'network-csp':'network-failure');
   }
   if(message.method==='Log.entryAdded'&&['error','warning'].includes(p?.entry?.level??'')){
    let platform=false;try{platform=Boolean(p?.entry?.url&&new URL(p.entry.url).origin==='https://vercel.live');}catch{/* No arbitrary log text is retained. */}
    if(!platform&&!classifyCsp(observed,p?.entry?.text,p?.entry?.url)){
     const log={origin:originCategory(p?.entry?.url),path:pathCategory(p?.entry?.url??''),logout:phase==='logout'};
     if(p?.entry?.source==='network'&&log.origin==='canonical'&&log.path==='session'&&log.logout&&observed.pendingNetworkLogs.length<24)observed.pendingNetworkLogs.push(log);
     else browserFailure(observed,p?.entry?.source==='security'?'log-security':p?.entry?.source==='network'?'log-network':'log-other');
    }
   }
  });
  const browserVersion=await send<{product:string}>('Browser.getVersion');if(/^(?:HeadlessChrome|Chrome)\/\d+(?:\.\d+){1,3}$/.test(browserVersion.product))observed.browserVersion=browserVersion.product;
  for(const method of ['Page.enable','Runtime.enable','Network.enable','Log.enable'])await send(method);
  await send('Fetch.enable',{patterns:[{urlPattern:'*',requestStage:'Request'}]});
  async function evaluate<T=unknown>(expression:string):Promise<T>{const value=await send<{result:{value?:T};exceptionDetails?:unknown}>('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(value.exceptionDetails)throw new Error('Browser inspection failed');return value.result.value as T;}
  async function waitFor(expression:string){for(let attempt=0;attempt<120;attempt++){try{if(await evaluate(expression))return;}catch{/* Navigation replaces execution contexts. */}await new Promise(resolve=>setTimeout(resolve,100));}throw new Error('Browser condition deadline');}
  async function navigate(url:string){const before=navigations;await send('Page.navigate',{url});for(let attempt=0;navigations<=before;attempt++){if(attempt>=120)throw new Error('Navigation deadline');await new Promise(resolve=>setTimeout(resolve,100));}await waitFor("document.readyState==='complete'");}
  async function key(key:string,code:string,windowsVirtualKeyCode:number){await send('Input.dispatchKeyEvent',keyboardEvent('keyDown',key,code,windowsVirtualKeyCode));await send('Input.dispatchKeyEvent',keyboardEvent('keyUp',key,code,windowsVirtualKeyCode));}
  async function screenshot(path:string){const result=await send<{data:string}>('Page.captureScreenshot',{format:'png'});await writeFile(path,Buffer.from(result.data,'base64'),{mode:0o600});}
  return{send,evaluate,waitFor,navigate,key,screenshot,close,setPhase(value:typeof phase){phase=value;}};
 }catch(error){await close();throw error;}
}
export async function runHostedBrowser(){
 let stage='input',browser:Awaited<ReturnType<typeof openHostedChrome>>|undefined,outputDirectory:string|undefined,overall:ReturnType<typeof setTimeout>|undefined;
 const startedAt=new Date().toISOString();
 const observed:Observations={expectedSession401:false,expectedLogoutLogs:0,expectedPlatformCspFailures:0,pendingNetworkLogs:[],exchangeCount:0,exchangeStatus:null,nativeOrigin:false,entrySameOriginPolicy:false,logoutStatus:null,bootstrapStatus:null,platformAssetsBlocked:0,forbiddenRequests:0,browserErrors:0,browserVersion:'unobserved',errorCategories:{},httpFailures:[],csp:[]};
 const checks:Record<string,boolean>={};let width:number|null=null,passed=false;
 try{
  const prepared=await loadHostedInput(process.env.HOSTED_BROWSER_INPUT_FILE??'',process.env.HOSTED_BROWSER_WIDTH);width=prepared.width;
  const output=process.env.HOSTED_BROWSER_OUTPUT_DIRECTORY??'';if(!isAbsolute(output)||await realpath(dirname(output))!==dirname(output))throw new Error('Output invalid');
  const parent=await stat(dirname(output));if(parent.uid!==process.getuid?.())throw new Error('Output invalid');await mkdir(output,{mode:0o700});outputDirectory=output;
  const task=(async()=>{
   stage='browser-start';browser=await openHostedChrome(new URL(prepared.input.shareableUrl).origin,observed);
   await browser.send('Emulation.setDeviceMetricsOverride',{width:prepared.width,height:1000,deviceScaleFactor:1,mobile:false});
   stage='platform-bootstrap';await browser.navigate(prepared.input.shareableUrl);
   if(observed.bootstrapStatus===null||observed.bootstrapStatus>=400)throw new Error('Platform bootstrap failed');checks.platformReachable=true;
   browser.setPhase('application');stage='entry';await browser.navigate(`${canonical}/verification`);
   await browser.waitFor(`location.origin===${JSON.stringify(canonical)}&&location.pathname==='/verification'&&location.search===''&&Boolean(document.querySelector('#capability'))`);
   if(!await browser.evaluate("document.querySelector('#capability').type==='password'&&document.documentElement.scrollWidth<=innerWidth"))throw new Error('Entry invalid');
   checks.entry=true;await browser.screenshot(join(output,'entry.png'));
   let focused=false;for(let i=0;i<20;i++){await browser.key('Tab','Tab',9);if(await browser.evaluate("document.activeElement?.id==='runId'")){focused=true;break;}}if(!focused)throw new Error('Keyboard focus failed');
   await browser.send('Input.insertText',{text:prepared.handoff.runId});await browser.key('Tab','Tab',9);
   if(!await browser.evaluate("document.activeElement?.id==='capability'"))throw new Error('Keyboard focus failed');
   await browser.send('Input.insertText',{text:prepared.handoff.members[0].capability});await browser.key('Tab','Tab',9);
   if(!await browser.evaluate("document.activeElement?.tagName==='BUTTON'&&Boolean(document.activeElement.closest('form'))"))throw new Error('Keyboard submit failed');checks.keyboardEntry=true;
   const validity=await browser.evaluate<Record<string,boolean>>(`(()=>{const form=document.querySelector('form'),run=document.querySelector('#runId'),credential=document.querySelector('#capability');return{runLength:run.value.length===36,credentialLength:credential.value.length===43,formValid:form.checkValidity(),canonicalAction:form.action===${JSON.stringify(canonical+'/api/verification/session')},canonicalPage:location.origin===${JSON.stringify(canonical)},documentFocus:document.hasFocus(),submitFocused:document.activeElement===form.querySelector('button')}})()`);
   for(const [name,value]of Object.entries(validity))checks['preSubmit_'+name]=value;if(Object.values(validity).some(value=>!value))throw new Error('Native form validity failed');
   stage='native-exchange';await browser.key('Enter','Enter',13);await browser.waitFor("location.pathname==='/'&&Boolean(document.querySelector('#recipe-query'))");
   if(observed.exchangeCount!==1||observed.exchangeStatus!==303||!observed.nativeOrigin||!observed.entrySameOriginPolicy)throw new Error('Native exchange invalid');checks.nativeExchange=true;
   stage='session';const session=await browser.evaluate<{status:number;authenticated:boolean}>("fetch('/api/session',{cache:'no-store'}).then(async r=>({status:r.status,authenticated:(await r.json()).authenticated===true}))");if(session.status!==200||!session.authenticated)throw new Error('Session invalid');checks.session=true;
   for(const [path,selector,name]of[['/','#recipe-query','home'],['/family','#members-heading','family'],['/menu','#menu-heading','menu'],['/plans','#plan-heading','plans']]as const){
    stage=name;await browser.navigate(`${canonical}${path}`);await browser.waitFor(`Boolean(document.querySelector(${JSON.stringify(selector)}))`);
    if(!await browser.evaluate(`location.origin===${JSON.stringify(canonical)}&&document.documentElement.scrollWidth<=innerWidth&&!document.querySelector('[role=alert]')`))throw new Error('Page check failed');
    if(name==='family'&&!await browser.evaluate("document.body.innerText.includes('Verification member')"))throw new Error('Synthetic family missing');
    checks[name]=true;await browser.screenshot(join(output,`${name}.png`));
   }
   stage='logout';browser.setPhase('logout');await browser.navigate(`${canonical}/sign-out`);await browser.waitFor("Boolean(document.querySelector('main button'))");
   focused=false;for(let i=0;i<20;i++){await browser.key('Tab','Tab',9);if(await browser.evaluate("document.activeElement===document.querySelector('main button')")){focused=true;break;}}if(!focused)throw new Error('Keyboard logout failed');checks.keyboardLogout=true;
   await browser.screenshot(join(output,'sign-out.png'));await browser.key('Enter','Enter',13);await browser.waitFor("location.pathname==='/sign-in'");
   if(observed.logoutStatus!==200)throw new Error('Logout status invalid');checks.logout=true;
   stage='post-logout';const ended=await browser.evaluate<number>("fetch('/api/session',{cache:'no-store'}).then(r=>r.status)");if(ended!==401)throw new Error('Session retained');checks.sessionDeniedAfterLogout=true;
   await browser.navigate(`${canonical}/menu`);await browser.waitFor("location.pathname==='/sign-in'");checks.privateRedirectAfterLogout=true;
   settleHostedNetworkLogs(observed);
   if(observed.forbiddenRequests||observed.browserErrors)throw new Error('Browser request failure');
   stage='complete';passed=true;
  })();
  try{await Promise.race([task,new Promise<never>((_,reject)=>{overall=setTimeout(()=>reject(new Error('Overall browser deadline')),180000);})]);}
  finally{clearTimeout(overall);await browser?.close();await task.catch(()=>{});}
 }catch{/* No arbitrary error, URL, body, command or credential is logged. */}
 settleHostedNetworkLogs(observed);if(observed.browserErrors)passed=false;
 const report={proofClass:'hosted-synthetic-browser',expectedSourceSha:fixedSource,startedAt,endedAt:new Date().toISOString(),passed,stage,width,browser:observed.browserVersion,checks,statuses:{platformBootstrap:observed.bootstrapStatus,exchange:observed.exchangeStatus,logout:observed.logoutStatus},counts:{nativeExchanges:observed.exchangeCount,blockedPlatformAssets:observed.platformAssetsBlocked,forbiddenRequests:observed.forbiddenRequests,browserErrors:observed.browserErrors,expectedPlatformCspFailures:observed.expectedPlatformCspFailures,expectedLogoutLogs:observed.expectedLogoutLogs},diagnostics:{errors:observed.errorCategories,httpFailures:observed.httpFailures,csp:observed.csp},gaps:['Real Google OAuth not exercised','Paid providers not exercised','Firefox not exercised','Safari not exercised',...(observed.platformAssetsBlocked?['Vercel live assets blocked; platform behavior not certified']:[])],releaseAccepted:false};
 if(outputDirectory)await writeFile(join(outputDirectory,'report.json'),JSON.stringify(report,null,2)+'\n',{mode:0o600});
 console.log(JSON.stringify(report));if(!passed)process.exitCode=1;
 return report;
}
if(require.main===module)void runHostedBrowser().catch(()=>{console.error('Hosted browser verification unavailable');process.exitCode=1;});
