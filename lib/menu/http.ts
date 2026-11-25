import { NextRequest, NextResponse } from 'next/server';
import { getCookieCache } from 'better-auth/cookies';
import { authConfiguration } from '../auth';
import { noStore } from '../auth-policy';
import { apiResponse } from '../http';
import { readCryptographicSession, requireFamilyContext } from '../session';
import { readVerificationCookie, capabilityDigest } from '../verification/cookies';
import { FamilyError, verifiedIdentity } from '../identity-access';

function protect(response: Response, origin?: string) {
  const nonce = crypto.randomUUID().replaceAll('-', '');
  for (const [key, value] of Object.entries(noStore)) response.headers.set(key, value);
  response.headers.set('Content-Security-Policy', `default-src 'self'; script-src 'self' 'nonce-${nonce}'${process.env.NODE_ENV === 'development' ? " 'unsafe-eval'" : ''}; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'`);
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('Referrer-Policy', 'no-referrer');
  if (origin?.startsWith('https:')) response.headers.set('Strict-Transport-Security', 'max-age=31536000');
  return response;
}

export async function requireMenuAuthority(request: NextRequest) {
  const { origin, secret } = authConfiguration();
  let rawVerification: string | null;
  try { rawVerification = readVerificationCookie(request.headers.get('cookie')); } catch { throw new FamilyError(401, 'Unauthorized'); }
  if (rawVerification) {
    const session = await readCryptographicSession(request.headers);
    if (!session || session.kind !== 'verification' || session.session.token !== rawVerification || session.identity.sessionDigest !== capabilityDigest(rawVerification)) throw new FamilyError(401, 'Unauthorized');
    await requireFamilyContext(request.headers);
    return { identity: session.identity, credentialExpiresAt: session.session.expiresAt.getTime() };
  }
    const cached = await getCookieCache(request, { secret, strategy: 'jwe', isSecure: origin.startsWith('https:'), version: '1' });
    const identity = cached ? verifiedIdentity(cached.user) : null;
    const expiry = cached ? new Date(cached.session.expiresAt).getTime() : NaN;
    const jwtExpiry: unknown = cached && 'exp' in cached ? cached.exp : undefined;
    if (!cached || !identity || !cached.session.token.trim() || !Number.isFinite(expiry) || expiry <= Date.now() || typeof jwtExpiry !== 'number' || !Number.isFinite(jwtExpiry) || jwtExpiry * 1000 <= Date.now()) throw new FamilyError(401, 'Unauthorized');
    const session = await readCryptographicSession(request.headers);
    if (!session || session.kind !== 'google' || session.session.token !== cached.session.token || session.identity.googleSubject !== identity.googleSubject || session.identity.email !== identity.email) throw new FamilyError(401, 'Unauthorized');
    await requireFamilyContext(request.headers);
    return { identity: session.identity, credentialExpiresAt: Math.min(expiry, jwtExpiry * 1000) };
}

/** Exact menu APIs bypass Next's body-buffering Proxy, never authentication. */
export async function menuApiResponse(request: NextRequest, allowedMethods: readonly string[], action: () => Promise<Response | object>) {
  let configuration: ReturnType<typeof authConfiguration>;
  try { configuration = authConfiguration(); }
  catch { return protect(NextResponse.json({ error: 'Authentication unavailable' }, { status: 503 })); }
  const { origin } = configuration;
  if (request.headers.get('host') !== new URL(origin).host) return protect(NextResponse.json({ error: 'Misdirected request' }, { status: 421 }), origin);
  const response = await apiResponse(async () => {
    // Better Auth can otherwise fall back to the callback process's in-memory
    // adapter when a stateless cache is absent/invalid. Preserve fail-closed
    // credential behavior independently of which process handles this request.
    await requireMenuAuthority(request);
    if (!allowedMethods.includes(request.method)) return NextResponse.json({ error: 'Method not allowed' }, { status: 405, headers: { Allow: allowedMethods.join(', ') } });
    return action();
  });
  return protect(response, origin);
}
