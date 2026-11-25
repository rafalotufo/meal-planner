import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildVerificationManifest, verificationTarget, databaseIdentity } from '../../lib/verification/target.ts';
const origin = 'https://meal-planner-staging-rafalotufos.vercel.app';
const env = { VERCEL_ENV: 'preview', VERCEL_TARGET_ENV: 'preview', VERIFICATION_BUILD_ENABLE: '1', VERCEL_PROJECT_ID: 'prj_verification', VERCEL_GIT_COMMIT_SHA: 'a'.repeat(40), VERIFICATION_PROFILE_SHA256: 'b'.repeat(64), BETTER_AUTH_URL: origin, DATABASE_URL: 'postgres://runtime:private@staging.neon.tech/staging?sslmode=verify-full', VERCEL_DEPLOYMENT_ID: 'dpl_verification' };
test('verification is disabled for Production even when all Preview settings are copied', () => {
  assert.deepEqual(buildVerificationManifest({ ...env, VERCEL_ENV: 'production' }), { enabled: false });
  assert.equal(verificationTarget(buildVerificationManifest(env), { ...env, VERCEL_ENV: 'production' }), null);
});
test('verification requires exact trusted source, profile, origin, database and deployment metadata', () => {
  const manifest = buildVerificationManifest(env);
  assert.equal(verificationTarget(manifest, env)?.deploymentId, 'dpl_verification');
  for (const field of ['VERCEL_PROJECT_ID', 'VERCEL_GIT_COMMIT_SHA', 'VERIFICATION_PROFILE_SHA256', 'BETTER_AUTH_URL', 'DATABASE_URL', 'VERCEL_DEPLOYMENT_ID'] as const) {
    assert.equal(verificationTarget(manifest, { ...env, [field]: '' }), null, field);
  }
  assert.equal(verificationTarget(manifest, { ...env, DATABASE_URL: env.DATABASE_URL.replace('/staging?', '/production?') }), null);
  assert.equal(verificationTarget(manifest, { ...env, BETTER_AUTH_URL: 'https://lotufo-meals.vercel.app' }), null);
  assert.throws(() => buildVerificationManifest({ ...env, VERIFICATION_PROFILE_SHA256: 'invalid' }), /Verification unavailable/);
  assert.equal(databaseIdentity(env.DATABASE_URL).length, 64);
});
