CREATE TABLE `ticket_events` (
	`id` text PRIMARY KEY NOT NULL,
	`ticket_id` text NOT NULL,
	`status` text NOT NULL,
	`response` text NOT NULL,
	`actor` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`ticket_id`) REFERENCES `tickets`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `tickets` (
	`id` text PRIMARY KEY NOT NULL,
	`token_hash` text NOT NULL,
	`type` text NOT NULL,
	`subject` text NOT NULL,
	`message` text NOT NULL,
	`email` text NOT NULL,
	`context` text NOT NULL,
	`attachment` text,
	`status` text DEFAULT 'received' NOT NULL,
	`assignee` text DEFAULT '' NOT NULL,
	`response` text DEFAULT '' NOT NULL,
	`note` text DEFAULT '' NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`client_hash` text NOT NULL,
	`version` integer DEFAULT 1 NOT NULL
);
