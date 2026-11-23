"use client";
import { useState } from "react";
import { authClient } from "../../lib/auth-client";

export function SignInButton() {
  const [pending, setPending] = useState(false);
  const [failed, setFailed] = useState(false);
  async function signIn() {
    setPending(true);
    setFailed(false);
    try {
      const { error } = await authClient.signIn.social({ provider: "google", callbackURL: "/onboarding", errorCallbackURL: "/sign-in" });
      if (!error) return;
    } catch { /* A generic retry message keeps provider details out of the page. */ }
    setFailed(true);
    setPending(false);
  }
  return (
    <>
      <button type="button" onClick={signIn} disabled={pending} className="mt-6 rounded border border-gray-500 px-4 py-3 font-medium focus-visible:outline-2 focus-visible:outline-offset-4 disabled:opacity-60">
        {pending ? "Connecting…" : "Continue with Google"}
      </button>
      {failed ? <p className="mt-4" role="alert">Sign-in failed. Please try again.</p> : null}
    </>
  );
}
