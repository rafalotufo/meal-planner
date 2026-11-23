'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
export function InviteContext() {
  const router = useRouter(); const [failed, setFailed] = useState(false);
  useEffect(() => {
    const token = window.location.hash.slice(1);
    window.history.replaceState(null, '', window.location.pathname);
    let active = true;
    fetch('/api/invitation-context', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token }) })
      .then((response) => { if (!active) return; if (response.ok) router.replace('/sign-in'); else setFailed(true); })
      .catch(() => { if (active) setFailed(true); });
    return () => { active = false; };
  }, [router]);
  return failed ? <p role="alert" className="mt-6">Invitation unavailable. Reopen the link or <Link href="/sign-in" className="underline">sign in</Link>.</p> : <p role="status" className="mt-6">Opening your invitation…</p>;
}
