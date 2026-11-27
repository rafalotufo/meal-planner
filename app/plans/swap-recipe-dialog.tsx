'use client';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { parseMenuPage } from '../../lib/menu/validation';
import { recipeCategoryLabels } from '../../lib/recipes/category';
import type { RecipeCategory } from '../../lib/recipes/types';
import type { MenuPage, SavedMenuEntry } from '../../lib/menu/types';

export interface SwapOutcome { ok: boolean; status: number; message: string }
interface Props {
  title: string; category: RecipeCategory | null; plannedSources: string[]; trigger: HTMLButtonElement; blocked: boolean;
  onDismiss: () => void; onRefresh: () => void;
  onSubmit: (menuRecipeId: string) => Promise<SwapOutcome>;
}
const action = 'min-h-11 rounded-lg border border-stone-300 px-4 py-2 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-800 disabled:cursor-wait disabled:opacity-50';
class LoadError extends Error { constructor(readonly status: number) { super('Saved menu unavailable'); } }
async function readPage(response: Response, signal: AbortSignal): Promise<MenuPage> {
  const limit = 512 * 1024;
  if (Number(response.headers.get('content-length')) > limit) { await response.body?.cancel(); throw new LoadError(503); }
  const reader = response.body?.getReader();
  if (!reader) throw new LoadError(503);
  const cancel = () => { void reader.cancel().catch(() => {}); };
  signal.addEventListener('abort', cancel, { once: true });
  const decoder = new TextDecoder('utf-8', { fatal: true });
  let bytes = 0, text = '';
  try {
    for (;;) {
      if (signal.aborted) throw new LoadError(503);
      const { done, value } = await reader.read();
      if (signal.aborted) throw new LoadError(503);
      if (done) break;
      bytes += value.byteLength;
      if (bytes > limit) throw new LoadError(503);
      text += decoder.decode(value, { stream: true });
    }
    const unknown: unknown = JSON.parse(text + decoder.decode());
    const page = parseMenuPage(unknown);
    if (!page) throw new LoadError(503);
    return page;
  } catch (error) { await reader.cancel().catch(() => {}); throw error; }
  finally { signal.removeEventListener('abort', cancel); reader.releaseLock(); }
}
function Choice({ entry, selected, disabled, onSelect }: { entry: SavedMenuEntry; selected: boolean; disabled: boolean; onSelect: () => void }) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const recipe = entry.recipe;
  return <button type="button" data-swap-choice={entry.id} aria-label={recipe.title} aria-pressed={selected} disabled={disabled} onClick={onSelect}
    className={`flex min-h-24 min-w-0 items-center gap-3 rounded-xl border p-2 text-left disabled:cursor-wait focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-800 sm:flex-col sm:items-stretch ${selected ? 'border-emerald-800 bg-emerald-50 ring-1 ring-emerald-800' : 'border-stone-200 bg-white hover:border-emerald-700'}`}>
    <span className="relative flex size-24 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-stone-100 sm:aspect-4/3 sm:h-auto sm:w-full" aria-hidden="true">
      {recipe.imageUrl && failedUrl !== recipe.imageUrl ? <Image src={recipe.imageUrl} alt="" width={240} height={180} unoptimized loading="lazy" referrerPolicy="no-referrer" className="h-full w-full object-cover" onError={() => setFailedUrl(recipe.imageUrl)} /> : <span className="px-2 text-center text-xs text-stone-500">Photo unavailable</span>}
    </span>
    <span className="min-w-0 flex-1"><span className="block font-serif text-base leading-snug wrap-anywhere text-stone-900">{recipe.title}</span>{selected ? <span className="mt-2 inline-block rounded-full bg-emerald-900 px-2 py-1 text-xs font-semibold text-white">Selected</span> : null}</span>
  </button>;
}
export default function SwapRecipeDialog({ title, category, plannedSources, trigger, blocked, onDismiss, onSubmit, onRefresh }: Props) {
  const dialog = useRef<HTMLDialogElement>(null), search = useRef<HTMLInputElement>(null);
  const backdrop = useRef(false), alive = useRef(true), request = useRef({ version: 0 }), active = useRef<AbortController | null>(null), submittingNow = useRef(false);
  const [query, setQuery] = useState(''), [after, setAfter] = useState<string | undefined>(), [retry, setRetry] = useState(0);
  const [displayed, setDisplayed] = useState<{ page: MenuPage; query: string; after?: string } | null>(null), [loading, setLoading] = useState(true), [loadError, setLoadError] = useState<number | null>(null);
  const [selection, setSelection] = useState<string | null>(null), [submitting, setSubmitting] = useState(false), [outcome, setOutcome] = useState<SwapOutcome | null>(null);
  useEffect(() => {
    alive.current = true;
    const counter = request.current;
    const element = dialog.current!;
    element.showModal(); search.current?.focus();
    return () => {
      alive.current = false; counter.version++; active.current?.abort(); element.close();
      const fallback = document.getElementById('plan-heading') ?? document.querySelector<HTMLButtonElement>('[data-plan-approve]');
      (trigger.isConnected ? trigger : fallback)?.focus();
    };
  }, [trigger]);
  useEffect(() => {
    const counter = request.current;
    const version = ++counter.version, controller = new AbortController(); active.current = controller;
    let deadline: ReturnType<typeof setTimeout> | undefined, timedOut = false;
    const debounce = setTimeout(async () => {
      deadline = setTimeout(() => { timedOut = true; controller.abort(); }, 12000);
      try {
        const params = new URLSearchParams(); if (query.trim()) params.set('q', query); if (after) params.set('after', after); if (category) params.set('category', category);
        const response = await fetch('/api/menu' + (params.size ? '?' + params : ''), { signal: controller.signal, cache: 'no-store' });
        if (!response.ok) throw new LoadError(response.status);
        const result = await readPage(response, controller.signal);
        if (alive.current && version === request.current.version && !controller.signal.aborted) { setDisplayed({ page: result, query: query.trim(), after }); setLoadError(null); }
      } catch (error) {
        if (alive.current && version === request.current.version && (!controller.signal.aborted || timedOut)) { const status = error instanceof LoadError ? error.status : 503; if (status === 401 || status === 403) setDisplayed(null); setSelection(null); setLoadError(status); }
      } finally { clearTimeout(deadline); if (alive.current && version === request.current.version) setLoading(false); }
    }, query ? 250 : 0);
    return () => { counter.version++; clearTimeout(debounce); clearTimeout(deadline); controller.abort(); };
  }, [query, after, retry, category]);
  function reset() { request.current.version++; active.current?.abort(); setSelection(null); setOutcome(null); setLoadError(null); setLoading(true); }
  function changeQuery(value: string) { reset(); setQuery(value); setAfter(undefined); }
  function changePage(value: string | undefined) { reset(); setAfter(value); if (value === after) setRetry(value => value + 1); }
  function dismiss() { dialog.current?.close(); onDismiss(); }
  const page = displayed?.page;
  const unavailable = loading || loadError !== null || !displayed || displayed.query !== query.trim() || displayed.after !== after;
  const planned = new Set(plannedSources), choices = page?.entries.filter(entry => entry.curation.state === 'ready' && (category === null || entry.recipe.category === category) && !planned.has(entry.recipe.sourceUrl)) ?? [];
  const selected = unavailable ? undefined : choices.find(entry => entry.id === selection);
  async function confirm() {
    if (!selected || unavailable || blocked || submittingNow.current) return;
    submittingNow.current = true; setSubmitting(true); setOutcome(null);
    try {
      const result = await onSubmit(selected.id);
      if (!alive.current) return;
      if (result.ok) dismiss(); else setOutcome(result);
    } finally { submittingNow.current = false; if (alive.current) setSubmitting(false); }
  }
  return <dialog ref={dialog} aria-labelledby="swap-title" aria-describedby="swap-context"
    onCancel={event => { event.preventDefault(); dismiss(); }}
    onPointerDown={event => { backdrop.current = event.target === event.currentTarget; }}
    onClick={event => { const bounds = event.currentTarget.getBoundingClientRect(); if (backdrop.current && event.target === event.currentTarget && (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom)) dismiss(); }}
    className="m-auto h-[min(52rem,calc(100dvh-2rem))] max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-2xl overflow-x-hidden overflow-y-auto rounded-2xl border border-stone-200 bg-white p-0 text-stone-900 shadow-xl backdrop:bg-stone-950/50">
    <div className="flex h-full min-h-0 flex-col">
      <div className="shrink-0 border-b border-stone-200 p-4 sm:p-6">
        <div className="flex items-start justify-between gap-3"><div><p className="text-xs font-semibold tracking-widest text-emerald-800 uppercase">From your saved menu</p><h2 id="swap-title" className="mt-2 font-serif text-2xl">Choose a replacement</h2></div><button type="button" aria-label="Close recipe picker" onClick={dismiss} className={`${action} min-w-11 shrink-0 px-3`}>×</button></div>
        <p id="swap-context" className="mt-2 text-sm wrap-anywhere text-stone-600">Replacing: {title}{category ? ` · Choose another ${recipeCategoryLabels[category]}.` : ''}</p>
        <label htmlFor="swap-search" className="mt-4 block text-sm font-medium">Search saved recipes</label>
        <input ref={search} id="swap-search" type="search" value={query} maxLength={100} onChange={event => changeQuery(event.target.value)} className="mt-2 min-h-11 w-full min-w-0 rounded-lg border border-stone-400 bg-white px-3 text-sm focus-visible:outline-2 focus-visible:outline-emerald-800" placeholder="Search by recipe title" />
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6" aria-busy={loading}>
        {loading && !displayed ? <p role="status" className="mb-3 text-sm text-stone-600">Loading saved recipes…</p> : null}
        {loadError ? <div role="alert" className="mb-4"><p>Could not load saved recipes. Please try again.</p><button type="button" className={`${action} mt-3`} onClick={() => { reset(); setRetry(value => value + 1); }}>Retry loading recipes</button>{loadError === 401 ? <a className="ml-3 inline-flex min-h-11 items-center underline" href="/sign-in">Sign in</a> : loadError === 403 ? <a className="ml-3 inline-flex min-h-11 items-center underline" href="/onboarding">Check access</a> : null}</div> : null}
        {page && displayed ? <>
          <p className="mb-2 text-xs wrap-anywhere text-stone-500">Showing {displayed.query !== query.trim() || displayed.after !== after ? 'previous ' : ''}results for {displayed.query ? `“${displayed.query}”` : 'all saved recipes'}{displayed.after ? ' (older page)' : ''}.</p>
          <p role="status" className="mb-3 text-sm text-stone-600">{choices.length} available {choices.length === 1 ? 'recipe' : 'recipes'} on this page</p>
          {!page.entries.length ? <p className="py-4 text-sm text-stone-600">{displayed.query ? 'No saved recipe titles match your search.' : 'No saved recipes on this page. Add recipes to your menu to suggest a swap.'}</p> : !choices.length ? <p className="py-4 text-sm text-stone-600">No matching replacements are available on this page. Recipes can be unready or already in your plan. Search for another title or browse older matches.</p> : <div role="group" aria-label="Available replacement recipes" className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-3">{choices.map(entry => <Choice key={entry.id} entry={entry} selected={selected?.id === entry.id} disabled={unavailable} onSelect={() => { if (!unavailable) { setSelection(entry.id); setOutcome(null); } }} />)}</div>}
          <nav aria-label="Recipe search pages" className="mt-4 flex flex-wrap justify-between gap-3">{displayed.after ? <button type="button" disabled={unavailable} className={action} onClick={() => changePage(undefined)}>Newest matches</button> : <span />}{page.nextCursor ? <button type="button" disabled={unavailable} className={action} onClick={() => changePage(page.nextCursor!)}>Older matches</button> : null}</nav>
        </> : null}
        {query ? <button type="button" className="mt-2 min-h-11 text-sm text-emerald-900 underline" onClick={() => changeQuery('')}>Clear search</button> : null}
      </div>
      <div className="shrink-0 border-t border-stone-200 bg-stone-50 p-4 sm:px-6">
        <p role="status" className="text-sm wrap-anywhere text-stone-600">{selected ? `Selected: ${selected.recipe.title}` : 'Choose a recipe, then suggest the swap.'}</p>
        {outcome ? <div role="alert" className="mt-2 text-sm wrap-anywhere"><p>{outcome.message}</p>{outcome.status === 409 ? <button type="button" className={`${action} mt-2`} onClick={onRefresh}>Refresh plan</button> : outcome.status === 401 ? <a href="/sign-in" className="inline-flex min-h-11 items-center underline">Sign in</a> : outcome.status === 403 ? <a href="/onboarding" className="inline-flex min-h-11 items-center underline">Check access</a> : null}</div> : null}
        <div className="mt-3 flex flex-wrap justify-end gap-3"><button data-swap-cancel type="button" className={action} onClick={dismiss}>Cancel</button><button data-swap-confirm type="button" disabled={!selected || unavailable || blocked || submitting} onClick={() => { void confirm(); }} className={`${action} border-emerald-900 bg-emerald-900 text-white hover:bg-emerald-950`}>{submitting ? 'Suggesting…' : 'Suggest swap'}</button></div>
      </div>
    </div>
  </dialog>;
}
