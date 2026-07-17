import { pgTable, text, serial, integer, timestamp, index } from "drizzle-orm/pg-core";
import { shelvesTable } from "./shelves";

export const artworksTable = pgTable("artworks", {
  id: serial("id").primaryKey(),
  shelfId: integer("shelf_id").notNull().references(() => shelvesTable.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description").notNull().default(""),
  link: text("link").notNull(),
  plot: text("plot").notNull().default(""),
  likesCount: integer("likes_count").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  index("artworks_shelf_id_idx").on(t.shelfId),
]);
