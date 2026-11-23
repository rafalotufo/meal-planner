import assert from 'node:assert/strict';
import test from 'node:test';
import { WORD_SNACK_PUZZLES } from '../lib/word-snack-puzzles';

test('Word Snack has 128 genuinely distinct six-letter puzzles within the local data budget', () => {
  assert.equal(WORD_SNACK_PUZZLES.length, 128);
  assert.equal(new Set(WORD_SNACK_PUZZLES.map(puzzle => puzzle.id)).size, 128);
  assert.equal(new Set(WORD_SNACK_PUZZLES.map(puzzle => [...puzzle.letters].sort().join(''))).size, 128);
  assert.ok(Buffer.byteLength(JSON.stringify(WORD_SNACK_PUZZLES), 'utf8') <= 65_536);
  assert.ok(WORD_SNACK_PUZZLES.some(puzzle => new Set(puzzle.letters).size < 6), 'includes repeated-letter racks');
});

test('every authored puzzle has at least ten unique supported answers that obey its letter supply', () => {
  for (const puzzle of WORD_SNACK_PUZZLES) {
    assert.match(puzzle.id, /^word-snack-\d{3}$/);
    assert.match(puzzle.letters, /^[a-z]{6}$/);
    assert.ok(puzzle.words.length >= 10, `${puzzle.id} needs at least ten words`);
    assert.equal(new Set(puzzle.words).size, puzzle.words.length, `${puzzle.id} has duplicate answers`);
    assert.ok(puzzle.words.some(word => word.length === 6), `${puzzle.id} needs a six-letter answer`);
    for (const word of puzzle.words) {
      assert.match(word, /^[a-z]{3,6}$/, `${puzzle.id}: ${word}`);
      const remaining = [...puzzle.letters];
      for (const letter of word) {
        const index = remaining.indexOf(letter);
        assert.notEqual(index, -1, `${puzzle.id}: ${word} exceeds ${puzzle.letters}`);
        remaining.splice(index, 1);
      }
    }
  }
});
