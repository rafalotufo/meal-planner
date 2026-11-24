CREATE TABLE meal_plan_weeks (
  id text PRIMARY KEY CHECK (id ~ '^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$'),
  family_id text NOT NULL REFERENCES families(id),
  week_start date NOT NULL CHECK (extract(dow FROM week_start)=0 AND week_start BETWEEN DATE '0001-01-01' AND DATE '9999-12-31'),
  revision integer NOT NULL DEFAULT 1 CHECK (revision > 0),
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','final')),
  meals jsonb NOT NULL CHECK (jsonb_typeof(meals)='array' AND jsonb_array_length(meals)=7),
  created_at bigint NOT NULL CHECK (created_at BETWEEN 0 AND 9007199254740991),
  finalized_at bigint CHECK (finalized_at BETWEEN 0 AND 9007199254740991),
  CHECK ((status='draft' AND finalized_at IS NULL) OR (status='final' AND finalized_at IS NOT NULL)),
  UNIQUE (family_id, week_start)
);
--> statement-breakpoint
CREATE INDEX meal_plan_family_week ON meal_plan_weeks (family_id, week_start DESC);
--> statement-breakpoint
CREATE TABLE meal_plan_approvals (
  plan_id text NOT NULL REFERENCES meal_plan_weeks(id),
  user_id text NOT NULL REFERENCES app_users(id),
  revision integer NOT NULL CHECK (revision > 0),
  created_at bigint NOT NULL CHECK (created_at BETWEEN 0 AND 9007199254740991),
  PRIMARY KEY (plan_id,user_id)
);
--> statement-breakpoint
CREATE TABLE meal_plan_suggestions (
  id text PRIMARY KEY CHECK (id ~ '^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$'),
  plan_id text NOT NULL REFERENCES meal_plan_weeks(id),
  user_id text NOT NULL REFERENCES app_users(id),
  base_revision integer NOT NULL CHECK (base_revision > 0),
  day_index integer NOT NULL CHECK (day_index BETWEEN 0 AND 6),
  menu_recipe_id text NOT NULL CHECK (menu_recipe_id ~ '^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$'),
  recipe jsonb NOT NULL CHECK (jsonb_typeof(recipe)='object'),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','accepted','rejected','stale')),
  created_at bigint NOT NULL CHECK (created_at BETWEEN 0 AND 9007199254740991)
);
--> statement-breakpoint
CREATE UNIQUE INDEX meal_plan_pending_unique ON meal_plan_suggestions (plan_id,base_revision,day_index,user_id) WHERE status='pending';
--> statement-breakpoint
CREATE INDEX meal_plan_suggestion_revision ON meal_plan_suggestions (plan_id,base_revision,status);
