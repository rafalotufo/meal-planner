import { Parser } from 'htmlparser2';
import { selectRecipePhoto } from '../recipes/photo-metadata';
import { isRecord, safeRecipeUrl } from '../recipes/validation';
import type { MenuRecipe } from './types';
import { parseMenuRecipe } from './validation';

function resolveUrl(value: unknown, source: string): string | null {
  if (typeof value !== 'string' || !value.isWellFormed() || !value.trim() || value.length > 2048 || /[\x00-\x1f\x7f]/.test(value)) return null;
  try { return safeRecipeUrl(new URL(value.trim(), source).href); } catch { return null; }
}
function dimension(value: unknown): number | null {
  if (typeof value === 'string' && /^\d+$/.test(value)) value = Number(value);
  return typeof value === 'number' && Number.isInteger(value) && value > 0 && value <= 20000 ? value : null;
}
function description(value: unknown): string {
  const fallback = 'Summary unavailable.';
  if (typeof value !== 'string' || value.length > 8192 || !value.isWellFormed() || /[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/.test(value)) return fallback;
  let result = '', suppressed = 0;
  const parser = new Parser({
    onopentag(name) { if (name === 'script' || name === 'style') suppressed++; else if (!suppressed) result += ' '; },
    ontext(text) { if (!suppressed) result += text; },
    onclosetag(name) { if (name === 'script' || name === 'style') suppressed--; else if (!suppressed) result += ' '; },
  }, { decodeEntities: true });
  try { parser.end(value); } catch { return fallback; }
  result = result.replace(/\s+/gu, ' ').trim();
  if (!result || !result.isWellFormed() || /[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/.test(result)) return fallback;
  result = result.slice(0, 600);
  if (!result.isWellFormed()) result = result.slice(0, -1);
  return result.trim() || fallback;
}
function duration(value: unknown): string | null {
  if (typeof value !== 'string' || value.length > 80 || value.endsWith('T')) return null;
  const match = /^P(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?)?$/.exec(value);
  if (!match) return null;
  const components = match.slice(1).map(part => part === undefined ? 0 : Number(part));
  const seconds = components.reduce((sum, component, index) => sum + component * [86400, 3600, 60, 1][index], 0);
  if (!components.every(Number.isSafeInteger) || !Number.isSafeInteger(seconds) || seconds < 1 || seconds > 604800) return null;
  const text = components.flatMap((component, index) => component ? [`${component} ${['day', 'hour', 'minute', 'second'][index]}${component === 1 ? '' : 's'}`] : []).join(' ');
  return text.length <= 80 ? text : null;
}
function recipeType(node: Record<string, unknown>): boolean {
  return (Array.isArray(node['@type']) ? node['@type'] : [node['@type']]).some(type => type === 'Recipe' || type === 'https://schema.org/Recipe' || type === 'http://schema.org/Recipe');
}
function associated(node: Record<string, unknown>, source: string, count: number): boolean {
  const declared = [node.url, node['@id'], node.mainEntityOfPage].filter(value => value !== undefined);
  const identities = declared.flatMap(value => {
    if (!isRecord(value)) return [value];
    const links = [value['@id'], value.url].filter(link => link !== undefined);
    return links.length ? links : [null];
  });
  return identities.length ? identities.every(value => resolveUrl(value, source) === source) : count === 1;
}
function image(node: Record<string, unknown>, html: string, source: string, title: string): { imageUrl: string | null } | null {
  const images = node.image === undefined ? [] : Array.isArray(node.image) ? node.image : [node.image];
  if (images.length > 20) return null;
  const candidates = images.flatMap((value, order) => {
    const imageUrl = isRecord(value) ? resolveUrl(value.contentUrl, source) ?? resolveUrl(value.url, source) : resolveUrl(value, source);
    if (!imageUrl) return [];
    const width = isRecord(value) ? dimension(value.width) : null;
    const height = isRecord(value) ? dimension(value.height) : null;
    return (width !== null && width < 160) || (height !== null && height < 90) ? [] : [{ imageUrl, width, height, order }];
  });
  const adequate = candidates.filter(value => value.width !== null && value.height !== null && value.width >= 480 && value.height >= 270)
    .sort((a, b) => a.width! * a.height! - b.width! * b.height! || a.order - b.order)[0];
  if (adequate) return { imageUrl: adequate.imageUrl };
  const unknown = candidates.find(value => value.width === null || value.height === null);
  if (unknown) return { imageUrl: unknown.imageUrl };
  // Reuse the existing page-bound OG rules, without changing search-photo behavior.
  const social = selectRecipePhoto(html, { sourceUrl: source, title });
  if (social?.reason === 'open-graph') return { imageUrl: social.imageUrl };
  const small = candidates.sort((a, b) => b.width! * b.height! - a.width! * a.height! || a.order - b.order)[0];
  return { imageUrl: small?.imageUrl ?? null };
}

/** Import only source-associated structured Recipe metadata; never execute or fetch content. */
export function parseImportedRecipe(html: string, sourceUrl: string): MenuRecipe | null {
  const source = safeRecipeUrl(sourceUrl);
  if (!source || typeof html !== 'string' || Buffer.byteLength(html) > 1048576) return null;
  const documents: unknown[] = [];
  let overflow = false, depth = 0, scripts = 0, scriptBytes = 0, totalBytes = 0;
  let script: string | null = null;
  const fail = () => { overflow = true; parser.pause(); };
  const parser = new Parser({
    onopentag(name, attributes) {
      if (++depth > 256) { fail(); return; }
      if (name === 'script' && attributes.type?.split(';')[0].trim().toLowerCase() === 'application/ld+json') {
        if (++scripts > 16) { fail(); return; }
        script = ''; scriptBytes = 0;
      }
    },
    ontext(text) {
      if (script === null) return;
      const bytes = Buffer.byteLength(text); scriptBytes += bytes; totalBytes += bytes;
      if (scriptBytes > 131072 || totalBytes > 262144) { fail(); return; }
      script += text;
    },
    onclosetag(name) {
      if (name === 'script' && script !== null) {
        try { documents.push(JSON.parse(script)); } catch { /* Ignore one malformed document. */ }
        script = null;
      }
      depth--;
    },
  }, { decodeEntities: true });
  try { parser.end(html); } catch { return null; }
  if (overflow) return null;
  let visited = 0;
  for (const document of documents) {
    const stack = [{ value: document, depth: 0 }];
    while (stack.length) {
      const entry = stack.pop()!;
      if (++visited > 1000 || entry.depth > 12) return null;
      if (entry.value !== null && typeof entry.value === 'object') {
        for (const value of Object.values(entry.value)) stack.push({ value, depth: entry.depth + 1 });
      }
    }
  }
  const recipes: Record<string, unknown>[] = [], roots = [...documents].reverse();
  while (roots.length) {
    const value = roots.pop();
    if (Array.isArray(value)) { roots.push(...[...value].reverse()); continue; }
    if (!isRecord(value)) continue;
    if (recipeType(value)) recipes.push(value);
    if (Array.isArray(value['@graph'])) roots.push(...[...value['@graph']].reverse());
  }
  const eligible = recipes.filter(node => associated(node, source, recipes.length));
  if (eligible.length !== 1) return null;
  const node = eligible[0];
  if (typeof node.name !== 'string' || !node.name.isWellFormed()) return null;
  const title = node.name.trim();
  const selected = image(node, html, source, title);
  if (!selected) return null;
  const total = duration(node.totalTime), cook = total ? null : duration(node.cookTime);
  return parseMenuRecipe({ title, sourceUrl: source, summary: description(node.description), imageUrl: selected.imageUrl,
    time: total ? { kind: 'total', text: total } : cook ? { kind: 'cook', text: cook } : null });
}
