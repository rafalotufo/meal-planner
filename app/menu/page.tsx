import { requireFamilyContext, requirePageSession } from '../../lib/session';
import { getDatabase } from '../../lib/db';
import { listMenuRecipes } from '../../lib/menu/store';
import { parseMenuCursor } from '../../lib/menu/validation';
import type { MenuPage } from '../../lib/menu/types';
import allowed from '../../lib/allowed-google-emails.json';
import MenuControls from './menu-controls';
import Link from 'next/link';

export default async function MenuPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await requireFamilyContext();
  const session = await requirePageSession();
  const query = await searchParams;
  const invalid = Object.keys(query).some(key => key !== 'after') || (query.after !== undefined && !parseMenuCursor(query.after));
  const after = typeof query.after === 'string' ? query.after : undefined;
  let page: MenuPage | null = null;
  if (!invalid) {
    try { page = await listMenuRecipes(await getDatabase(), session.identity, allowed, after); }
    catch { /* A failed read must never look like an empty menu. */ }
  }
  return <main className="min-h-screen bg-stone-50 px-4 pb-12 sm:px-8 sm:pb-16">
    <div className="mx-auto max-w-6xl">
      <header className="flex min-h-16 flex-wrap items-center justify-between gap-x-6 gap-y-2 border-b border-stone-200 py-4">
        <h1 className="font-serif text-2xl font-semibold tracking-tight text-emerald-950">Meal Planner</h1>
        <nav aria-label="Main" className="flex items-center gap-6 text-sm font-semibold text-emerald-900">
          <Link href="/" prefetch={false} className="inline-flex min-h-11 items-center focus-visible:outline-2 focus-visible:outline-offset-4">Recipe search</Link>
          <a href="/menu" aria-current="page" className="inline-flex min-h-11 items-center border-b-2 border-emerald-900 focus-visible:outline-2 focus-visible:outline-offset-4">Menu</a>
        </nav>
      </header>
      <section aria-labelledby="menu-heading" className="pt-8 sm:pt-12">
        <p className="text-xs font-semibold tracking-widest text-emerald-800 uppercase">Saved for later</p>
        <h2 id="menu-heading" tabIndex={-1} className="mt-3 font-serif text-3xl tracking-tight text-stone-900 sm:text-5xl">Your menu</h2>
        <p className="mt-3 text-sm leading-relaxed text-stone-600 sm:text-base">Recipes saved by your family, ready when you are. Everyone in your family can add or remove recipes.</p>
        {invalid ? <div className="mt-8 rounded-xl border border-stone-200 bg-white p-6"><p>This menu page is invalid.</p><a href="/menu" className="mt-3 inline-flex min-h-11 items-center text-emerald-900 underline">Newest recipes</a></div>
          : !page ? <div role="alert" className="mt-8 rounded-xl border border-stone-200 bg-white p-6"><p>Could not load your menu. Please try again.</p><a href="/menu" className="mt-3 inline-flex min-h-11 items-center text-emerald-900 underline">Reload menu</a></div>
          : <MenuControls page={page} after={after} />}
      </section>
    </div>
  </main>;
}
