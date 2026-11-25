import type { FamilyDatabase } from '../db/connection';
import { FamilyError } from '../identity-access';
import { validateGoogleAccessList } from '../google-access';
import { noStore } from '../auth-policy';
import { cookieValues, NONCE_COOKIE, uuidPattern, validNonce, verificationCookie } from './cookies';
import { exchangeVerification, throttleVerification } from './store';
import type { VerificationTarget } from './target';
export function protectVerificationResponse(response: Response, origin?: string) {
 for(const [key,value] of Object.entries(noStore))response.headers.set(key,value);
 response.headers.set('Content-Security-Policy',"default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'");
 response.headers.set('X-Content-Type-Options','nosniff');response.headers.set('X-Frame-Options','DENY');response.headers.set('Referrer-Policy','no-referrer');
 if(origin?.startsWith('https:'))response.headers.set('Strict-Transport-Security','max-age=31536000');return response;
}
interface Dependencies { origin:string; secret:string; target:VerificationTarget|null; db:(deadline:number)=>Promise<FamilyDatabase>; allowed:unknown }
async function readForm(request:Request,deadline:number) {
 const reader=request.body?.getReader();if(!reader)throw new FamilyError(400,'Invalid request');
 let timer:ReturnType<typeof setTimeout>|undefined;let completed=false,bytes=0,text='';const decoder=new TextDecoder('utf-8',{fatal:true});
 const timeout=new Promise<never>((_,reject)=>{timer=setTimeout(()=>reject(new FamilyError(408,'Request timeout')),Math.max(1,deadline-Date.now()));});
 try {
  for(;;){const part=await Promise.race([reader.read(),timeout]);if(part.done){completed=true;break;}bytes+=part.value.byteLength;if(bytes>2048)throw new FamilyError(400,'Invalid request');text+=decoder.decode(part.value,{stream:true});}
  text+=decoder.decode();if(/%(?![a-fA-F0-9]{2})/.test(text))throw new FamilyError(400,'Invalid request');
  const fields=new URLSearchParams(text);if([...fields.keys()].length!==3||!['runId','capability','nonce'].every(key=>fields.getAll(key).length===1))throw new FamilyError(400,'Invalid request');return fields;
 } catch(error){if(error instanceof FamilyError)throw error;throw new FamilyError(400,'Invalid request');}
 finally{clearTimeout(timer);if(!completed)void reader.cancel().catch(()=>{});reader.releaseLock();}
}
export async function verificationApiResponse(request:Request,deps:Dependencies) {
 const deadline=Date.now()+5000;const finish=(response:Response)=>protectVerificationResponse(response,deps.origin);
 try {
  validateGoogleAccessList(deps.allowed);
  if(request.headers.get('host')!==new URL(deps.origin).host)return finish(Response.json({error:'Misdirected request'},{status:421}));
  if(!deps.target)return finish(Response.json({error:'Not found'},{status:404}));
  if(request.method!=='POST')return finish(Response.json({error:'Method not allowed'},{status:405,headers:{Allow:'POST'}}));
  if(request.headers.get('origin')!==deps.origin||request.headers.get('sec-fetch-site')==='cross-site')throw new FamilyError(403,'Forbidden');
  if(new URL(request.url).search||request.headers.get('content-type')?.split(';')[0].trim().toLowerCase()!=='application/x-www-form-urlencoded'||Number(request.headers.get('content-length'))>2048)throw new FamilyError(400,'Invalid request');
  const db=await deps.db(deadline);
  if(!await throttleVerification(db,`deployment:${deps.target.deploymentId}`,100,deadline))throw new FamilyError(429,'Too many attempts');
  const fields=await readForm(request,deadline);const runId=fields.get('runId')!;
  if(!uuidPattern.test(runId))throw new FamilyError(400,'Invalid request');
  const nonceCookies=cookieValues(request.headers.get('cookie'),NONCE_COOKIE);
  if(nonceCookies.length!==1||!validNonce(fields.get('nonce')!,nonceCookies[0],deps.secret))throw new FamilyError(403,'Forbidden');
  if(!await throttleVerification(db,`run:${runId}`,10,deadline))throw new FamilyError(429,'Too many attempts');
  const issued=await exchangeVerification(db,runId,fields.get('capability')!,deps.target,deps.allowed,deadline);
  const response=new Response(null,{status:303,headers:{Location:`${deps.origin}/`}});response.headers.append('Set-Cookie',verificationCookie(issued.token,issued.expiresAt));response.headers.append('Set-Cookie',`${NONCE_COOKIE}=; Path=/; Secure; HttpOnly; SameSite=Lax; Max-Age=0`);return finish(response);
 }catch(error){const status=error instanceof FamilyError?error.status:error instanceof Error&&error.message==='Verification deadline'?408:503;return finish(Response.json({error:status===503?'Verification unavailable':status===408?'Request timeout':error instanceof FamilyError?error.message:'Invalid request'},{status}));}
}
