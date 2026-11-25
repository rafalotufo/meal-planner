import assert from "node:assert/strict";
import test from "node:test";
import {
  CACTUS_BOXES, GROUND_Y, JUMP_DURATION_MS, MIN_OBSTACLE_GAP,
  RUNNING_BOXES, SPEED, TREX_HEIGHT, TREX_WIDTH, TREX_X, WORLD_HEIGHT,
  WORLD_WIDTH, createRunner, hasCollision, jumpRunner, pauseRunner,
  resumeRunner, tickRunner, type RunnerState,
} from "../lib/t-rex-runner";

const MAX_SPEED = 330;

function advance(state: RunnerState, milliseconds: number): RunnerState {
  let remaining = milliseconds;
  while (remaining > 0) {
    const step = Math.min(remaining, 1000 / 60);
    state = tickRunner(state, step);
    remaining -= step;
  }
  return state;
}

test("runner begins automatically in a fixed jump-only world with three obstacle-free seconds", () => {
  const state = createRunner(9);
  assert.equal(state.mode, "running");
  assert.equal(state.y, GROUND_Y);
  assert.equal(state.distance, 0);
  assert.equal(state.velocity, 0);
  assert.deepEqual([WORLD_WIDTH, WORLD_HEIGHT, TREX_X, TREX_WIDTH, TREX_HEIGHT], [600, 150, 50, 44, 47]);
  assert.ok(SPEED > 0 && SPEED <= 240);
  const before = advance(state, 2999);
  assert.deepEqual(before.obstacles, []);
  assert.equal(advance(before, 20).obstacles.length, 1);
  assert.deepEqual(state.obstacles, []);
});

test("a fresh grounded jump follows one fixed arc, ignores held/airborne attempts and lands", () => {
  const state = createRunner(1);
  assert.equal(jumpRunner(state, true), state);
  const jumping = jumpRunner(state);
  assert.ok(jumping.velocity < 0);
  assert.equal(jumpRunner(jumping), jumping);
  const airborne = advance(jumping, 100);
  assert.ok(airborne.y < GROUND_Y);
  assert.equal(jumpRunner(airborne), airborne);
  const landed = advance(airborne, 550);
  assert.equal(landed.y, GROUND_Y);
  assert.equal(landed.velocity, 0);
  assert.equal(landed.mode, "running");
  assert.equal(state.y, GROUND_Y);
});

test("pause freezes physics, distance and spawning; only explicit resume continues", () => {
  const moving = advance(jumpRunner(createRunner(6)), 120);
  const paused = pauseRunner(moving, "focus");
  assert.equal(paused.mode, "paused");
  assert.equal(paused.pauseReason, "focus");
  assert.equal(tickRunner(paused, 50), paused);
  assert.equal(jumpRunner(paused), paused);
  assert.equal(paused.y, moving.y);
  assert.deepEqual(paused.obstacles, moving.obstacles);
  assert.equal(paused.distance, moving.distance);
  const running = resumeRunner(paused);
  assert.equal(running.mode, "running");
  assert.equal(running.pauseReason, null);
  assert.equal(running.y, paused.y);
  assert.ok(tickRunner(running, 16).distance > paused.distance);
  const initialPaused = createRunner(6, "reduced-motion");
  assert.equal(initialPaused.mode, "paused");
  assert.equal(initialPaused.pauseReason, "reduced-motion");
});

test("frame deltas are bounded and invalid time cannot advance simulation", () => {
  const start = jumpRunner(createRunner(4));
  assert.deepEqual(tickRunner(start, 100000), tickRunner(start, 50));
  assert.deepEqual(tickRunner(start, 50), advance(start, 50));
  for (const delta of [0, -1, Infinity, -Infinity, NaN]) assert.equal(tickRunner(start, delta), start);
  assert.ok(Math.abs(tickRunner(start, 50).distance - (SPEED * 0.05 + 0.0025)) < 1e-9);
});

test("original running and single-small-cactus hitboxes collide without treating empty sprite pixels as solid", () => {
  assert.equal(RUNNING_BOXES.length, 6);
  assert.equal(CACTUS_BOXES.length, 3);
  assert.equal(hasCollision(GROUND_Y, TREX_X + 20), true);
  assert.equal(hasCollision(GROUND_Y - 65, TREX_X + 20), false);
  assert.equal(hasCollision(GROUND_Y, WORLD_WIDTH), false);
  const approaching = { ...createRunner(1), obstacles: [{ id: 1, x: TREX_X + TREX_WIDTH + 1 }] };
  const crashed = advance(approaching, 200);
  assert.equal(crashed.mode, "crashed", "substeps detect a cactus crossing the running hitboxes");
  assert.equal(tickRunner(crashed, 50), crashed);
  assert.equal(pauseRunner(crashed, "hidden"), crashed);
  assert.equal(resumeRunner(crashed), crashed);
});

test("one fresh press after collision resets distance/obstacles and immediately jumps", () => {
  const crashed = { ...createRunner(3), mode: "crashed" as const, distance: 500, elapsedMs: 3000, obstacles: [{ id: 1, x: 60 }] };
  assert.equal(jumpRunner(crashed, true), crashed);
  const restarted = jumpRunner(crashed);
  assert.equal(restarted.mode, "running");
  assert.equal(restarted.distance, 0);
  assert.equal(restarted.elapsedMs, 0);
  assert.deepEqual(restarted.obstacles, []);
  assert.ok(restarted.velocity < 0);
  assert.equal(crashed.distance, 500);
});

test("seeded gaps exceed a full jump plus 300ms running and every generated cactus is jumpable", () => {
  assert.ok(MIN_OBSTACLE_GAP > MAX_SPEED * (JUMP_DURATION_MS + 300) / 1000);
  const seen: number[] = [];
  for (let seed = 1; seed <= 24; seed++) {
    let state = createRunner(seed);
    let lastId = 0;
    let lastSpawn = 0;
    let count = 0;
    for (let frame = 0; frame < 3600; frame++) {
      const next = state.obstacles.find(obstacle => obstacle.x + 17 > TREX_X);
      if (next && next.x - (TREX_X + TREX_WIDTH) < 65) state = jumpRunner(state);
      state = tickRunner(state, 1000 / 60);
      assert.equal(state.mode, "running", `seed ${seed}, frame ${frame}: generated pattern remains jumpable`);
      const newest = state.obstacles.at(-1);
      if (newest && newest.id !== lastId) {
        const spawnDistance = state.distance - (WORLD_WIDTH - newest.x);
        if (lastId) assert.ok(spawnDistance - lastSpawn - 17 >= MIN_OBSTACLE_GAP - 0.00001);
        lastSpawn = spawnDistance;
        lastId = newest.id;
        count++;
      }
    }
    assert.ok(count >= 20);
    seen.push(lastSpawn);
    assert.deepEqual(advance(createRunner(seed), 3500), advance(createRunner(seed), 3500));
  }
  assert.ok(new Set(seen).size > 1, "different seeds vary the safe obstacle gaps");
});

test("immutable transitions do not mutate frozen input snapshots or obstacle arrays", () => {
  const state = Object.freeze({ ...createRunner(2), obstacles: Object.freeze([{ id: 1, x: 500 }]) });
  const moved = tickRunner(state, 50);
  assert.equal(state.obstacles[0].x, 500);
  assert.notEqual(moved, state);
  assert.ok(moved.obstacles[0].x < 500);
  assert.equal(pauseRunner({ ...state, mode: "idle" }, "manual").mode, "idle");
});

test("every allowed integer cactus gap admits a complete jump and recovery before the next", () => {
  for (let gap = MIN_OBSTACLE_GAP; gap <= MIN_OBSTACLE_GAP + 120; gap++) {
    let state: RunnerState = { ...createRunner(1), elapsedMs: 45000, nextObstacleDistance: Infinity,
      obstacles: [{ id: 1, x: 200 }, { id: 2, x: 200 + 17 + gap }] };
    for (let frame = 0; frame < 360; frame++) {
      const next = state.obstacles.find(obstacle => obstacle.x + 17 > TREX_X);
      if (next && next.x - (TREX_X + TREX_WIDTH) < 65) state = jumpRunner(state);
      state = tickRunner(state, 1000 / 60);
      assert.equal(state.mode, "running", `gap ${gap} remains jumpable`);
    }
    assert.deepEqual(state.obstacles, [], `both cacti passed for gap ${gap}`);
  }
});


test("speed rises gradually with active time, caps, freezes on pause and resets on restart", () => {
  const start = { ...createRunner(8), nextObstacleDistance: Infinity };
  const first = advance(start, 1000);
  const second = advance(first, 1000);
  assert.ok(Math.abs(first.distance - 241) < 1e-7);
  assert.ok(Math.abs(second.distance - first.distance - 243) < 1e-7);
  const capped = advance(start, 45000);
  assert.ok(Math.abs(capped.distance - 12825) < 1e-6);
  const later = advance(capped, 1000);
  assert.ok(Math.abs(later.distance - capped.distance - MAX_SPEED) < 1e-6);
  const paused = pauseRunner(capped, "manual");
  assert.equal(advance(paused, 2000), paused);
  assert.ok(Math.abs(advance(resumeRunner(paused), 1000).distance - later.distance) < 1e-6);
  const restarted = jumpRunner({ ...capped, mode: "crashed" });
  assert.ok(Math.abs(advance(restarted, 1000).distance - 241) < 1e-7);
});

test("a step crossing the speed cap keeps obstacles and distance synchronized", () => {
  const before = { ...createRunner(1), elapsedMs: 44990, distance: 12821.7001,
    nextObstacleDistance: Infinity, obstacles: [{ id: 1, x: 500 }] };
  const after = tickRunner(before, 30);
  const traveled = 9.8999;
  assert.ok(Math.abs(after.distance - before.distance - traveled) < 1e-7);
  assert.ok(Math.abs(after.obstacles[0].x - (500 - traveled)) < 1e-7);
  assert.deepEqual(after.obstacles, tickRunner(tickRunner(before, 15), 15).obstacles);
});
