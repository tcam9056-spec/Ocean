import { pgTable, text, serial, integer, timestamp, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const showcaseLinksTable = pgTable("showcase_links", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  url: text("url").notNull(),
  likesCount: integer("likes_count").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  index("showcase_links_created_at_idx").on(t.createdAt),
]);

export const insertShowcaseLinkSchema = createInsertSchema(showcaseLinksTable).omit({
  id: true,
  likesCount: true,
  createdAt: true,
});

export type InsertShowcaseLink = z.infer<typeof insertShowcaseLinkSchema>;
export type ShowcaseLink = typeof showcaseLinksTable.$inferSelect;
