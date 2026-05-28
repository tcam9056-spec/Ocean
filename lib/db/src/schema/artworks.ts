import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { shelvesTable } from "./shelves";

export const artworksTable = pgTable("artworks", {
  id: serial("id").primaryKey(),
  shelfId: integer("shelf_id").notNull().references(() => shelvesTable.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description").notNull().default(""),
  link: text("link").notNull(),
  likesCount: integer("likes_count").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
