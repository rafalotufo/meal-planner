import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { readCryptographicSession } from "../../lib/session";
import { cookieValues, VERIFICATION_COOKIE } from "../../lib/verification/cookies";
import { SignOutButton } from "./sign-out-button";

export default async function SignOutPage() {
  const requestHeaders = await headers();
  if (!cookieValues(requestHeaders.get("cookie"), VERIFICATION_COOKIE).length && !await readCryptographicSession(requestHeaders)) redirect("/sign-in");
  return (
    <main className="mx-auto mt-8 max-w-lg rounded-lg border border-stone-200 bg-white p-6 sm:mt-12 sm:p-8">
      <h1 className="font-serif text-2xl font-semibold tracking-tight text-emerald-950">Sign out of Meal Planner</h1>
      <SignOutButton />
    </main>
  );
}
