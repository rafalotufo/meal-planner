import { test } from 'node:test';
import assert from 'node:assert/strict';
import { verificationFixture } from './database.ts';
import { exchangeVerification, readVerificationSession, revokeVerificationSession, throttleVerification } from '../../lib/verification/store.ts';
test('one concurrent exchange wins, current session is target-bound and revocable', async () => {
  const f = await verificationFixture();
  try {
    const attempts = await Promise.allSettled([exchangeVerification(f.db,f.runId,f.capability,f.target,[]),exchangeVerification(f.db,f.runId,f.capability,f.target,[])]);
    const winners = attempts.filter(result => result.status === 'fulfilled'); assert.equal(winners.length,1);
    const result = winners[0]; assert.equal(result.status,'fulfilled'); if (result.status !== 'fulfilled') throw new Error('No winner');
    const session = await readVerificationSession(f.db,result.value.token,f.target,[]); assert.equal(session?.user.familyId,f.familyId);
    assert.equal(await readVerificationSession(f.db,result.value.token,{...f.target,deploymentId:'dpl_other'},[]),null);
    await assert.rejects(readVerificationSession(f.db,result.value.token,f.target,['bad']), /Authentication unavailable/);
    await revokeVerificationSession(f.db,result.value.token,f.target);
    assert.equal(await readVerificationSession(f.db,result.value.token,f.target,[]),null);
    assert.equal((await f.db.one<{ n:number }>('SELECT count(*)::integer AS n FROM verification_sessions'))?.n,1);
  } finally { await f.close(); }
});
test('revoked runs and expired capabilities fail without creating sessions; throttle is shared', async () => {
  const f = await verificationFixture();
  try {
    await f.db.execute('UPDATE verification_runs SET revoked_at=$2 WHERE id=$1',[f.runId,Date.now()]);
    await assert.rejects(exchangeVerification(f.db,f.runId,f.capability,f.target,[]),/Unauthorized/);
    assert.equal((await f.db.one<{ n:number }>('SELECT count(*)::integer AS n FROM verification_sessions'))?.n,0);
    assert.equal(await throttleVerification(f.db,'test',1,Date.now()+1000),true);
    assert.equal(await throttleVerification(f.db,'test',1,Date.now()+1000),false);
  } finally { await f.close(); }
});
