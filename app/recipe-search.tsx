"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type FormEvent } from "react";
import type { Recipe } from "../lib/recipes/types";
import { isRecord, validateQuery } from "../lib/recipes/validation";

const FAILURE = "We couldn’t finish the search. Please try again.";

function RecipeCard({ recipe }: { recipe: Recipe }) {
  const [failedPhotoUrl, setFailedPhotoUrl] = useState<string | null>(null);
  return (
    <article className="flex min-w-0 flex-col overflow-hidden rounded-xl border border-stone-200 bg-white">
      <div className="relative flex aspect-[4/3] items-center justify-center bg-stone-100 text-sm text-stone-500">
        {recipe.imageUrl && recipe.imageUrl !== failedPhotoUrl ? (
          <Image src={recipe.imageUrl} alt={recipe.title} fill
            className="object-cover" unoptimized loading="lazy"
            referrerPolicy="no-referrer" onError={() => setFailedPhotoUrl(recipe.imageUrl)} />
        ) : <span>Photo unavailable</span>}
      </div>
      <div className="flex grow flex-col p-5">
        <p className="text-xs font-medium tracking-wide break-all text-stone-500">{new URL(recipe.sourceUrl).hostname}</p>
        <h3 className="mt-2 text-xl leading-snug font-semibold break-words text-stone-900">{recipe.title}</h3>
        <p className="mt-3 text-sm leading-relaxed break-words text-stone-600">{recipe.summary}</p>
        {recipe.time ? <p className="mt-4 text-sm font-medium text-stone-700">
          {recipe.time.kind === "cook" ? "Cook time" : "Total time"}: {recipe.time.text}
        </p> : null}
        <a href={recipe.sourceUrl} target="_blank" rel="noopener noreferrer"
          className="mt-5 self-start rounded-sm text-sm font-semibold text-emerald-900 underline decoration-emerald-900/30 underline-offset-4 hover:decoration-emerald-900 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-800">
          View recipe<span className="sr-only">: {recipe.title} (opens in a new tab)</span>
          <span aria-hidden="true"> ↗</span>
        </a>
      </div>
    </article>
  );
}

export default function RecipeSearch() {
  const [query, setQuery] = useState("");
  const [recipes, setRecipes] = useState<Recipe[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [inputError, setInputError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const generation = useRef(0);
  const pending = useRef<AbortController | null>(null);
  const textarea = useRef<HTMLTextAreaElement>(null);

  // Cleanup and generation checks prevent an older request from updating a newer view.
  // https://react.dev/reference/react/useEffect#fetching-data-with-effects
  useEffect(() => () => { generation.current++; pending.current?.abort(); }, []);

  async function search(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;
    const description = validateQuery(query);
    if (!description) {
      setInputError("Enter a recipe description between 1 and 1,000 characters.");
      textarea.current?.focus();
      return;
    }
    setInputError(null);
    setError(null);
    setRecipes(null);
    setLoading(true);
    const id = ++generation.current;
    pending.current?.abort();
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
        setRecipes(data.recipes as Recipe[]);
      } else { setError(FAILURE); }
    } catch {
      if (id === generation.current && !controller.signal.aborted) setError(FAILURE);
    } finally {
      if (id === generation.current) setLoading(false);
    }
  }

  const status = loading ? "Searching for recipes…" : recipes === null ? ""
    : recipes.length ? `${recipes.length} ${recipes.length === 1 ? "recipe" : "recipes"} found.`
      : "No matching recipes found. Try a different description.";

  return (
    <>
      <form onSubmit={search} noValidate className="mt-10 max-w-2xl">
        <label htmlFor="recipe-query" className="block text-lg font-semibold text-stone-900">What would you like to cook?</label>
        <p id="recipe-query-hint" className="mt-2 text-sm leading-relaxed text-stone-600">Tell us about ingredients, a craving, or the time you have.</p>
        <textarea id="recipe-query" ref={textarea} value={query} onChange={(event) => { setQuery(event.target.value); setInputError(null); }}
          rows={3} maxLength={1000} placeholder="A quick vegetarian dinner with chickpeas and lemon…"
          aria-invalid={Boolean(inputError)} aria-describedby={`recipe-query-hint${inputError ? " recipe-query-error" : ""}`}
          className="mt-4 block w-full resize-y rounded-lg border border-stone-300 bg-white p-4 text-base leading-relaxed text-stone-900 placeholder:text-stone-400 focus-visible:border-emerald-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-800" />
        {inputError ? <p id="recipe-query-error" role="alert" className="mt-3 text-sm text-red-800">{inputError}</p> : null}
        <button type="submit" disabled={loading}
          className="mt-4 inline-flex min-h-11 items-center gap-5 rounded-lg bg-emerald-900 px-6 py-3 text-sm font-semibold text-white hover:bg-emerald-950 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-800 disabled:cursor-wait disabled:opacity-60">
          {loading ? "Searching…" : "Find recipes"}<span aria-hidden="true">→</span>
        </button>
      </form>
      <section aria-label="Recipe results" className="mt-10">
        <p role="status" aria-live="polite" aria-atomic="true" className="text-sm text-stone-600">{status}</p>
        {error ? <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-900">{error}</p> : null}
        {recipes && recipes.length > 0 ? <>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-stone-900">Recipes to try</h2>
          <p className="mt-2 text-sm text-stone-600">A quick look at each recipe. Open the source for the full method.</p>
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {recipes.map((recipe) => <RecipeCard key={recipe.sourceUrl} recipe={recipe} />)}
          </div>
        </> : null}
      </section>
    </>
  );
}
