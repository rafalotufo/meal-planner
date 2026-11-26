import assert from 'node:assert/strict';
import test from 'node:test';
import { classifyRecipeMetadata, isRecipeCategory, recipeCategoryLabels } from '../lib/recipes/category.js';

test('stored categories are exact values with stable user labels', () => {
  for (const value of ['main', 'side', 'veggie']) assert.equal(isRecipeCategory(value), true);
  for (const value of [null, undefined, '', 'Main', 'main dish', 'vegetarian', ' main ', 1, {}, ['main']]) assert.equal(isRecipeCategory(value), false);
  assert.deepEqual(recipeCategoryLabels, { main: 'Main dish', side: 'Side', veggie: 'Veggie' });
});
test('metadata maps exact bounded role phrases with case and whitespace normalization', () => {
  for (const value of ['main', 'Main Dish', ' MAIN   COURSE ', 'entree', 'entrée']) assert.equal(classifyRecipeMetadata(value), 'main');
  for (const value of ['side', ' Side Dish ']) assert.equal(classifyRecipeMetadata(value), 'side');
  for (const value of ['veggie', 'Vegetable Side', 'vegetable side dish', 'vegetable accompaniment']) assert.equal(classifyRecipeMetadata(value), 'veggie');
  assert.equal(classifyRecipeMetadata(['main dish', 'entrée', 'vegetarian']), 'main');
  assert.equal(classifyRecipeMetadata(Array(16).fill('side')), 'side');
});
test('metadata uncertainty and malformed or conflicting input stay unclassified', () => {
  for (const value of [null, undefined, '', 'vegetarian', 'vegan', 'vegetables', 'dinner', 'salad', 'vegetable soup', 'main dish with vegetables', ['main', 'side'], ['side', 'veggie'], ['unknown'], [], {}, 1, ['side', null], ['side', '\uD800'], ['side', 'main\u0000'], ['side', 'x'.repeat(101)], Array(17).fill('side'), 'main' + ' '.repeat(97)]) {
    assert.equal(classifyRecipeMetadata(value), null, JSON.stringify(value));
  }
});
