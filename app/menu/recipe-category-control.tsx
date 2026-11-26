"use client";

import { useEffect, useRef, useState, type FormEvent } from 'react';
import type { SavedMenuEntry } from '../../lib/menu/types';
import { isRecipeCategory, recipeCategoryLabels } from '../../lib/recipes/category';
import { isRecord } from '../../lib/recipes/validation';
import { parseSavedMenuEntry } from '../../lib/menu/validation';

type Feedback = { kind: 'status' | 'error' | 'signin' | 'family'; text: string };
export default function RecipeCategoryControl({ entry, canEdit, onSaved }: { entry: SavedMenuEntry; canEdit: boolean; onSaved: () => void }) {
  const category = entry.recipe.category ?? null;
  const [draft, setDraft] = useState(category ?? '');
  const [pending, setPending] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const request = useRef<AbortController | null>(null);
  const select = useRef<HTMLSelectElement>(null);
  const id = `recipe-category-${entry.id}`;
  const title = entry.curation.state === 'ready' ? entry.recipe.title : entry.recipe.sourceUrl;
  useEffect(() => () => { request.current?.abort(); request.current = null; }, []);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (request.current || !canEdit || !isRecipeCategory(draft)) return;
    const controller = new AbortController(); request.current = controller;
    setPending(true); setFeedback({ kind: 'status', text: 'Saving category…' });
    const timeout = setTimeout(() => controller.abort(), 15000);
    try {
      const response = await fetch('/api/menu?category=update', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: entry.id, category: draft }), signal: controller.signal });
      if (request.current !== controller) return;
      if (response.status === 401 || response.status === 403) {
        setFeedback({ kind: response.status === 401 ? 'signin' : 'family', text: 'Category was not saved. Your access changed.' }); return;
      }
      if (!response.ok) throw new Error('Category unavailable');
      const result: unknown = await response.json();
      if (!isRecord(result) || Object.keys(result).length !== 1 || !Object.hasOwn(result, 'entry')) throw new Error('Invalid response');
      const saved = parseSavedMenuEntry(result.entry);
      if (!saved || saved.id !== entry.id || saved.recipe.category !== draft) throw new Error('Invalid saved category');
      controller.signal.throwIfAborted();
      if (request.current !== controller) return;
      setFeedback({ kind: 'status', text: 'Category saved.' }); onSaved();
    } catch {
      if (request.current === controller) setFeedback({ kind: 'error', text: 'Could not confirm category. Refresh your menu or try again.' });
    } finally {
      clearTimeout(timeout);
      if (request.current === controller) {
        request.current = null; setPending(false);
        if (document.activeElement === document.body) select.current?.focus();
      }
    }
  }
  return <div className="mt-4 border-t border-stone-100 pt-3">
    <p data-recipe-category className="text-sm font-medium text-stone-700">Category: {category ? recipeCategoryLabels[category] : 'Unclassified'}</p>
    {canEdit ? <form onSubmit={submit} className="mt-3" aria-label={`Change category for ${title}`}>
      <label htmlFor={id} className="block text-xs font-semibold text-stone-600">Category<span className="sr-only"> for {title}</span></label>
      <select ref={select} id={id} data-category-select value={draft} disabled={pending} aria-describedby={`${id}-feedback`} onChange={event => { setDraft(event.target.value); setFeedback(null); }} className="mt-1 min-h-11 w-full min-w-0 rounded-lg border border-stone-300 bg-white px-3 py-2 text-base text-stone-900 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-800 disabled:bg-stone-100">
        <option value="" disabled>Unclassified</option>
        {Object.entries(recipeCategoryLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
      </select>
      <button data-save-category type="submit" disabled={pending || !isRecipeCategory(draft) || draft === category} className="mt-2 min-h-11 w-full rounded-lg border border-emerald-900 px-3 py-2 text-sm font-semibold text-emerald-900 hover:bg-emerald-50 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-800 disabled:opacity-60">{pending ? 'Saving…' : 'Save category'}</button>
      <p id={`${id}-feedback`} role="status" aria-live="polite" aria-atomic="true" className={`mt-2 text-sm ${feedback?.kind === 'error' ? 'text-red-800' : 'text-stone-600'}`}>
        {feedback?.text}{feedback?.kind === 'signin' ? <> <a href="/sign-in" className="underline">Sign in again</a>.</> : feedback?.kind === 'family' ? <> <a href="/onboarding" className="underline">Check family access</a>.</> : null}
      </p>
    </form> : null}
  </div>;
}
