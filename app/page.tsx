import RecipeSearch from "./recipe-search";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-stone-50 px-5 py-10 sm:px-8 sm:py-14">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-3xl font-semibold tracking-tight text-stone-900">Meal Planner</h1>
        <p className="mt-3 max-w-xl text-base leading-relaxed text-stone-600">Find a recipe for whatever sounds good.</p>
        <RecipeSearch />
      </div>
    </main>
  );
}
