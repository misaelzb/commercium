import {
  boolean,
  decimal,
  int,
  mysqlTable,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";
import { storeTable } from "../store.sql";

export const productsTable = mysqlTable("products", {
  id: int("id").primaryKey().autoincrement(),
  sku: varchar("sku", { length: 255 }).unique().notNull(), // Bar code
  description: varchar("description", { length: 255 }).notNull(),

  costPrice: decimal("cost_price", { precision: 15, scale: 2 }).notNull(),
  salePrice: decimal("sale_price", { precision: 15, scale: 2 }).notNull(),

  stock: int("stock").notNull().default(0),

  storeId: int("store_id")
    .notNull()
    .references(() => storeTable.id),

  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
