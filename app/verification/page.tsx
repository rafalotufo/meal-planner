import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import { authConfiguration } from '../../lib/auth';
import { currentVerificationTarget } from '../../lib/verification/runtime';
import { validNonce } from '../../lib/verification/cookies';
export const dynamic='force-dynamic';
export default async function VerificationPage(){
 const nonce=(await headers()).get('x-mp-verification-nonce')??'';
 if(!currentVerificationTarget()||!validNonce(nonce,nonce,authConfiguration().secret))notFound();
 return <main className="mx-auto mt-8 max-w-lg rounded-lg border border-stone-200 bg-white p-6 sm:mt-12 sm:p-8"><h1 className="font-serif text-2xl font-semibold text-emerald-950">Verification access</h1><p className="mt-3 text-sm leading-6 text-stone-600">Use the run ID and single-use credential supplied for this staging check.</p><form action="/api/verification/session" method="post" className="mt-6 space-y-5"><input type="hidden" name="nonce" value={nonce}/><div><label htmlFor="runId" className="block text-sm font-medium">Run ID</label><input id="runId" name="runId" required autoComplete="off" maxLength={36} className="mt-2 w-full rounded border border-stone-300 px-3 py-2 focus:outline-2 focus:outline-emerald-700"/></div><div><label htmlFor="capability" className="block text-sm font-medium">Single-use credential</label><input id="capability" name="capability" type="password" required autoComplete="off" maxLength={43} className="mt-2 w-full rounded border border-stone-300 px-3 py-2 focus:outline-2 focus:outline-emerald-700"/></div><button className="min-h-11 rounded bg-emerald-900 px-5 py-2 font-medium text-white focus:outline-2 focus:outline-offset-2 focus:outline-emerald-700">Start verification</button></form></main>;
}
