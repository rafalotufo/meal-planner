import type { VerificationTarget } from './target';
export interface VerificationPrincipal {
  kind: 'verification'; runId: string; memberId: string; sessionDigest: string;
  target: VerificationTarget;
}
export interface VerificationMemberRow {
  identityKind: 'verification'; id: string; googleSubject: null; verifiedEmail: null;
  familyId: string; createdAt: number; invitationGrantedAt: null; verificationRunId: string;
}
