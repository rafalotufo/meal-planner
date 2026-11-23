import assert from 'node:assert/strict';
import { CookieJar } from './server.ts';

export function beginGoogle(origin: string, jar: CookieJar, changes: Record<string, unknown> = {}, headers: Record<string, string> = {}) {
  return jar.request(origin, '/api/auth/sign-in/social', { method: 'POST', headers: { Origin: origin, 'Content-Type': 'application/json', ...headers }, body: JSON.stringify({ provider: 'google', errorCallbackURL: '/sign-in', ...changes }) });
}

export async function signInWithGoogle(origin: string, jar: CookieJar, code = 'test-code') {
  const initial = await beginGoogle(origin, jar);
  assert.equal(initial.status, 200);
  const authorization = new URL((await initial.json()).url);
  const callback = await jar.request(origin, `/api/auth/callback/google?code=${code}&state=${encodeURIComponent(authorization.searchParams.get('state') ?? '')}`);
  return { initial, authorization, callback };
}

export function provision(origin: string, jar: CookieJar) {
  return jar.request(origin, "/api/onboarding/provision", { method: "POST", headers: { Origin: origin, "Content-Type": "application/json" }, body: "{}" });
}
