import type { RecipeCategory } from './types';

export const recipeCategoryLabels: Record<RecipeCategory, string> = { main: 'Main dish', side: 'Side', veggie: 'Veggie' };

export function isRecipeCategory(value: unknown): value is RecipeCategory {
  return value === 'main' || value === 'side' || value === 'veggie';
}

const metadataRoles = new Map<string, RecipeCategory>([
  ['main', 'main'], ['main dish', 'main'], ['main course', 'main'], ['entree', 'main'], ['entrée', 'main'],
  ['side', 'side'], ['side dish', 'side'],
  ['veggie', 'veggie'], ['vegetable side', 'veggie'], ['vegetable side dish', 'veggie'], ['vegetable accompaniment', 'veggie'],
]);

/** Only explicit meal roles from the selected Recipe node; uncertainty stays null. */
export function classifyRecipeMetadata(value: unknown): RecipeCategory | null {
  const values = Array.isArray(value) ? value : [value];
  if (!values.length || values.length > 16 || !values.every(item => typeof item === 'string' && item.length <= 100 && !/[\uD800-\uDFFF\x00-\x1f\x7f]/u.test(item))) return null;
  let category: RecipeCategory | null = null;
  for (const item of values as string[]) {
    const role = metadataRoles.get(item.trim().replace(/\s+/gu, ' ').toLowerCase());
    if (!role) continue;
    if (category !== null && category !== role) return null;
    category = role;
  }
  return category;
}
