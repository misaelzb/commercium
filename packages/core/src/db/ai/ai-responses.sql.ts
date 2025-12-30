import { int, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";
import { storeTable } from "../store/store.sql";


export const aiResponsesTable = mysqlTable("ai_responses", {
  id: int("id").primaryKey().autoincrement(),
  storeId: int("store_id").references(() => storeTable.id, { onDelete: "cascade" }),
  response: text("text").notNull(),
  label: varchar("label", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});