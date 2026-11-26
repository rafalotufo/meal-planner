// Domain rows for the reviewed SQL migrations; SQL is the schema source of truth.
export interface UserRow {
  identityKind: 'google';
  verificationRunId: null;
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
  category: import('../recipes/types').RecipeCategory | null;
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

export interface MenuCurationRow {
  entryId: string; state: 'pending' | 'processing' | 'ready' | 'failed'; generation: string;
  scheduledAt: number; expiresAt: number; lease: string | null; googleSubject: string;
  verifiedEmail: string; credentialExpiresAt: number;
}

export interface MealPlanWeekRow { id: string; familyId: string; weekStart: string; revision: number; status: 'draft' | 'final'; meals: unknown; createdAt: number; finalizedAt: number | null }
export interface MealPlanSuggestionRow { id: string; planId: string; userId: string; baseRevision: number; day: number; menuRecipeId: string; recipe: unknown; status: 'pending' | 'accepted' | 'rejected' | 'stale'; createdAt: number }
