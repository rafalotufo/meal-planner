-- Staging verification principals. Native UUID identity; historical SQL stays immutable.
ALTER TABLE public.families ADD COLUMN identity_kind text NOT NULL DEFAULT 'google';
ALTER TABLE public.families ADD CONSTRAINT families_identity_kind CHECK (identity_kind IN ('google','verification'));
ALTER TABLE public.families ADD CONSTRAINT families_id_kind_unique UNIQUE (id,identity_kind);
--> statement-breakpoint
CREATE TABLE public.verification_runs (
  id text PRIMARY KEY CHECK (id ~ '^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$'),
  family_id text NOT NULL UNIQUE,
  family_kind text NOT NULL DEFAULT 'verification' CHECK (family_kind='verification'),
  project_id text NOT NULL CHECK (project_id ~ '^[A-Za-z0-9_-]{1,128}$'),
  deployment_id text NOT NULL CHECK (deployment_id ~ '^[A-Za-z0-9_-]{1,128}$'),
  source_sha text NOT NULL CHECK (source_sha ~ '^[a-f0-9]{40}$'),
  profile_sha256 text NOT NULL CHECK (profile_sha256 ~ '^[a-f0-9]{64}$'),
  origin text NOT NULL CHECK (length(origin) BETWEEN 9 AND 300 AND origin ~ '^https://[^/?#[:space:]]+$'),
  database_identity text NOT NULL CHECK (database_identity ~ '^[a-f0-9]{64}$'),
  created_at bigint NOT NULL CHECK (created_at BETWEEN 0 AND 9007199254740991),
  expires_at bigint NOT NULL CHECK (expires_at > created_at AND expires_at <= created_at+1800000 AND expires_at <= 9007199254740991),
  revoked_at bigint CHECK (revoked_at >= created_at AND revoked_at <= 9007199254740991),
  scope text NOT NULL CHECK (scope IN ('app','collaboration')),
  UNIQUE (id,family_id),
  FOREIGN KEY (family_id,family_kind) REFERENCES public.families(id,identity_kind) ON DELETE RESTRICT
);
--> statement-breakpoint
ALTER TABLE public.app_users ADD COLUMN identity_kind text NOT NULL DEFAULT 'google';
ALTER TABLE public.app_users ADD COLUMN verification_run_id text;
ALTER TABLE public.app_users ALTER COLUMN google_subject DROP NOT NULL;
ALTER TABLE public.app_users ALTER COLUMN verified_email DROP NOT NULL;
ALTER TABLE public.app_users ADD CONSTRAINT app_users_identity_branch CHECK (
  (identity_kind='google' AND google_subject IS NOT NULL AND verified_email IS NOT NULL AND verification_run_id IS NULL
    AND length(trim(google_subject))>0 AND verified_email=lower(trim(verified_email)) AND length(verified_email)>0)
  OR
  (identity_kind='verification' AND google_subject IS NULL AND verified_email IS NULL AND invitation_granted_at IS NULL AND verification_run_id IS NOT NULL
    AND id ~ '^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$')
);
ALTER TABLE public.app_users ADD CONSTRAINT app_users_family_kind FOREIGN KEY (family_id,identity_kind) REFERENCES public.families(id,identity_kind) ON DELETE RESTRICT;
ALTER TABLE public.app_users ADD CONSTRAINT app_users_run_family FOREIGN KEY (verification_run_id,family_id) REFERENCES public.verification_runs(id,family_id) ON DELETE RESTRICT;
ALTER TABLE public.app_users ADD CONSTRAINT app_users_member_run_unique UNIQUE (id,verification_run_id);
--> statement-breakpoint
CREATE TABLE public.verification_capabilities (
  digest text PRIMARY KEY CHECK (digest ~ '^[a-f0-9]{64}$'),
  run_id text NOT NULL,
  member_id text NOT NULL,
  created_at bigint NOT NULL CHECK (created_at BETWEEN 0 AND 9007199254740991),
  expires_at bigint NOT NULL CHECK (expires_at > created_at AND expires_at <= created_at+300000 AND expires_at <= 9007199254740991),
  consumed_at bigint CHECK (consumed_at >= created_at AND consumed_at <= expires_at),
  FOREIGN KEY (member_id,run_id) REFERENCES public.app_users(id,verification_run_id) ON DELETE RESTRICT
);
--> statement-breakpoint
CREATE TABLE public.verification_sessions (
  digest text PRIMARY KEY CHECK (digest ~ '^[a-f0-9]{64}$'),
  run_id text NOT NULL,
  member_id text NOT NULL,
  created_at bigint NOT NULL CHECK (created_at BETWEEN 0 AND 9007199254740991),
  expires_at bigint NOT NULL CHECK (expires_at > created_at AND expires_at <= created_at+900000 AND expires_at <= 9007199254740991),
  revoked_at bigint CHECK (revoked_at >= created_at AND revoked_at <= 9007199254740991),
  FOREIGN KEY (member_id,run_id) REFERENCES public.app_users(id,verification_run_id) ON DELETE RESTRICT
);
--> statement-breakpoint
CREATE TABLE public.verification_throttles (
  bucket text PRIMARY KEY CHECK (length(bucket) BETWEEN 1 AND 250),
  window_start bigint NOT NULL CHECK (window_start BETWEEN 0 AND 9007199254740991),
  attempts integer NOT NULL CHECK (attempts BETWEEN 1 AND 1000000)
);
--> statement-breakpoint
-- Existing explicit migration tooling binds only the reviewed mp_runtime role.
-- Revoke broad ACLs before applying the final column-grant profile atomically.
REVOKE INSERT, UPDATE ON public.families, public.app_users FROM mp_runtime;
