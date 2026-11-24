import { isRecord, safeRecipeUrl } from '../recipes/validation';
import type { MenuCursor, MenuPage, MenuRecipe, SavedMenuEntry } from './types';

function exactKeys(value: Record<string, unknown>, keys: readonly string[]) {
  return Object.keys(value).length === keys.length && keys.every(key => Object.hasOwn(value, key));
}
function text(value: unknown, maximum: number): string | null {
  if (typeof value !== 'string' || !value.isWellFormed() || /[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/.test(value)) return null;
  const trimmed = value.trim();
  return trimmed.length > 0 && trimmed.length <= maximum ? trimmed : null;
}
export function parseMenuSourceUrl(value: unknown) {
  const normalized = safeRecipeUrl(value);
  return normalized && normalized.length <= 2048 && /^[\x21-\x7e]+$/.test(normalized) ? normalized : null;
}
export function parseMenuSourceUrls(value: unknown): string[] | null {
  if (!Array.isArray(value) || value.length < 1 || value.length > 6) return null;
  const normalized = value.map(parseMenuSourceUrl);
  return normalized.every((source): source is string => source !== null) ? [...new Set(normalized)] : null;
}
export function parseMenuRecipe(value: unknown): MenuRecipe | null {
  if (!isRecord(value) || !exactKeys(value, ['title', 'sourceUrl', 'imageUrl', 'summary', 'time'])) return null;
  const title = text(value.title, 160), summary = text(value.summary, 600), sourceUrl = parseMenuSourceUrl(value.sourceUrl);
  const imageUrl = value.imageUrl === null ? null : parseMenuSourceUrl(value.imageUrl);
  if (!title || !summary || !sourceUrl || value.imageUrl !== null && !imageUrl) return null;
  let time: MenuRecipe['time'] = null;
  if (value.time !== null) {
    if (!isRecord(value.time) || !exactKeys(value.time, ['kind', 'text'])) return null;
    const timeText = text(value.time.text, 80);
    if (!timeText || value.time.kind !== 'cook' && value.time.kind !== 'total') return null;
    time = { kind: value.time.kind, text: timeText };
  }
  return { title, sourceUrl, imageUrl, summary, time };
}
export function parseMenuId(value: unknown): string | null {
  return typeof value === 'string' && /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/.test(value) ? value : null;
}
function timestamp(value: unknown): value is number { return typeof value === 'number' && Number.isSafeInteger(value) && value >= 0; }
export function encodeMenuCursor(value: MenuCursor): string {
  if (!parseMenuId(value.id) || !timestamp(value.savedAt)) throw new Error('Invalid menu position');
  return btoa(JSON.stringify([value.savedAt, value.id])).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/, '');
}
export function parseMenuCursor(value: unknown): MenuCursor | null {
  if (typeof value !== 'string' || value.length > 128 || !/^[a-zA-Z0-9_-]+$/.test(value)) return null;
  try {
    const decoded: unknown = JSON.parse(atob(value.replaceAll('-', '+').replaceAll('_', '/')));
    if (!Array.isArray(decoded) || decoded.length !== 2 || !timestamp(decoded[0]) || !parseMenuId(decoded[1])) return null;
    const position = { savedAt: decoded[0], id: decoded[1] as string };
    return encodeMenuCursor(position) === value ? position : null;
  } catch { return null; }
}
function unchangedRecipe(raw: Record<string, unknown>, recipe: MenuRecipe) {
  return raw.title === recipe.title && raw.sourceUrl === recipe.sourceUrl && raw.imageUrl === recipe.imageUrl && raw.summary === recipe.summary &&
    (raw.time === null ? recipe.time === null : isRecord(raw.time) && raw.time.kind === recipe.time?.kind && raw.time.text === recipe.time?.text);
}
export function parseSavedMenuEntry(value: unknown): SavedMenuEntry | null {
  if (!isRecord(value) || !exactKeys(value, ['id', 'savedAt', 'recipe', 'curation']) || !parseMenuId(value.id) || !timestamp(value.savedAt)) return null;
  const recipe = parseMenuRecipe(value.recipe);
  if (!recipe || !isRecord(value.recipe) || !unchangedRecipe(value.recipe, recipe)) return null;
  const curation = value.curation;
  if (!isRecord(curation) || !exactKeys(curation, ['state', 'retryable']) || typeof curation.state !== 'string' || !['ready', 'pending', 'processing', 'failed', 'interrupted'].includes(curation.state) || typeof curation.retryable !== 'boolean' || curation.retryable !== (curation.state === 'failed' || curation.state === 'interrupted')) return null;
  return { id: value.id as string, savedAt: value.savedAt, recipe, curation: { state: curation.state as SavedMenuEntry['curation']['state'], retryable: curation.retryable } };
}
export function menuEntryFromRow(value: unknown): SavedMenuEntry {
  if (!isRecord(value)) throw new Error('Storage unavailable');
  const time = value.timeKind === null && value.timeText === null ? null : { kind: value.timeKind, text: value.timeText };
  let state: unknown = value.curationState ?? 'ready';
  if (value.curationState != null) {
    if (typeof state !== 'string' || !['pending', 'processing', 'ready', 'failed'].includes(state) || !timestamp(value.curationExpiresAt)) throw new Error('Storage unavailable');
    if ((state === 'pending' || state === 'processing') && value.curationExpiresAt <= Date.now()) state = 'interrupted';
  }
  const entry = parseSavedMenuEntry({ id: value.id, savedAt: value.savedAt, curation: { state, retryable: state === 'failed' || state === 'interrupted' }, recipe: { title: value.title, sourceUrl: value.sourceUrl, imageUrl: value.imageUrl, summary: value.summary, time } });
  if (!entry) throw new Error('Storage unavailable');
  return entry;
}

export function parseMenuPage(value: unknown): MenuPage | null {
  if (!isRecord(value) || !exactKeys(value, ['entries', 'nextCursor']) || !Array.isArray(value.entries) || value.entries.length > 50 || value.nextCursor !== null && !parseMenuCursor(value.nextCursor)) return null;
  const entries = value.entries.map(parseSavedMenuEntry);
  return entries.every((entry): entry is SavedMenuEntry => entry !== null) ? { entries, nextCursor: value.nextCursor as string | null } : null;
}
