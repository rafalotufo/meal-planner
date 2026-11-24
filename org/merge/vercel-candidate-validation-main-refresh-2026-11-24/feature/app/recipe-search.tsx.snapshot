"use client";

import { useEffect, useReducer, useRef, useState, type FormEvent } from "react";
import type { Recipe } from "../lib/recipes/types";
import { initialNotebook, notebookReducer } from "../lib/recipes/notebook";
import { isRecord, validateQuery } from "../lib/recipes/validation";
import SearchNotebook from "./search-notebook";

const FAILURE = "We couldn’t finish the search. Please try again.";

export default function RecipeSearch() {
  const [query, setQuery] = useState("");
  const [notebook, dispatch] = useReducer(notebookReducer, initialNotebook);
  const [loading, setLoading] = useState(false);
  const [inputError, setInputError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState("");
  const generation = useRef(0);
  const pending = useRef<AbortController | null>(null);
  const textarea = useRef<HTMLTextAreaElement>(null);

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
    const controller = new AbortController();
    pending.current = controller;
    try {
      const response = await fetch("/api/recipes/search", { method: "POST", signal: controller.signal,
        headers: { "Content-Type": "application/json" }, body: JSON.stringify({ query: description }) });
      const data: unknown = await response.json();
      if (id !== generation.current || controller.signal.aborted) return;
      if (!response.ok) {
        const code = isRecord(data) && isRecord(data.error) ? data.error.code : null;
        setError(code === "SEARCH_UNAVAILABLE" ? "Recipe search is not available yet. Please try again later."
          : code === "SEARCH_BUSY" ? "Recipe search is busy. Please try again shortly." : FAILURE);
      } else if (isRecord(data) && Array.isArray(data.recipes)) {
        const recipes = data.recipes as Recipe[];
        dispatch({ type: "add", id, query: description, recipes });
        setStatus(recipes.length ? `${recipes.length} ${recipes.length === 1 ? "recipe" : "recipes"} found. Added to your searches.`
          : "No matching recipes found. Try a different description.");
      } else { setError(FAILURE); }
    } catch {
      if (id === generation.current && !controller.signal.aborted) setError(FAILURE);
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
          {loading ? "Searching for recipes… Your earlier searches are still here." : status}
        </p>
        {error ? <p role="alert" className="mt-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-900">{error}</p> : null}
      </section>
      {notebook.entries.length ? <SearchNotebook entries={notebook.entries} selectedId={notebook.selectedId}
        onSelect={id => dispatch({ type: "select", id })}
        onFilter={(id, filter) => dispatch({ type: "filter", id, filter })}
        onSort={(id, sort) => dispatch({ type: "sort", id, sort })} />
        : !loading ? <section aria-label="Getting started" className="mt-8 rounded-xl border border-dashed border-stone-300 px-6 py-10 sm:py-14">
          <p className="font-serif text-2xl text-stone-800">Your next favorite starts here.</p>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-stone-600">Search for something you’re craving. Your recipes will appear here, grouped by search, so you can explore without losing a good idea.</p>
          <p className="mt-4 text-xs text-stone-500">Searches stay on this page until you refresh.</p>
        </section> : null}
    </>
  );
}
