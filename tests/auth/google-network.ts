// Test-process-only transport fixture. Production never imports this module.
import { generateKeyPairSync, sign } from 'node:crypto';
import { readFileSync } from 'node:fs';
const allowed: unknown = JSON.parse(readFileSync(new URL('../../lib/allowed-google-emails.json', import.meta.url), 'utf8'));
if (!Array.isArray(allowed)) throw new Error('Invalid code access configuration');
const configuredEmail: unknown = allowed[0];
if (typeof configuredEmail !== 'string') throw new Error('Positive integration tests require a configured allowed account');
const { privateKey, publicKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });
const jwk = { ...publicKey.export({ format: 'jwk' }), kid: 'test-google', alg: 'RS256', use: 'sig' };
const originalFetch = globalThis.fetch;
globalThis.fetch = async (input, options) => {
  const url = new URL(typeof input === 'string' || input instanceof URL ? input : input.url);
  if (url.href === 'https://oauth2.googleapis.com/token') {
    const requestBody = options?.body;
    let body: string;
    if (requestBody instanceof URLSearchParams) body = requestBody.toString();
    else if (typeof requestBody === 'string') body = requestBody;
    else if (input instanceof Request) body = await input.text();
    else throw new Error('Unexpected Google token request body');
    const code = new URLSearchParams(body).get('code');
    const [local] = configuredEmail.split('@');
    const email = code === 'unlisted' ? 'unlisted.member@gmail.com' : code === 'wrong-domain' ? `${local}@example.test` : code === 'plus-alias' ? `${local}+alias@gmail.com` : code === 'dot-alias' ? `${local[0]}.${local.slice(1)}@gmail.com` : configuredEmail;
    const now = Math.floor(Date.now() / 1000);
    const header = Buffer.from(JSON.stringify({ alg: 'RS256', kid: 'test-google', typ: 'JWT' })).toString('base64url');
    const payload = Buffer.from(JSON.stringify({ iss: code === 'wrong-issuer' ? 'https://evil.example' : 'https://accounts.google.com', aud: code === 'wrong-audience' ? 'other-client' : 'test-client', sub: 'fixture-user', email, email_verified: code === 'unverified' ? false : code === 'string-verified' ? 'true' : true, name: 'Fixture User', iat: now, exp: code === 'expired-token' ? now - 3600 : now + 3600 })).toString('base64url');
    const value = `${header}.${payload}`;
    const idToken = `${value}.${sign('RSA-SHA256', Buffer.from(value), privateKey).toString('base64url')}`;
    return Response.json({ access_token: 'fixture-access-token', token_type: 'Bearer', expires_in: 3600, scope: 'openid email profile', id_token: code === 'bad-signature' ? `${idToken.slice(0, -6)}broken` : idToken });
  }
  if (url.href === 'https://www.googleapis.com/oauth2/v3/certs') return Response.json({ keys: [jwk] });
  if (!['127.0.0.1', 'localhost'].includes(url.hostname)) throw new Error('Unexpected external request in authentication test');
  return originalFetch(input, options);
};
