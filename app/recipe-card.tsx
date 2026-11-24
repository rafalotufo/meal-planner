"use client";

import Image from "next/image";
import { useState, type ReactNode } from "react";
import type { Recipe } from "../lib/recipes/types";

export default function RecipeCard({ recipe, children }: { recipe: Recipe; children?: ReactNode }) {
  const [failedPhotoUrl, setFailedPhotoUrl] = useState<string | null>(null);
  return (
    <article className="flex min-w-0 flex-col overflow-hidden rounded-xl border border-stone-200 bg-white">
      <div className="relative flex aspect-[4/3] items-center justify-center bg-stone-100 text-sm text-stone-500">
        {recipe.imageUrl && recipe.imageUrl !== failedPhotoUrl ? (
          <Image src={recipe.imageUrl} alt={recipe.title} fill
            className="object-cover" unoptimized loading="lazy"
            referrerPolicy="no-referrer" onError={() => setFailedPhotoUrl(recipe.imageUrl)} />
        ) : (
          <div className="flex flex-col items-center gap-3">
            <span aria-hidden="true" className="flex size-12 items-center justify-center rounded-full border border-stone-300 text-xl">↗</span>
            <span>Photo unavailable</span>
          </div>
        )}
      </div>
      <div className="flex grow flex-col p-5">
        <p className="text-xs font-medium tracking-wide break-all text-stone-500">{new URL(recipe.sourceUrl).hostname}</p>
        <h4 className="mt-2 text-lg leading-snug font-semibold break-words text-stone-900">{recipe.title}</h4>
        <p className="mt-3 text-sm leading-relaxed break-words text-stone-600">{recipe.summary}</p>
        <div className="mt-auto pt-5">
          {recipe.time ? <p className="text-sm font-medium break-words text-stone-700">
            {recipe.time.kind === "cook" ? "Cook time" : "Total time"}: {recipe.time.text}
          </p> : <p className="text-sm text-stone-500">Time not provided</p>}
          <a href={recipe.sourceUrl} target="_blank" rel="noopener noreferrer"
            className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-md text-sm font-semibold text-emerald-900 underline decoration-emerald-900/30 underline-offset-4 hover:decoration-emerald-900 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-800">
            View recipe<span className="sr-only">: {recipe.title} (opens in a new tab)</span>
            <span aria-hidden="true">↗</span>
          </a>
          {children}
        </div>
      </div>
    </article>
  );
}
