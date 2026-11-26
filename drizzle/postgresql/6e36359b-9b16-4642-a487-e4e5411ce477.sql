ALTER TABLE public.menu_recipes
  ADD COLUMN category text,
  ADD COLUMN category_overridden boolean NOT NULL DEFAULT false,
  ADD CONSTRAINT menu_recipe_category_valid CHECK (category IS NULL OR category IN ('main', 'side', 'veggie')),
  ADD CONSTRAINT menu_recipe_category_override_valid CHECK (NOT category_overridden OR category IS NOT NULL);
