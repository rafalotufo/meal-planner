import type { Recipe } from "./types";

export type RecipeFilter = "all" | "chickpeas" | "pasta" | "quick";
export type RecipeSort = "match" | "quickest";
export const FILTER_LABELS: Record<RecipeFilter, string> = {
  all: "All recipes", chickpeas: "Chickpeas", pasta: "Pasta", quick: "25 min or less",
};
export type SearchEntry = {
  id: number;
  query: string;
  recipes: Recipe[];
  filter: RecipeFilter;
  sort: RecipeSort;
};
type NotebookState = { entries: SearchEntry[]; selectedId: number | null };
type NotebookAction =
  | { type: "add"; id: number; query: string; recipes: Recipe[]; selectNew?: boolean }
  | { type: "select"; id: number }
  | { type: "open"; id: number }
  | { type: "filter"; id: number; filter: RecipeFilter }
  | { type: "sort"; id: number; sort: RecipeSort };

export const initialNotebook: NotebookState = { entries: [], selectedId: null };

export function notebookReducer(state: NotebookState, action: NotebookAction): NotebookState {
  if (action.type === "add") {
    const entry: SearchEntry = { id: action.id, query: action.query, recipes: action.recipes, filter: "all", sort: "match" };
    return { entries: [entry, ...state.entries], selectedId: action.selectNew === false ? state.selectedId : entry.id };
  }
  if (!state.entries.some(entry => entry.id === action.id)) return state;
  if (action.type === "select") {
    return { ...state, selectedId: state.selectedId === action.id ? null : action.id };
  }
  if (action.type === "open") return { ...state, selectedId: action.id };
  return { ...state, entries: state.entries.map(entry => {
    if (entry.id !== action.id) return entry;
    return action.type === "filter" ? { ...entry, filter: action.filter } : { ...entry, sort: action.sort };
  }) };
}

// Only exact reported total times qualify; cook times and ambiguous prose stay unknown.
export function totalMinutes(recipe: Recipe): number | null {
  if (recipe.time?.kind !== "total") return null;
  const text = recipe.time.text.trim().toLowerCase();
  const minutes = /^(\d+)\s*(?:minutes?|mins?|m)$/.exec(text);
  const hours = /^(\d+(?:\.\d+)?)\s*(?:hours?|hrs?|h)(?:\s+(?:and\s+)?(\d+)\s*(?:minutes?|mins?|m))?$/.exec(text);
  const value = minutes ? Number(minutes[1]) : hours ? Number(hours[1]) * 60 + Number(hours[2] ?? 0) : NaN;
  return Number.isSafeInteger(value) && value > 0 ? value : null;
}

export function filterRecipes(recipes: readonly Recipe[], filter: RecipeFilter): Recipe[] {
  return recipes.filter(recipe => {
    if (filter === "chickpeas") return /\bchickpeas?\b/i.test(recipe.title);
    if (filter === "pasta") return /\bpasta\b/i.test(recipe.title);
    if (filter === "quick") {
      const minutes = totalMinutes(recipe);
      return minutes !== null && minutes <= 25;
    }
    return true;
  });
}

export function availableFilters(recipes: readonly Recipe[]): RecipeFilter[] {
  const filters: RecipeFilter[] = ["all", "chickpeas", "pasta", "quick"];
  return filters.filter(filter => filter === "all" || filterRecipes(recipes, filter).length > 0);
}

export function sortRecipes(recipes: readonly Recipe[], sort: RecipeSort): Recipe[] {
  if (sort === "match") return [...recipes];
  return [...recipes].sort((a, b) => (totalMinutes(a) ?? Infinity) - (totalMinutes(b) ?? Infinity));
}
