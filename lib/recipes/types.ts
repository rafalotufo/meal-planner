export type RecipeTime = { kind: "cook" | "total"; text: string };

export type Recipe = {
  title: string;
  sourceUrl: string;
  imageUrl: string | null;
  summary: string;
  time: RecipeTime | null;
};

export interface RecipeSearchProvider {
  search(query: string, options: { signal: AbortSignal }): Promise<Recipe[]>;
}
