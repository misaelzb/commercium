import { int, mysqlTable, timestamp, varchar } from "drizzle-orm/mysql-core";


export const userTable = mysqlTable("users", {
    id: int("id").primaryKey().autoincrement(),

    firstName: varchar("first_name", { length: 25 }).notNull(),
    lastName: varchar("last_name", { length: 25 }).notNull(),
    username: varchar("username", { length: 25 }).notNull().unique(),
    hashedPassword: varchar("hashed_password", { length: 255 }).notNull(),

    createdAt: timestamp("created_at").defaultNow()
});


export type UserTableType = typeof userTable.$inferSelect