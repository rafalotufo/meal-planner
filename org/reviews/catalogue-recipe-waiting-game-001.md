# Word Snack — independent full-catalogue content audit

- Date: 2026-11-23
- Reviewer: reviewer (independent of catalogue author)
- Source: lib/word-snack-puzzles.ts, catalogue commit 48829e1
- Assignment: catalogue-recipe-waiting-game-001
- Verdict: Approved catalogue content; no required findings

## Actual coverage and lexical assessment

Read every source row: 128/128 racks, word-snack-001 through word-snack-128
inclusive, and all 1,392 rack-answer entries (971 distinct answer strings).
This was a full lexical inspection, not a sample inferred from passing tests.
Checked spelling, ordinary English meanings/inflections, proper-name-only
entries, abbreviations, slurs, and suitability for the disclosed curated game.
No required replacements or typographical errors were identified.

Less frequent but legitimate vocabulary includes recuse (012), riven (032),
thane (059), renal (073/081/101), emend (093), and plat (113). Regional forms
kerb (018) and leant (072) are valid English and explicitly permitted by the
vocabulary note. Ordinary words that can also be names, such as dale, lee and
jack, have independent lowercase English meanings; they are not accepted only
as proper names. The lists remain limited and uneven in familiarity; this
review does not claim a measured reading level or comprehensive vocabulary.

## Structure, provenance and tests

Read the full catalogue test file and feature vocabulary note. The source
comment links the authored-origin/coverage note. Its explicit assertion that
the author composed the list without importing a corpus is consistent with
the repository evidence; this audit did not independently prove the negative
of every possible outside influence or provide legal certification. No
external dictionary, dataset, download or service was used in this review.

Ran `node --import tsx --test tests/recipe-word-snack-catalogue.test.ts`:
2 tests passed, 0 failed. These verify 128 unique IDs, unique six-letter
multisets, repeated-letter inclusion, >=10 unique supported 3–6-letter answers
per rack, at least one six-letter answer, exact letter supply, ASCII shape,
and the serialized byte bound. Lexical judgment above was separate from these
structural assertions.

Independently measured the exported catalogue with the pinned tsx loader:
128 racks; 1,392 entries; 971 distinct words; 20 repeated-letter racks;
17,028 serialized UTF-8 bytes, below 65,536. Measurements match vocabulary.md.
No source edits, builds, auth-server work, browser checks or live-provider calls
were performed. This content approval is not final code/security approval,
human merge approval or production authorization.
