'use client';
import Image from 'next/image';
import { useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import SwapRecipeDialog, { type SwapOutcome } from './swap-recipe-dialog';
import { planTargets } from '../../lib/plans/composition';
import type { RecipeCategory } from '../../lib/recipes/types';
import type { PlanAction, PlanView } from '../../lib/plans/types';
const button = 'inline-flex min-h-11 items-center justify-center rounded-lg border border-emerald-800 px-3 py-2 text-sm font-medium text-emerald-950 hover:bg-emerald-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700 disabled:cursor-wait disabled:opacity-50';
function RecipeThumbnail({ imageUrl }: { imageUrl: string | null }) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  return <div aria-hidden="true" className="mb-3 flex h-32 w-full items-center justify-center overflow-hidden rounded-lg bg-stone-100">
    {imageUrl && failedUrl !== imageUrl ? <Image src={imageUrl} alt="" width={320} height={240} unoptimized loading="lazy" referrerPolicy="no-referrer" className="h-full w-full object-cover" onError={() => setFailedUrl(imageUrl)} /> : <span className="px-2 text-center text-xs text-stone-500">Photo unavailable</span>}
  </div>;
}
export default function PlanControls({ view }: { view: PlanView }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [refreshing, startRefresh] = useTransition();
  const [message, setMessage] = useState('');
  const [error, setError] = useState<number | null>(null);
  const [confirming, setConfirming] = useState(false);
  const inFlight = useRef(false);
  const feedback = useRef<HTMLDivElement>(null);
  const instance = useRef(0);
  const [opened, setOpened] = useState<{ instance: number; planId: string; revision: number; day: number; title: string; category: RecipeCategory | null; plannedSources: string[]; trigger: HTMLButtonElement } | null>(null);
  const plan = view.plan;
  if (!plan) return null;
  const disabled = busy || refreshing;
  async function submit(action: PlanAction, planId = plan?.id): Promise<SwapOutcome> {
    if (!planId || inFlight.current) return { ok: false, status: 409, message: 'Another change is finishing. Please try again.' };
    inFlight.current = true; setBusy(true); setMessage(''); setError(null);
    try {
      const response = await fetch(`/api/plans/${planId}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(action), signal: AbortSignal.timeout(12000) });
      if (!response.ok) {
        setError(response.status);
        const body: unknown = response.status === 409 ? await response.json().catch(() => null) : null;
        const conflictMessage = body && typeof body === 'object' && 'error' in body && typeof body.error === 'string' && body.error.length <= 200 ? body.error : 'This plan changed or is read-only.';
        const message = response.status === 409 ? `${conflictMessage} Refresh for the current revision, or choose another recipe.` : response.status === 401 ? 'Your session ended. Sign in again.' : response.status === 403 ? 'Family access changed. Check your access.' : response.status === 400 ? 'Choose a different saved dinner and try again.' : 'Could not update your plan. Please try again.';
        setMessage(message); return { ok: false, status: response.status, message };
      } else {
        setMessage(action.action === 'accept' ? 'Swap accepted. Everyone needs to renew their approval.' : action.action === 'finalize' ? 'Week confirmed. Planned meals are now final.' : action.action === 'approve' ? 'Your approval was saved.' : action.action === 'suggest' ? 'Your suggestion was saved.' : 'Suggestion rejected.');
        setConfirming(false); startRefresh(() => router.refresh());
        return { ok: true, status: 200, message: 'Your suggestion was saved.' };
      }
    } catch { const message = 'Could not update your plan. Please try again; a timed-out request may have completed.'; setError(503); setMessage(message); return { ok: false, status: 503, message }; }
    finally { inFlight.current = false; setBusy(false); if (!document.querySelector('dialog[open]')) feedback.current?.focus(); }
  }
  return <>
    {opened ? <SwapRecipeDialog key={opened.instance} title={opened.title} category={opened.category} plannedSources={opened.plannedSources} trigger={opened.trigger} blocked={disabled} onDismiss={() => setOpened(null)} onRefresh={() => { setOpened(null); startRefresh(() => router.refresh()); }} onSubmit={menuRecipeId => submit({ action: 'suggest', revision: opened.revision, day: opened.day, menuRecipeId }, opened.planId)} /> : null}
    <div ref={feedback} tabIndex={-1} role={error ? 'alert' : 'status'} className="mt-4 text-sm focus-visible:outline-2 focus-visible:outline-emerald-700">
      {disabled ? 'Saving and refreshing your plan…' : message}
      {error === 409 ? <button type="button" onClick={() => startRefresh(() => router.refresh())} className={`${button} ml-2`}>Refresh plan</button> : error === 401 ? <a className="inline-flex min-h-11 items-center underline" href="/sign-in">Sign in</a> : error === 403 ? <a className="inline-flex min-h-11 items-center underline" href="/onboarding">Check access</a> : null}
    </div>
    <div className="mt-5 flex flex-wrap items-center gap-3 text-sm">
      <p><strong>{view.approvals}</strong> {view.approvals === 1 ? 'approval' : 'approvals'} for revision {plan.revision}. Silent members have not approved.</p>
      {view.editable ? <button data-plan-approve className={button} disabled={disabled || view.approved} onClick={() => submit({ action: 'approve', revision: plan.revision })}>{view.approved ? 'You approved' : 'Looks good'}</button> : null}
    </div>
    {plan.originalRecipeCount > plan.meals.length ? <p role="note" className="mt-5 text-sm text-stone-600">This older finalized plan contained repeated recipes. Showing {plan.meals.length} unique recipes from its original {plan.originalRecipeCount} entries.</p> : null}
    <p className="mt-5 text-sm leading-relaxed text-stone-600">Groups use the recipe classifications saved with this plan. Older plans may have a different mix.</p>
    {[...planTargets, ...(plan.meals.some(meal => meal.category == null) ? [{ category: null, label: 'Unclassified', target: null }] : [])].map(group => {
      const entries = plan.meals.map((meal, day) => ({ meal, day })).filter(({ meal }) => (meal.category ?? null) === group.category);
      const headingId = `plan-category-${group.category ?? 'unclassified'}`;
      return <section key={group.category ?? 'unclassified'} data-plan-category={group.category ?? 'unclassified'} aria-labelledby={headingId} className="mt-8 min-w-0">
        <h2 id={headingId} className="font-serif text-2xl text-stone-900">{group.label}</h2>
        <p className="mt-2 text-sm text-stone-600">{entries.length} {entries.length === 1 ? 'recipe' : 'recipes'}{group.target === null ? ' without a saved classification.' : ` · Current target: ${group.target}.`}</p>
        {group.target !== null && entries.length < group.target ? <p className="mt-2 text-sm text-stone-600">Save or classify more {group.label.toLowerCase()} in <a href="/menu" className="inline-flex min-h-11 items-center text-emerald-900 underline focus-visible:outline-2 focus-visible:outline-emerald-700">Menu</a> for future plans.</p> : null}
        <div className="mt-4 grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {entries.map(({ meal, day }) => <article key={day} data-plan-index={day} className="min-w-0 rounded-xl border border-stone-200 bg-white p-4">
        <RecipeThumbnail key={meal.sourceUrl} imageUrl={meal.imageUrl} />
        <h3 className="font-serif text-xl wrap-anywhere text-stone-900">{meal.title}</h3>
        <a href={meal.sourceUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex min-h-11 items-center text-sm text-emerald-900 underline focus-visible:outline-2 focus-visible:outline-emerald-700">Open recipe<span className="sr-only">: {meal.title} (new tab)</span></a>
        {view.editable ? <button type="button" data-plan-suggest={day} className={`${button} mt-3 w-full`} onClick={event => setOpened({ instance: ++instance.current, planId: plan.id, revision: plan.revision, day, title: meal.title, category: meal.category ?? null, plannedSources: plan.meals.map(recipe => recipe.sourceUrl), trigger: event.currentTarget })}>Suggest swap<span className="sr-only"> for {meal.title}</span></button> : null}
        {view.suggestions.filter(suggestion => suggestion.day === day).map(suggestion => <div key={suggestion.id} className="mt-4 border-t border-stone-200 pt-3">
          <p className="text-xs font-semibold text-stone-600">Proposed replacement</p><p className="mt-1 wrap-anywhere text-sm">{suggestion.recipe.title}</p>
          {view.editable ? <div className="mt-2 flex flex-wrap gap-2"><button data-plan-accept className={button} disabled={disabled} onClick={() => submit({ action: 'accept', revision: plan.revision, suggestionId: suggestion.id })}>Accept</button><button data-plan-reject className={button} disabled={disabled} onClick={() => submit({ action: 'reject', revision: plan.revision, suggestionId: suggestion.id })}>Reject</button></div> : null}
        </div>)}
      </article>)}
        </div>
      </section>;
    })}
    {view.editable ? <section className="mt-6 rounded-xl border border-stone-200 bg-white p-5" aria-label="Confirm planned meals">
      <p className="text-sm text-stone-600">Accepting a swap clears all approvals. Everyone must approve the new revision again.</p>
      {confirming ? <div className="mt-3"><p id="confirm-warning" className="text-sm font-medium">Confirm {plan.meals.length} planned {plan.meals.length === 1 ? 'recipe' : 'recipes'}? Later edits are unavailable. Pending suggestions will be closed. Confirmation does not require everyone’s approval.</p><div className="mt-3 flex flex-wrap gap-3"><button data-plan-confirm className={button} aria-describedby="confirm-warning" disabled={disabled} onClick={() => submit({ action: 'finalize', revision: plan.revision })}>Confirm these meals</button><button className={button} disabled={disabled} onClick={() => setConfirming(false)}>Cancel</button></div></div> : <button className={`${button} mt-3`} data-plan-finalize disabled={disabled} onClick={() => setConfirming(true)}>Confirm week</button>}
    </section> : <p className="mt-6 text-sm text-stone-600">{plan.status === 'final' ? 'Final planned meals. This week cannot be edited.' : 'This past draft is read-only and was never confirmed.'}</p>}
  </>;
}
