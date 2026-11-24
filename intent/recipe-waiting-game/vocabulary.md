# Word Snack — authored vocabulary

Date: 2026-11-23

## Origin and scope

The implementing catalogue author composed these puzzle racks and answer lists
for this repository from ordinary English vocabulary. No dictionary corpus,
website, word-game database, or third-party package was copied, scraped or
imported. The source is lib/word-snack-puzzles.ts; its fixed entries are not
provider-generated at runtime and require no network request or separate
asset. Generated IDs follow the stable authored catalogue order.

This is a curated puzzle answer list, not a general English dictionary. Some
valid English words are intentionally absent. The interface must disclose the
small word list and say “Not in this game's word list” for unsupported input,
without claiming the word is not English. Listed ordinary inflections are
accepted; unlisted inflections are not inferred. No per-user vocabulary,
progress storage or game-word logging is introduced.

## Selection and review

The catalogue author inspected every rack and each listed answer while
composing and reviewing the data: 128 racks and 1,392 rack-answer entries
(971 distinct words across racks). Entries use lowercase ASCII and 3–6 letters;
proper names, abbreviations, hyphenated/apostrophized words and slurs were not
selected. Ordinary dictionary words, inflections and common regional spellings
are permitted (for example “kerb” and “leant”). The lists favor familiar words
but do not claim a measured reading level or complete coverage.

This was an implementing AI agent's semantic review, not a human or
lexicographer certification. Structural validation cannot establish whether an
entry is familiar English or appropriate in every context. Independent final
content review must inspect all source rows and record any corrections; it
must not treat structural tests as a substitute for that review.

## Measured structural checks

- Exactly 128 IDs and 128 distinct sorted-letter multisets.
- Exactly six letters per rack; 20 racks contain repeated letters.
- At least 10 distinct supported answers per rack, including a six-letter
  answer; every answer fits its rack's letter multiplicities.
- Serialized catalogue is 17,028 UTF-8 bytes, below the 65,536-byte design bound.
- All structural checks are executable in
  tests/recipe-word-snack-catalogue.test.ts using the existing TypeScript
  compiler and Node native runner.

The test was written before the catalogue: the initial compile failed with
TS2307 for the missing module. Once authored, an isolated strict compile and
both native-runner catalogue tests passed. The full application suite is owned
by the integrating developer; no live provider or external dictionary evidence
is claimed here. Re-measure the byte/entry counts after any catalogue edit.
