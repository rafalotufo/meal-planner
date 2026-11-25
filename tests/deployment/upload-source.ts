import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { copyFile, lstat, mkdir, readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
const exec=promisify(execFile);
export function uploadExclusions(text:string):string[]{
 const rules=text.split(/\r?\n/).map(line=>line.trim()).filter(line=>line&&!line.startsWith('#'));
 // Current upload rules are slash-free basename globs. Reject new grammar until
 // its exact Vercel semantics are deliberately supported by this regression.
 if(rules.some(rule=>!/^[A-Za-z0-9_.?*~-]+$/.test(rule)))throw new Error('Unsupported Vercel exclusion grammar');
 return rules;
}
export function excludedFromUpload(path:string,rules:readonly string[]):boolean{
 const segments=path.split('/');
 return rules.some(rule=>{const pattern='^'+rule.replace(/[.+^${}()|[\]\\]/g,'\\$&').replaceAll('*','.*').replaceAll('?','.')+'$';return segments.some(segment=>new RegExp(pattern).test(segment));});
}
export async function exportUploadSource(destination:string){
 const rules=uploadExclusions(await readFile('.vercelignore','utf8'));
 const {stdout}=await exec('git',['ls-files','-z'],{maxBuffer:8*1024*1024});
 const files=stdout.split('\0').filter(path=>path&&!excludedFromUpload(path,rules));
 for(const path of files){
  const source=resolve(path),target=resolve(destination,path);
  if(!target.startsWith(resolve(destination)+'/')||!(await lstat(source)).isFile())throw new Error('Unsafe upload source');
  await mkdir(dirname(target),{recursive:true});await copyFile(source,target);
 }
 return files;
}
