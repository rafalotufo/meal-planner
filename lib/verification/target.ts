import { createHash } from 'node:crypto';
import { validateDatabaseUrl } from '../db/connection';

export const VERIFICATION_ORIGIN = 'https://meal-planner-staging-rafalotufos.vercel.app';
export type VerificationManifest = { enabled: false } | {
  enabled: true; projectId: string; sourceSha: string; profileSha256: string;
  origin: string; databaseIdentity: string;
};
export interface VerificationTarget {
  projectId: string; deploymentId: string; sourceSha: string; profileSha256: string;
  origin: string; databaseIdentity: string;
}
type Environment = Readonly<Record<string, string | undefined>>;
export function databaseIdentity(value: string): string {
  const url = validateDatabaseUrl(value);
  return createHash('sha256').update([url.hostname.replace(/-pooler(?=\.)/, ''), url.port || '5432', url.pathname].join('\n')).digest('hex');
}
export function buildVerificationManifest(env: Environment): VerificationManifest {
  if (env.VERCEL_ENV !== 'preview' || env.VERCEL_TARGET_ENV !== 'preview' || env.VERIFICATION_BUILD_ENABLE !== '1') return { enabled: false };
  if (!/^prj_[A-Za-z0-9]+$/.test(env.VERCEL_PROJECT_ID ?? '') || !/^[a-f0-9]{40}$/.test(env.VERCEL_GIT_COMMIT_SHA ?? '') || !/^[a-f0-9]{64}$/.test(env.VERIFICATION_PROFILE_SHA256 ?? '') || env.BETTER_AUTH_URL !== VERIFICATION_ORIGIN || !env.DATABASE_URL) throw new Error('Verification unavailable');
  return { enabled: true, projectId: env.VERCEL_PROJECT_ID!, sourceSha: env.VERCEL_GIT_COMMIT_SHA!, profileSha256: env.VERIFICATION_PROFILE_SHA256!, origin: VERIFICATION_ORIGIN, databaseIdentity: databaseIdentity(env.DATABASE_URL) };
}
export function verificationTarget(manifest: VerificationManifest, env: Environment = process.env): VerificationTarget | null {
  try {
    if (!manifest.enabled || env.VERCEL_ENV !== 'preview' || env.VERCEL_TARGET_ENV !== 'preview' || !/^dpl_[A-Za-z0-9]+$/.test(env.VERCEL_DEPLOYMENT_ID ?? '') || env.VERCEL_PROJECT_ID !== manifest.projectId || env.VERCEL_GIT_COMMIT_SHA !== manifest.sourceSha || env.VERIFICATION_PROFILE_SHA256 !== manifest.profileSha256 || env.BETTER_AUTH_URL !== manifest.origin || manifest.origin !== VERIFICATION_ORIGIN || !env.DATABASE_URL || databaseIdentity(env.DATABASE_URL) !== manifest.databaseIdentity) return null;
    return { projectId: manifest.projectId, deploymentId: env.VERCEL_DEPLOYMENT_ID!, sourceSha: manifest.sourceSha, profileSha256: manifest.profileSha256, origin: manifest.origin, databaseIdentity: manifest.databaseIdentity };
  } catch { return null; }
}
export function sameVerificationTarget(left: VerificationTarget, right: VerificationTarget): boolean {
  return (['projectId', 'deploymentId', 'sourceSha', 'profileSha256', 'origin', 'databaseIdentity'] as const).every(key => left[key] === right[key]);
}
