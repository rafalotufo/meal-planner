import { spawn } from 'node:child_process';
import { createServer } from 'node:net';
import { randomBytes } from 'node:crypto';
import { testDatabase } from '../family/database.ts';

type EnvironmentOverrides = Record<string, string> | ((origin: string) => Record<string, string>);

export async function startServer(overrides: EnvironmentOverrides = {}, preload = false, development = false) {
  const port = await new Promise<number>((resolve, reject) => {
    const listener = createServer();
    listener.once('error', reject);
    listener.listen(0, '127.0.0.1', () => {
      const address = listener.address();
      if (!address || typeof address === 'string') {
        listener.close();
        reject(new Error('No isolated HTTP port assigned'));
        return;
      }
      listener.close(() => resolve(address.port));
    });
  });
  const origin = `http://127.0.0.1:${port}`;
  const secret = randomBytes(48).toString('base64url');
  const config = typeof overrides === 'function' ? overrides(origin) : overrides;
  const database = config.DATABASE_URL === undefined ? await testDatabase() : undefined;
  const env: NodeJS.ProcessEnv = { ...process.env, NODE_ENV: development ? 'development' : 'production', BETTER_AUTH_URL: origin, BETTER_AUTH_SECRET: secret, GOOGLE_CLIENT_ID: 'test-client', GOOGLE_CLIENT_SECRET: 'test-client-secret', DATABASE_URL: database?.url, ...config, OPENAI_API_KEY: '', RECIPE_SEARCH_PROVIDER: 'openai' };
  delete env.MIGRATION_DATABASE_URL; delete env.TEST_DATABASE_URL;
  if (preload) env.NODE_OPTIONS = `--import=tsx --import=${new URL('./google-network.ts', import.meta.url).pathname}`;
  else delete env.NODE_OPTIONS;
  let output = '';
  const child = spawn(process.execPath, ['node_modules/next/dist/bin/next', ...(development ? ['dev', '--webpack'] : ['start']), '-H', '127.0.0.1', '-p', String(port)], { env, stdio: ['ignore', 'pipe', 'pipe'] });
  child.stdout.on('data', (data: Buffer) => { output += data; });
  child.stderr.on('data', (data: Buffer) => { output += data; });
  async function stop() {
    if (child.exitCode === null && child.signalCode === null) {
      const exited = new Promise<void>((resolve) => child.once('exit', () => resolve()));
      child.kill('SIGTERM');
      await exited;
    }
    await database?.cleanup();
  }
  for (let attempt = 0; attempt < 100; attempt++) {
    if (child.exitCode !== null) { await stop(); throw new Error(`Server exited: ${output}`); }
    try {
      await fetch(origin, { redirect: 'manual', signal: AbortSignal.timeout(2000) });
      return { origin, secret, databaseUrl: env.DATABASE_URL!, stop, output: () => output };
    } catch { await new Promise<void>((resolve) => setTimeout(resolve, 100)); }
  }
  await stop();
  throw new Error(`Server did not start: ${output}`);
}

export class CookieJar {
  values = new Map<string, string>();
  receive(response: Response): Response {
    for (const cookie of response.headers.getSetCookie()) {
      const [pair] = cookie.split(';');
      const index = pair.indexOf('=');
      const name = pair.slice(0, index);
      if (/max-age=0(?:;|$)/i.test(cookie)) this.values.delete(name);
      else this.values.set(name, pair.slice(index + 1));
    }
    return response;
  }
  header(): string { return [...this.values].map(([name, value]) => `${name}=${value}`).join('; '); }
  async request(origin: string, path: string, options: RequestInit = {}): Promise<Response> {
    const headers = new Headers(options.headers);
    headers.set('Cookie', this.header());
    const response = await fetch(`${origin}${path}`, { redirect: 'manual', ...options, headers });
    return this.receive(response);
  }
}
