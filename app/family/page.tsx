import { requireFamilyContext, requirePageSession } from '../../lib/session';
import { getDatabase } from '../../lib/db';
import { familySummary } from '../../lib/family-store';
import allowed from '../../lib/allowed-google-emails.json';
import { FamilyControls } from './family-controls';
import Link from 'next/link';
export default async function FamilyPage() {
  await requireFamilyContext();
  const session = await requirePageSession();
  const summary = familySummary(getDatabase(), session.identity, allowed);
  return <main className="mx-auto min-h-screen max-w-xl p-6">
    <h1 className="text-2xl font-semibold">Your family</h1>
    <section className="mt-8" aria-labelledby="members-heading"><h2 id="members-heading" className="text-lg font-semibold">Members</h2><ul className="mt-3 space-y-2">{summary.members.map((member) => <li key={member.id} className="break-all">{member.email}</li>)}</ul></section>
    <FamilyControls invitations={summary.invitations} />
    <p className="mt-8"><Link className="underline focus-visible:outline-2 focus-visible:outline-offset-4" href="/sign-out">Sign out</Link></p>
  </main>;
}
