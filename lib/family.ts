import 'server-only';
import { readSession } from './session';
import { FamilyError } from './identity-access';
export async function requireIdentity(requestHeaders: Headers) {
  const session = await readSession(requestHeaders);
  if (!session) throw new FamilyError(401, 'Unauthorized');
  return session;
}
