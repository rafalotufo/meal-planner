"use client";

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { parseSavedMenuEntry } from '../../lib/menu/validation';

type Feedback = { kind: 'status' | 'error' | 'signin' | 'family'; text: string };
export default function AddRecipeUrlForm({ onSaved, after }: { onSaved: () => void; after?: string }) {
  const [sourceUrl, setSourceUrl] = useState('');
  const [pending, setPending] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const request = useRef<AbortController | null>(null);
  const input = useRef<HTMLInputElement>(null);
  useEffect(() => () => { request.current?.abort(); request.current = null; }, []);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (request.current) return;
    const controller = new AbortController(); request.current = controller;
    setPending(true); setFeedback({ kind: 'status', text: 'Saving recipe link…' });
    const timeout = setTimeout(() => controller.abort(), 15000);
    try {
      const response = await fetch('/api/menu?import=url', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sourceUrl }), signal: controller.signal });
      if (request.current !== controller) return;
      if (response.status === 401 || response.status === 403) {
        setFeedback({ kind: response.status === 401 ? 'signin' : 'family', text: 'The link was not saved. Your access changed.' }); return;
      }
      if (!response.ok) {
        setFeedback({ kind: 'error', text: response.status === 400 ? 'Enter a valid direct HTTPS recipe link and try again.' : 'Could not confirm the save. Check your menu or try again.' }); return;
      }
      const result: unknown = await response.json();
      if (!result || typeof result !== 'object' || Object.keys(result).length !== 2 || !('entry' in result) || !('created' in result) || typeof result.created !== 'boolean') throw new Error('Invalid response');
      const entry = parseSavedMenuEntry(result.entry);
      if (!entry) throw new Error('Invalid saved entry');
      if (request.current !== controller) return;
      setFeedback({ kind: 'status', text: result.created ? 'Link saved to your menu. Its details will appear below when ready.' : `Already in your menu: ${entry.curation.state === 'ready' ? entry.recipe.title : 'saved recipe link'}.` });
      onSaved();
    } catch {
      if (request.current === controller) setFeedback({ kind: 'error', text: 'Could not confirm the save. Check your menu or try again.' });
    } finally {
      clearTimeout(timeout);
      if (request.current === controller) {
        request.current = null; setPending(false);
        if (document.activeElement === document.body) input.current?.focus();
      }
    }
  }
  return <form onSubmit={submit} aria-label="Add a recipe from a URL" className="mt-7 rounded-xl border border-stone-200 bg-white p-5 sm:p-6">
    <label htmlFor="recipe-url" className="block text-sm font-semibold text-stone-900">Recipe URL</label>
    <p id="recipe-url-help" className="mt-2 text-sm leading-relaxed text-stone-600">Have a recipe link? Save it now, and we’ll prepare its details. Use the final direct HTTPS link. Some sites may not share details we can read. Your link stays saved, and you can retry interrupted preparation.</p>
    <div className="mt-4 flex flex-col gap-3 sm:flex-row">
      <input ref={input} id="recipe-url" name="sourceUrl" type="url" inputMode="url" autoComplete="url" required maxLength={2048} value={sourceUrl} disabled={pending} onChange={event => setSourceUrl(event.target.value)} aria-describedby="recipe-url-help recipe-url-feedback" placeholder="https://example.com/recipes/soup" className="min-h-11 min-w-0 grow rounded-lg border border-stone-300 bg-white px-3 py-2 text-base text-stone-900 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-800 disabled:bg-stone-100" />
      <button data-add-recipe-url type="submit" disabled={pending} className="min-h-11 shrink-0 rounded-lg bg-emerald-900 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-950 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-800 disabled:opacity-60">{pending ? 'Saving…' : 'Add recipe'}</button>
    </div>
    <p id="recipe-url-feedback" role="status" aria-live="polite" aria-atomic="true" className={`mt-3 min-h-5 text-sm ${feedback?.kind === 'error' ? 'text-red-800' : 'text-stone-600'}`}>
      {feedback?.text}{feedback?.kind === 'signin' ? <> <a href="/sign-in" className="underline">Sign in again</a>.</> : feedback?.kind === 'family' ? <> <a href="/onboarding" className="underline">Check family access</a>.</> : null}
    </p>
    {after && feedback?.kind === 'status' && !pending ? <a href="/menu#menu-heading" className="mt-2 inline-flex min-h-11 items-center text-sm font-semibold text-emerald-900 underline focus-visible:outline-2 focus-visible:outline-offset-4">Newest recipes</a> : null}
  </form>;
}
