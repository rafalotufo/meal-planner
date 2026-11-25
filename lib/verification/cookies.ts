import { createHash, createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
export const VERIFICATION_COOKIE = '__Host-mp-verification';
export const NONCE_COOKIE = '__Host-mp-verification-nonce';
export const credentialPattern = /^[A-Za-z0-9_-]{43}$/;
export const uuidPattern = /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/;
export function newCredential() { return randomBytes(32).toString('base64url'); }
export function capabilityDigest(value: string) { return createHash('sha256').update(value).digest('hex'); }
export function cookieValues(header: string | null, name: string): string[] {
  return (header ?? '').split(';').flatMap(part => {
    const separator = part.indexOf('=');
    return separator >= 0 && part.slice(0, separator).trim() === name ? [part.slice(separator + 1).trim()] : [];
  });
}
export function readVerificationCookie(header: string | null): string | null {
  const values = cookieValues(header, VERIFICATION_COOKIE);
  if (!values.length) return null;
  if (values.length !== 1 || !credentialPattern.test(values[0]) || /(?:^|;)\s*(?:__Secure-)?better-auth\.(?:session_data|session_token)(?:\.\d+)?=/.test(header ?? '')) throw new Error('Unauthorized');
  return values[0];
}
export function createNonce(secret: string, now = Date.now()) {
  const data = `${newCredential()}.${now + 300000}`;
  return `${data}.${createHmac('sha256', secret).update(data).digest('base64url')}`;
}
export function validNonce(value: string, cookie: string, secret: string, now = Date.now()) {
  if (value !== cookie || !/^[A-Za-z0-9_-]{43}\.\d{1,16}\.[A-Za-z0-9_-]{43}$/.test(value)) return false;
  const [token, expiry, signature] = value.split('.');
  const expiresAt = Number(expiry);
  if (!Number.isSafeInteger(expiresAt) || expiresAt <= now || expiresAt > now + 300000) return false;
  const expected = createHmac('sha256', secret).update(`${token}.${expiry}`).digest();
  const actual = Buffer.from(signature, 'base64url');
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}
export function verificationCookie(value: string, expiresAt: number) {
  return `${VERIFICATION_COOKIE}=${value}; Path=/; Secure; HttpOnly; SameSite=Lax; Expires=${new Date(expiresAt).toUTCString()}`;
}
export function clearVerificationCookie() { return `${VERIFICATION_COOKIE}=; Path=/; Secure; HttpOnly; SameSite=Lax; Max-Age=0`; }
