import type { Recipe } from '../recipes/types';

export type MenuRecipe = Recipe;
export interface MenuCursor { savedAt: number; id: string }
export type CurationState = 'ready' | 'pending' | 'processing' | 'failed' | 'interrupted';
export interface SavedMenuEntry extends MenuCursor { recipe: MenuRecipe; curation: { state: CurationState; retryable: boolean } }
export interface MenuPage { entries: SavedMenuEntry[]; nextCursor: string | null }
export type MenuSaveStatus = 'checking' | 'available' | 'saved' | 'error' | 'signin' | 'family';
