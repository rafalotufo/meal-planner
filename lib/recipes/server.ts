import "server-only";
import { createRecipeProvider, createSearchHandler } from "./search";

// Source photos are derived from the same safely fetched pages as recipe evidence.
export const searchRecipes = createSearchHandler({ getProvider: () => createRecipeProvider({
  RECIPE_SEARCH_PROVIDER: process.env.RECIPE_SEARCH_PROVIDER,
  BRAVE_SEARCH_API_KEY: process.env.BRAVE_SEARCH_API_KEY,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  OPENAI_RECIPE_MODEL: process.env.OPENAI_RECIPE_MODEL,
}) });
