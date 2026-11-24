import 'server-only';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { getAuth } from './auth';
import allowedGoogleEmails from './allowed-google-emails.json';
import { classifyAccess, FamilyError, verifiedIdentity } from './identity-access';
import { getDatabase } from './db';

export async function readCryptographicSession(requestHeaders: Headers) {
  const session = await getAuth().api.getSession({ headers: requestHeaders });
  const identity = session ? verifiedIdentity(session.user) : null;
  return session && identity ? { ...session, identity } : null;
}
export async function readSession(requestHeaders: Headers) {
  const session = await readCryptographicSession(requestHeaders);
  if (!session) return null;
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
