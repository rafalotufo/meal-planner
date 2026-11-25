// Copyright (c) 2014 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
// extract from chromium source code by @liuwayong
// Adapted from wayou/t-rex-runner@5455bfa408ec6b707c7300ff194b7390733a766d.
// Full notices: /games/t-rex/THIRD-PARTY-NOTICES.txt; mapping: intent/t-rex-runner/provenance.md.
import { GROUND_Y, TREX_X, WORLD_HEIGHT, WORLD_WIDTH, jumpRunner, pauseRunner, resumeRunner, tickRunner, type RunnerState } from "./t-rex-runner";

export const SPRITE_LAYOUT = {
  1: { width: 1233, height: 68, trexX: 848, trexY: 2, cactusX: 228, cactusY: 2, groundX: 2, groundY: 54 },
  2: { width: 2441, height: 130, trexX: 1678, trexY: 2, cactusX: 446, cactusY: 2, groundX: 2, groundY: 104 },
} as const;
export type RunnerView = { mode: RunnerState["mode"]; score: number; status: string; loading: boolean; unavailable: boolean; y: number };
export type RunnerCanvas = { jump: (repeat?: boolean) => void; pause: (reason: string) => void; resume: () => void; snapshot: () => RunnerState; dispose: () => void };

export function mountRunnerCanvas(canvas: HTMLCanvasElement, section: HTMLElement, initial: RunnerState, onView: (view: RunnerView) => void, autoStartAllowed = false): RunnerCanvas {
  // Automatic motion requires the parent's first-commit interaction eligibility,
  // not merely focus that may return before a delayed image callback.
  let state = autoStartAllowed ? initial : pauseRunner(initial, "focus");
  let disposed = false;
  let image: HTMLImageElement | null = new Image();
  let loaded = false;
  let unavailable = false;
  let frame: number | null = null;
  let previous: number | null = null;
  const ratio = window.devicePixelRatio >= 2 ? 2 : 1;
  const sprite = SPRITE_LAYOUT[ratio];
  const context = canvas.getContext("2d");
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");

  function publish() {
    const status = unavailable ? "Game unavailable. Your recipe search is still running."
      : !loaded ? state.mode === "paused" ? "Game paused. Loading sprites…" : "Loading sprites…"
        : state.mode === "crashed" ? "Collision. Press Space on the game or Jump to restart."
          : state.mode === "paused" ? "Game paused. Choose Resume to continue."
            : "Running. Press Space on the game or Jump to jump.";
    onView({ mode: state.mode, score: Math.floor(state.distance / 10), status, loading: !loaded, unavailable, y: state.y });
  }
  function draw() {
    if (!context || !loaded || !image || disposed) return;
    const width = Math.max(1, canvas.getBoundingClientRect().width);
    const dpr = window.devicePixelRatio || 1;
    const height = Math.max(1, canvas.getBoundingClientRect().height);
    if (canvas.width !== Math.round(width * dpr) || canvas.height !== Math.round(height * dpr)) {
      canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
    }
    context.setTransform(canvas.width / WORLD_WIDTH, 0, 0, canvas.height / WORLD_HEIGHT, 0, 0);
    context.imageSmoothingEnabled = false;
    context.clearRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
    const offset = state.distance % 600;
    for (const x of [-offset, 600 - offset]) context.drawImage(image, sprite.groundX, sprite.groundY, 600 * ratio, 12 * ratio, x, 127, 600, 12);
    const trexFrame = state.mode === "crashed" ? 220 : state.y < GROUND_Y ? 0 : 88 + (Math.floor(state.elapsedMs / (1000 / 12)) % 2) * 44;
    context.drawImage(image, sprite.trexX + trexFrame * ratio, sprite.trexY, 44 * ratio, 47 * ratio, TREX_X, state.y, 44, 47);
    for (const obstacle of state.obstacles) context.drawImage(image, sprite.cactusX, sprite.cactusY, 17 * ratio, 35 * ratio, obstacle.x, 105, 17, 35);
  }
  function stop() {
    if (frame !== null) cancelAnimationFrame(frame);
    frame = null; previous = null;
  }
  function eligible() { return !document.hidden && document.hasFocus() && section.contains(document.activeElement); }
  function schedule() {
    if (!disposed && loaded && !unavailable && state.mode === "running" && frame === null) frame = requestAnimationFrame(animate);
  }
  // RAF is one-shot; resetting its clock on pause/resume drops suspended time.
  // https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame
  function animate(timestamp: number) {
    frame = null;
    if (disposed) return;
    if (!eligible()) { pause("focus"); return; }
    state = tickRunner(state, previous === null ? 0 : timestamp - previous);
    previous = timestamp;
    draw(); publish(); schedule();
  }
  function pause(reason: string) { if (disposed) return; state = pauseRunner(state, reason); stop(); draw(); publish(); }
  function resume() { if (disposed || !loaded || unavailable || !eligible()) return; state = resumeRunner(state); previous = null; draw(); publish(); schedule(); }
  function jump(repeat = false) {
    if (disposed || !loaded || unavailable || !eligible()) return;
    if (state.mode === "crashed" && !repeat) previous = null;
    state = jumpRunner(state, repeat); draw(); publish(); schedule();
  }
  function onVisibility() { if (document.hidden) pause("visibility"); }
  function onBlur() { pause("blur"); }
  function onReducedMotion() { if (reduced.matches) pause("reduced-motion"); }
  function redraw() { draw(); }
  const observer = new ResizeObserver(redraw);
  observer.observe(canvas);
  window.addEventListener("resize", redraw);
  window.addEventListener("blur", onBlur);
  document.addEventListener("visibilitychange", onVisibility);
  reduced.addEventListener("change", onReducedMotion);
  // Parent's initial commit may focus the surface after this child mounts.
  // Asset completion checks section focus but never changes it.
  if (reduced.matches || document.hidden || !document.hasFocus()) state = pauseRunner(state, reduced.matches ? "reduced-motion" : "visibility");
  if (!context) { unavailable = true; publish(); }
  else {
    image.onload = () => {
      if (disposed || !image) return;
      if (image.naturalWidth !== sprite.width || image.naturalHeight !== sprite.height) { unavailable = true; stop(); publish(); return; }
      loaded = true;
      if (!eligible()) state = pauseRunner(state, "focus");
      draw(); publish(); schedule();
    };
    image.onerror = () => { if (!disposed) { unavailable = true; stop(); publish(); } };
    image.src = `/games/t-rex/${ratio === 2 ? "200" : "100"}-offline-sprite.png`;
    publish();
  }
  return { jump, pause, resume, snapshot: () => state, dispose: () => {
    if (disposed) return;
    disposed = true; stop(); observer.disconnect();
    window.removeEventListener("resize", redraw); window.removeEventListener("blur", onBlur);
    document.removeEventListener("visibilitychange", onVisibility); reduced.removeEventListener("change", onReducedMotion);
    if (image) { image.onload = null; image.onerror = null; image = null; }
    context?.clearRect(0, 0, canvas.width, canvas.height);
  } };
}
