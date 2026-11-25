// Test-process-only real Preview build and TLS ingress. Application code never imports this helper.
import { spawn, execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { createServer as createNetServer } from 'node:net';
import { createServer as createHttpsServer, request as httpsRequest } from 'node:https';
import { request as httpRequest } from 'node:http';
import { randomBytes } from 'node:crypto';
import { cp, mkdir, mkdtemp, readFile, realpath, rm, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { restrictedMenuDatabase } from '../menu/database.ts';
import { compatibility } from '../../lib/db/compatibility.ts';
import { databaseIdentity, VERIFICATION_ORIGIN, type VerificationTarget } from '../../lib/verification/target.ts';
import { validNonce, NONCE_COOKIE } from '../../lib/verification/cookies.ts';
import { issueVerificationRun, writeHandoff } from '../../lib/verification/operator.ts';
const exec = promisify(execFile);
async function unusedPort() {
  const listener = createNetServer();
  await new Promise<void>((resolve, reject) => { listener.once('error', reject); listener.listen(0, '127.0.0.1', resolve); });
  const address = listener.address();
  if (!address || typeof address === 'string') throw new Error('No fixture port allocated');
  await new Promise<void>((resolve, reject) => listener.close(error => error ? reject(error) : resolve()));
  return address.port;
}
export async function startVerificationServer(options: { runtimeTarget?: 'preview' | 'production'; stripRuntimeSources?: boolean; overrideLogoutFromCommit?: 'd71806a' } = {}) {
  const fixture = await restrictedMenuDatabase();
  let directory: string;
  try { directory = await realpath(await mkdtemp(join(tmpdir(), 'meal-verification-preview-'))); }
  catch (error) { await fixture.cleanup(); throw error; }
  const ownerDb = await fixture.open().catch(async (error: unknown) => { await fixture.cleanup(); await rm(directory, { recursive: true, force: true }); throw error; });
  let child: ReturnType<typeof spawn> | undefined;
  let ingress: ReturnType<typeof createHttpsServer> | undefined;
  let stopped = false;
  const secret = randomBytes(48).toString('base64url');
  let output = '';
  const exchangeObservations: { origin: string; fetchSite: string; cookieNames: string[]; nonceMatches: boolean; nonceValid: boolean }[] = [];
  const target: VerificationTarget = { projectId: 'prj_verificationfixture', deploymentId: 'dpl_verificationfixture',
    sourceSha: 'a'.repeat(40), profileSha256: 'b'.repeat(64), origin: VERIFICATION_ORIGIN,
    databaseIdentity: databaseIdentity(fixture.runtimeUrl) };
  const environment: NodeJS.ProcessEnv = { ...process.env, NODE_ENV: 'production', NEXT_TELEMETRY_DISABLED: '1',
    DATABASE_URL: fixture.runtimeUrl, OPENAI_API_KEY: '', RECIPE_SEARCH_PROVIDER: 'openai',
    BETTER_AUTH_URL: target.origin, BETTER_AUTH_SECRET: secret, GOOGLE_CLIENT_ID: 'fixture-client', GOOGLE_CLIENT_SECRET: 'fixture-secret',
    VERCEL_ENV: 'preview', VERCEL_TARGET_ENV: 'preview', VERCEL_PROJECT_ID: target.projectId, VERCEL_DEPLOYMENT_ID: target.deploymentId,
    VERCEL_GIT_COMMIT_SHA: target.sourceSha, VERIFICATION_PROFILE_SHA256: target.profileSha256, VERIFICATION_BUILD_ENABLE: '1' };
  delete environment.MIGRATION_DATABASE_URL; delete environment.TEST_DATABASE_URL; delete environment.NODE_OPTIONS;
  function sanitized(value: string) { return value.replaceAll(fixture.runtimeUrl, '[runtime database]').replaceAll(fixture.url, '[owner database]').replaceAll(secret, '[auth secret]'); }
  async function stop() {
    if (stopped) return;
    stopped = true;
    if (ingress) await new Promise<void>(resolve => { ingress!.closeAllConnections(); ingress!.close(() => resolve()); });
    if (child && child.exitCode === null && child.signalCode === null) {
      const exited = new Promise<void>(resolve => child!.once('exit', () => resolve()));
      child.kill('SIGTERM'); await exited;
    }
    await ownerDb.close(); await fixture.cleanup();
    await rm(directory, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
  }
  try {
    for (const name of ['app', 'lib', 'public', 'drizzle', 'scripts', 'tests', 'types']) {
      try { await cp(resolve(name), join(directory, name), { recursive: true }); }
      catch (error) { if (!(error instanceof Error) || !('code' in error) || error.code !== 'ENOENT' || name !== 'types') throw error; }
    }
    for (const name of ['package.json', 'pnpm-lock.yaml', 'tsconfig.json', 'next-env.d.ts', 'next.config.ts', 'postcss.config.mjs', 'proxy.ts']) await cp(resolve(name), join(directory, name));
    await mkdir(join(directory, 'intent/postgresql-persistence'), { recursive: true });
    await cp(resolve('intent/postgresql-persistence/hosted-resources.json'), join(directory, 'intent/postgresql-persistence/hosted-resources.json'));
    await symlink(resolve('node_modules'), join(directory, 'node_modules'), 'dir');
    if (JSON.stringify(JSON.parse(await readFile(join(directory, 'drizzle/postgresql/compatibility.json'), 'utf8'))) !== JSON.stringify(compatibility)) throw new Error('Fixture metadata changed while creating the snapshot; rerun from a fresh process');
    if (options.overrideLogoutFromCommit) {
      const historical = await exec('git', ['show', `${options.overrideLogoutFromCommit}:app/api/auth/[...all]/route.ts`], { cwd: resolve('.'), maxBuffer: 1024 * 1024 });
      await writeFile(join(directory, 'app/api/auth/[...all]/route.ts'), historical.stdout);
    }
    try { await exec('pnpm', ['run', 'build'], { cwd: directory, env: environment, timeout: 180000, maxBuffer: 4 * 1024 * 1024 }); }
    catch (error) {
      const result = error as { stdout?: string; stderr?: string };
      throw new Error(`Isolated fixture build failed: ${sanitized(`${result.stdout ?? ''}\n${result.stderr ?? ''}`).slice(-6000)}`);
    }
    if (options.stripRuntimeSources) {
      // Remove the owned copy only, after compilation. No application/test source or SQL remains.
      for (const name of ['app', 'lib', 'scripts', 'tests', 'types', 'drizzle', 'proxy.ts']) await rm(join(directory, name), { recursive: true, force: true });
    }
    const port = await unusedPort();
    child = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start', '-H', '127.0.0.1', '-p', String(port)], { cwd: directory, env: { ...environment, VERCEL_ENV: options.runtimeTarget ?? 'preview', VERCEL_TARGET_ENV: options.runtimeTarget ?? 'preview' }, stdio: ['ignore', 'pipe', 'pipe'] });
    child.stdout?.on('data', (data: Buffer) => { output = (output + sanitized(data.toString())).slice(-32000); });
    child.stderr?.on('data', (data: Buffer) => { output = (output + sanitized(data.toString())).slice(-32000); });
    for (let attempt = 0; ; attempt++) {
      if (child.exitCode !== null || attempt >= 100) throw new Error(`Isolated fixture server did not start: ${output}`);
      try { await fetch(`http://127.0.0.1:${port}`, { headers: { Host: new URL(target.origin).host }, redirect: 'manual', signal: AbortSignal.timeout(500) }); break; }
      catch { await new Promise(resolve => setTimeout(resolve, 100)); }
    }
    const certPath = join(directory, 'fixture-cert.pem'), keyPath = join(directory, 'fixture-key.pem');
    await exec('/usr/bin/openssl', ['req', '-x509', '-newkey', 'rsa:2048', '-nodes', '-keyout', keyPath, '-out', certPath, '-days', '1', '-subj', `/CN=${new URL(target.origin).hostname}`], { maxBuffer: 1024 * 1024 });
    ingress = createHttpsServer({ key: await readFile(keyPath), cert: await readFile(certPath) }, (request, response) => {
      if (request.url === '/api/verification/session' && request.method === 'POST') {
        let body = '';
        request.on('data', (data: Buffer) => { if (body.length < 2048) body += data.toString(); });
        request.once('end', () => {
          const values = (request.headers.cookie ?? '').split(';').map(value => value.trim().split('='));
          const nonce = values.find(([name]) => name === NONCE_COOKIE)?.[1] ?? '';
          const formNonce = new URLSearchParams(body).get('nonce') ?? '';
          exchangeObservations.push({ origin: String(request.headers.origin ?? ''), fetchSite: String(request.headers['sec-fetch-site'] ?? ''), cookieNames: values.map(([name]) => name).filter(Boolean), nonceMatches: nonce === formNonce, nonceValid: validNonce(formNonce, nonce, secret) });
        });
      }
      const upstream = httpRequest({ hostname: '127.0.0.1', port, path: request.url, method: request.method,
        headers: { ...request.headers, 'x-forwarded-proto': 'https' } }, upstreamResponse => {
        response.writeHead(upstreamResponse.statusCode ?? 502, upstreamResponse.headers); upstreamResponse.pipe(response);
      });
      upstream.once('error', () => { if (!response.headersSent) response.writeHead(502); response.end(); });
      request.once('aborted', () => upstream.destroy());
      request.pipe(upstream);
    });
    await new Promise<void>((resolve, reject) => { ingress!.once('error', reject); ingress!.listen(0, '127.0.0.1', resolve); });
    const address = ingress.address(); if (!address || typeof address === 'string') throw new Error('No TLS fixture port');
    const httpsPort = address.port;
    const run = await issueVerificationRun(ownerDb, target, 'app');
    const handoffDirectory = join(directory, 'handoff'); await mkdir(handoffDirectory, { mode: 0o700 });
    const handoffPath = join(handoffDirectory, 'run.json'); await writeHandoff(handoffPath, run);
    async function request(path: string, options: { method?: string; headers?: Record<string, string>; body?: string } = {}) {
      return new Promise<{ status: number; headers: import('node:http').IncomingHttpHeaders; body: string }>((resolve, reject) => {
        const req = httpsRequest({ hostname: '127.0.0.1', port: httpsPort, servername: new URL(target.origin).hostname, rejectUnauthorized: false,
          path, method: options.method ?? 'GET', headers: { Host: new URL(target.origin).host, ...options.headers } }, response => {
          let body = ''; response.on('data', (data: Buffer) => { body += data; }); response.once('end', () => resolve({ status: response.statusCode ?? 0, headers: response.headers, body }));
        });
        req.once('error', reject); req.setTimeout(15000, () => req.destroy(new Error('Fixture request timed out'))); req.end(options.body);
      });
    }
    return { runtimeDirectory: directory, origin: target.origin, host: new URL(target.origin).host, httpsPort, ownerDb, run, target, handoffPath, request, stop, output: () => output, exchangeObservations };
  } catch (error) { await stop(); throw error; }
}
