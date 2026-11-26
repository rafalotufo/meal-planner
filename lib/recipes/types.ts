export type RecipeCategory = 'main' | 'side' | 'veggie';

export type RecipeTime = { kind: "cook" | "total"; text: string };

export type Recipe = {
  category?: RecipeCategory | null;
  title: string;
  sourceUrl: string;
  imageUrl: string | null;
  summary: string;
  time: RecipeTime | null;
};

export interface RecipeSearchProvider {
  search(query: string, options: { signal: AbortSignal; deadlineAt?: number }): Promise<Recipe[]>;
}
