import RecipeSearch from "./recipe-search";
import { requireFamilyContext } from "../lib/session";

export default async function HomePage() {
  await requireFamilyContext();
  return (
    <main>
      <h1 className="sr-only">Meal Planner</h1>
      <p className="pt-6 text-xs font-medium tracking-widest text-stone-500 uppercase">Recipe search</p>
      <RecipeSearch />
    </main>
  );
}
