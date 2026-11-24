import { requireFamilyContext, requirePageSession } from '../../lib/session';
import { getDatabase } from '../../lib/db';
import { listMenuRecipes } from '../../lib/menu/store';
import { parseMenuCursor } from '../../lib/menu/validation';
import type { MenuPage } from '../../lib/menu/types';
import allowed from '../../lib/allowed-google-emails.json';
import MenuControls from './menu-controls';

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
  return <main>
      <section aria-labelledby="menu-heading" className="pt-8 sm:pt-12">
        <p className="text-xs font-semibold tracking-widest text-emerald-800 uppercase">Saved for later</p>
        <h1 id="menu-heading" tabIndex={-1} className="mt-3 font-serif text-3xl tracking-tight text-stone-900 sm:text-5xl">Your menu</h1>
        <p className="mt-3 text-sm leading-relaxed text-stone-600 sm:text-base">Recipes saved by your family, ready when you are. Everyone in your family can add or remove recipes.</p>
        {invalid ? <div className="mt-8 rounded-xl border border-stone-200 bg-white p-6"><p>This menu page is invalid.</p><a href="/menu" className="mt-3 inline-flex min-h-11 items-center text-emerald-900 underline">Newest recipes</a></div>
          : !page ? <div role="alert" className="mt-8 rounded-xl border border-stone-200 bg-white p-6"><p>Could not load your menu. Please try again.</p><a href="/menu" className="mt-3 inline-flex min-h-11 items-center text-emerald-900 underline">Reload menu</a></div>
          : <MenuControls page={page} after={after} />}
      </section>
  </main>;
}
