CREATE TABLE `app_users` (
	`id` text PRIMARY KEY NOT NULL,
	`google_subject` text NOT NULL,
	`verified_email` text NOT NULL,
	`family_id` text NOT NULL,
	`created_at` integer NOT NULL,
	`invitation_granted_at` integer,
	FOREIGN KEY (`family_id`) REFERENCES `families`(`id`) ON UPDATE no action ON DELETE restrict,
	CONSTRAINT "subject_nonempty" CHECK(length(trim("app_users"."google_subject")) > 0),
	CONSTRAINT "email_normalized" CHECK("app_users"."verified_email" = lower(trim("app_users"."verified_email")) AND length("app_users"."verified_email") > 0)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `app_users_google_subject_unique` ON `app_users` (`google_subject`);--> statement-breakpoint
CREATE UNIQUE INDEX `app_users_verified_email_unique` ON `app_users` (`verified_email`);--> statement-breakpoint
CREATE INDEX `users_family` ON `app_users` (`family_id`);--> statement-breakpoint
CREATE TABLE `families` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `family_invitations` (
	`id` text PRIMARY KEY NOT NULL,
	`family_id` text NOT NULL,
	`created_by_user_id` text NOT NULL,
	`recipient_email` text NOT NULL,
	`token_hash` text NOT NULL,
	`created_at` integer NOT NULL,
	`expires_at` integer NOT NULL,
	`status` text NOT NULL,
	`accepted_by_user_id` text,
	`accepted_at` integer,
	`revoked_at` integer,
	FOREIGN KEY (`family_id`) REFERENCES `families`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`created_by_user_id`) REFERENCES `app_users`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`accepted_by_user_id`) REFERENCES `app_users`(`id`) ON UPDATE no action ON DELETE restrict,
	CONSTRAINT "invitation_deadline" CHECK("family_invitations"."expires_at" > "family_invitations"."created_at"),
	CONSTRAINT "invitation_state" CHECK((
    ("family_invitations"."status" = 'pending' AND "family_invitations"."accepted_by_user_id" IS NULL AND "family_invitations"."accepted_at" IS NULL AND "family_invitations"."revoked_at" IS NULL) OR
    ("family_invitations"."status" = 'accepted' AND "family_invitations"."accepted_by_user_id" IS NOT NULL AND "family_invitations"."accepted_at" IS NOT NULL AND "family_invitations"."revoked_at" IS NULL) OR
    ("family_invitations"."status" = 'revoked' AND "family_invitations"."accepted_by_user_id" IS NULL AND "family_invitations"."accepted_at" IS NULL AND "family_invitations"."revoked_at" IS NOT NULL)
  ))
);
--> statement-breakpoint
CREATE UNIQUE INDEX `family_invitations_token_hash_unique` ON `family_invitations` (`token_hash`);--> statement-breakpoint
CREATE INDEX `invitations_recipient` ON `family_invitations` (`recipient_email`,`status`,`expires_at`);--> statement-breakpoint
CREATE INDEX `invitations_family` ON `family_invitations` (`family_id`,`created_at`);