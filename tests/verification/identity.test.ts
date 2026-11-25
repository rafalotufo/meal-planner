import { test } from 'node:test';
import assert from 'node:assert/strict';
import { verificationFixture } from './database.ts';
import { exchangeVerification, readVerificationSession } from '../../lib/verification/store.ts';
import { requireMember, requireGoogleIdentity } from '../../lib/identity-access.ts';
test('verification member resolution requires live token, own run and valid global admission config', async () => {
  const f = await verificationFixture();
  try {
    const { token } = await exchangeVerification(f.db,f.runId,f.capability,f.target,[]);
    const session = await readVerificationSession(f.db,token,f.target,[]); assert.ok(session);
    assert.equal((await requireMember(f.db,session.identity,[])).familyId,f.familyId);
    assert.throws(() => requireGoogleIdentity(session.identity), /Forbidden/);
    await assert.rejects(requireMember(f.db,{...session.identity,memberId:crypto.randomUUID()},[]), /Family membership required/);
    await assert.rejects(requireMember(f.db,session.identity,['invalid']), /Authentication unavailable/);
    await f.db.execute('UPDATE verification_runs SET revoked_at=$2 WHERE id=$1',[f.runId,Date.now()]);
    await assert.rejects(requireMember(f.db,session.identity,[]), /Family membership required/);
  } finally { await f.close(); }
});
