import { requireFamilyContext, requirePageSession } from '../../lib/session';
import { getDatabase } from '../../lib/db';
import { familySummary } from '../../lib/family-store';
import allowed from '../../lib/allowed-google-emails.json';
import { FamilyControls } from './family-controls';
import Link from 'next/link';
export default async function FamilyPage() {
  await requireFamilyContext();
  const session = await requirePageSession();
  const summary = await familySummary(await getDatabase(), session.identity, allowed);
  return <main className="mx-auto max-w-2xl pt-8 sm:pt-12">
    <h1 className="font-serif text-2xl font-semibold tracking-tight text-emerald-950">Your family</h1>
    <section className="mt-6 rounded-lg border border-stone-200 bg-white p-6" aria-labelledby="members-heading"><h2 id="members-heading" className="text-lg font-semibold text-emerald-950">Members</h2><ul className="mt-3 space-y-2">{summary.members.map((member) => <li key={member.id} className="wrap-anywhere text-sm leading-6">{member.email}</li>)}</ul></section>
    {session.kind === 'google' ? <FamilyControls invitations={summary.invitations} /> : <p className="mt-6 text-sm text-stone-600">Invitations are unavailable for verification members.</p>}
    <p className="mt-8"><Link className="text-sm font-medium text-emerald-900 underline decoration-stone-300 underline-offset-4 hover:decoration-emerald-900 focus-visible:outline-2 focus-visible:outline-offset-4" href="/sign-out">Sign out</Link></p>
  </main>;
}
