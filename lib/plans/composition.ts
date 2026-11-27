import type { RecipeCategory } from '../recipes/types';

export const planTargets: { category: RecipeCategory; label: string; target: number }[] = [
  { category: 'main', label: 'Main dishes', target: 4 },
  { category: 'side', label: 'Sides', target: 2 },
  { category: 'veggie', label: 'Veggies', target: 2 },
];
export const maxPlanMeals = 8;

/** Historical unclassified slots retain their existing unrestricted swaps. */
export function canReplaceMeal(planned: { category?: RecipeCategory | null }, replacement: { category?: RecipeCategory | null }) {
  return planned.category == null || planned.category === replacement.category;
}
