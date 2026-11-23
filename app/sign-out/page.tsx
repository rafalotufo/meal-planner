import { requirePageSession } from "../../lib/session";
import { SignOutButton } from "./sign-out-button";

export default async function SignOutPage() {
  await requirePageSession();
  return (
    <main className="min-h-screen p-6">
      <h1 className="text-2xl font-semibold">Sign out of Meal Planner</h1>
      <SignOutButton />
    </main>
  );
}
