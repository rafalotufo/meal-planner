// Copyright (c) 2014 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
// extract from chromium source code by @liuwayong
// Typed adaptation of wayou/t-rex-runner@5455bfa408ec6b707c7300ff194b7390733a766d.
// Full notices: public/games/t-rex/THIRD-PARTY-NOTICES.txt.
// Source ranges and deliberate changes: intent/t-rex-runner/provenance.md.

export const WORLD_WIDTH = 600;
export const WORLD_HEIGHT = 150;
export const TREX_X = 50;
export const TREX_WIDTH = 44;
export const TREX_HEIGHT = 47;
export const GROUND_Y = WORLD_HEIGHT - TREX_HEIGHT - 10;
export const SPEED = 240;
export const MAX_SPEED = 330;
const ACCELERATION = 2;

// Integrate the ramp exactly, including steps crossing the speed cap.
function runningDistance(elapsedMs: number): number {
  const seconds = elapsedMs / 1000;
  const accelerating = Math.min(seconds, (MAX_SPEED - SPEED) / ACCELERATION);
  return SPEED * accelerating + ACCELERATION * accelerating * accelerating / 2
    + MAX_SPEED * (seconds - accelerating);
}
export const CACTUS_WIDTH = 17;
export const CACTUS_HEIGHT = 35;
export const CACTUS_Y = 105;
const JUMP_VELOCITY = -600;
const GRAVITY = 2160;
export const JUMP_DURATION_MS = -2 * JUMP_VELOCITY / GRAVITY * 1000;
export const MIN_OBSTACLE_GAP = 300;
const MAX_STEP_MS = 1000 / 60;

export type RunnerMode = "idle" | "running" | "paused" | "crashed";
export type CollisionBox = Readonly<{ x: number; y: number; width: number; height: number }>;
export type RunnerObstacle = Readonly<{ id: number; x: number }>;
export type RunnerState = {
  mode: RunnerMode;
  pauseReason: string | null;
  y: number;
  velocity: number;
  distance: number;
  elapsedMs: number;
  obstacles: readonly RunnerObstacle[];
  seed: number;
  initialSeed: number;
  nextObstacleDistance: number;
  nextObstacleId: number;
};

// Preserve the original RUNNING and single CACTUS_SMALL hitboxes, not opaque sprite bounds.
export const RUNNING_BOXES: readonly CollisionBox[] = [
  { x: 22, y: 0, width: 17, height: 16 },
  { x: 1, y: 18, width: 30, height: 9 },
  { x: 10, y: 35, width: 14, height: 8 },
  { x: 1, y: 24, width: 29, height: 5 },
  { x: 5, y: 30, width: 21, height: 4 },
  { x: 9, y: 34, width: 15, height: 4 },
];
export const CACTUS_BOXES: readonly CollisionBox[] = [
  { x: 0, y: 7, width: 5, height: 27 },
  { x: 4, y: 0, width: 6, height: 34 },
  { x: 10, y: 4, width: 7, height: 14 },
];

function overlaps(a: CollisionBox, b: CollisionBox): boolean {
  return a.x < b.x + b.width && a.x + a.width > b.x
    && a.y < b.y + b.height && a.y + a.height > b.y;
}

export function hasCollision(y: number, cactusX: number): boolean {
  const dinosaur = { x: TREX_X + 1, y: y + 1, width: TREX_WIDTH - 2, height: TREX_HEIGHT - 2 };
  const cactus = { x: cactusX + 1, y: CACTUS_Y + 1, width: CACTUS_WIDTH - 2, height: CACTUS_HEIGHT - 2 };
  if (!overlaps(dinosaur, cactus)) return false;
  return RUNNING_BOXES.some(a => CACTUS_BOXES.some(b => overlaps(
    { ...a, x: a.x + dinosaur.x, y: a.y + dinosaur.y },
    { ...b, x: b.x + cactus.x, y: b.y + cactus.y },
  )));
}

export function createRunner(seed: number, pausedReason?: string): RunnerState {
  const normalizedSeed = (Number.isFinite(seed) ? seed >>> 0 : 0) || 1;
  return {
    mode: pausedReason ? "paused" : "running", pauseReason: pausedReason ?? null,
    y: GROUND_Y, velocity: 0, distance: 0, elapsedMs: 0, obstacles: [],
    seed: normalizedSeed, initialSeed: normalizedSeed,
    nextObstacleDistance: runningDistance(3000), nextObstacleId: 1,
  };
}

export function jumpRunner(state: RunnerState, repeated = false): RunnerState {
  if (repeated) return state;
  const next = state.mode === "crashed" ? createRunner(state.initialSeed) : state;
  if (next.mode !== "running" || next.y !== GROUND_Y || next.velocity !== 0) return next;
  return { ...next, velocity: JUMP_VELOCITY };
}

export function pauseRunner(state: RunnerState, reason: string): RunnerState {
  if (state.mode !== "running" && state.mode !== "paused") return state;
  return state.mode === "paused" && state.pauseReason === reason ? state : { ...state, mode: "paused", pauseReason: reason };
}

export function resumeRunner(state: RunnerState): RunnerState {
  return state.mode === "paused" ? { ...state, mode: "running", pauseReason: null } : state;
}

function step(state: RunnerState, milliseconds: number): RunnerState {
  const seconds = milliseconds / 1000;
  const elapsedMs = state.elapsedMs + milliseconds;
  const distance = runningDistance(elapsedMs);
  const movement = distance - runningDistance(state.elapsedMs);
  const jumping = state.y < GROUND_Y || state.velocity < 0;
  const y = jumping ? Math.min(GROUND_Y, state.y + state.velocity * seconds + GRAVITY * seconds * seconds / 2) : GROUND_Y;
  const velocity = y === GROUND_Y ? 0 : state.velocity + GRAVITY * seconds;
  const obstacles = state.obstacles.map(obstacle => ({ ...obstacle, x: obstacle.x - movement }))
    .filter(obstacle => obstacle.x + CACTUS_WIDTH > 0);
  let { seed, nextObstacleDistance, nextObstacleId } = state;
  if (distance >= nextObstacleDistance) {
    obstacles.push({ id: nextObstacleId++, x: WORLD_WIDTH - (distance - nextObstacleDistance) });
    // xorshift32 supplies deterministic bounded variety without a clock or global randomness.
    seed ^= seed << 13;
    seed ^= seed >>> 17;
    seed = (seed ^ (seed << 5)) >>> 0;
    nextObstacleDistance += CACTUS_WIDTH + MIN_OBSTACLE_GAP + Math.floor(seed / 0x100000000 * 121);
  }
  return { ...state, y, velocity, distance, elapsedMs,
    obstacles, seed, nextObstacleDistance, nextObstacleId,
    mode: obstacles.some(obstacle => hasCollision(y, obstacle.x)) ? "crashed" : "running" };
}

export function tickRunner(state: RunnerState, deltaMs: number): RunnerState {
  if (state.mode !== "running" || !Number.isFinite(deltaMs) || deltaMs <= 0) return state;
  let remaining = Math.min(deltaMs, 50);
  let next = state;
  while (remaining > 0 && next.mode === "running") {
    const milliseconds = Math.min(remaining, MAX_STEP_MS);
    next = step(next, milliseconds);
    remaining -= milliseconds;
  }
  return next;
}
