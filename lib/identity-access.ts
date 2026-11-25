import type { FamilyDatabase } from './db/connection';
import type { UserRow } from './db/schema';
import type { VerificationPrincipal } from './verification/types';
import { verificationMember } from './verification/store';
import { isAllowedGoogleUser } from './google-access';
export interface VerifiedIdentity {
    googleSubject: string;
    email: string;
    emailVerified: true;
}
export type Principal = VerifiedIdentity | VerificationPrincipal;
export function isVerificationIdentity(identity: Principal): identity is VerificationPrincipal { return 'kind' in identity && identity.kind === 'verification'; }
export function requireGoogleIdentity(identity: Principal): VerifiedIdentity { if (isVerificationIdentity(identity)) throw new FamilyError(403, 'Forbidden'); return identity; }
export type Access = {
    kind: 'member';
    user: UserRow | import('./verification/types').VerificationMemberRow;
} | {
    kind: 'invited';
} | {
    kind: 'provision';
};
export class FamilyError extends Error {
    constructor(readonly status: number, message = 'Invitation unavailable') { super(message); }
}
export function normalizeEmail(value: unknown): string | null {
    if (typeof value !== 'string')
        return null;
    const email = value.trim().toLowerCase();
    return email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : null;
}
export function verifiedIdentity(value: unknown): VerifiedIdentity | null {
    if (!value || typeof value !== 'object' || !('googleSubject' in value) || typeof value.googleSubject !== 'string' || !value.googleSubject.trim() || value.googleSubject.length > 255 || !('emailVerified' in value) || value.emailVerified !== true || !('email' in value))
        return null;
    const email = normalizeEmail(value.email);
    return email ? { googleSubject: value.googleSubject, email, emailVerified: true } : null;
}
export const userColumns = 'identity_kind AS "identityKind", verification_run_id AS "verificationRunId", id, google_subject AS "googleSubject", verified_email AS "verifiedEmail", family_id AS "familyId", created_at AS "createdAt", invitation_granted_at AS "invitationGrantedAt"';
export async function findUser(db: FamilyDatabase, subject: string) {
    return (await db.one<UserRow>(`SELECT ${userColumns} FROM app_users WHERE google_subject=$1`, [subject]));
}
export async function hasPendingInvitation(db: FamilyDatabase, email: string, now = Date.now()) {
    return Boolean((await db.one<{
        id: string;
    }>("SELECT id FROM family_invitations WHERE recipient_email=$1 AND status='pending' AND expires_at>$2 LIMIT 1", [email, now])));
}
export async function classifyAccess(db: FamilyDatabase, identity: VerifiedIdentity, allowedEmails: unknown, now = Date.now()): Promise<Access | null> {
    const allowed = isAllowedGoogleUser(identity, allowedEmails); // validates even when a grant exists
    const user = (await findUser(db, identity.googleSubject));
    if (user)
        return user.invitationGrantedAt !== null || allowed ? { kind: 'member', user } : null;
    const collision = (await db.one<{
        id: string;
    }>("SELECT id FROM app_users WHERE verified_email=$1", [identity.email]));
    if (collision)
        return null;
    if ((await hasPendingInvitation(db, identity.email, now)))
        return { kind: 'invited' };
    return allowed ? { kind: 'provision' } : null;
}
export async function requireMember(db: FamilyDatabase, identity: Principal, allowedEmails: unknown) {
    if (isVerificationIdentity(identity)) { const user = await verificationMember(db, identity, allowedEmails); if (!user) throw new FamilyError(403, 'Family membership required'); return user; }
    const access = (await classifyAccess(db, identity, allowedEmails));
    if (access?.kind !== 'member')
        throw new FamilyError(403, 'Family membership required');
    return access.user;
}
export async function updateVerifiedEmail(db: FamilyDatabase, identity: VerifiedIdentity, allowedEmails: unknown) {
    await db.transaction(async (db) => {
        const access = (await classifyAccess(db, identity, allowedEmails));
        if (!access)
            throw new FamilyError(401, 'Unauthorized');
        if (access.kind === 'member')
            (await db.execute("UPDATE app_users SET verified_email=$1 WHERE google_subject=$2", [identity.email, identity.googleSubject]));
    });
}
