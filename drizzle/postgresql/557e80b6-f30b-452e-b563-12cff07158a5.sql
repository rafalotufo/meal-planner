-- Preserve the initial verification identity and its ledger row. Spell this
-- equivalent predicate as flat conjunctions so pg_dump/restore has a stable
-- pg_get_constraintdef representation under the reviewed strict catalog.
ALTER TABLE public.verification_runs DROP CONSTRAINT verification_runs_origin_check;
ALTER TABLE public.verification_runs ADD CONSTRAINT verification_runs_origin_check CHECK (
  length(origin) >= 9 AND length(origin) <= 300 AND origin ~ '^https://[^/?#[:space:]]+$'
);
