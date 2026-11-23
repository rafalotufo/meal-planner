// Native Mac development cluster. Never controls Homebrew's default cluster/service.
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { randomBytes } from 'node:crypto';
import { homedir } from 'node:os';
import { join, resolve } from 'node:path';
import { mkdir, readFile, writeFile, lstat, realpath, rename, chmod } from 'node:fs/promises';
import { Client } from 'pg';
const exec = promisify(execFile);
const root = join(homedir(), 'Library/Application Support/MealPlanner/postgresql-17');
const data = join(root, 'data');
const secretsFile = join(root, 'credentials.json');
const marker = 'meal-planner-native-postgresql-v1';
async function privateDirectory(path: string) {
  await mkdir(path, { recursive: true, mode: 0o700 });
  const info = await lstat(path);
  if (!info.isDirectory() || info.isSymbolicLink() || info.uid !== process.getuid?.() || await realpath(path) !== resolve(path)) throw new Error('Unsafe cluster directory');
  await chmod(path, 0o700);
}
async function privateFile(path: string) {
  try {
    const info = await lstat(path);
    if (!info.isFile() || info.isSymbolicLink() || info.uid !== process.getuid?.() || await realpath(path) !== resolve(path)) throw new Error('Unsafe private file');
    await chmod(path, 0o600);
  } catch (error) { if (!(error instanceof Error) || !('code' in error) || error.code !== 'ENOENT') throw error; }
}
async function writePrivate(path: string, value: string) {
  await privateFile(path);
  const temporary = path + '.' + randomBytes(12).toString('hex');
  await writeFile(temporary, value, { mode: 0o600, flag: 'wx' });
  await rename(temporary, path);
}
function url(user: string, password: string, database: string) {
  const value = new URL(`postgresql://127.0.0.1:5432/${database}`); value.username = user; value.password = password; return value.href;
}
async function main() {
  const action = process.argv[2];
  if (!['setup', 'start', 'stop', 'status'].includes(action)) throw new Error('Use setup, start, stop or status');
  const { stdout } = await exec('brew', ['--prefix', 'postgresql@17']);
  const bin = join(stdout.trim(), 'bin');
  await privateDirectory(root);
  let credentials: { marker: string; bootstrap: string; migrator: string; runtime: string; test: string };
  try { await privateFile(secretsFile); credentials = JSON.parse(await readFile(secretsFile, 'utf8')) as typeof credentials; }
  catch (error) {
    if (action !== 'setup' || !(error instanceof Error) || !('code' in error) || error.code !== 'ENOENT') throw error;
    const password = () => randomBytes(32).toString('hex');
    credentials = { marker, bootstrap: password(), migrator: password(), runtime: password(), test: password() };
    await writeFile(secretsFile, JSON.stringify(credentials), { mode: 0o600, flag: 'wx' });
  }
  const info = await lstat(secretsFile);
  if (credentials.marker !== marker || info.isSymbolicLink() || info.uid !== process.getuid?.() || (info.mode & 0o077) !== 0) throw new Error('Unsafe cluster credentials');
  if (action === 'setup') {
    let initialized = false;
    try { initialized = (await readFile(join(data, 'PG_VERSION'), 'utf8')).trim() === '17'; }
    catch (error) { if (!(error instanceof Error) || !('code' in error) || error.code !== 'ENOENT') throw error; }
    if (!initialized) {
      await privateDirectory(join(root, 'socket'));
      const passwordFile = join(root, 'bootstrap-password');
      await writeFile(passwordFile, credentials.bootstrap, { mode: 0o600, flag: 'wx' });
      await exec(join(bin, 'initdb'), ['-D', data, '--username=mp_bootstrap', '--auth-host=scram-sha-256', '--auth-local=scram-sha-256', `--pwfile=${passwordFile}`, '--encoding=UTF8', '--locale=C']);
      await writeFile(join(data, 'meal-planner-owner'), marker, { mode: 0o600, flag: 'wx' });
      await writeFile(join(data, 'postgresql.auto.conf'), `listen_addresses = '127.0.0.1'\nport = 5432\nunix_socket_directories = '${join(root, 'socket').replaceAll("'", "''")}'\nunix_socket_permissions = 0700\nshared_buffers = '64MB'\nmax_connections = 60\npassword_encryption = 'scram-sha-256'\nlog_statement = 'none'\nlog_min_error_statement = 'panic'\n`, { mode: 0o600 });
    }
  }
  await privateDirectory(data);
  if ((await readFile(join(data, 'meal-planner-owner'), 'utf8')) !== marker) throw new Error('Unowned cluster');
  if ((await readFile(join(data, 'PG_VERSION'), 'utf8')).trim() !== '17') throw new Error('Unexpected cluster version');
  const control = (command: string[]) => exec(join(bin, 'pg_ctl'), ['-D', data, ...command]);
  if (action === 'stop') { await control(['stop', '-m', 'fast', '-w']); console.log('Dedicated Meal Planner PostgreSQL stopped; data preserved.'); return; }
  if (action === 'status') { try { await control(['status']); console.log('Dedicated Meal Planner PostgreSQL is running.'); } catch { console.log('Dedicated Meal Planner PostgreSQL is stopped.'); } return; }
  try { await control(['status']); } catch { await control(['start', '-l', join(root, 'server.log'), '-w']); }
  if (action === 'start') { console.log('Dedicated Meal Planner PostgreSQL started on 127.0.0.1:5432.'); return; }
  const admin = new Client({ connectionString: url('mp_bootstrap', credentials.bootstrap, 'postgres') });
  await admin.connect();
  try {
    for (const [role, password, extra] of [['mp_migrator', credentials.migrator, ''], ['mp_runtime', credentials.runtime, ''], ['mp_test', credentials.test, 'CREATEDB']] as const) {
      const found = await admin.query('SELECT 1 FROM pg_roles WHERE rolname=$1', [role]);
      if (!found.rowCount) await admin.query(`CREATE ROLE ${role} LOGIN NOSUPERUSER NOCREATEROLE NOREPLICATION ${extra} PASSWORD '${password}'`);
    }
    const found = await admin.query("SELECT 1 FROM pg_database WHERE datname='meal_planner_dev'");
    if (!found.rowCount) await admin.query('CREATE DATABASE meal_planner_dev OWNER mp_migrator');
    await admin.query('REVOKE ALL ON DATABASE meal_planner_dev FROM PUBLIC');
    await admin.query('GRANT CONNECT ON DATABASE meal_planner_dev TO mp_migrator, mp_runtime');
    await admin.query('REVOKE CONNECT ON DATABASE postgres FROM PUBLIC');
    await admin.query('GRANT CONNECT ON DATABASE postgres TO mp_test');
    await admin.query('REVOKE CONNECT ON DATABASE template1 FROM PUBLIC');
  } finally { await admin.end(); }
  const owner = new Client({ connectionString: url('mp_migrator', credentials.migrator, 'meal_planner_dev') }); await owner.connect();
  try {
    await owner.query('REVOKE ALL ON SCHEMA public FROM PUBLIC');
    await owner.query('GRANT USAGE ON SCHEMA public TO mp_runtime');
    await owner.query('ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON TABLES FROM mp_runtime');
    const ledger = await owner.query("SELECT to_regclass('public.__drizzle_migrations') AS name");
    if (ledger.rows[0].name) await owner.query('REVOKE INSERT, UPDATE, DELETE ON __drizzle_migrations FROM mp_runtime');
  } finally { await owner.end(); }
  await privateDirectory('.data'); await privateDirectory('.data/postgres');
  const configuration = `DATABASE_URL=${url('mp_runtime', credentials.runtime, 'meal_planner_dev')}\nMIGRATION_DATABASE_URL=${url('mp_migrator', credentials.migrator, 'meal_planner_dev')}\nTEST_DATABASE_URL=${url('mp_test', credentials.test, 'postgres')}\n`;
  await writePrivate('.data/postgres/development.env', configuration);
  // Add only DB settings; never copy live provider keys from another checkout.
  let existing = ''; try { await privateFile('.env.local'); existing = await readFile('.env.local', 'utf8'); } catch (error) { if (!(error instanceof Error) || !('code' in error) || error.code !== 'ENOENT') throw error; }
  if (!/^DATABASE_URL=/m.test(existing)) await writePrivate('.env.local', `${existing}\n${configuration}`);
  console.log('Native PostgreSQL ready on loopback. Private credentials saved; development database and restricted roles configured.');
}
main().catch(() => { console.error('Native PostgreSQL operation failed. Check the dedicated cluster and private log; no credentials printed.'); process.exitCode = 1; });
