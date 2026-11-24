import { SignInButton } from "./sign-in-button";

export const dynamic = "force-dynamic";

export default async function SignInPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return (
    <main className="mx-auto mt-8 max-w-lg rounded-lg border border-stone-200 bg-white p-6 sm:mt-12 sm:p-8">
      <h1 className="font-serif text-2xl font-semibold tracking-tight text-emerald-950">Sign in to Meal Planner</h1>
      {error ? <p className="mt-4" role="alert">Sign-in failed. Please try again.</p> : null}
      <SignInButton />
    </main>
  );
}
