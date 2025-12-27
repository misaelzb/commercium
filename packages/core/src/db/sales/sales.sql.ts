import { decimal, int, mysqlTable, timestamp, varchar } from "drizzle-orm/mysql-core";
import { storeTable } from "../store/store.sql";
import { productsTable } from "../store/products/products.sql";


export const salesTable = mysqlTable("sales", {
  id: int("id").primaryKey().autoincrement(),
  storeId: int("store_id")
    .notNull()
    .references(() => storeTable.id, { onDelete: "cascade" }),

  label: varchar("label", { length: 255 }),
  total: decimal("total", { precision: 15, scale: 2 }).notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const saleDetailsTable = mysqlTable("sale_details", {
  id: int("id").primaryKey().autoincrement(),
  saleId: int("sale_id")
    .notNull()
    .references(() => salesTable.id),
  productId: int("product_id")
    .notNull()
    .references(() => productsTable.id, { onDelete: "cascade" }),

  quantity: int("quantity").notNull(),
  unitPrice: decimal("price", { precision: 15, scale: 2 }).notNull(), // unit price at moment of creation
});