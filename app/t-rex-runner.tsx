"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { mountRunnerCanvas, type RunnerCanvas, type RunnerView } from "../lib/t-rex-canvas";
import type { RunnerState } from "../lib/t-rex-runner";

type Props = { requestId: number; initial: RunnerState; canAutoStart: (requestId: number) => boolean; onHide: (snapshot: RunnerState) => void };
const control = "min-h-11 min-w-11 rounded-lg border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-800 hover:bg-stone-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-800";

export default function TRexRunner({ requestId, initial, canAutoStart, onHide }: Props) {
  const section = useRef<HTMLElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const controller = useRef<RunnerCanvas | null>(null);
  const initialEligibility = useRef<boolean | null>(null);
  const [view, setView] = useState<RunnerView>({ mode: initial.mode, score: Math.floor(initial.distance / 10), status: "Loading sprites…", loading: true, unavailable: false, y: initial.y });

  useLayoutEffect(() => {
    if (!canvas.current || !section.current) return;
    // Keep the one first-commit decision across Strict Mode effect replay.
    if (initialEligibility.current === null) initialEligibility.current = canAutoStart(requestId);
    const mounted = mountRunnerCanvas(canvas.current, section.current, initial, next => {
      setView(previous => previous.mode === next.mode && previous.score === next.score && previous.status === next.status && previous.y === next.y ? previous : next);
    }, initialEligibility.current);
    controller.current = mounted;
    return () => { mounted.dispose(); controller.current = null; };
  }, [initial, requestId, canAutoStart]);

  return <section ref={section} aria-labelledby="t-rex-title"
    onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) controller.current?.pause("focus"); }}
    className="mt-5 rounded-xl border border-stone-300 bg-white p-4 sm:p-6">
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div><p className="text-xs font-medium tracking-widest text-emerald-800 uppercase">A little running break</p>
        <h2 id="t-rex-title" className="mt-1 font-serif text-2xl text-stone-900">T-Rex Runner</h2></div>
      <button id="t-rex-hide" type="button" className={control} onClick={() => {
        controller.current?.pause("hidden"); onHide(controller.current?.snapshot() ?? initial);
      }}>Hide game</button>
    </div>
    <p id="t-rex-instructions" className="mt-3 text-sm leading-relaxed text-stone-700">Press Space on the game or use Jump to clear a cactus. After a collision, Jump restarts.</p>
    <div className="mt-4 flex items-center justify-center rounded-lg bg-stone-50">
      <canvas id="t-rex-surface" ref={canvas} tabIndex={0} width={600} height={120}
        aria-label="T-Rex jumping game" aria-describedby="t-rex-instructions t-rex-status"
        data-mode={view.mode} data-y={view.y} data-score={view.score}
        onKeyDown={event => {
          if (event.target === event.currentTarget && event.code === "Space") {
            event.preventDefault(); controller.current?.jump(event.repeat);
          }
        }}
        className="block aspect-5/1 w-full rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-800">
        A dinosaur jumping game. Use the Jump, Pause, Resume and Hide controls below.
      </canvas>
    </div>
    <div className="mt-4 flex flex-wrap items-center gap-2">
      <button id="t-rex-jump" type="button" disabled={view.loading || view.unavailable} onClick={() => controller.current?.jump()}
        className="min-h-11 min-w-11 rounded-lg bg-emerald-900 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-800 disabled:opacity-60">Jump</button>
      <button id="t-rex-pause" type="button" disabled={view.unavailable || (view.loading && view.mode === "paused") || view.mode === "crashed"}
        onClick={() => view.mode === "paused" ? controller.current?.resume() : controller.current?.pause("manual")}
        className={control}>{view.mode === "paused" ? "Resume" : "Pause"}</button>
      <p className="ml-auto text-sm text-stone-600">Distance: <span id="t-rex-score">{view.score}</span></p>
    </div>
    <p id="t-rex-status" role="status" aria-live="polite" aria-atomic="true" className="mt-3 min-h-5 text-sm text-stone-700">{view.status}</p>
    <a className="mt-2 inline-flex min-h-11 items-center text-xs text-stone-600 underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-800"
      href="/games/t-rex/THIRD-PARTY-NOTICES.txt" target="_blank" rel="noopener noreferrer">T-Rex Runner / Chromium — source and license notices</a>
  </section>;
}
