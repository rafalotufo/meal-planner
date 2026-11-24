import type { Recipe } from '../recipes/types';

export type MenuRecipe = Recipe;
export interface MenuCursor { savedAt: number; id: string }
export interface SavedMenuEntry extends MenuCursor { recipe: MenuRecipe }
export interface MenuPage { entries: SavedMenuEntry[]; nextCursor: string | null }
