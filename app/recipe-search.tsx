"use client";

import { useCallback, useEffect, useLayoutEffect, useReducer, useRef, useState, type FormEvent } from "react";
import type { Recipe } from "../lib/recipes/types";
import { initialNotebook, notebookReducer } from "../lib/recipes/notebook";
import { isRecord, validateQuery } from "../lib/recipes/validation";
import SearchNotebook from "./search-notebook";
import TRexRunner from "./t-rex-runner";
import { createRunner, type RunnerState } from "../lib/t-rex-runner";
import { runnerSessionReducer } from "../lib/t-rex-session";

const FAILURE = "We couldn’t finish the search. Please try again.";

export default function RecipeSearch() {
  const [query, setQuery] = useState("");
  const [notebook, dispatch] = useReducer(notebookReducer, initialNotebook);
  const [runner, runnerAction] = useReducer(runnerSessionReducer, null);
  const [loading, setLoading] = useState(false);
  const [inputError, setInputError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState("");
  const generation = useRef(0);
  const pending = useRef<AbortController | null>(null);
  const textarea = useRef<HTMLTextAreaElement>(null);
  const interactionVersion = useRef(0);
  const initialFocus = useRef<{ id: number; version: number; form: HTMLFormElement } | null>(null);
  const gameRegion = useRef<HTMLDivElement>(null);
  const notebookRegion = useRef<HTMLDivElement>(null);
  const focusAfterCommit = useRef<string | null>(null);

  // The same initial interaction token authorizes both focus and automatic motion.
  // A failed first-commit check must not be revived by later sprite loading/focus.
  const canAutoStart = useCallback((id: number) => {
    const intent = initialFocus.current;
    return Boolean(intent && intent.id === id && generation.current === id
      && pending.current && !pending.current.signal.aborted && intent.version === interactionVersion.current
      && intent.form.contains(document.activeElement));
  }, []);

  // Commit-time focus is never deferred to asset callbacks.
  // https://react.dev/learn/manipulating-the-dom-with-refs
  useLayoutEffect(() => {
    const intent = initialFocus.current;
    const focusGame = intent && runner?.visible && runner.requestId === intent.id && canAutoStart(intent.id);
    initialFocus.current = null;
    if (focusGame) {
      document.getElementById("t-rex-surface")?.focus({ preventScroll: true });
    }
    const id = focusAfterCommit.current;
    focusAfterCommit.current = null;
    if (!id) return;
    const target = document.getElementById(id);
    target?.focus({ preventScroll: true });
    if (id.startsWith("search-heading-")) target?.scrollIntoView({ behavior: "instant", block: "start" });
  }, [runner?.requestId, runner?.visible, notebook.selectedId, canAutoStart]);

  function hideRunner(snapshot: RunnerState) {
    if (!runner) return;
    focusAfterCommit.current = "t-rex-show";
    runnerAction({ type: "hide", requestId: runner.requestId, snapshot });
  }

  function discardRunner(id: number, success: boolean) {
    initialFocus.current = null;
    if (gameRegion.current?.contains(document.activeElement)) {
      focusAfterCommit.current = success ? `search-heading-${id}` : "recipe-query";
    }
    runnerAction({ type: "end", requestId: id });
  }

  // Cleanup and generation checks prevent an older request from updating a newer view.
  // https://react.dev/reference/react/useEffect#fetching-data-with-effects
  useEffect(() => () => { generation.current++; pending.current?.abort(); }, []);

  async function search(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading || pending.current) return;
    const description = validateQuery(query);
    if (!description) {
      setInputError("Enter a recipe description between 1 and 1,000 characters.");
      textarea.current?.focus();
      return;
    }
    setInputError(null);
    setError(null);
    setStatus("");
    setLoading(true);
    const id = ++generation.current;
    initialFocus.current = { id, version: interactionVersion.current, form: event.currentTarget };
    runnerAction({ type: "start", requestId: id, snapshot: createRunner(id) });
    const controller = new AbortController();
    pending.current = controller;
    try {
      const response = await fetch("/api/recipes/search", { method: "POST", signal: controller.signal,
        headers: { "Content-Type": "application/json" }, body: JSON.stringify({ query: description }) });
      const data: unknown = await response.json();
      if (id !== generation.current || controller.signal.aborted) return;
      if (!response.ok) {
        discardRunner(id, false);
        const code = isRecord(data) && isRecord(data.error) ? data.error.code : null;
        setError(code === "SEARCH_UNAVAILABLE" ? "Recipe search is not available yet. Please try again later."
          : code === "SEARCH_BUSY" ? "Recipe search is busy. Please try again shortly." : FAILURE);
      } else if (isRecord(data) && Array.isArray(data.recipes)) {
        const recipes = data.recipes as Recipe[];
        const focusedPanel = document.activeElement?.closest("[data-search-panel]");
        const retainPanel = Boolean(focusedPanel && notebookRegion.current?.contains(focusedPanel));
        dispatch({ type: "add", id, query: description, recipes, selectNew: !retainPanel });
        discardRunner(id, true);
        setStatus(recipes.length ? `${recipes.length} ${recipes.length === 1 ? "recipe" : "recipes"} found. Added to your searches.`
          : "No matching recipes found. Try a different description.");
      } else { discardRunner(id, false); setError(FAILURE); }
    } catch {
      if (id === generation.current && !controller.signal.aborted) { discardRunner(id, false); setError(FAILURE); }
    } finally {
      if (id === generation.current) {
        pending.current = null;
        setLoading(false);
      }
    }
  }

  return (
    <div onPointerDownCapture={() => { interactionVersion.current++; }}
      onKeyDownCapture={() => { interactionVersion.current++; }}
      onFocusCapture={() => { interactionVersion.current++; }}>
      <section aria-labelledby="recipe-search-title" className="pt-6 sm:pt-10">
        <p className="text-xs font-medium tracking-widest text-emerald-800 uppercase">Find your next meal</p>
        <h2 id="recipe-search-title" className="mt-3 font-serif text-3xl leading-tight tracking-tight text-stone-900 sm:text-5xl">What’s on your wish list this week?</h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed sm:text-base text-stone-600">From comforting favorites to something new, find recipes you’ll want to eat.</p>
        <form onSubmit={search} noValidate className="mt-5">
          <label htmlFor="recipe-query" className="block text-sm font-medium text-stone-800">What would you like to eat this week?</label>
          <p id="recipe-query-hint" className="sr-only sm:not-sr-only sm:mt-1 sm:text-sm sm:leading-relaxed sm:text-stone-600">Tell us about ingredients, a craving, or the time you have.</p>
          <div className="mt-3 flex flex-col gap-3 rounded-xl border border-stone-300 bg-white p-3 sm:flex-row sm:items-end">
            <textarea id="recipe-query" ref={textarea} value={query} onChange={event => { setQuery(event.target.value); setInputError(null); }}
              rows={2} maxLength={1000} placeholder="A quick vegetarian dinner with chickpeas and lemon…"
              aria-invalid={Boolean(inputError)} aria-describedby={`recipe-query-hint${inputError ? " recipe-query-error" : ""}`}
              className="block min-h-16 w-full min-w-0 flex-1 resize-y rounded-md bg-white p-2 text-base leading-relaxed text-stone-900 placeholder:text-stone-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-800" />
            <button type="submit" disabled={loading}
              className="inline-flex min-h-12 shrink-0 items-center justify-center gap-5 rounded-lg bg-emerald-900 px-6 py-3 text-sm font-semibold text-white hover:bg-emerald-950 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-800 disabled:cursor-wait disabled:opacity-60">
              {loading ? "Searching…" : "Find recipes"}<span aria-hidden="true">→</span>
            </button>
          </div>
          {inputError ? <p id="recipe-query-error" role="alert" className="mt-3 text-sm text-red-800">{inputError}</p> : null}
        </form>
        <p role="status" aria-live="polite" aria-atomic="true" className="mt-3 min-h-5 text-sm text-stone-600">
          {loading ? "Searching for recipes… Your earlier searches are still here." : status}
        </p>
        {error ? <p role="alert" className="mt-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-900">{error}</p> : null}
      </section>
      <div ref={gameRegion}>
        {runner?.visible ? <TRexRunner key={runner.requestId} requestId={runner.requestId} initial={runner.snapshot} canAutoStart={canAutoStart} onHide={hideRunner} />
          : runner ? <button id="t-rex-show" type="button" onClick={() => {
            focusAfterCommit.current = "t-rex-surface";
            runnerAction({ type: "show", requestId: runner.requestId });
          }} className="mt-3 min-h-11 min-w-11 rounded-lg border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-emerald-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-800">Show game</button> : null}
      </div>
      <div ref={notebookRegion}>
      {notebook.entries.length ? <SearchNotebook entries={notebook.entries} selectedId={notebook.selectedId}
        onSelect={id => dispatch({ type: "select", id })}
        onFilter={(id, filter) => dispatch({ type: "filter", id, filter })}
        onSort={(id, sort) => dispatch({ type: "sort", id, sort })} />
        : !loading ? <section aria-label="Getting started" className="mt-8 rounded-xl border border-dashed border-stone-300 px-6 py-10 sm:py-14">
          <p className="font-serif text-2xl text-stone-800">Your next favorite starts here.</p>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-stone-600">Search for something you’re craving. Your recipes will appear here, grouped by search, so you can explore without losing a good idea.</p>
          <p className="mt-4 text-xs text-stone-500">Searches stay on this page until you refresh.</p>
        </section> : null}
      </div>
    </div>
  );
}
