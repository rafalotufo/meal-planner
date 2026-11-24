SELECT pg_advisory_xact_lock(73462901);
--> statement-breakpoint
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM meal_plan_weeks w CROSS JOIN LATERAL jsonb_array_elements(w.meals) item
    WHERE w.status='draft' AND (
      jsonb_typeof(item) IS DISTINCT FROM 'object' OR
      jsonb_typeof(item->'sourceUrl') IS DISTINCT FROM 'string' OR
      length(item->>'sourceUrl') NOT BETWEEN 1 AND 2048 OR
      item->>'sourceUrl' !~ '^https://[^/?#@:]*[.][^/?#@:]+/[^#]*$' OR
      item->>'sourceUrl' ~ '[^!-~]'
    )
  ) THEN RAISE EXCEPTION 'Invalid draft recipe source'; END IF;
  IF EXISTS (
    SELECT 1 FROM meal_plan_weeks w WHERE w.status='draft' AND w.revision=2147483647
    AND (SELECT count(DISTINCT item->>'sourceUrl') FROM jsonb_array_elements(w.meals) item) < jsonb_array_length(w.meals)
  ) THEN RAISE EXCEPTION 'Draft revision overflow'; END IF;
END $$;
--> statement-breakpoint
ALTER TABLE meal_plan_weeks DROP CONSTRAINT meal_plan_weeks_meals_check;
--> statement-breakpoint
ALTER TABLE meal_plan_weeks ADD CONSTRAINT meal_plan_weeks_meals_check CHECK (jsonb_typeof(meals)='array' AND jsonb_array_length(meals) BETWEEN 1 AND 7);
--> statement-breakpoint
CREATE TEMPORARY TABLE _meal_plan_compaction ON COMMIT DROP AS
WITH entries AS (
  SELECT w.id,w.revision,item,ordinality,
    row_number() OVER (PARTITION BY w.id,item->>'sourceUrl' ORDER BY ordinality) AS occurrence
  FROM meal_plan_weeks w CROSS JOIN LATERAL jsonb_array_elements(w.meals) WITH ORDINALITY AS items(item,ordinality)
  WHERE w.status='draft'
), compact AS (
  SELECT id,revision,jsonb_agg(item ORDER BY ordinality) FILTER (WHERE occurrence=1) AS meals,
    count(*) AS original_count,count(*) FILTER (WHERE occurrence=1) AS unique_count
  FROM entries GROUP BY id,revision
)
SELECT id,revision,meals FROM compact WHERE unique_count<original_count;
--> statement-breakpoint
CREATE TEMPORARY TABLE _meal_plan_slot_map ON COMMIT DROP AS
SELECT c.id,(old.ordinality-1)::integer AS old_index,(new.ordinality-1)::integer AS new_index
FROM _meal_plan_compaction c JOIN meal_plan_weeks w ON w.id=c.id
CROSS JOIN LATERAL jsonb_array_elements(w.meals) WITH ORDINALITY AS old(item,ordinality)
CROSS JOIN LATERAL jsonb_array_elements(c.meals) WITH ORDINALITY AS new(item,ordinality)
WHERE old.item->>'sourceUrl'=new.item->>'sourceUrl';
--> statement-breakpoint
CREATE TEMPORARY TABLE _meal_plan_proposal_map ON COMMIT DROP AS
SELECT s.id,m.new_index,c.revision+1 AS new_revision,
  row_number() OVER (PARTITION BY s.plan_id,s.user_id,m.new_index ORDER BY s.created_at,s.id) AS winner
FROM meal_plan_suggestions s JOIN _meal_plan_compaction c ON c.id=s.plan_id
JOIN _meal_plan_slot_map m ON m.id=s.plan_id AND m.old_index=s.day_index
WHERE s.status='pending' AND s.base_revision=c.revision;
--> statement-breakpoint
UPDATE meal_plan_suggestions s SET status='stale' FROM _meal_plan_proposal_map m WHERE s.id=m.id AND m.winner>1;
--> statement-breakpoint
UPDATE meal_plan_suggestions s SET day_index=m.new_index,base_revision=m.new_revision FROM _meal_plan_proposal_map m WHERE s.id=m.id AND m.winner=1;
--> statement-breakpoint
DELETE FROM meal_plan_approvals a USING _meal_plan_compaction c WHERE a.plan_id=c.id;
--> statement-breakpoint
UPDATE meal_plan_weeks w SET meals=c.meals,revision=c.revision+1 FROM _meal_plan_compaction c WHERE w.id=c.id;
