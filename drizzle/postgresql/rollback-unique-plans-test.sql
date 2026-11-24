-- Owned disposable tests only. Fail atomically if any remaining plan is not seven entries.
-- After dropping weekly tables for full cleanup, this removes only the fourth history entry.
DO $$
BEGIN
  IF to_regclass('public.meal_plan_weeks') IS NOT NULL THEN
    ALTER TABLE meal_plan_weeks DROP CONSTRAINT meal_plan_weeks_meals_check;
    ALTER TABLE meal_plan_weeks ADD CONSTRAINT meal_plan_weeks_meals_check CHECK (jsonb_typeof(meals)='array' AND jsonb_array_length(meals)=7);
  END IF;
  DELETE FROM __drizzle_migrations WHERE id=3;
END $$;
