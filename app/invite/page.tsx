import { InviteContext } from './invite-context';
// Per-request CSP nonces require dynamic rendering, including this public shell.
export const dynamic = 'force-dynamic';
export default function InvitePage() {
  return <main className="mx-auto mt-8 max-w-lg rounded-lg border border-stone-200 bg-white p-6 sm:mt-12 sm:p-8"><h1 className="font-serif text-2xl font-semibold tracking-tight text-emerald-950">Family invitation</h1><InviteContext /></main>;
}
