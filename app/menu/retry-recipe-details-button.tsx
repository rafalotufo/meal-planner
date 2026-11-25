"use client";

import { useEffect, useRef, useState } from 'react';
import { parseSavedMenuEntry } from '../../lib/menu/validation';

export default function RetryRecipeDetailsButton({ id, onRetried }: { id: string; onRetried: () => void }) {
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState('');
  const [access, setAccess] = useState<'signin' | 'family' | null>(null);
  const request = useRef<AbortController | null>(null);
  useEffect(() => () => { request.current?.abort(); request.current = null; }, []);
  async function retry() {
    if (request.current) return;
    const controller = new AbortController(); request.current = controller;
    setPending(true); setAccess(null); setMessage('Starting recipe details again…');
    const timeout = setTimeout(() => controller.abort(), 15000);
    try {
      const response = await fetch('/api/menu?curate=retry', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }), signal: controller.signal });
      if (request.current !== controller) return;
      if (response.status === 401 || response.status === 403) { setAccess(response.status === 401 ? 'signin' : 'family'); setMessage('Your link remains saved. Your access changed.'); return; }
      if (response.status === 404) { setMessage('This saved link is no longer available. Refresh your menu.'); onRetried(); return; }
      if (!response.ok) throw new Error('Retry unavailable');
      const result: unknown = await response.json();
      if (!result || typeof result !== 'object' || Object.keys(result).length !== 2 || !('entry' in result) || !('started' in result) || typeof result.started !== 'boolean') throw new Error('Invalid response');
      const entry = parseSavedMenuEntry(result.entry);
      if (!entry || entry.id !== id) throw new Error('Invalid saved entry');
      if (request.current !== controller) return;
      setMessage(result.started ? 'Preparing recipe details again. Your link remains saved.' : entry.curation.state === 'ready' ? 'Recipe details are ready.' : 'Recipe details are already being prepared.');
      onRetried();
    } catch {
      if (request.current === controller) setMessage('Could not confirm the retry. Your link remains saved. Check the menu or try again.');
    } finally { clearTimeout(timeout); if (request.current === controller) { request.current = null; setPending(false); } }
  }
  return <div className="mt-3">
    <button data-retry-recipe-details={id} type="button" disabled={pending} onClick={() => { void retry(); }} className="min-h-11 w-full rounded-lg bg-emerald-900 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-950 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-800 disabled:opacity-60">{pending ? 'Starting…' : 'Retry details'}</button>
    <p role="status" aria-live="polite" aria-atomic="true" className="mt-2 text-sm text-stone-600">{message}{access === 'signin' ? <> <a href="/sign-in" className="underline">Sign in again</a>.</> : access === 'family' ? <> <a href="/onboarding" className="underline">Check family access</a>.</> : null}</p>
  </div>;
}
