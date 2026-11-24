"use client";

import { useEffect, useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import type { MenuPage, SavedMenuEntry } from '../../lib/menu/types';
import RecipeCard from '../recipe-card';
import RemoveRecipeDialog from './remove-recipe-dialog';

type ActionState = 'pending' | 'error' | 'signin' | 'family';
export default function MenuControls({ page, after }: { page: MenuPage; after?: string }) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [selected, setSelected] = useState<SavedMenuEntry | null>(null);
  const [states, setStates] = useState<Record<string, ActionState>>({});
  const [message, setMessage] = useState('');
  const requests = useRef(new Map<string, AbortController>());
  const buttons = useRef(new Map<string, HTMLButtonElement>());
  const trigger = useRef<HTMLButtonElement | null>(null);
  const interaction = useRef(0);
  const focusAfterRefresh = useRef<{ removed: string; next?: string; previous?: string; version: number } | null>(null);
  useEffect(() => {
    const active = requests.current;
    return () => { for (const request of active.values()) request.abort(); active.clear(); };
  }, []);
  useEffect(() => {
    const target = focusAfterRefresh.current;
    if (!target || target.version !== interaction.current || page.entries.some(entry => entry.id === target.removed)) return;
    focusAfterRefresh.current = null;
    const control = (target.next && buttons.current.get(target.next)) || (target.previous && buttons.current.get(target.previous)) || buttons.current.values().next().value || document.getElementById('menu-empty-link');
    control?.focus();
  }, [page]);
  function open(entry: SavedMenuEntry, button: HTMLButtonElement) {
    interaction.current++; focusAfterRefresh.current = null; trigger.current = button; setSelected(entry);
  }
  function cancel() { interaction.current++; setSelected(null); trigger.current?.focus(); }
  async function remove(entry: SavedMenuEntry) {
    setSelected(null);
    if (requests.current.has(entry.id)) return;
    const controller = new AbortController(); requests.current.set(entry.id, controller);
    const version = ++interaction.current;
    const index = page.entries.findIndex(item => item.id === entry.id);
    setStates(previous => ({ ...previous, [entry.id]: 'pending' })); setMessage('Removing recipe…');
    const timeout = setTimeout(() => controller.abort(), 15000);
    try {
      const response = await fetch(`/api/menu/${encodeURIComponent(entry.id)}/remove`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}', signal: controller.signal });
      if (requests.current.get(entry.id) !== controller) return;
      if (response.status === 401 || response.status === 403) { setStates(previous => ({ ...previous, [entry.id]: response.status === 401 ? 'signin' : 'family' })); setMessage('Removal was not completed.'); return; }
      if (!response.ok) throw new Error('Removal failed');
      const result: unknown = await response.json();
      if (!result || typeof result !== 'object' || !('removed' in result) || result.removed !== true) throw new Error('Invalid response');
      if (requests.current.get(entry.id) !== controller) return;
      if (version === interaction.current) {
        focusAfterRefresh.current = { removed: entry.id, next: page.entries[index + 1]?.id, previous: page.entries[index - 1]?.id, version };
        setMessage('Recipe removed from menu.');
      }
      startTransition(() => router.refresh());
    } catch {
      if (requests.current.get(entry.id) === controller) { setStates(previous => ({ ...previous, [entry.id]: 'error' })); setMessage('Could not remove this recipe. Please try again.'); }
    } finally { clearTimeout(timeout); if (requests.current.get(entry.id) === controller) requests.current.delete(entry.id); }
  }
  return <>
    <p className="mt-6 text-sm text-stone-600">{page.entries.length} {page.entries.length === 1 ? 'recipe' : 'recipes'} on this page</p>
    <p role="status" aria-live="polite" aria-atomic="true" className="my-3 min-h-5 text-sm text-stone-600">{message}</p>
    {page.entries.length ? <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">{page.entries.map(entry => <RecipeCard key={entry.id} recipe={entry.recipe}>
      <button data-remove-recipe={entry.id} ref={button => { if (button) buttons.current.set(entry.id, button); else buttons.current.delete(entry.id); }} type="button" disabled={states[entry.id] === 'pending'} aria-label={`Remove from menu: ${entry.recipe.title}`} onClick={event => open(entry, event.currentTarget)}
        className="mt-3 min-h-11 w-full rounded-lg border border-stone-300 px-4 py-2 text-sm font-semibold text-stone-700 hover:border-emerald-800 hover:bg-emerald-50 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-800 disabled:opacity-60">
        {states[entry.id] === 'pending' ? 'Removing…' : states[entry.id] === 'error' ? 'Retry removing from menu' : 'Remove from menu'}
      </button>
      {states[entry.id] === 'error' ? <p role="alert" className="mt-2 text-sm text-red-800">Could not remove this recipe. Please try again.</p> : states[entry.id] === 'signin' ? <p role="alert" className="mt-2 text-sm text-stone-600">Your session ended. <a href="/sign-in" className="underline">Sign in again</a>.</p> : states[entry.id] === 'family' ? <p role="alert" className="mt-2 text-sm text-stone-600">Family access changed. <a href="/onboarding" className="underline">Check family access</a>.</p> : null}
    </RecipeCard>)}</div> : <div className="rounded-xl border border-dashed border-stone-300 bg-white px-6 py-12 text-center"><h3 className="text-xl font-semibold text-stone-900">{after ? 'No recipes on this page' : 'Your menu is waiting'}</h3><p className="mt-3 text-sm text-stone-600">{after ? 'Return to the newest recipes to keep browsing.' : 'Find something delicious and add it to your shared menu from search.'}</p><a id="menu-empty-link" href={after ? '/menu#menu-heading' : '/'} className="mt-5 inline-flex min-h-11 items-center rounded-lg bg-emerald-900 px-5 py-2 font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-800">{after ? 'Newest recipes' : 'Find recipes'}</a></div>}
    <nav aria-label="Menu pages" className="mt-8 flex flex-wrap justify-between gap-4 text-sm font-semibold text-emerald-900">
      {after ? <a href="/menu#menu-heading" className="inline-flex min-h-11 items-center underline focus-visible:outline-2 focus-visible:outline-offset-4">Newest recipes</a> : <span />}
      {page.nextCursor ? <a href={`/menu?after=${encodeURIComponent(page.nextCursor)}#menu-heading`} className="inline-flex min-h-11 items-center underline focus-visible:outline-2 focus-visible:outline-offset-4">Older recipes</a> : null}
    </nav>
    {selected ? <RemoveRecipeDialog title={selected.recipe.title} onCancel={cancel} onConfirm={() => { void remove(selected); }} /> : null}
  </>;
}
