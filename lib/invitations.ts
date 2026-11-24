import { createHash, randomBytes, randomUUID } from 'node:crypto';
import type { FamilyDatabase } from './db/connection';
import type { InvitationRow } from './db/schema';
import { classifyAccess, FamilyError, findUser, hasPendingInvitation, normalizeEmail, requireMember, type VerifiedIdentity } from './identity-access';
const invitationColumns = 'id, family_id AS "familyId", created_by_user_id AS "createdByUserId", recipient_email AS "recipientEmail", token_hash AS "tokenHash", created_at AS "createdAt", expires_at AS "expiresAt", status, accepted_by_user_id AS "acceptedByUserId", accepted_at AS "acceptedAt", revoked_at AS "revokedAt"';
const hash = (token: string) => createHash('sha256').update(token).digest('hex');
export async function lookupInvitation(db: FamilyDatabase, token: string | null) {
    if (!token || !/^[A-Za-z0-9_-]{43}$/.test(token))
        return undefined;
    return (await db.one<InvitationRow>(`SELECT ${invitationColumns} FROM family_invitations WHERE token_hash=$1`, [hash(token)]));
}
export async function invitationForRecipient(db: FamilyDatabase, identity: VerifiedIdentity, token: string | null) {
    const invitation = (await lookupInvitation(db, token));
    return invitation?.status === 'pending' && invitation.expiresAt > Date.now() && invitation.recipientEmail === identity.email ? invitation : null;
}
export async function createInvitation(db: FamilyDatabase, identity: VerifiedIdentity, allowed: unknown, recipient: unknown, origin: string) {
    const email = normalizeEmail(recipient);
    if (!email)
        throw new FamilyError(400, 'Invalid request');
    return db.transaction(async (db) => {
        const owner = (await requireMember(db, identity, allowed));
        const now = Date.now();
        const existing = (await db.one<{
            id: string;
        }>("SELECT id FROM app_users WHERE verified_email=$1", [email]));
        if (existing || (await hasPendingInvitation(db, email, now)))
            throw new FamilyError(409);
        const created = (await db.one<{
            n: number;
        }>("SELECT count(*) AS n FROM family_invitations WHERE family_id=$1 AND created_at>$2", [owner.familyId, now - 3600000]))!.n;
        const active = (await db.one<{
            n: number;
        }>("SELECT count(*) AS n FROM family_invitations WHERE family_id=$1 AND status='pending' AND expires_at>$2", [owner.familyId, now]))!.n;
        if (created >= 10 || active >= 20)
            throw new FamilyError(429);
        const token = randomBytes(32).toString('base64url');
        const id = randomUUID();
        const expiresAt = now + 7 * 24 * 3600000;
        (await db.execute("INSERT INTO family_invitations (id,family_id,created_by_user_id,recipient_email,token_hash,created_at,expires_at,status) VALUES ($1,$2,$3,$4,$5,$6,$7,'pending')", [id, owner.familyId, owner.id, email, hash(token), now, expiresAt]));
        return { id, url: `${origin}/invite#${token}`, expiresAt };
    });
}
export async function acceptInvitation(db: FamilyDatabase, identity: VerifiedIdentity, allowed: unknown, token: string | null) {
    return db.transaction(async (db) => {
        const access = (await classifyAccess(db, identity, allowed));
        const invitation = (await lookupInvitation(db, token));
        if (access?.kind === 'member') {
            if (invitation?.status === 'accepted' && invitation.acceptedByUserId === access.user.id && invitation.familyId === access.user.familyId)
                return access.user;
            throw new FamilyError(409);
        }
        if (!access || !invitation || invitation.recipientEmail !== identity.email || invitation.status !== 'pending' || invitation.expiresAt <= Date.now())
            throw new FamilyError(409);
        const now = Date.now();
        const id = randomUUID();
        (await db.execute("INSERT INTO app_users (id,google_subject,verified_email,family_id,created_at,invitation_granted_at) VALUES ($1,$2,$3,$4,$5,$6)", [id, identity.googleSubject, identity.email, invitation.familyId, now, now]));
        (await db.execute("UPDATE family_invitations SET status='accepted',accepted_by_user_id=$1,accepted_at=$2 WHERE id=$3", [id, now, invitation.id]));
        return (await findUser(db, identity.googleSubject))!;
    });
}
export async function revokeInvitation(db: FamilyDatabase, identity: VerifiedIdentity, allowed: unknown, id: string) {
    await db.transaction(async (db) => {
        const owner = (await requireMember(db, identity, allowed));
        const row = (await db.one<{
            status: string;
        }>("SELECT status FROM family_invitations WHERE id=$1 AND family_id=$2", [id, owner.familyId]));
        if (!row)
            throw new FamilyError(404, 'Not found');
        if (row.status !== 'pending')
            throw new FamilyError(409);
        (await db.execute("UPDATE family_invitations SET status='revoked',revoked_at=$1 WHERE id=$2 AND family_id=$3", [Date.now(), id, owner.familyId]));
    });
}
