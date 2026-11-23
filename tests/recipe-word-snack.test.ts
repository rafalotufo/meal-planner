import assert from "node:assert/strict";
import { test } from "node:test";
import { initialWordSnack, remainingLetters, wordSnackReducer } from "../lib/word-snack";

const puzzle = { id: "letters", letters: "letter", words: ["letter", "tree", "tee", "let"] };
const other = { id: "planet", letters: "planet", words: ["planet", "plant", "net"] };
const start = (id = 1) => wordSnackReducer(initialWordSnack, { type: "start", requestId: id, puzzles: [puzzle, other] });
const opened = () => wordSnackReducer(start(), { type: "open" });

test("rounds start hidden and only actual starts consume the ordered catalogue", () => {
  const first = start();
  assert.equal(first.round?.puzzle.id, "letters");
  assert.equal(first.round?.open, false);
  assert.equal(first.nextPuzzleIndex, 1);
  const second = wordSnackReducer(first, { type: "start", requestId: 2, puzzles: [puzzle, other] });
  assert.equal(second.round?.puzzle.id, "planet");
  assert.equal(second.nextPuzzleIndex, 0);
  const third = wordSnackReducer(second, { type: "start", requestId: 3, puzzles: [puzzle, other] });
  assert.equal(third.round?.puzzle.id, "letters");
});

test("accepted words normalize case and trim, clear the draft and cannot be counted twice", () => {
  const state = wordSnackReducer(opened(), { type: "draft", value: " TREE " });
  const accepted = wordSnackReducer(state, { type: "submit" });
  assert.deepEqual(accepted.round?.found, ["tree"]);
  assert.equal(accepted.round?.draft, "");
  assert.match(accepted.round?.feedback ?? "", /Added tree. 1 word found/);
  assert.equal(state.round?.draft, " TREE ");
  assert.deepEqual(state.round?.found, []);
  const duplicate = wordSnackReducer(wordSnackReducer(accepted, { type: "draft", value: "tree" }), { type: "submit" });
  assert.deepEqual(duplicate.round?.found, ["tree"]);
  assert.equal(duplicate.round?.draft, "tree");
  assert.match(duplicate.round?.feedback ?? "", /already found tree/);
});

test("word rejection distinguishes rules and limited vocabulary while retaining drafts", () => {
  for (const [draft, feedback] of [["te", /3–6/], ["trée", /letters A–Z/], ["teee", /available letters/], ["eel", /word list/]] as const) {
    const state = wordSnackReducer(opened(), { type: "draft", value: draft });
    const rejected = wordSnackReducer(state, { type: "submit" });
    assert.equal(rejected.round?.draft, draft);
    assert.deepEqual(rejected.round?.found, []);
    assert.match(rejected.round?.feedback ?? "", feedback);
  }
});

test("tile entry respects repeated-letter supply and delete/clear restore it", () => {
  let state = opened();
  for (const letter of ["t", "e", "e", "e"]) state = wordSnackReducer(state, { type: "tile", letter });
  assert.equal(state.round?.draft, "tee");
  assert.equal(remainingLetters(puzzle, "tee").e, 0);
  assert.equal(remainingLetters(puzzle, "TEE").t, 1);
  state = wordSnackReducer(state, { type: "delete" });
  assert.equal(state.round?.draft, "te");
  state = wordSnackReducer(state, { type: "clear" });
  assert.equal(state.round?.draft, "");
  assert.equal(remainingLetters(puzzle, "").e, 2);
  const bounded = wordSnackReducer(state, { type: "draft", value: "a".repeat(50) });
  assert.equal(bounded.round?.draft.length, 6);
});

test("pending close/reopen preserves play; success keeps the same round playable", () => {
  let state = wordSnackReducer(opened(), { type: "draft", value: "tee" });
  state = wordSnackReducer(state, { type: "submit" });
  state = wordSnackReducer(state, { type: "draft", value: "let" });
  const closed = wordSnackReducer(state, { type: "close" });
  assert.equal(closed.round?.open, false);
  assert.equal(closed.round?.draft, "let");
  const reopened = wordSnackReducer(closed, { type: "open" });
  const ready = wordSnackReducer(reopened, { type: "ready", requestId: 1, count: 2 });
  assert.equal(ready.round?.open, true);
  assert.equal(ready.round?.draft, "let");
  assert.deepEqual(ready.round?.found, ["tee"]);
  assert.equal(ready.round?.puzzle, reopened.round?.puzzle);
  assert.equal(ready.round?.readyCount, 2);
  const continued = wordSnackReducer(ready, { type: "submit" });
  assert.deepEqual(continued.round?.found, ["tee", "let"]);
  assert.equal(wordSnackReducer(continued, { type: "close" }).round, null);
});

test("zero-result success remains playable but closed/never-opened rounds cannot reopen after success", () => {
  const zero = wordSnackReducer(opened(), { type: "ready", requestId: 1, count: 0 });
  assert.equal(zero.round?.open, true);
  assert.equal(zero.round?.readyCount, 0);
  for (const pending of [start(), wordSnackReducer(opened(), { type: "close" })]) {
    const complete = wordSnackReducer(pending, { type: "ready", requestId: 1, count: 2 });
    assert.equal(complete.round, null);
    assert.equal(wordSnackReducer(complete, { type: "open" }).round, null);
  }
});

test("stale completions/errors cannot mutate current play and new searches reset it", () => {
  const state = wordSnackReducer(opened(), { type: "draft", value: "tee" });
  assert.equal(wordSnackReducer(state, { type: "ready", requestId: 0, count: 3 }), state);
  assert.equal(wordSnackReducer(state, { type: "discard", requestId: 0 }), state);
  assert.equal(wordSnackReducer(state, { type: "discard", requestId: 1 }).round, null);
  const next = wordSnackReducer(state, { type: "start", requestId: 2, puzzles: [puzzle, other] });
  assert.equal(next.round?.requestId, 2);
  assert.equal(next.round?.draft, "");
  assert.deepEqual(next.round?.found, []);
  assert.equal(next.round?.open, false);
});

test("all supported words found does not end or reset play", () => {
  let state = opened();
  for (const word of puzzle.words) state = wordSnackReducer(wordSnackReducer(state, { type: "draft", value: word }), { type: "submit" });
  assert.deepEqual(state.round?.found, puzzle.words);
  assert.equal(state.round?.open, true);
});
