import { Parser } from 'htmlparser2';
import { selectRecipePhoto } from './photo-metadata';
import { boundedText, isRecord, safeRecipeUrl } from './validation';
import type { RecipeTime } from './types';

export type SourceRecipe = { sourceUrl: string; titles: string[]; ingredients: string; method: string; context: string; time: RecipeTime | null; imageUrl: string | null };
export type ParsedSource = { kind: 'recipe'; recipe: SourceRecipe } | { kind: 'collection'; links: string[] } | { kind: 'unsupported' };
const unsupported: ParsedSource = { kind: 'unsupported' };
export function normalizedText(value: string): string { return value.replace(/\s+/gu, ' ').trim(); }
function plain(value: unknown, maximum = 12000): string {
  if (typeof value !== 'string' || value.length > 100000 || Buffer.from(value).toString('utf8') !== value) return '';
  let result = '', suppressed = 0;
  const parser = new Parser({ onopentag(name) { if (name === 'script' || name === 'style') suppressed++; }, ontext(text) { if (!suppressed && result.length < maximum) result += text + ' '; }, onclosetag(name) { if (name === 'script' || name === 'style') suppressed = Math.max(0, suppressed - 1); } }, { decodeEntities: true });
  parser.end(value); return normalizedText(result).slice(0, maximum);
}
function titleKey(value: string) { return normalizedText(value.normalize('NFKC').toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ')).replace(/ recipe$/, ''); }
function resolve(value: unknown, source: string): string | null {
  if (typeof value !== 'string' || value.length > 2048 || !value.trim() || /[\x00-\x1f\x7f]/.test(value)) return null;
  try { return safeRecipeUrl(new URL(value.trim(), source).href); } catch { return null; }
}
function recipeType(node: Record<string, unknown>, type: string) {
  return (Array.isArray(node['@type']) ? node['@type'] : [node['@type']]).some(x => x === type || x === `https://schema.org/${type}` || x === `http://schema.org/${type}`);
}
function associated(node: Record<string, unknown>, source: string) {
  const declared = [node.url, node['@id'], node.mainEntityOfPage].filter(x => x !== undefined);
  return declared.every(value => {
    if (!isRecord(value)) return resolve(value, source) === source;
    const links = [value['@id'], value.url].filter(x => x !== undefined);
    return links.length > 0 && links.every(x => resolve(x, source) === source);
  });
}
function instructions(value: unknown, depth = 0): string {
  if (depth > 8) return '';
  if (typeof value === 'string') return plain(value, 10000);
  if (Array.isArray(value)) return value.slice(0, 100).map(x => instructions(x, depth + 1)).filter(Boolean).join('\n').slice(0, 12000);
  if (!isRecord(value)) return '';
  return instructions(value.text ?? value.itemListElement ?? value.steps ?? value.item, depth + 1);
}
function duration(value: unknown): string | null {
  if (typeof value !== 'string' || value.length > 80) return null;
  const match = /^P(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?)?$/.exec(value);
  if (!match || value.endsWith('T')) return null;
  const parts = match.slice(1).map(x => Number(x ?? 0));
  const seconds = parts.reduce((sum, n, i) => sum + n * [86400, 3600, 60, 1][i], 0);
  if (!parts.every(Number.isSafeInteger) || seconds < 1 || seconds > 604800) return null;
  const result = parts.flatMap((n, i) => n ? [`${n} ${['day', 'hour', 'minute', 'second'][i]}${n === 1 ? '' : 's'}`] : []).join(' ');
  return result.length <= 80 ? result : null;
}
function usefulLink(raw: string, label: string, source: string): string | null {
  if (raw.startsWith('#')) return null;
  const url = resolve(raw, source);
  if (!url || url === source) return null;
  const parsed = new URL(url);
  if (/\.(?:pdf|zip|jpe?g|png|webp|gif|svg|mp4)$/i.test(parsed.pathname) || /\/(?:login|account|cart|search|category|categories|tag|tags|page|author|about|contact)(?:\/|$)/i.test(parsed.pathname) || parsed.searchParams.has('page')) return null;
  return /recipe|make this|chicken|burger|dinner|pasta|meal|soup|curry|salad|rice|beef|pizza|taco/i.test(label + ' ' + parsed.pathname) ? url : null;
}

/** Parses public-source data only: no scripts, follow-up effects, HTML rendering or model memory. */
export function parseRecipeSource(html: string, sourceUrl: string): ParsedSource {
  const source = safeRecipeUrl(sourceUrl);
  if (!source || Buffer.byteLength(html) > 1048576) return unsupported;
  const documents: unknown[] = [], canonical: string[] = [], anchors: { href: string; label: string }[] = [];
  let overflow = false, depth = 0, scripts = 0, scriptBytes = 0, totalScriptBytes = 0;
  let script: string | null = null, body = '', heading = '', h1 = '', h1Count = 0, section = '', ingredientBody = '', methodBody = '';
  let contentDepth = 0;
  let inH1 = false, inHeading = false, currentAnchor: { href: string; label: string } | null = null;
  const suppressed: string[] = [];
  const skipTags = new Set(['head', 'script', 'style', 'noscript', 'nav', 'header', 'footer', 'aside', 'svg']);
  const fail = () => { overflow = true; parser.pause(); };
  const parser = new Parser({
    onopentag(name, a) {
      if (++depth > 256) { fail(); return; }
      if (name === 'link' && a.rel?.toLowerCase().split(/\s+/).includes('canonical')) canonical.push(a.href ?? '');
      if (name === 'script' && a.type?.split(';')[0].trim().toLowerCase() === 'application/ld+json') { if (++scripts > 16) { fail(); return; } script = ''; scriptBytes = 0; }
      if (name === 'main' || name === 'article') contentDepth++;
      if (skipTags.has(name)) suppressed.push(name);
      // Article headers commonly own the principal recipe heading; site/navigation headers do not.
      if (name === 'h1' && (!suppressed.length || contentDepth > 0 && suppressed.every(tag => tag === 'header'))) { inH1 = true; h1Count++; }
      if (suppressed.length) return;
      if (/^h[1-6]$/.test(name)) { inHeading = true; heading = ''; section = ''; body += '\n'; }
      if (name === 'a' && anchors.length < 500) currentAnchor = { href: a.href ?? '', label: '' };
      if (['p', 'li', 'div', 'br'].includes(name)) body += '\n';
    },
    ontext(text) {
      if (script !== null) { const bytes = Buffer.byteLength(text); scriptBytes += bytes; totalScriptBytes += bytes; if (scriptBytes > 131072 || totalScriptBytes > 262144) { fail(); return; } script += text; }
      if (inH1 && h1.length < 500) h1 += text;
      if (suppressed.length) return;
      if (body.length < 24000) body += text + ' ';
      if (inHeading && heading.length < 500) heading += text;
      if (currentAnchor && currentAnchor.label.length < 300) currentAnchor.label += text;
      if (section === 'ingredients' && ingredientBody.length < 12000) ingredientBody += text + ' ';
      if (section === 'method' && methodBody.length < 12000) methodBody += text + ' ';
    },
    onclosetag(name) {
      if (name === 'script' && script !== null) { try { documents.push(JSON.parse(script)); } catch { /* One malformed script is not evidence. */ } script = null; }
      if (skipTags.has(name)) { const index = suppressed.lastIndexOf(name); if (index >= 0) suppressed.splice(index, 1); }
      if (name === 'main' || name === 'article') contentDepth = Math.max(0, contentDepth - 1);
      if (name === 'h1') inH1 = false;
      if (/^h[1-6]$/.test(name) && inHeading) { inHeading = false; section = /ingredients/i.test(heading) ? 'ingredients' : /instructions|directions|method|how to make/i.test(heading) ? 'method' : ''; }
      if (name === 'a' && currentAnchor) { anchors.push(currentAnchor); currentAnchor = null; }
      depth = Math.max(0, depth - 1);
    },
  }, { decodeEntities: true });
  try { parser.end(html); } catch { return unsupported; }
  if (overflow) return unsupported;
  const nodes: Record<string, unknown>[] = []; const stack = documents.map(value => ({ value, depth: 0 })); let visited = 0;
  while (stack.length) {
    const entry = stack.pop()!;
    if (++visited > 1000 || entry.depth > 12) return unsupported;
    if (entry.value !== null && typeof entry.value === 'object') {
      if (isRecord(entry.value)) nodes.push(entry.value);
      for (const value of Object.values(entry.value)) stack.push({ value, depth: entry.depth + 1 });
    }
  }
  const recipes = nodes.filter(node => recipeType(node, 'Recipe'));
  const collection = nodes.some(node => recipeType(node, 'CollectionPage') || recipeType(node, 'ItemList')) || /\/(?:collection|collections|category|categories|gallery|tag|tags|photos|article|articles|howto\/guide)(?:\/|$)/i.test(new URL(source).pathname) || /(?:\b\d+\+?\s+.*(?:recipes|meals|dinners|ideas)\b|\b(?:dinner|meal|recipe|family)\s+(?:ideas|recipes)\b)/i.test(h1);
  if (collection) {
    const links: string[] = []; const seen = new Set<string>();
    const add = (raw: unknown, label: string) => { if (typeof raw !== 'string' || links.length >= 12) return; const url = usefulLink(raw, label, source); if (url && !seen.has(url)) { links.push(url); seen.add(url); } };
    for (const node of nodes.filter(node => recipeType(node, 'ItemList'))) {
      if (!Array.isArray(node.itemListElement)) continue;
      for (const value of node.itemListElement.slice(0, 100)) { if (!isRecord(value)) continue; const item = isRecord(value.item) ? value.item : value; add(item.url ?? item.URL ?? item['@id'] ?? value.url, String(item.name ?? 'recipe')); }
    }
    for (const anchor of anchors) add(anchor.href, anchor.label);
    return { kind: 'collection', links };
  }
  if (h1Count !== 1 || !boundedText(normalizedText(h1), 160) || canonical.some(url => resolve(url, source) !== source) || recipes.length > 1) return unsupported;
  const node = recipes[0];
  const titles = [normalizedText(h1)];
  let ingredients = '', method = '', time: RecipeTime | null = null;
  if (node) {
    if (!associated(node, source)) return unsupported;
    const name = plain(node.name);
    if (!boundedText(name, 160) || titleKey(name) !== titleKey(h1)) return unsupported;
    if (!titles.includes(name)) titles.unshift(name);
    ingredients = Array.isArray(node.recipeIngredient) ? node.recipeIngredient.slice(0, 100).map(x => plain(x, 500)).filter(Boolean).join('\n') : plain(node.recipeIngredient);
    method = instructions(node.recipeInstructions);
    const total = duration(node.totalTime), cook = total ? null : duration(node.cookTime);
    time = total ? { kind: 'total', text: total } : cook ? { kind: 'cook', text: cook } : null;
  } else { ingredients = normalizedText(ingredientBody); method = normalizedText(methodBody); }
  if (!ingredients.trim() || !method.trim()) return unsupported;
  return { kind: 'recipe', recipe: { sourceUrl: source, titles, ingredients: normalizedText(ingredients).slice(0, 6000), method: normalizedText(method).slice(0, 12000), context: normalizedText(body).slice(0, 4000), time, imageUrl: selectRecipePhoto(html, { sourceUrl: source, title: titles[0] })?.imageUrl ?? null } };
}
