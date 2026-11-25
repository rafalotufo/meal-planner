import { discoverRecipes, type SearchHit } from './brave';
import { BoundedPool, sourcePool, modelPool, deadline, abortable } from './concurrency';
import { curateRecipe, prepareCuration } from './curation';
import { SearchError } from './errors';
import { createSafeHtmlLoader } from './photo-transport';
import { parseRecipeSource, type ParsedSource, type SourceRecipe } from './source';
import type { Recipe, RecipeSearchProvider } from './types';

type Options = { braveKey: string; apiKey: string; model?: string; transport?: typeof fetch; loadHtml?: ReturnType<typeof createSafeHtmlLoader>; now?: () => number; pools?: { source: BoundedPool; model: BoundedPool } };
type PendingSource = SearchHit & { expanded: boolean; rank: number };
export function createParallelRecipeProvider({ braveKey, apiKey, model = 'gpt-6.2-sol', transport = fetch, loadHtml = createSafeHtmlLoader(), now = Date.now, pools = { source: sourcePool, model: modelPool } }: Options): RecipeSearchProvider {
  return { async search(query, { signal: parent, deadlineAt }) {
    if (parent.aborted) throw parent.reason;
    const budget = deadline(parent, Math.min(deadlineAt ?? Infinity, now() + 55000), now);
    let timedOut = false, busy = false, technical = false, explicitRejection = false;
    try {
      const brave = deadline(budget.signal, Math.min(now() + 10000, deadlineAt ?? Infinity), now);
      let hits: SearchHit[];
      try { hits = await abortable(discoverRecipes(query, { apiKey: braveKey, signal: brave.signal, transport }), brave.signal); }
      finally { brave.cancel(); brave.dispose(); }
      if (parent.aborted) throw parent.reason;
      if (!hits.length) return [];
      const pending: PendingSource[] = hits.map((hit, index) => ({ ...hit, expanded: false, rank: index * 1000 }));
      const seen = new Set<string>(); const candidates: { recipe: SourceRecipe; rank: number }[] = [];
      let attempts = 0, expandedCollections = 0;
      const sourceDeadline = Math.min(now() + 20000, deadlineAt ?? now() + 55000);
      const source = deadline(budget.signal, sourceDeadline, now);
      try {
        while (pending.length && attempts < 24 && candidates.length < 12 && !source.signal.aborted && now() < sourceDeadline) {
          const wave: PendingSource[] = [];
          while (pending.length && wave.length < 2 && attempts < 24) {
            const hit = pending.shift()!;
            if (seen.has(hit.url)) continue;
            seen.add(hit.url); attempts++; wave.push(hit);
          }
          const parsed = await Promise.all(wave.map(async hit => {
            try {
              const page = await pools.source.run(source.signal, async () => {
                const html = await loadHtml(hit.url, { signal: source.signal, deadlineAt: Math.min(now() + 3000, sourceDeadline) });
                if (source.signal.aborted) throw source.signal.reason;
                return html === null ? null : parseRecipeSource(html, hit.url);
              });
              if (page === null) technical = true;
              return page;
            } catch (error) { if (error instanceof SearchError && error.code === 'SEARCH_BUSY') busy = true; else if (source.signal.aborted) timedOut = true; else technical = true; return null; }
          }));
          const children: PendingSource[] = [];
          for (let index = 0; index < wave.length; index++) {
            const page: ParsedSource | null = parsed[index];
            if (page?.kind === 'recipe' && candidates.length < 12) candidates.push({ recipe: page.recipe, rank: wave[index].rank });
            else if (page?.kind === 'collection' && !wave[index].expanded && expandedCollections < 2) {
              expandedCollections++; children.push(...page.links.map((url, child) => ({ url, title: '', expanded: true, rank: wave[index].rank + child + 1 })));
            }
          }
          pending.unshift(...children);
        }
        if (source.signal.aborted) timedOut = true;
      } finally { source.cancel(); source.dispose(); }
      if (parent.aborted) throw parent.reason;
      if (budget.signal.aborted) throw budget.signal.reason;
      let inputBytes = 0, calls = 0;
      const curation = candidates.sort((a, b) => a.rank - b.rank).map(async ({recipe: candidate}) => {
        const prepared = prepareCuration(candidate, query, model);
        if (!prepared || calls >= 12 || inputBytes + prepared.bytes > 491520) { technical = true; return null; }
        inputBytes += prepared.bytes; calls++;
        const jobDeadline = Math.min(now() + 8000, deadlineAt ?? Infinity);
        const job = deadline(budget.signal, jobDeadline, now);
        try {
          const result = await pools.model.run(job.signal, () => {
            if (now() >= jobDeadline) { job.cancel(); throw job.signal.reason; }
            return curateRecipe(candidate, prepared, { apiKey, signal: job.signal, transport });
          });
          if (now() >= jobDeadline) { job.cancel(); throw job.signal.reason; }
          if (result === null) explicitRejection = true;
          return result;
        } catch (error) {
          if (error instanceof SearchError && error.code === 'SEARCH_BUSY') busy = true;
          else if (job.signal.aborted) timedOut = true;
          else technical = true;
          return null;
        } finally { job.cancel(); job.dispose(); }
      });
      const completed = await Promise.all(curation);
      if (parent.aborted) throw parent.reason;
      const emitted = new Set<string>();
      const recipes = completed.filter((recipe): recipe is Recipe => recipe !== null && !emitted.has(recipe.sourceUrl) && !!emitted.add(recipe.sourceUrl));
      if (recipes.length) return recipes;
      if (budget.signal.aborted) throw budget.signal.reason;
      if (timedOut) throw new SearchError('SEARCH_TIMEOUT');
      if (explicitRejection) return [];
      if (busy) throw new SearchError('SEARCH_BUSY');
      if (technical) throw new SearchError('SEARCH_FAILED');
      return [];
    } catch (error) {
      if (parent.aborted) throw parent.reason;
      if (budget.signal.aborted) throw budget.signal.reason;
      throw error instanceof SearchError ? error : new SearchError('SEARCH_FAILED');
    } finally { budget.cancel(); budget.dispose(); }
  } };
}
