import { randomUUID } from 'node:crypto';
import type { FamilyDatabase } from './db/connection';
import { classifyAccess, FamilyError, findUser, requireMember, type VerifiedIdentity } from './identity-access';

export function provisionFamily(db: FamilyDatabase, identity: VerifiedIdentity, allowedEmails: unknown, contextPresent: boolean) {
  return db.transaction(() => {
    const access = classifyAccess(db, identity, allowedEmails);
    if (access?.kind === 'member') return access.user;
    if (access?.kind !== 'provision' || contextPresent) throw new FamilyError(409);
    const now = Date.now(); const familyId = randomUUID(); const userId = randomUUID();
    db.prepare<[string, number]>('INSERT INTO families (id,created_at) VALUES (?,?)').run(familyId, now);
    db.prepare<[string, string, string, string, number]>('INSERT INTO app_users (id,google_subject,verified_email,family_id,created_at) VALUES (?,?,?,?,?)').run(userId, identity.googleSubject, identity.email, familyId, now);
    return findUser(db, identity.googleSubject)!;
  }).immediate();
}
export function familySummary(db: FamilyDatabase, identity: VerifiedIdentity, allowedEmails: unknown) {
  const user = requireMember(db, identity, allowedEmails);
  const members = db.prepare<[string], { id: string; email: string }>('SELECT id, verified_email AS email FROM app_users WHERE family_id=? ORDER BY created_at, id').all(user.familyId);
  const invitations = db.prepare<[string], { id: string; email: string; expiresAt: number; status: string }>("SELECT id, recipient_email AS email, expires_at AS expiresAt, status FROM family_invitations WHERE family_id=? AND status='pending' ORDER BY created_at DESC, id").all(user.familyId);
  return { members, invitations };
}
