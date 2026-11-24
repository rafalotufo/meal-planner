import RecipeSearch from "./recipe-search";
import Link from 'next/link';
import { requireFamilyContext } from "../lib/session";

export default async function HomePage() {
  await requireFamilyContext();
  return (
    <main className="min-h-screen bg-stone-50 px-4 pb-12 sm:px-8 sm:pb-16">
      <div className="mx-auto max-w-6xl">
        <header className="flex min-h-16 flex-wrap items-center justify-between gap-x-6 gap-y-2 border-b border-stone-200 py-4">
          <h1 className="font-serif text-2xl font-semibold tracking-tight text-emerald-950">Meal Planner</h1>
          <nav aria-label="Main" className="flex items-center gap-6 text-sm font-semibold text-emerald-900">
            <Link href="/" prefetch={false} aria-current="page" className="inline-flex min-h-11 items-center border-b-2 border-emerald-900 focus-visible:outline-2 focus-visible:outline-offset-4">Recipe search</Link>
            <a href="/menu" className="inline-flex min-h-11 items-center focus-visible:outline-2 focus-visible:outline-offset-4">Menu</a>
          </nav>
        </header>
        <RecipeSearch />
      </div>
    </main>
  );
}
