import RecipeSearch from "./recipe-search";
import { requireFamilyContext } from "../lib/session";

export default async function HomePage() {
  await requireFamilyContext();
  return (
    <main className="min-h-screen bg-stone-50 px-4 pb-12 sm:px-8 sm:pb-16">
      <div className="mx-auto max-w-6xl">
        <header className="flex min-h-16 flex-wrap items-center justify-between gap-x-6 gap-y-2 border-b border-stone-200 py-4">
          <h1 className="font-serif text-2xl font-semibold tracking-tight text-emerald-950">Meal Planner</h1>
          <p className="text-xs font-medium tracking-widest text-stone-500 uppercase">Recipe search</p>
        </header>
        <RecipeSearch />
      </div>
    </main>
  );
}
