import { randomUUID } from 'node:crypto';
import type { FamilyDatabase } from './db/connection';
import { classifyAccess, FamilyError, findUser, requireMember, requireGoogleIdentity, type Principal } from './identity-access';
export async function provisionFamily(db: FamilyDatabase, identity: Principal, allowedEmails: unknown, contextPresent: boolean) {
    identity = requireGoogleIdentity(identity);
    const google = identity;
    return db.transaction(async (db) => {
        const access = (await classifyAccess(db, google, allowedEmails));
        if (access?.kind === 'member')
            return access.user;
        if (access?.kind !== 'provision' || contextPresent)
            throw new FamilyError(409);
        const now = Date.now();
        const familyId = randomUUID();
        const userId = randomUUID();
        (await db.execute("INSERT INTO families (id,created_at) VALUES ($1,$2)", [familyId, now]));
        (await db.execute("INSERT INTO app_users (id,google_subject,verified_email,family_id,created_at) VALUES ($1,$2,$3,$4,$5)", [userId, google.googleSubject, google.email, familyId, now]));
        return (await findUser(db, google.googleSubject))!;
    });
}
export async function familySummary(db: FamilyDatabase, identity: Principal, allowedEmails: unknown) {
    const user = (await requireMember(db, identity, allowedEmails));
    const members = (await db.all<{
        id: string;
        email: string;
    }>("SELECT id, CASE WHEN identity_kind='verification' THEN 'Verification member ' || left(id,8) ELSE verified_email END AS email FROM app_users WHERE family_id=$1 ORDER BY created_at, id", [user.familyId]));
    const invitations = (await db.all<{
        id: string;
        email: string;
        expiresAt: number;
        status: string;
    }>("SELECT id, recipient_email AS email, expires_at AS \"expiresAt\", status FROM family_invitations WHERE family_id=$1 AND status='pending' ORDER BY created_at DESC, id", [user.familyId]));
    return { members, invitations };
}
