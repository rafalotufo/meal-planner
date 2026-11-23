import { InviteContext } from './invite-context';
// Per-request CSP nonces require dynamic rendering, including this public shell.
export const dynamic = 'force-dynamic';
export default function InvitePage() {
  return <main className="mx-auto min-h-screen max-w-lg p-6"><h1 className="text-2xl font-semibold">Family invitation</h1><InviteContext /></main>;
}
