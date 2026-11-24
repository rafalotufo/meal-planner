import type { MenuRecipe, MenuPage } from '../menu/types';
export type PlanAction = { action: 'approve'; revision: number } | { action: 'finalize'; revision: number } | { action: 'suggest'; revision: number; day: number; menuRecipeId: string } | { action: 'accept'; revision: number; suggestionId: string } | { action: 'reject'; revision: number; suggestionId: string };
export interface PlanWeek { id: string; weekStart: string; revision: number; status: 'draft' | 'final'; meals: MenuRecipe[]; createdAt: number; finalizedAt: number | null }
export interface PlanSuggestion { id: string; day: number; recipe: MenuRecipe }
export interface PlanView { plan: PlanWeek | null; history: string[]; approvals: number; approved: boolean; suggestions: PlanSuggestion[]; menu: MenuPage; editable: boolean }
