import assert from "node:assert/strict";
import test from "node:test";
import { runnerSessionReducer } from "../lib/t-rex-session";
import { createRunner, jumpRunner, pauseRunner } from "../lib/t-rex-runner";

test("actual requests start visible, replacement gets a fresh identity and snapshot", () => {
  const first = runnerSessionReducer(null, { type: "start", requestId: 1, snapshot: createRunner(1) });
  assert.equal(first?.visible, true);
  assert.equal(first?.requestId, 1);
  const next = runnerSessionReducer(first, { type: "start", requestId: 2, snapshot: createRunner(2) });
  assert.equal(next?.requestId, 2);
  assert.equal(next?.snapshot.distance, 0);
  assert.notEqual(next?.snapshot, first?.snapshot);
});

test("Hide/Show retains paused snapshot; stale actions never mutate the current request", () => {
  const first = runnerSessionReducer(null, { type: "start", requestId: 1, snapshot: createRunner(1) });
  const paused = pauseRunner(jumpRunner(createRunner(1)), "hidden");
  const hidden = runnerSessionReducer(first, { type: "hide", requestId: 1, snapshot: paused });
  assert.equal(hidden?.visible, false);
  assert.equal(hidden?.snapshot, paused);
  const shown = runnerSessionReducer(hidden, { type: "show", requestId: 1 });
  assert.equal(shown?.visible, true);
  assert.equal(shown?.snapshot.mode, "paused");
  assert.equal(shown?.snapshot.y, paused.y);
  assert.equal(runnerSessionReducer(shown, { type: "end", requestId: 0 }), shown);
  assert.equal(runnerSessionReducer(shown, { type: "hide", requestId: 0, snapshot: paused }), shown);
  assert.equal(runnerSessionReducer(shown, { type: "show", requestId: 0 }), shown);
});

test("every terminal result discards open, hidden, jumping, paused and crashed snapshots", () => {
  for (const mode of ["running", "paused", "crashed", "idle"] as const) {
    const snapshot = { ...jumpRunner(createRunner(4)), mode };
    for (const visible of [true, false]) {
      assert.equal(runnerSessionReducer({ requestId: 4, visible, snapshot }, { type: "end", requestId: 4 }), null);
    }
  }
  assert.equal(runnerSessionReducer(null, { type: "show", requestId: 1 }), null);
});
