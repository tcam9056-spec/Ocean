import { pgTable, text, serial, timestamp } from "drizzle-orm/pg-core";

export const shelvesTable = pgTable("shelves", {
  id: serial("id").primaryKey(),
  shelfName: text("shelf_name").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
