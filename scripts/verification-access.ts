import { readFile } from 'node:fs/promises';
import { openDatabase, validateDatabaseUrl } from '../lib/db/connection.ts';
import { databaseIdentity, VERIFICATION_ORIGIN, type VerificationTarget } from '../lib/verification/target.ts';
import { issueVerificationRun, writeHandoff, revokeVerificationRun, cleanupVerificationRun } from '../lib/verification/operator.ts';
import hosted from '../intent/postgresql-persistence/hosted-resources.json';
async function main() {
  const [command,...argv]=process.argv.slice(2);
  if (!['issue','revoke','cleanup'].includes(command ?? '') || argv.length%2) throw new Error();
  const values=new Map<string,string>();
  for(let i=0;i<argv.length;i+=2) { if(!['--record','--output','--scope','--run'].includes(argv[i])||values.has(argv[i])||!argv[i+1]) throw new Error(); values.set(argv[i],argv[i+1]); }
  const record: unknown=JSON.parse(await readFile(values.get('--record') ?? '', 'utf8'));
  if(!record||typeof record!=='object'||!('target' in record)||!('environment' in record)||record.environment!=='preview'||!('inspectedAt' in record)||typeof record.inspectedAt!=='number'||record.inspectedAt>Date.now()||Date.now()-record.inspectedAt>600000) throw new Error();
  const target=record.target as VerificationTarget;
  if(!target||typeof target!=='object'||target.origin!==VERIFICATION_ORIGIN||target.projectId!=='prj_ntxXnJAVA977jHjLNDR7xJuwSx4V'||!/^dpl_[A-Za-z0-9]+$/.test(target.deploymentId)||!/^[a-f0-9]{40}$/.test(target.sourceSha)||!/^[a-f0-9]{64}$/.test(target.profileSha256)) throw new Error();
  const url=validateDatabaseUrl(process.env.VERIFICATION_OPERATOR_DATABASE_URL);
  if(url.hostname.replace(/-pooler(?=\.)/,'')!==hosted.preview.host||url.pathname!==`/${hosted.preview.database}`||url.username==='mp_runtime'||target.databaseIdentity!==databaseIdentity(url.href)) throw new Error();
  const db=await openDatabase(url.href,{ownerTooling:true});
  try {
    if(command==='issue') {
      const scope=values.get('--scope'); if(!['app','collaboration'].includes(scope ?? '')||!values.get('--output')||values.has('--run')) throw new Error();
      const issued=await issueVerificationRun(db,target,scope as 'app'|'collaboration');
      try { await writeHandoff(values.get('--output')!,issued); }
      catch(error) { await revokeVerificationRun(db,issued.runId,target); throw error; }
      console.log(JSON.stringify({runId:issued.runId,expiresAt:issued.expiresAt,members:issued.members.map(member=>member.memberId)}));
    } else {
      if(values.has('--output')||values.has('--scope')||!values.get('--run')) throw new Error();
      if(command==='revoke') await revokeVerificationRun(db,values.get('--run')!,target);
      else await cleanupVerificationRun(db,values.get('--run')!,target);
      console.log(JSON.stringify({runId:values.get('--run'),action:command}));
    }
  } finally { await db.close(); }
}
main().catch(()=>{console.error('Verification operation refused or unavailable');process.exitCode=1;});
