import assert from "node:assert/strict";
import test from "node:test";
import { safeRecipeUrl, validateQuery } from "../build/recipe-tests/lib/recipes/validation.js";

test("query validation trims text and enforces the useful input boundary", () => {
  assert.equal(validateQuery("  chickpea dinner  "), "chickpea dinner");
  for (const value of [null, 4, {}, "", "   ", "x".repeat(1001)]) {
    assert.equal(validateQuery(value), null);
  }
  assert.equal(validateQuery("x".repeat(1000)).length, 1000);
});

test("source URLs normalize fragments and hostnames without broadening their identity", () => {
  assert.equal(safeRecipeUrl("https://FOOD.example.com:443/chickpeas?q=1#method"),
    "https://food.example.com/chickpeas?q=1");
  assert.notEqual(safeRecipeUrl("https://food.example.com/a?x=1"),
    safeRecipeUrl("https://food.example.com/a?x=2"));
});

test("unsafe URL schemes, credentials, local targets, ports and control characters are rejected", () => {
  for (const value of [null, {}, "javascript:alert(1)", "http://food.example.com/a",
    "https://user:pass@food.example.com/a", "https://food.example.com:444/a",
    "https://127.0.0.1/a", "https://2130706433/a", "https://0x7f000001/a",
    "https://[::1]/a", "https://localhost/a", "https://localhost./a",
    "https://x.local/a", "https://x.localhost/a", "https://x.internal/a",
    "https://intranet/a", "https://food.example.com/\na", "https://food.example.com/" + "x".repeat(2048)]) {
    assert.equal(safeRecipeUrl(value), null, String(value));
  }
});
