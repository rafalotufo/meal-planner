import { requireFamilyContext } from "../lib/session";

export default async function HomePage() {
  await requireFamilyContext();
  return (
    <main className="min-h-screen p-6">
      <h1 className="text-2xl font-semibold">Meal Planner</h1>
    </main>
  );
}
