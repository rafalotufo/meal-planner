import type { FamilyDatabase } from '../db/connection';
import { createSafeHtmlLoader } from '../recipes/photo-transport';
import { parseImportedRecipe } from './recipe-metadata';
import { claimMenuRecipeCuration, completeMenuRecipeCuration, failMenuRecipeCuration, type CurationJob } from './store';

type HtmlLoader = ReturnType<typeof createSafeHtmlLoader>;
/** One bounded attempt. Persistent task state, rather than this process, owns recovery. */
export function createMenuCurator({ loadHtml = createSafeHtmlLoader() }: { loadHtml?: HtmlLoader } = {}) {
  let active = 0;
  return async function curate(db: FamilyDatabase, entryId: string, generation: string, allowedEmails: unknown): Promise<boolean> {
    if (active >= 2) { await failMenuRecipeCuration(db, entryId, generation); return false; }
    active++;
    let job: CurationJob | null = null;
    let signal: AbortSignal | undefined;
    try {
      job = await claimMenuRecipeCuration(db, entryId, generation, allowedEmails);
      if (!job) return false;
      const deadlineAt = Math.min(Date.now() + 3000, job.expiresAt);
      signal = AbortSignal.timeout(Math.max(1, deadlineAt - Date.now()));
      signal.throwIfAborted();
      const html = await loadHtml(job.sourceUrl, { signal, deadlineAt });
      signal.throwIfAborted();
      const recipe = html === null ? null : parseImportedRecipe(html, job.sourceUrl);
      signal.throwIfAborted();
      if (!recipe) { await failMenuRecipeCuration(db, entryId, generation, job.lease); return false; }
      return await completeMenuRecipeCuration(db, job, allowedEmails, recipe);
    } catch (error) {
      await failMenuRecipeCuration(db, entryId, generation, job?.lease ?? null);
      if (signal?.aborted) throw error;
      return false;
    } finally { active--; }
  };
}
export const curateMenuRecipe = createMenuCurator();
