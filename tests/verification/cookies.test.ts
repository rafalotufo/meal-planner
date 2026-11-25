import { test } from 'node:test';
import assert from 'node:assert/strict';
import { capabilityDigest, newCredential, readVerificationCookie, createNonce, validNonce } from '../../lib/verification/cookies.ts';
test('opaque credentials reject duplicates, malformed bytes and simultaneous Google cookies', () => {
  const token = newCredential();
  assert.equal(token.length, 43); assert.equal(capabilityDigest(token).length, 64);
  assert.equal(readVerificationCookie(`__Host-mp-verification=${token}`), token);
  for (const cookie of [`__Host-mp-verification=${token}; __Host-mp-verification=${token}`, `__Host-mp-verification=${token}; better-auth.session_data=copied`, '__Host-mp-verification=short']) assert.throws(() => readVerificationCookie(cookie), /Unauthorized/);
});
test('preflight nonce is bounded and bound to the server secret and matching cookie', () => {
  const nonce = createNonce('a'.repeat(32), 1000);
  assert.equal(validNonce(nonce, nonce, 'a'.repeat(32), 1001), true);
  assert.equal(validNonce(nonce, nonce, 'b'.repeat(32), 1001), false);
  assert.equal(validNonce(nonce, nonce, 'a'.repeat(32), 301001), false);
  assert.equal(validNonce(nonce, nonce + 'x', 'a'.repeat(32), 1001), false);
});
