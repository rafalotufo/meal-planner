import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { requirePageSession } from '../../lib/session';
import { authConfiguration } from '../../lib/auth';
import { invitationContext } from '../../lib/invitation-context';
import { getDatabase } from '../../lib/db';
import { invitationForRecipient } from '../../lib/invitations';
import { OnboardingControls } from './onboarding-controls';
export default async function OnboardingPage() {
  const session = await requirePageSession();
  const context = invitationContext(await headers(), authConfiguration().origin);
  if (session.access.kind === 'member' && !context.present) redirect('/');
  const invitation = session.access.kind !== 'member' ? invitationForRecipient(getDatabase(), session.identity, context.token) : null;
  const automatic = session.access.kind === 'provision' && !context.present;
  return <main className="mx-auto min-h-screen max-w-lg p-6">
    <h1 className="text-2xl font-semibold">{session.access.kind === 'member' ? 'You already belong to a family' : automatic ? 'Welcome to Meal Planner' : 'Your invitation'}</h1>
    {session.access.kind === 'member' ? <p className="mt-4">You cannot join another family. <Link className="underline" href="/family">View your family</Link>.</p> : automatic ? <OnboardingControls automatic /> : <>{invitation ? <><p className="mt-4">Join the family that invited {session.identity.email}.</p><OnboardingControls join /></> : <p className="mt-4">{context.present ? "Invitation unavailable. Reopen a valid invitation link to continue." : "Reopen your invitation link to continue."}</p>}</>}
    <p className="mt-6"><Link className="underline focus-visible:outline-2 focus-visible:outline-offset-4" href="/sign-out">Cancel and sign out</Link></p>
  </main>;
}
