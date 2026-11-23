import "server-only";
import { createRecipeProvider, createSearchHandler } from "./search";

// One guard per application process; provider credentials never enter client imports.
export const searchRecipes = createSearchHandler({ getProvider: () => createRecipeProvider({
  RECIPE_SEARCH_PROVIDER: process.env.RECIPE_SEARCH_PROVIDER,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  OPENAI_RECIPE_MODEL: process.env.OPENAI_RECIPE_MODEL,
}) });
