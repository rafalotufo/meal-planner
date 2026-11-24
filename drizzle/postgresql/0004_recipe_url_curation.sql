CREATE TABLE "menu_recipe_curations" (
  "entry_id" text PRIMARY KEY NOT NULL REFERENCES "menu_recipes"("id") ON DELETE CASCADE,
  "state" text NOT NULL,
  "generation" uuid NOT NULL,
  "scheduled_at" bigint NOT NULL,
  "expires_at" bigint NOT NULL,
  "lease" uuid,
  "google_subject" text NOT NULL,
  "verified_email" text NOT NULL,
  "credential_expires_at" bigint NOT NULL,
  CONSTRAINT "menu_curation_state" CHECK ("state" IN ('pending','processing','ready','failed')),
  CONSTRAINT "menu_curation_lease" CHECK (("state" = 'processing') = ("lease" IS NOT NULL)),
  CONSTRAINT "menu_curation_subject" CHECK (length("google_subject") >= 1 AND length("google_subject") <= 255 AND "google_subject" = btrim("google_subject")),
  CONSTRAINT "menu_curation_email" CHECK (length("verified_email") >= 3 AND length("verified_email") <= 254 AND "verified_email" = lower(btrim("verified_email"))),
  CONSTRAINT "menu_curation_timestamps" CHECK ("scheduled_at" >= 0 AND "scheduled_at" <= 9007199254740991 AND "expires_at" >= "scheduled_at" AND "expires_at" <= "scheduled_at" + 30000 AND "credential_expires_at" >= "expires_at" AND "credential_expires_at" <= 9007199254740991)
);
