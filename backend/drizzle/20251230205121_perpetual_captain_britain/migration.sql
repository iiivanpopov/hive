CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`name` text,
	`username` text NOT NULL UNIQUE,
	`email` text NOT NULL UNIQUE,
	`email_confirmed` integer DEFAULT 0 NOT NULL,
	`password_hash` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL
);
