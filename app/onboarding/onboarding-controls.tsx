'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
export function OnboardingControls({ automatic = false, join = false }: { automatic?: boolean; join?: boolean }) {
  const router = useRouter();
  const [failed, setFailed] = useState(false);
  const [pending, setPending] = useState(automatic);
  async function complete() {
    setFailed(false); setPending(true);
    try {
      const response = await fetch(join ? '/api/invitations/accept' : '/api/onboarding/provision', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' });
      if (response.ok) { router.replace('/'); router.refresh(); return; }
    } catch { /* Generic retry feedback avoids disclosing identity and invite details. */ }
    setFailed(true); setPending(false);
  }
  useEffect(() => {
    if (!automatic) return;
    let active = true;
    fetch('/api/onboarding/provision', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' })
      .then((response) => { if (!active) return; if (response.ok) { router.replace('/'); router.refresh(); } else { setFailed(true); setPending(false); } })
      .catch(() => { if (active) { setFailed(true); setPending(false); } });
    return () => { active = false; };
  }, [automatic, router]);
  return <>
    {automatic && !failed ? <p role="status" className="mt-6">Setting up your family…</p> : <button onClick={complete} disabled={pending} className="mt-6 rounded border border-gray-500 px-4 py-3 font-medium focus-visible:outline-2 focus-visible:outline-offset-4 disabled:opacity-60">{pending ? 'Working…' : failed ? 'Try again' : 'Join family'}</button>}
    {failed ? <p role="alert" className="mt-4">Unable to continue. Please try again or sign out.</p> : null}
  </>;
}
