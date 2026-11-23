import { createSafeHtmlLoader, type PhotoFetchOptions } from "./photo-transport";
import { selectRecipePhoto } from "./photo-metadata";
import type { Recipe } from "./types";
import { safeRecipeUrl } from "./validation";

export type PhotoEnricher = (recipes: Recipe[], options: PhotoFetchOptions) => Promise<Recipe[]>;
type HtmlLoader = (source: string, options: PhotoFetchOptions) => Promise<string | null>;
let activePhotoJobs = 0;

export function createPhotoEnricher({ loadHtml = createSafeHtmlLoader(), now = Date.now }: {
  loadHtml?: HtmlLoader; now?: () => number;
} = {}): PhotoEnricher {
  async function load(source: string, options: PhotoFetchOptions): Promise<string | null> {
    let onAbort: () => void = () => {};
    try {
      if (options.signal.aborted) return null;
      const aborted = new Promise<null>((resolve) => {
        onAbort = () => resolve(null);
        options.signal.addEventListener("abort", onAbort, { once: true });
      });
      const pending = Promise.resolve().then(() => options.signal.aborted ? null : loadHtml(source, options)).catch(() => null);
      return await Promise.race([pending, aborted]);
    } finally { options.signal.removeEventListener("abort", onAbort); }
  }

  return async function enrich(recipes, { signal, deadlineAt }) {
    if (signal.aborted) throw signal.reason;
    if (deadlineAt - now() < 1000) return recipes;
    const softDeadline = Math.min(now() + 6000, deadlineAt - 250);
    const stage = new AbortController();
    const combined = AbortSignal.any([signal, stage.signal]);
    const timer = setTimeout(() => stage.abort(), Math.max(0, softDeadline - now()));
    const images = new Map<string, string>();
    const seen = new Set<string>();
    const jobs = recipes.slice(0, 6).flatMap((recipe) => {
      const source = safeRecipeUrl(recipe.sourceUrl);
      if (!source || seen.has(source)) return [];
      seen.add(source);
      return [{ source, title: recipe.title }];
    });
    let next = 0;
    try {
      while (next < jobs.length && !combined.aborted) {
        const batch: Promise<void>[] = [];
        while (next < jobs.length && activePhotoJobs < 2 && !combined.aborted) {
          const job = jobs[next++];
          activePhotoJobs++;
          batch.push((async () => {
            try {
              const html = await load(job.source, { signal: combined, deadlineAt: Math.min(softDeadline, now() + 3000) });
              if (html === null || combined.aborted) return;
              const photo = selectRecipePhoto(html, { sourceUrl: job.source, title: job.title });
              if (photo) images.set(job.source, photo.imageUrl);
            } catch { /* Optional publisher metadata must not discard a valid recipe. */ }
            finally { activePhotoJobs--; }
          })());
        }
        if (!batch.length) break;
        await Promise.all(batch);
      }
      if (signal.aborted) throw signal.reason;
      return recipes.map((recipe) => {
        const source = safeRecipeUrl(recipe.sourceUrl);
        const imageUrl = source ? images.get(source) : undefined;
        return imageUrl ? { ...recipe, imageUrl } : recipe;
      });
    } finally { clearTimeout(timer); stage.abort(); }
  };
}
