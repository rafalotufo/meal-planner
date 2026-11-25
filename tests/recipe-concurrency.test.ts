import assert from 'node:assert/strict';
import test from 'node:test';
import { setImmediate as turn } from 'node:timers/promises';
import { BoundedPool } from '../lib/recipes/concurrency.js';
import { SearchError } from '../lib/recipes/errors.js';

test('pool preserves global active leases until abort-ignoring work settles and removes queued aborts', async () => {
  const pool = new BoundedPool(1, 1);
  const firstAbort = new AbortController();
  let finish!: () => void;
  let started = 0;
  const first = pool.run(firstAbort.signal, async () => { started++; await new Promise<void>(resolve => { finish = resolve; }); return 1; });
  firstAbort.abort(new SearchError('SEARCH_TIMEOUT'));
  await assert.rejects(first, /SEARCH_TIMEOUT/);
  const queuedAbort = new AbortController();
  const queued = pool.run(queuedAbort.signal, async () => { started++; return 2; });
  await assert.rejects(pool.run(new AbortController().signal, async () => 3), /SEARCH_BUSY/);
  queuedAbort.abort(new SearchError('SEARCH_TIMEOUT'));
  await assert.rejects(queued, /SEARCH_TIMEOUT/);
  const next = pool.run(new AbortController().signal, async () => { started++; return 4; });
  await turn();
  assert.equal(started, 1, 'aborted active transport retains the lease');
  finish();
  assert.equal(await next, 4);
  assert.equal(started, 2, 'aborted queued transport never starts');
});

test('pool FIFO and full body leases enforce max active across independent callers', async () => {
  const pool = new BoundedPool(2, 4);
  let active = 0, maximum = 0;
  const releases: (() => void)[] = [];
  const order: number[] = [];
  const jobs = Array.from({ length: 4 }, (_, n) => pool.run(new AbortController().signal, async () => {
    order.push(n); maximum = Math.max(maximum, ++active);
    await new Promise<void>(resolve => releases.push(resolve));
    active--; return n;
  }));
  assert.deepEqual(order, [0, 1]);
  releases.shift()!(); await turn(); assert.deepEqual(order, [0, 1, 2]);
  releases.shift()!(); await turn(); assert.deepEqual(order, [0, 1, 2, 3]);
  releases.splice(0).forEach(release => release());
  assert.deepEqual(await Promise.all(jobs), [0, 1, 2, 3]);
  assert.equal(maximum, 2);
});
