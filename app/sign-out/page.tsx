import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { readCryptographicSession } from "../../lib/session";
import { SignOutButton } from "./sign-out-button";

export default async function SignOutPage() {
  if (!await readCryptographicSession(await headers())) redirect("/sign-in");
  return (
    <main className="min-h-screen p-6">
      <h1 className="text-2xl font-semibold">Sign out of Meal Planner</h1>
      <SignOutButton />
    </main>
  );
}
