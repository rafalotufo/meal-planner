import type { FamilyDatabase } from './db/connection';
import type { UserRow } from './db/schema';
import { isAllowedGoogleUser } from './google-access';

export interface VerifiedIdentity { googleSubject: string; email: string; emailVerified: true }
export type Access = { kind: 'member'; user: UserRow } | { kind: 'invited' } | { kind: 'provision' };
export class FamilyError extends Error {
  constructor(readonly status: number, message = 'Invitation unavailable') { super(message); }
}
export function normalizeEmail(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const email = value.trim().toLowerCase();
  return email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : null;
}
export function verifiedIdentity(value: unknown): VerifiedIdentity | null {
  if (!value || typeof value !== 'object' || !('googleSubject' in value) || typeof value.googleSubject !== 'string' || !value.googleSubject.trim() || value.googleSubject.length > 255 || !('emailVerified' in value) || value.emailVerified !== true || !('email' in value)) return null;
  const email = normalizeEmail(value.email);
  return email ? { googleSubject: value.googleSubject, email, emailVerified: true } : null;
}
export const userColumns = 'id, google_subject AS googleSubject, verified_email AS verifiedEmail, family_id AS familyId, created_at AS createdAt, invitation_granted_at AS invitationGrantedAt';
export function findUser(db: FamilyDatabase, subject: string) {
  return db.prepare<[string], UserRow>(`SELECT ${userColumns} FROM app_users WHERE google_subject=?`).get(subject);
}
export function hasPendingInvitation(db: FamilyDatabase, email: string, now = Date.now()) {
  return Boolean(db.prepare<[string, number], { id: string }>("SELECT id FROM family_invitations WHERE recipient_email=? AND status='pending' AND expires_at>? LIMIT 1").get(email, now));
}
export function classifyAccess(db: FamilyDatabase, identity: VerifiedIdentity, allowedEmails: unknown, now = Date.now()): Access | null {
  const allowed = isAllowedGoogleUser(identity, allowedEmails); // validates even when a grant exists
  const user = findUser(db, identity.googleSubject);
  if (user) return user.invitationGrantedAt !== null || allowed ? { kind: 'member', user } : null;
  const collision = db.prepare<[string], { id: string }>('SELECT id FROM app_users WHERE verified_email=?').get(identity.email);
  if (collision) return null;
  if (hasPendingInvitation(db, identity.email, now)) return { kind: 'invited' };
  return allowed ? { kind: 'provision' } : null;
}
export function requireMember(db: FamilyDatabase, identity: VerifiedIdentity, allowedEmails: unknown) {
  const access = classifyAccess(db, identity, allowedEmails);
  if (access?.kind !== 'member') throw new FamilyError(403, 'Family membership required');
  return access.user;
}
export function updateVerifiedEmail(db: FamilyDatabase, identity: VerifiedIdentity, allowedEmails: unknown) {
  db.transaction(() => {
    const access = classifyAccess(db, identity, allowedEmails);
    if (!access) throw new FamilyError(401, 'Unauthorized');
    if (access.kind === 'member') db.prepare<[string, string]>('UPDATE app_users SET verified_email=? WHERE google_subject=?').run(identity.email, identity.googleSubject);
  }).immediate();
}
