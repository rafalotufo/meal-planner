"use client";

import {
  availableFilters, FILTER_LABELS, filterRecipes, sortRecipes,
  type RecipeFilter, type RecipeSort, type SearchEntry,
} from "../lib/recipes/notebook";
import RecipeCard from "./recipe-card";

type Props = {
  entries: SearchEntry[];
  selectedId: number | null;
  onSelect: (id: number) => void;
  onFilter: (id: number, filter: RecipeFilter) => void;
  onSort: (id: number, sort: RecipeSort) => void;
};

export default function SearchNotebook({ entries, selectedId, onSelect, onFilter, onSort }: Props) {
  return (
    <section aria-labelledby="notebook-title" className="mt-6 sm:mt-10">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-2">
        <h2 id="notebook-title" className="text-2xl font-semibold tracking-tight text-stone-900">Your searches</h2>
        <p className="text-sm text-stone-600">Kept here until you refresh.</p>
      </div>
      <div className="divide-y divide-stone-200 border-y border-stone-200">
        {entries.map((entry, index) => {
          const open = selectedId === entry.id;
          const visible = sortRecipes(filterRecipes(entry.recipes, entry.filter), entry.sort);
          const panelId = `search-results-${entry.id}`;
          const headingId = `search-heading-${entry.id}`;
          return (
            <section key={entry.id} aria-labelledby={headingId}>
              <h3>
                <button id={headingId} type="button" aria-expanded={open} aria-controls={panelId}
                  onClick={() => onSelect(entry.id)}
                  className="flex min-h-20 w-full items-center justify-between gap-4 rounded-sm py-5 text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-800">
                  <span className="min-w-0">
                    <span className="block text-base leading-relaxed font-semibold break-words text-stone-900 sm:text-lg">{entry.query}</span>
                    <span className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm font-normal text-stone-600">
                      <span>{entry.recipes.length} {entry.recipes.length === 1 ? "recipe" : "recipes"}</span>
                      {index === 0 ? <span className="text-emerald-800">Latest search</span> : null}
                    </span>
                  </span>
                  <span aria-hidden="true" className="flex size-9 shrink-0 items-center justify-center rounded-full border border-stone-200 bg-white text-xl text-emerald-900">{open ? "−" : "+"}</span>
                </button>
              </h3>
              <div id={panelId} data-search-panel={entry.id} hidden={!open}>
                {open ? <div className="pb-8">
                  {entry.recipes.length > 0 ? <>
                    <div role="group" aria-label={`Filter results for ${entry.query}`} className="flex flex-wrap gap-2">
                      {availableFilters(entry.recipes).map(filter => (
                        <button key={filter} type="button" aria-pressed={entry.filter === filter}
                          onClick={() => onFilter(entry.id, filter)}
                          className={`inline-flex min-h-11 items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-800 ${entry.filter === filter
                            ? "border-emerald-900 bg-emerald-900 text-white"
                            : "border-stone-300 bg-white text-stone-700 hover:border-emerald-800 hover:bg-emerald-50"}`}>
                          {entry.filter === filter ? <span aria-hidden="true">✓</span> : null}{FILTER_LABELS[filter]}
                        </button>
                      ))}
                    </div>
                    <p className="mt-3 text-xs leading-relaxed text-stone-600">Ingredient filters match recipe titles. Time filters use reported total time.</p>
                    <div className="my-5 flex flex-wrap items-center justify-between gap-3">
                      <p role="status" aria-live="polite" aria-atomic="true" className="text-sm text-stone-600">
                        <span className="sr-only">Showing </span>{visible.length} of {entry.recipes.length} recipes
                      </p>
                      <label className="flex items-center gap-2 text-sm text-stone-600">
                        <span className="sr-only sm:not-sr-only">Sort by</span>
                        <select value={entry.sort} onChange={event => onSort(entry.id, event.target.value as RecipeSort)}
                          className="min-h-11 rounded-md border border-stone-300 bg-white px-3 py-2 text-base text-stone-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-800">
                          <option value="match">Best match</option>
                          <option value="quickest">Quickest first</option>
                        </select>
                      </label>
                    </div>
                    {visible.length ? <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                      {visible.map(recipe => <RecipeCard key={recipe.sourceUrl} recipe={recipe} />)}
                    </div> : <p className="rounded-lg bg-white p-5 text-sm text-stone-600">No recipes match this filter. Choose All recipes to see this search again.</p>}
                  </> : <div className="rounded-lg border border-dashed border-stone-300 bg-white px-5 py-8 text-center">
                    <p className="font-medium text-stone-900">No matching recipes found.</p>
                    <p className="mt-2 text-sm text-stone-600">Try a different ingredient or a broader description in a new search.</p>
                  </div>}
                </div> : null}
              </div>
            </section>
          );
        })}
      </div>
    </section>
  );
}
