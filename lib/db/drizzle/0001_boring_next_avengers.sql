CREATE INDEX IF NOT EXISTS "showcase_links_created_at_idx" ON "showcase_links" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "artworks_shelf_id_idx" ON "artworks" USING btree ("shelf_id");
