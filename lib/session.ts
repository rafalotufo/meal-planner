import 'server-only';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { getAuth } from './auth';
import allowedGoogleEmails from './allowed-google-emails.json';
import { classifyAccess, FamilyError, verifiedIdentity } from './identity-access';
import { getDatabase } from './db';
import { currentVerificationTarget } from './verification/runtime';
import { readVerificationCookie } from './verification/cookies';
import { readVerificationSession } from './verification/store';

export async function readCryptographicSession(requestHeaders: Headers) {
  let token: string | null;
  try { token = readVerificationCookie(requestHeaders.get('cookie')); } catch { return null; }
  if (token) {
    const target = currentVerificationTarget();
    if (!target) return null;
    const verification = await readVerificationSession(await getDatabase(), token, target, allowedGoogleEmails);
    return verification ? { kind: 'verification' as const, identity: verification.identity, user: verification.user, session: { token, expiresAt: new Date(verification.expiresAt) } } : null;
  }
  const session = await getAuth().api.getSession({ headers: requestHeaders });
  const identity = session ? verifiedIdentity(session.user) : null;
  return session && identity ? { ...session, kind: 'google' as const, identity } : null;
}
export async function readSession(requestHeaders: Headers) {
  const session = await readCryptographicSession(requestHeaders);
  if (!session) return null;
  if (session.kind === 'verification') return { ...session, access: { kind: 'member' as const, user: session.user } };
  const access = await classifyAccess(await getDatabase(), session.identity, allowedGoogleEmails);
  return access ? { ...session, access } : null;
}
export async function requirePageSession() {
  const session = await readSession(await headers());
  if (!session) redirect('/sign-in');
  return session;
}
export async function requireFamilyContext(requestHeaders?: Headers) {
  const session = await readSession(requestHeaders ?? await headers());
  if (!session) { if (!requestHeaders) redirect('/sign-in'); throw new FamilyError(401, 'Unauthorized'); }
  if (session.access.kind !== 'member') { if (!requestHeaders) redirect('/onboarding'); throw new FamilyError(403, 'Family membership required'); }
  return { userId: session.access.user.id, familyId: session.access.user.familyId };
}
