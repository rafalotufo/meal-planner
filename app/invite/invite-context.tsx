'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
export function InviteContext() {
  const capturedToken = useRef<string | null>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    // React development replay must reuse the initial fragment after cleanup.
    if (capturedToken.current === null) capturedToken.current = window.location.hash.slice(1);
    const token = capturedToken.current;
    // Strip only the fragment without starting a framework route restoration.
    History.prototype.replaceState.call(window.history, window.history.state, '', window.location.pathname);
    let active = true;
    fetch('/api/invitation-context', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token }) })
      .then((response) => { if (!active) return; if (response.ok) window.location.replace('/sign-in'); else setFailed(true); })
      .catch(() => { if (active) setFailed(true); });
    return () => { active = false; };
  }, []);
  return failed ? <p role="alert" className="mt-6">Invitation unavailable. Reopen the link or <Link href="/sign-in" className="underline">sign in</Link>.</p> : <p role="status" className="mt-6">Opening your invitation…</p>;
}
