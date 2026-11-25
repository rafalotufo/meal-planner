import { authConfiguration } from '../../../../lib/auth';
import { openVerificationDatabase, type FamilyDatabase } from '../../../../lib/db/connection';
import allowed from '../../../../lib/allowed-google-emails.json';
import { currentVerificationTarget } from '../../../../lib/verification/runtime';
import { protectVerificationResponse, verificationApiResponse } from '../../../../lib/verification/http';
export const runtime='nodejs';
async function handle(request:Request){
 let db:FamilyDatabase|undefined;
 try{const {origin,secret}=authConfiguration();return await verificationApiResponse(request,{origin,secret,target:currentVerificationTarget(),db:async deadline=>(db=await openVerificationDatabase(process.env.DATABASE_URL??'',deadline)),allowed});}
 catch{return protectVerificationResponse(Response.json({error:'Verification unavailable'},{status:503}));}
 finally{await db?.close();}
}
export const GET=handle;export const HEAD=handle;export const POST=handle;export const OPTIONS=handle;export const PUT=handle;export const PATCH=handle;export const DELETE=handle;
