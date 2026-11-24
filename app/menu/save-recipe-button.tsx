"use client";

import { useEffect, useRef, useState } from 'react';
import type { Recipe } from '../../lib/recipes/types';
import { parseSavedMenuEntry } from '../../lib/menu/validation';
import type { MenuSaveStatus } from '../../lib/menu/types';

export default function SaveRecipeButton({ recipe, status, onSaved, onRetryCheck }: { recipe: Recipe; status: MenuSaveStatus; onSaved: () => void; onRetryCheck: () => void }) {
  const request = useRef<AbortController | null>(null);
  const [state, setState] = useState<'idle' | 'pending' | 'saved' | 'error' | 'signin' | 'family'>('idle');
  useEffect(() => () => { request.current?.abort(); request.current = null; }, []);
  async function save() {
    if (request.current || status !== 'available' || state === 'saved') return;
    const controller = new AbortController(); request.current = controller; setState('pending');
    try {
      const response = await fetch('/api/menu', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(recipe), signal: controller.signal });
      if (request.current !== controller) return;
      if (response.status === 401 || response.status === 403) { setState(response.status === 401 ? 'signin' : 'family'); return; }
      if (!response.ok) throw new Error('Save failed');
      const value: unknown = await response.json();
      if (!value || typeof value !== 'object' || !('entry' in value) || !parseSavedMenuEntry(value.entry)) throw new Error('Invalid response');
      if (request.current === controller) { setState('saved'); onSaved(); }
    } catch {
      if (!controller.signal.aborted && request.current === controller) setState('error');
    } finally { if (request.current === controller) request.current = null; }
  }
  const alreadySaved = state === 'saved' || status === 'saved';
  const label = alreadySaved ? 'Added to menu' : status === 'checking' ? 'Checking menu…' : status === 'error' ? 'Retry checking menu' : state === 'pending' ? 'Adding…' : state === 'error' ? 'Retry adding to menu' : 'Add to menu';
  return <div className="mt-3">
    <button data-save-recipe type="button" disabled={alreadySaved || status === 'checking' || status === 'signin' || status === 'family' || state === 'pending'} aria-label={`${label}: ${recipe.title}`} onClick={status === 'error' ? onRetryCheck : save}
      className="min-h-11 w-full rounded-lg bg-emerald-900 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-950 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-800 disabled:opacity-60">
      {label}
    </button>
    <p role="status" aria-live="polite" aria-atomic="true" className="mt-2 text-sm text-stone-600">
      {alreadySaved ? <>Saved to menu. <a href="/menu" className="font-medium text-emerald-900 underline">View menu</a></> : status === 'checking' ? 'Checking saved recipes…' : status === 'error' ? 'Could not check whether this recipe is saved. Retry checking before adding.' : state === 'pending' ? 'Saving recipe…' : state === 'error' ? 'Could not save this recipe. Please try again.' : state === 'signin' || status === 'signin' ? <>Your session ended. <a href="/sign-in" className="underline">Sign in again</a>.</> : state === 'family' || status === 'family' ? <>Family access changed. <a href="/onboarding" className="underline">Check family access</a>.</> : null}
    </p>
  </div>;
}
