-- Owned disposable test databases only. Reverse before the menu/initial rollbacks.
DROP TABLE meal_plan_suggestions;
DROP TABLE meal_plan_approvals;
DROP TABLE meal_plan_weeks;
DELETE FROM __drizzle_migrations WHERE id=2;
