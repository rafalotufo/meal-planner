import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { testAdminUrl } from './database.ts';
const exec = promisify(execFile);
export async function restoreBackup(source: string, target: string) {
  const admin = await testAdminUrl();
  const environment = (value: string) => {
    const url = new URL(value);
    if (url.protocol !== admin.protocol || url.host !== admin.host || !/^\/mp_test_[a-f0-9]{24}$/.test(url.pathname) || url.username !== admin.username || url.password !== admin.password) throw new Error('Refusing unsafe backup target');
    return { ...process.env, PGHOST: url.hostname, PGPORT: url.port, PGUSER: decodeURIComponent(url.username), PGPASSWORD: decodeURIComponent(url.password), PGDATABASE: url.pathname.slice(1) };
  };
  const directory = await mkdtemp(join(tmpdir(), 'meal-postgres-backup-'));
  try {
    const { stdout } = await exec('brew', ['--prefix','postgresql@17']); const bin = join(stdout.trim(), 'bin');
    const path = join(directory, 'snapshot.dump');
    await exec(join(bin,'pg_dump'), ['--format=custom','--file',path], {env:environment(source)});
    await exec(join(bin,'pg_restore'), ['--dbname',new URL(target).pathname.slice(1),'--no-owner','--no-acl','--exit-on-error',path], {env:environment(target)});
  } finally { await rm(directory, {recursive:true,force:true}); }
}
