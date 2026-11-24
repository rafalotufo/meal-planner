import { isRecord } from '../recipes/validation';
import { parseMenuCursor, parseMenuId, parseMenuRecipe } from '../menu/validation';
import { parseWeek } from './calendar';
import type { PlanAction } from './types';
export const maxRevision = 2147483647;
export function validRevision(value: unknown): value is number { return typeof value === 'number' && Number.isInteger(value) && value > 0 && value <= maxRevision; }
export function parsePlanAction(value: unknown): PlanAction | null {
  if (!isRecord(value) || !validRevision(value.revision)) return null;
  const keys = value.action === 'approve' || value.action === 'finalize' ? ['action', 'revision'] : value.action === 'suggest' ? ['action', 'revision', 'day', 'menuRecipeId'] : value.action === 'accept' || value.action === 'reject' ? ['action', 'revision', 'suggestionId'] : [];
  if (!keys.length || Object.keys(value).length !== keys.length || !keys.every(key => Object.hasOwn(value, key))) return null;
  if (value.action === 'suggest' && (!Number.isInteger(value.day) || typeof value.day !== 'number' || value.day < 0 || value.day > 6 || !parseMenuId(value.menuRecipeId))) return null;
  if ((value.action === 'accept' || value.action === 'reject') && !parseMenuId(value.suggestionId)) return null;
  return value as unknown as PlanAction;
}
export function parsePlanQuery(value: Record<string, unknown>): { week?: string; menuAfter?: string } | null {
  if (Object.keys(value).some(key => key !== 'week' && key !== 'menuAfter') || value.week !== undefined && !parseWeek(value.week) || value.menuAfter !== undefined && !parseMenuCursor(value.menuAfter)) return null;
  return { ...(value.week === undefined ? {} : { week: value.week as string }), ...(value.menuAfter === undefined ? {} : { menuAfter: value.menuAfter as string }) };
}
export function parseMeals(value: unknown, allowLegacyDuplicates = false) {
  if (!Array.isArray(value) || value.length < 1 || value.length > 7) return null;
  const meals = value.map(parseMenuRecipe);
  if (!meals.every(meal => meal !== null)) return null;
  return allowLegacyDuplicates || new Set(meals.map(meal => meal.sourceUrl)).size === meals.length ? meals : null;
}
