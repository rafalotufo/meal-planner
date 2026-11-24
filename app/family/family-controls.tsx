'use client';
import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
interface InvitationSummary { id: string; email: string; expiresAt: number; status: string }
const buttonClass = 'rounded border border-gray-500 px-4 py-3 font-medium focus-visible:outline-2 focus-visible:outline-offset-4 disabled:opacity-60';
export function FamilyControls({ invitations }: { invitations: InvitationSummary[] }) {
  const router = useRouter(); const [email, setEmail] = useState(''); const [link, setLink] = useState('');
  const [pending, setPending] = useState(false); const [message, setMessage] = useState(''); const [failed, setFailed] = useState(false);
  async function create(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setPending(true); setFailed(false); setMessage(''); setLink('');
    try {
      const response = await fetch('/api/family/invitations', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ recipientEmail: email }) });
      if (!response.ok) throw new Error('Unavailable');
      const data = await response.json(); if (typeof data.url !== 'string') throw new Error('Unavailable');
      setLink(data.url); setEmail(''); setMessage('Invitation created. Copy the link and share it with the recipient.'); router.refresh();
    } catch { setFailed(true); setMessage('Unable to create this invitation. Check the address and try again later.'); }
    finally { setPending(false); }
  }
  async function revoke(id: string) {
    setPending(true); setFailed(false); setMessage(''); setLink('');
    try {
      const response = await fetch(`/api/family/invitations/${encodeURIComponent(id)}/revoke`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' });
      if (!response.ok) throw new Error('Unavailable');
      setMessage('Invitation revoked.'); router.refresh();
    } catch { setFailed(true); setMessage('Unable to revoke this invitation. Please try again.'); }
    finally { setPending(false); }
  }
  async function copy() {
    try { await navigator.clipboard.writeText(link); setFailed(false); setMessage('Invitation link copied.'); }
    catch { setMessage('Select and copy the invitation link below.'); }
  }
  return <>
    <section className="mt-8" aria-labelledby="invite-heading">
      <h2 id="invite-heading" className="text-lg font-semibold">Invite someone</h2>
      <form className="mt-4 flex flex-col gap-3" onSubmit={create}>
        <label htmlFor="recipient-email" className="font-medium">Recipient email</label>
        <input id="recipient-email" type="email" autoComplete="email" required maxLength={254} value={email} onChange={(event) => setEmail(event.target.value)} className="min-w-0 rounded border border-gray-500 p-3 focus-visible:outline-2 focus-visible:outline-offset-2" />
        <button className={buttonClass} disabled={pending} type="submit">{pending ? 'Working…' : 'Create invitation'}</button>
      </form>
      {message ? <p className="mt-4" role={failed ? 'alert' : 'status'}>{message}</p> : null}
      {link ? <div className="mt-4 flex min-w-0 flex-col gap-3"><label htmlFor="invitation-link" className="font-medium">Invitation link</label><input id="invitation-link" readOnly value={link} onFocus={(event) => event.currentTarget.select()} className="min-w-0 w-full rounded border border-gray-500 p-3" /><button type="button" onClick={copy} className={buttonClass}>Copy invitation link</button></div> : null}
    </section>
    <section className="mt-8" aria-labelledby="pending-heading"><h2 id="pending-heading" className="text-lg font-semibold">Invitations</h2>
      {invitations.length ? <ul className="mt-4 space-y-4">{invitations.map((invitation) => <li key={invitation.id} className="rounded border border-gray-500 p-4"><p className="break-all">{invitation.email}</p><p className="mt-1 text-sm">Expires {new Date(invitation.expiresAt).toISOString().slice(0, 16).replace('T', ' ')} UTC</p><button type="button" className={`${buttonClass} mt-3`} disabled={pending} onClick={() => revoke(invitation.id)} aria-label={`Revoke invitation for ${invitation.email}`}>Revoke invitation</button></li>)}</ul> : <p className="mt-3">No pending invitations.</p>}
    </section>
  </>;
}
