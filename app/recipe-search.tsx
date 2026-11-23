"use client";

import { useEffect, useLayoutEffect, useReducer, useRef, useState, type FormEvent } from "react";
import type { Recipe } from "../lib/recipes/types";
import { initialNotebook, notebookReducer } from "../lib/recipes/notebook";
import { isRecord, validateQuery } from "../lib/recipes/validation";
import SearchNotebook from "./search-notebook";
import WordSnack from "./word-snack";
import { initialWordSnack, wordSnackReducer } from "../lib/word-snack";
import { WORD_SNACK_PUZZLES } from "../lib/word-snack-puzzles";

const FAILURE = "We couldn’t finish the search. Please try again.";

export default function RecipeSearch() {
  const [query, setQuery] = useState("");
  const [notebook, dispatch] = useReducer(notebookReducer, initialNotebook);
  const [game, gameAction] = useReducer(wordSnackReducer, initialWordSnack);
  const [readyLauncherId, setReadyLauncherId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [inputError, setInputError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState("");
  const generation = useRef(0);
  const pending = useRef<AbortController | null>(null);
  const textarea = useRef<HTMLTextAreaElement>(null);
  const gameRegion = useRef<HTMLDivElement>(null);
  const notebookRegion = useRef<HTMLDivElement>(null);
  const focusAfterCommit = useRef<string | null>(null);

  // Focus DOM targets after React commits the corresponding close/open changes.
  // https://react.dev/learn/manipulating-the-dom-with-refs
  useLayoutEffect(() => {
    const id = focusAfterCommit.current;
    if (!id) return;
    focusAfterCommit.current = null;
    const target = document.getElementById(id);
    target?.focus({ preventScroll: true });
    if (id.startsWith("search-heading-")) target?.scrollIntoView({ behavior: "instant", block: "start" });
  }, [game.round?.open, notebook.selectedId, readyLauncherId]);

  function closeGame() {
    if (!game.round) return;
    if (game.round.readyCount !== null) {
      dispatch({ type: "open", id: game.round.requestId });
      focusAfterCommit.current = `search-heading-${game.round.requestId}`;
    } else focusAfterCommit.current = "word-snack-play";
    gameAction({ type: "close" });
  }

  function discardGame(id: number) {
    if (gameRegion.current?.contains(document.activeElement) || document.activeElement?.id === "word-snack-play") focusAfterCommit.current = "recipe-query";
    gameAction({ type: "discard", requestId: id });
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
    setReadyLauncherId(null);
    setLoading(true);
    const id = ++generation.current;
    gameAction({ type: "start", requestId: id, puzzles: WORD_SNACK_PUZZLES });
    const controller = new AbortController();
    pending.current = controller;
    try {
      const response = await fetch("/api/recipes/search", { method: "POST", signal: controller.signal,
        headers: { "Content-Type": "application/json" }, body: JSON.stringify({ query: description }) });
      const data: unknown = await response.json();
      if (id !== generation.current || controller.signal.aborted) return;
      if (!response.ok) {
        discardGame(id);
        const code = isRecord(data) && isRecord(data.error) ? data.error.code : null;
        setError(code === "SEARCH_UNAVAILABLE" ? "Recipe search is not available yet. Please try again later."
          : code === "SEARCH_BUSY" ? "Recipe search is busy. Please try again shortly." : FAILURE);
      } else if (isRecord(data) && Array.isArray(data.recipes)) {
        const recipes = data.recipes as Recipe[];
        const focusedPanel = document.activeElement?.closest("[data-search-panel]");
        const retainPanel = Boolean(focusedPanel && notebookRegion.current?.contains(focusedPanel));
        dispatch({ type: "add", id, query: description, recipes, selectNew: !retainPanel });
        // Preserve a focused launcher as results navigation instead of removing it.
        if (document.activeElement?.id === "word-snack-play") setReadyLauncherId(id);
        gameAction({ type: "ready", requestId: id, count: recipes.length });
        setStatus(recipes.length ? `${recipes.length} ${recipes.length === 1 ? "recipe" : "recipes"} found. Added to your searches.`
          : "No matching recipes found. Try a different description.");
      } else { discardGame(id); setError(FAILURE); }
    } catch {
      if (id === generation.current && !controller.signal.aborted) { discardGame(id); setError(FAILURE); }
    } finally {
      if (id === generation.current) {
        pending.current = null;
        setLoading(false);
      }
    }
  }

  return (
    <>
      <section aria-labelledby="recipe-search-title" className="pt-6 sm:pt-10">
        <p className="text-xs font-medium tracking-widest text-emerald-800 uppercase">Find your next meal</p>
        <h2 id="recipe-search-title" className="mt-3 font-serif text-3xl leading-tight tracking-tight text-stone-900 sm:text-5xl">What sounds good tonight?</h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed sm:text-base text-stone-600">A little inspiration. A dinner you’ll actually want to make.</p>
        <form onSubmit={search} noValidate className="mt-5">
          <label htmlFor="recipe-query" className="block text-sm font-medium text-stone-800">What would you like to cook?</label>
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
          {loading ? "Searching for recipes… Your earlier searches are still here." : game.round?.readyCount !== null && game.round?.open
            ? game.round.readyCount === 0 ? "Search finished — no matches. You can keep playing or view your search."
              : `Recipes ready — ${game.round.readyCount} found. Keep playing or view results.` : status}
        </p>
        {error ? <p role="alert" className="mt-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-900">{error}</p> : null}
      </section>
      {(loading && !game.round?.open) || readyLauncherId !== null ? <button id="word-snack-play" type="button"
        onClick={() => {
          if (readyLauncherId !== null) {
            focusAfterCommit.current = `search-heading-${readyLauncherId}`;
            dispatch({ type: "open", id: readyLauncherId });
            setReadyLauncherId(null);
          } else { focusAfterCommit.current = "word-snack-title"; gameAction({ type: "open" }); }
        }}
        className="mt-3 min-h-11 rounded-lg border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-emerald-900 hover:bg-stone-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-800">{readyLauncherId === null ? "Play Word Snack" : "View results"}</button> : null}
      <div ref={gameRegion}>
        {game.round?.open ? <WordSnack round={game.round} onAction={gameAction} onClose={closeGame} /> : null}
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
    </>
  );
}
