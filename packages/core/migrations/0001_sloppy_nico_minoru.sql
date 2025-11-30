CREATE TABLE `sessions` (
	`token` varchar(255) NOT NULL,
	`user_id` int NOT NULL,
	`expires` timestamp NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `sessions_token` PRIMARY KEY(`token`)
);
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `first_name` varchar(25) NOT NULL;--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `last_name` varchar(25) NOT NULL;--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `username` varchar(25) NOT NULL;--> statement-breakpoint
ALTER TABLE `sessions` ADD CONSTRAINT `sessions_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;