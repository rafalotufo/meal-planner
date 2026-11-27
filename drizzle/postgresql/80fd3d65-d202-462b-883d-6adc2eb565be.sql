SELECT pg_advisory_xact_lock(73462901);
--> statement-breakpoint
ALTER TABLE meal_plan_weeks DROP CONSTRAINT meal_plan_weeks_meals_check;
--> statement-breakpoint
ALTER TABLE meal_plan_weeks ADD CONSTRAINT meal_plan_weeks_meals_check CHECK (jsonb_typeof(meals)='array' AND jsonb_array_length(meals) BETWEEN 1 AND 8);
--> statement-breakpoint
ALTER TABLE meal_plan_suggestions DROP CONSTRAINT meal_plan_suggestions_day_index_check;
--> statement-breakpoint
ALTER TABLE meal_plan_suggestions ADD CONSTRAINT meal_plan_suggestions_day_index_check CHECK (day_index BETWEEN 0 AND 7);
