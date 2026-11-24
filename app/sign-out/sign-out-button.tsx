"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "../../lib/auth-client";

export function SignOutButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [failed, setFailed] = useState(false);
  async function signOut() {
    setPending(true);
    setFailed(false);
    try {
      const { error } = await authClient.signOut({});
      if (!error) { router.replace("/sign-in"); router.refresh(); return; }
    } catch { /* A generic retry message keeps provider details out of the page. */ }
    setFailed(true);
    setPending(false);
  }
  return (
    <>
      <button type="button" onClick={signOut} disabled={pending} className="mt-6 rounded-md border border-emerald-900 bg-emerald-900 px-4 py-3 font-medium text-white hover:bg-emerald-950 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-700 disabled:cursor-wait disabled:opacity-60">
        {pending ? "Signing out…" : "Sign out"}
      </button>
      {failed ? <p className="mt-4" role="alert">Sign-out failed. Please try again.</p> : null}
    </>
  );
}
