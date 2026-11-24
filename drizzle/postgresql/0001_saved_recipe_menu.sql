CREATE TABLE "menu_recipes" (
  "id" text PRIMARY KEY NOT NULL,
  "family_id" text NOT NULL,
  "source_url" text NOT NULL,
  "image_url" text,
  "title" text NOT NULL,
  "summary" text NOT NULL,
  "time_kind" text,
  "time_text" text,
  "saved_at" bigint NOT NULL,
  FOREIGN KEY ("family_id") REFERENCES "families"("id") ON UPDATE no action ON DELETE restrict,
  CONSTRAINT "menu_source_bound" CHECK (octet_length("source_url") >= 1 AND octet_length("source_url") <= 2048 AND "source_url" = trim("source_url")),
  CONSTRAINT "menu_image_bound" CHECK ("image_url" IS NULL OR (octet_length("image_url") >= 1 AND octet_length("image_url") <= 2048 AND "image_url" = trim("image_url"))),
  CONSTRAINT "menu_title_bound" CHECK (length("title") >= 1 AND length("title") <= 160 AND "title" = trim("title")),
  CONSTRAINT "menu_summary_bound" CHECK (length("summary") >= 1 AND length("summary") <= 600 AND "summary" = trim("summary")),
  CONSTRAINT "menu_time_pair" CHECK (("time_kind" IS NULL AND "time_text" IS NULL) OR ("time_kind" IS NOT NULL AND "time_kind" IN ('cook', 'total') AND "time_text" IS NOT NULL AND length("time_text") BETWEEN 1 AND 80 AND "time_text" = trim("time_text"))),
  CONSTRAINT "menu_saved_at_safe" CHECK ("saved_at" BETWEEN 0 AND 9007199254740991)
);
--> statement-breakpoint
CREATE UNIQUE INDEX "menu_family_source_unique" ON "menu_recipes" ("family_id", "source_url");
--> statement-breakpoint
CREATE INDEX "menu_family_saved" ON "menu_recipes" ("family_id", "saved_at" DESC, "id" DESC);
