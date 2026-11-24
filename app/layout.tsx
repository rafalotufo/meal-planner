import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Meal Planner",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-stone-50 font-sans text-stone-800">
        <div className="min-h-screen px-4 pb-12 sm:px-8 sm:pb-16">
          <div className="mx-auto max-w-6xl">
            <header className="flex min-h-16 flex-wrap items-center justify-between gap-x-6 gap-y-2 border-b border-stone-200 py-4">
              <Link href="/" prefetch={false} className="font-serif text-2xl font-semibold tracking-tight text-emerald-950 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-700">Meal Planner</Link>
              <nav aria-label="Primary" className="flex flex-wrap items-center gap-1 text-sm font-medium">
                <Link href="/" prefetch={false} className="rounded px-3 py-2 text-stone-600 hover:bg-stone-100 hover:text-emerald-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700">Recipes</Link>
                <a href="/menu" className="inline-flex min-h-11 items-center rounded px-3 py-2 text-stone-600 hover:bg-stone-100 hover:text-emerald-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700">Menu</a>
                <Link href="/family" prefetch={false} className="rounded px-3 py-2 text-stone-600 hover:bg-stone-100 hover:text-emerald-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700">Family</Link>
              </nav>
            </header>
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
