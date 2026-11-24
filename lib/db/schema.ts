// Domain rows for the reviewed SQL migrations; SQL is the schema source of truth.
export interface UserRow {
  id: string;
  googleSubject: string;
  verifiedEmail: string;
  familyId: string;
  createdAt: number;
  invitationGrantedAt: number | null;
}
export interface InvitationRow {
  id: string;
  familyId: string;
  createdByUserId: string;
  recipientEmail: string;
  tokenHash: string;
  createdAt: number;
  expiresAt: number;
  status: 'pending' | 'accepted' | 'revoked';
  acceptedByUserId: string | null;
  acceptedAt: number | null;
  revokedAt: number | null;
}
export interface MenuRecipeRow {
  id: string;
  familyId: string;
  sourceUrl: string;
  imageUrl: string | null;
  title: string;
  summary: string;
  timeKind: 'cook' | 'total' | null;
  timeText: string | null;
  savedAt: number;
}
