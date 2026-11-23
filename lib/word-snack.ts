export type WordSnackPuzzle = {
  readonly id: string;
  readonly letters: string;
  readonly words: readonly string[];
};
export type WordSnackRound = {
  requestId: number;
  puzzle: WordSnackPuzzle;
  open: boolean;
  draft: string;
  found: string[];
  feedback: string;
  readyCount: number | null;
};
export type WordSnackState = { nextPuzzleIndex: number; round: WordSnackRound | null };
export type WordSnackAction =
  | { type: "start"; requestId: number; puzzles: readonly WordSnackPuzzle[] }
  | { type: "ready"; requestId: number; count: number }
  | { type: "discard"; requestId: number }
  | { type: "open" | "close" | "submit" | "delete" | "clear" }
  | { type: "draft"; value: string }
  | { type: "tile"; letter: string };

export const initialWordSnack: WordSnackState = { nextPuzzleIndex: 0, round: null };

export function remainingLetters(puzzle: WordSnackPuzzle, draft: string): Record<string, number> {
  const remaining: Record<string, number> = {};
  for (const letter of puzzle.letters) remaining[letter] = (remaining[letter] ?? 0) + 1;
  for (const letter of draft.trim().toLowerCase()) {
    if (Object.hasOwn(remaining, letter)) remaining[letter]--;
  }
  return remaining;
}

export function wordSnackReducer(state: WordSnackState, action: WordSnackAction): WordSnackState {
  if (action.type === "start") {
    const puzzle = action.puzzles[state.nextPuzzleIndex % action.puzzles.length];
    if (!puzzle) return state;
    return { nextPuzzleIndex: (state.nextPuzzleIndex + 1) % action.puzzles.length,
      round: { requestId: action.requestId, puzzle, open: false, draft: "", found: [], feedback: "", readyCount: null } };
  }
  const round = state.round;
  if (!round) return state;
  if (action.type === "ready" || action.type === "discard") {
    if (round.requestId !== action.requestId) return state;
    return { ...state, round: action.type === "ready" && round.open ? { ...round, readyCount: action.count } : null };
  }
  if (action.type === "open") return { ...state, round: { ...round, open: true } };
  if (action.type === "close") return { ...state, round: round.readyCount === null ? { ...round, open: false } : null };
  if (!round.open) return state;

  let draft = round.draft;
  if (action.type === "draft") draft = action.value.slice(0, 6);
  if (action.type === "clear") draft = "";
  if (action.type === "delete") draft = draft.slice(0, -1);
  if (action.type === "tile") {
    if (!/^[a-z]$/.test(action.letter) || draft.length >= 6 || !(remainingLetters(round.puzzle, draft)[action.letter] > 0)) return state;
    draft += action.letter;
  }
  if (action.type !== "submit") return { ...state, round: { ...round, draft, feedback: "" } };

  const word = draft.trim().toLowerCase();
  let feedback: string;
  if (!/^[a-z]*$/.test(word)) feedback = "Use letters A–Z only.";
  else if (word.length < 3 || word.length > 6) feedback = "Make a word of 3–6 letters.";
  else if (Object.values(remainingLetters(round.puzzle, word)).some(count => count < 0)
    || [...word].some(letter => !round.puzzle.letters.includes(letter))) feedback = "Use only the available letters.";
  else if (!round.puzzle.words.includes(word)) feedback = "Not in this game's word list. Try another word.";
  else if (round.found.includes(word)) feedback = `You already found ${word}.`;
  else {
    const found = [...round.found, word];
    return { ...state, round: { ...round, found, draft: "", feedback: `Added ${word}. ${found.length} ${found.length === 1 ? "word" : "words"} found.` } };
  }
  return { ...state, round: { ...round, feedback } };
}
