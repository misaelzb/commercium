import { int, mysqlTable, timestamp, varchar } from "drizzle-orm/mysql-core";
import { userTable } from "../users/users.sql";


export const storeTable = mysqlTable("stores", {
    id: int("id").primaryKey().autoincrement(),
    name: varchar("name", { length: 255 }).notNull(),
    description: varchar("description", { length: 255 }),

    ownerId: int("owner_id").notNull().references(() => userTable.id),

    logoURL: varchar("logo_url", { length: 255 }), // TODO: Implement logo upload
    createdAt: timestamp("created_at").defaultNow()
})