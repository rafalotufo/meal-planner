"use client";

import { useRef, type Dispatch, type FormEvent } from "react";
import { remainingLetters, type WordSnackAction, type WordSnackRound } from "../lib/word-snack";

type Props = { round: WordSnackRound; onAction: Dispatch<WordSnackAction>; onClose: () => void };
const control = "min-h-11 min-w-11 rounded-lg border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-800 hover:bg-stone-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-800";

export default function WordSnack({ round, onAction, onClose }: Props) {
  const input = useRef<HTMLInputElement>(null);
  const remaining = remainingLetters(round.puzzle, round.draft);
  const ready = round.readyCount !== null;

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onAction({ type: "submit" });
  }

  return (
    <section aria-labelledby="word-snack-title" className="mt-5 rounded-xl border border-stone-300 bg-white p-4 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium tracking-widest text-emerald-800 uppercase">A little word break</p>
          <h2 id="word-snack-title" tabIndex={-1} className="mt-1 rounded-sm font-serif text-2xl text-stone-900 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-800">Word Snack</h2>
        </div>
        <button type="button" onClick={onClose} className={control}>
          {ready ? round.readyCount === 0 ? "Close game and view search" : "Close game and view results" : "Close game"}
        </button>
      </div>
      <p id="word-snack-instructions" className="mt-3 text-sm leading-relaxed text-stone-700">Make words of 3–6 letters from these six letters.</p>
      <p id="word-snack-coverage" className="mt-1 text-xs leading-relaxed text-stone-600">Uses a small word list. Your words do not affect your recipes.</p>
      {ready ? <p id="word-snack-ready" className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm leading-relaxed font-medium text-emerald-950">
        {round.readyCount === 0 ? "Search finished — no matches. You can keep playing or view your search."
          : `Recipes ready — ${round.readyCount} found. Keep playing or view results.`}
      </p> : null}
      <div role="group" aria-label="Available letters" className="mt-4 grid max-w-md grid-cols-3 gap-2 sm:grid-cols-6">
        {[...round.puzzle.letters].map((letter, index) => (
          <button key={index} type="button" disabled={remaining[letter] <= 0}
            aria-label={`${letter.toUpperCase()}, tile ${index + 1}, ${Math.max(0, remaining[letter])} remaining`}
            onClick={event => {
              onAction({ type: "tile", letter });
              // A disabled focused tile must hand focus to a stable editable control.
              if (remaining[letter] === 1 && event.currentTarget === document.activeElement) input.current?.focus();
            }}
            className="min-h-14 min-w-11 rounded-lg border border-stone-300 bg-stone-50 font-serif text-2xl font-semibold text-emerald-950 hover:border-emerald-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-800 disabled:cursor-default disabled:border-stone-200 disabled:bg-stone-100 disabled:text-stone-400">
            {letter.toUpperCase()}
          </button>
        ))}
      </div>
      <form onSubmit={submit} className="mt-4">
        <label htmlFor="word-snack-word" className="block text-sm font-medium text-stone-800">Your word</label>
        <div className="mt-2 flex flex-wrap gap-2">
          <input id="word-snack-word" ref={input} value={round.draft} maxLength={6} autoComplete="off" autoCapitalize="none" spellCheck={false}
            aria-describedby="word-snack-instructions word-snack-coverage"
            onChange={event => onAction({ type: "draft", value: event.target.value })}
            className="min-h-12 w-full min-w-0 rounded-lg border border-stone-300 bg-white px-3 py-2 text-base text-stone-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-800 sm:w-48" />
          <button type="submit" className="min-h-12 min-w-11 rounded-lg bg-emerald-900 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-800">Submit word</button>
          <button type="button" className={control} onClick={() => onAction({ type: "delete" })}>Delete letter</button>
          <button type="button" className={control} onClick={() => onAction({ type: "clear" })}>Clear word</button>
        </div>
      </form>
      <p id="word-snack-feedback" role="status" aria-live="polite" aria-atomic="true" className="mt-3 min-h-5 text-sm text-stone-700">{round.feedback}</p>
      <p className="mt-3 text-sm font-medium text-stone-800">{round.found.length} {round.found.length === 1 ? "word" : "words"} found</p>
      {round.found.length ? <ul aria-label="Found words" className="mt-2 flex flex-wrap gap-2">
        {round.found.map(word => <li key={word} className="rounded-full bg-stone-100 px-3 py-1 text-sm text-stone-700">{word}</li>)}
      </ul> : <p className="mt-1 text-sm text-stone-600">Find any word to get started. There’s no timer.</p>}
    </section>
  );
}
