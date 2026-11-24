import assert from "node:assert/strict";
import test from "node:test";
import {
  availableFilters, filterRecipes, initialNotebook, notebookReducer,
  sortRecipes, totalMinutes,
} from "../lib/recipes/notebook.js";
import type { Recipe } from "../lib/recipes/types.js";

function recipe(title: string, time: Recipe["time"] = null, summary = "A simple dinner."): Recipe {
  return { title, time, summary, sourceUrl: `https://recipes.example/${encodeURIComponent(title)}`, imageUrl: null };
}
const bowl = recipe("Lemony chickpea bowls", { kind: "total", text: "20 minutes" });
const pasta = recipe("Spinach pasta", { kind: "total", text: "25 mins" });
const soup = recipe("Lentil soup", { kind: "cook", text: "10 minutes" });

test("results can retain an earlier selected panel and explicit open never toggles it shut", () => {
  const first = notebookReducer(initialNotebook, { type: "add", id: 1, query: "First", recipes: [bowl] });
  const second = notebookReducer(first, { type: "add", id: 2, query: "Second", recipes: [pasta], selectNew: false });
  assert.deepEqual(second.entries.map(entry => entry.id), [2, 1]);
  assert.equal(second.selectedId, 1);
  const opened = notebookReducer(second, { type: "open", id: 2 });
  assert.equal(opened.selectedId, 2);
  assert.equal(notebookReducer(opened, { type: "open", id: 2 }).selectedId, 2);
  assert.equal(notebookReducer(opened, { type: "open", id: 999 }), opened);
  assert.equal(first.entries.length, 1);
});

// Each new submission is a separate group; per-group choices survive navigation.
test("notebook retains searches newest first, including repeated queries and empty results", () => {
  const first = notebookReducer(initialNotebook, { type: "add", id: 1, query: "Dinner", recipes: [bowl, soup] });
  const filtered = notebookReducer(first, { type: "filter", id: 1, filter: "chickpeas" });
  const sorted = notebookReducer(filtered, { type: "sort", id: 1, sort: "quickest" });
  const second = notebookReducer(sorted, { type: "add", id: 2, query: "Dinner", recipes: [] });
  assert.deepEqual(second.entries.map(entry => entry.id), [2, 1]);
  assert.equal(second.selectedId, 2);
  assert.deepEqual(second.entries[0].recipes, []);
  const reopened = notebookReducer(second, { type: "select", id: 1 });
  assert.equal(reopened.selectedId, 1);
  assert.equal(reopened.entries[1].filter, "chickpeas");
  assert.equal(reopened.entries[1].sort, "quickest");
  assert.equal(notebookReducer(reopened, { type: "select", id: 1 }).selectedId, null);
  assert.equal(first.entries[0].filter, "all");
  assert.equal(first.entries[0].sort, "match");
  assert.deepEqual(initialNotebook.entries, []);
});

test("filtering and sorting one group do not change another group or its original results", () => {
  const first = notebookReducer(initialNotebook, { type: "add", id: 1, query: "First", recipes: [bowl, soup] });
  const second = notebookReducer(first, { type: "add", id: 2, query: "Second", recipes: [pasta] });
  const updated = notebookReducer(second, { type: "filter", id: 2, filter: "pasta" });
  assert.equal(updated.entries[0].filter, "pasta");
  assert.equal(updated.entries[1].filter, "all");
  assert.deepEqual(updated.entries[1].recipes, [bowl, soup]);
  assert.deepEqual(filterRecipes(updated.entries[1].recipes, "all"), [bowl, soup]);
  assert.deepEqual(notebookReducer(updated, { type: "select", id: 999 }), updated);
});

test("ingredient pills match whole words in titles, never queries, summaries or partial words", () => {
  const recipes = [bowl, pasta, recipe("Chickpeas and greens"), recipe("Chickpeasta"),
    recipe("Vegetable bowl", null, "Serve with chickpeas or pasta.")];
  assert.deepEqual(filterRecipes(recipes, "chickpeas").map(r => r.title), [bowl.title, "Chickpeas and greens"]);
  assert.deepEqual(filterRecipes(recipes, "pasta"), [pasta]);
  assert.deepEqual(availableFilters(recipes), ["all", "chickpeas", "pasta", "quick"]);
  assert.deepEqual(availableFilters([soup]), ["all"]);
  assert.deepEqual(availableFilters([]), ["all"]);
});

test("short-time filter uses exact total time and includes 25 minutes, keeping unknowns in All", () => {
  const recipes = [bowl, pasta, soup, recipe("Longer", { kind: "total", text: "26 minutes" }),
    recipe("Unknown"), recipe("Range", { kind: "total", text: "20–30 minutes" })];
  assert.deepEqual(filterRecipes(recipes, "quick"), [bowl, pasta]);
  assert.deepEqual(filterRecipes(recipes, "all"), recipes);
});

test("totalMinutes accepts only exact English numeric durations with total-time evidence", () => {
  for (const [text, expected] of [
    ["15 minutes", 15], ["25 min", 25], ["25 mins", 25], ["1 hour", 60],
    ["1 hr 15 min", 75], ["1 hour and 5 minutes", 65], ["2 hrs", 120],
    ["  20 MINUTES  ", 20], ["1.5 hours", 90],
  ] as const) assert.equal(totalMinutes(recipe("Test", { kind: "total", text })), expected, text);
  for (const text of ["", "25", "0 minutes", "-5 minutes", "20-30 min", "20–30 minutes", "~20 minutes",
    "about 20 minutes", "under 20 minutes", "20 minutes or more", "20 min + chilling",
    "1:20", "PT20M", "20 minutes per batch", "overnight", "Infinity hours", "999999999999999999999 hours"])
    assert.equal(totalMinutes(recipe("Test", { kind: "total", text })), null, text);
  assert.equal(totalMinutes(soup), null);
  assert.equal(totalMinutes(recipe("No time")), null);
});

test("quickest sort is stable, places unknown and cook-only times last, and preserves source order", () => {
  const tied = recipe("Another bowl", { kind: "total", text: "20 minutes" });
  const unknown = recipe("Unknown");
  const recipes = [unknown, pasta, soup, bowl, tied];
  assert.deepEqual(sortRecipes(recipes, "quickest"), [bowl, tied, pasta, unknown, soup]);
  assert.deepEqual(sortRecipes(recipes, "match"), recipes);
  assert.deepEqual(recipes, [unknown, pasta, soup, bowl, tied]);
});
