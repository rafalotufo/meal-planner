import Link from 'next/link';
import { requireFamilyContext, requirePageSession } from '../../lib/session';
import { getDatabase } from '../../lib/db';
import allowed from '../../lib/allowed-google-emails.json';
import { readPlans } from '../../lib/plans/store';
import { parsePlanQuery } from '../../lib/plans/validation';
import { currentWeek, draftDay } from '../../lib/plans/calendar';
import type { PlanView } from '../../lib/plans/types';
import PlanControls from './plan-controls';
export default async function PlansPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await requireFamilyContext();
  const session = await requirePageSession();
  const query = parsePlanQuery(await searchParams);
  let view: PlanView | null = null, schedule: string | null = null;
  try {
    schedule = draftDay(process.env.MEAL_PLAN_DRAFT_DAY);
    if (query) view = await readPlans(await getDatabase(), session.identity, allowed, query);
  } catch { /* A failed read/configuration never looks like an empty plan. */ }
  const week = view?.plan?.weekStart ?? query?.week ?? currentWeek(new Date());
  const linkClass = 'inline-flex min-h-11 items-center text-sm text-emerald-900 underline focus-visible:outline-2 focus-visible:outline-emerald-700';
  return <main className="min-w-0 pt-8 sm:pt-12">
    <p className="text-xs font-semibold tracking-widest text-emerald-800 uppercase">Around the family table</p>
    <h1 id="plan-heading" tabIndex={-1} className="mt-3 font-serif text-3xl tracking-tight text-stone-900 sm:text-5xl">Your weekly plan</h1>
    <p className="mt-3 text-sm leading-relaxed text-stone-600">Drafts are scheduled for {schedule ?? 'the configured weekday'} after 09:00 America/Toronto, for the following Sunday–Saturday. </p>
    <p className="mt-2 text-sm leading-relaxed text-stone-600">Future plans aim for 4 main dishes, 2 sides and 2 veggies, with distinct recipes in each group. Save and classify recipes in Menu to fill each group. Recipes may return in later weeks.</p>
    {!query ? <div className="mt-8"><p role="alert">This plan page is invalid.</p><a className={linkClass} href="/plans">Latest plan</a></div>
      : !view ? <div role="alert" className="mt-8"><p>Could not load your plan. Please try again.</p><a className={linkClass} href="/plans">Reload plans</a></div>
      : <>
        <div className="mt-8 flex flex-wrap items-center gap-3"><p className="font-serif text-xl">{view.plan ? `${view.plan.meals.length} ${view.plan.meals.length === 1 ? 'recipe' : 'recipes'} for the week` : 'Weekly recipes'}</p>{view.plan ? <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-950">{view.plan.status === 'final' ? 'Final · Planned meals' : 'Draft'}</span> : null}</div>
        {view.plan ? <PlanControls key={view.plan.id} view={view} /> : <div className="mt-6 rounded-xl border border-stone-200 bg-white p-5"><p>No draft exists for this week.</p><p className="mt-2 text-sm text-stone-600">The next scheduled draft can fill the upcoming week when your menu has ready recipes classified as Main dish, Side or Veggie.</p></div>}
        {!view.menu.entries.length ? <p className="mt-5 text-sm">{query.menuAfter ? 'No recipes on this menu page. ' : 'Your menu is empty. '}<a className={linkClass} href="/menu">Open Menu</a> or <Link className={linkClass} href="/" prefetch={false}>find recipes</Link>.</p> : null}
        <section className="mt-10 border-t border-stone-200 pt-6" aria-labelledby="planned-history"><h2 id="planned-history" className="font-serif text-2xl">Planned meals history</h2><p className="mt-2 text-sm text-stone-600">Finalized plans record what was planned, not what was consumed.</p>
          <nav aria-label="Recent planned weeks" className="mt-3 flex flex-wrap gap-x-5"><a className={linkClass} href="/plans">Latest plan</a>{view.history.map(week => <a key={week} className={linkClass} href={`/plans?week=${week}`}>Week of {week}</a>)}</nav>
          <form action="/plans" className="mt-4 flex flex-wrap items-end gap-3"><div className="min-w-0"><label htmlFor="history-week" className="block text-sm font-medium">Open any retained week (Sunday)</label><input id="history-week" type="date" name="week" required defaultValue={week} className="mt-2 min-h-11 max-w-full rounded-lg border border-stone-400 bg-white px-3 focus-visible:outline-2 focus-visible:outline-emerald-700" /></div><button type="submit" className="min-h-11 rounded-lg border border-emerald-800 px-3 text-sm font-medium text-emerald-950 focus-visible:outline-2 focus-visible:outline-emerald-700">Open week</button></form>
        </section>
      </>}
  </main>;
}
