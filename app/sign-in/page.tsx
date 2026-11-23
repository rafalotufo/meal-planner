import { SignInButton } from "./sign-in-button";

export const dynamic = "force-dynamic";

export default async function SignInPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return (
    <main className="min-h-screen p-6">
      <h1 className="text-2xl font-semibold">Sign in to Meal Planner</h1>
      {error ? <p className="mt-4" role="alert">Sign-in failed. Please try again.</p> : null}
      <SignInButton />
    </main>
  );
}
