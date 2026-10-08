CREATE TABLE `login_attempts` (
	`key` text PRIMARY KEY NOT NULL,
	`count` integer NOT NULL,
	`expires_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `sessions` (
	`token_hash` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`expires_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_sessions_email` ON `sessions` (`email`);--> statement-breakpoint
ALTER TABLE `staff` ADD `username` text;--> statement-breakpoint
ALTER TABLE `staff` ADD `password_hash` text;--> statement-breakpoint
ALTER TABLE `staff` ADD `password_salt` text;--> statement-breakpoint
ALTER TABLE `staff` ADD `must_change` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX `idx_staff_username` ON `staff` (`username`);