'use client';
import { useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import type { PlanAction, PlanView } from '../../lib/plans/types';
const button = 'inline-flex min-h-11 items-center justify-center rounded-lg border border-emerald-800 px-3 py-2 text-sm font-medium text-emerald-950 hover:bg-emerald-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700 disabled:cursor-wait disabled:opacity-50';
export default function PlanControls({ view }: { view: PlanView }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [refreshing, startRefresh] = useTransition();
  const [message, setMessage] = useState('');
  const [error, setError] = useState<number | null>(null);
  const [confirming, setConfirming] = useState(false);
  const inFlight = useRef(false);
  const feedback = useRef<HTMLDivElement>(null);
  const plan = view.plan;
  if (!plan) return null;
  const disabled = busy || refreshing;
  async function submit(action: PlanAction) {
    if (!plan || inFlight.current) return;
    inFlight.current = true; setBusy(true); setMessage(''); setError(null);
    try {
      const response = await fetch(`/api/plans/${plan.id}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(action), signal: AbortSignal.timeout(12000) });
      if (!response.ok) {
        setError(response.status);
        setMessage(response.status === 409 ? 'This plan changed or is read-only. Refresh to see the latest week.' : response.status === 401 ? 'Your session ended. Sign in again.' : response.status === 403 ? 'Family access changed. Check your access.' : response.status === 400 ? 'Choose a different saved dinner and try again.' : 'Could not update your plan. Please try again.');
      } else {
        setMessage(action.action === 'accept' ? 'Swap accepted. Everyone needs to renew their approval.' : action.action === 'finalize' ? 'Week confirmed. Planned meals are now final.' : action.action === 'approve' ? 'Your approval was saved.' : action.action === 'suggest' ? 'Your suggestion was saved.' : 'Suggestion rejected.');
        setConfirming(false); startRefresh(() => router.refresh());
      }
    } catch { setError(503); setMessage('Could not update your plan. Please try again.'); }
    finally { inFlight.current = false; setBusy(false); feedback.current?.focus(); }
  }
  return <>
    <div ref={feedback} tabIndex={-1} role={error ? 'alert' : 'status'} className="mt-4 text-sm focus-visible:outline-2 focus-visible:outline-emerald-700">
      {disabled ? 'Saving and refreshing your plan…' : message}
      {error === 409 ? <button type="button" onClick={() => startRefresh(() => router.refresh())} className={`${button} ml-2`}>Refresh plan</button> : error === 401 ? <a className="inline-flex min-h-11 items-center underline" href="/sign-in">Sign in</a> : error === 403 ? <a className="inline-flex min-h-11 items-center underline" href="/onboarding">Check access</a> : null}
    </div>
    <div className="mt-5 flex flex-wrap items-center gap-3 text-sm">
      <p><strong>{view.approvals}</strong> {view.approvals === 1 ? 'approval' : 'approvals'} for revision {plan.revision}. Silent members have not approved.</p>
      {view.editable ? <button data-plan-approve className={button} disabled={disabled || view.approved} onClick={() => submit({ action: 'approve', revision: plan.revision })}>{view.approved ? 'You approved' : 'Looks good'}</button> : null}
    </div>
    <div className="mt-6 grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {plan.meals.map((meal, day) => <article key={day} className="min-w-0 rounded-xl border border-stone-200 bg-white p-4">
        <h2 className="font-serif text-xl wrap-anywhere text-stone-900">{meal.title}</h2>
        <a href={meal.sourceUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex min-h-11 items-center text-sm text-emerald-900 underline focus-visible:outline-2 focus-visible:outline-emerald-700">Open recipe<span className="sr-only">: {meal.title} (new tab)</span></a>
        {view.editable && view.menu.entries.length ? <form className="mt-3 border-t border-stone-100 pt-3" onSubmit={event => { event.preventDefault(); const value = new FormData(event.currentTarget).get('recipe'); if (typeof value === 'string') void submit({ action: 'suggest', revision: plan.revision, day, menuRecipeId: value }); }}>
          <label className="block text-sm font-medium" htmlFor={`swap-${day}`}>Replacement recipe<span className="sr-only"> for {meal.title}</span></label>
          <select id={`swap-${day}`} name="recipe" required disabled={disabled} defaultValue="" className="mt-2 min-h-11 w-full min-w-0 max-w-full rounded-lg border border-stone-400 bg-white px-2 text-sm focus-visible:outline-2 focus-visible:outline-emerald-700">
            <option value="" disabled>Choose a replacement</option>
            {view.menu.entries.filter(entry => entry.recipe.sourceUrl !== meal.sourceUrl).map(entry => <option key={entry.id} value={entry.id}>{entry.recipe.title}</option>)}
          </select>
          <button type="submit" disabled={disabled} data-plan-suggest={day} className={`${button} mt-2 w-full`}>Suggest swap</button>
        </form> : null}
        {view.suggestions.filter(suggestion => suggestion.day === day).map(suggestion => <div key={suggestion.id} className="mt-4 border-t border-stone-200 pt-3">
          <p className="text-xs font-semibold text-stone-600">Proposed replacement</p><p className="mt-1 wrap-anywhere text-sm">{suggestion.recipe.title}</p>
          {view.editable ? <div className="mt-2 flex flex-wrap gap-2"><button data-plan-accept className={button} disabled={disabled} onClick={() => submit({ action: 'accept', revision: plan.revision, suggestionId: suggestion.id })}>Accept</button><button data-plan-reject className={button} disabled={disabled} onClick={() => submit({ action: 'reject', revision: plan.revision, suggestionId: suggestion.id })}>Reject</button></div> : null}
        </div>)}
      </article>)}
    </div>
    {view.editable ? <section className="mt-6 rounded-xl border border-stone-200 bg-white p-5" aria-label="Confirm planned meals">
      <p className="text-sm text-stone-600">Accepting a swap clears all approvals. Everyone must approve the new revision again.</p>
      {confirming ? <div className="mt-3"><p id="confirm-warning" className="text-sm font-medium">Confirm these seven planned meals? Later edits are unavailable. Pending suggestions will be closed. Confirmation does not require everyone’s approval.</p><div className="mt-3 flex flex-wrap gap-3"><button data-plan-confirm className={button} aria-describedby="confirm-warning" disabled={disabled} onClick={() => submit({ action: 'finalize', revision: plan.revision })}>Confirm these meals</button><button className={button} disabled={disabled} onClick={() => setConfirming(false)}>Cancel</button></div></div> : <button className={`${button} mt-3`} data-plan-finalize disabled={disabled} onClick={() => setConfirming(true)}>Confirm week</button>}
    </section> : <p className="mt-6 text-sm text-stone-600">{plan.status === 'final' ? 'Final planned meals. This week cannot be edited.' : 'This past draft is read-only and was never confirmed.'}</p>}
  </>;
}
