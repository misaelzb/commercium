import { int, mysqlTable, timestamp, varchar } from "drizzle-orm/mysql-core";
import { userTable } from "../users/users.sql";


export const sessionsTable = mysqlTable("sessions", {
    token: varchar("token", { length: 255 }).primaryKey(),
    userId: int("user_id").notNull().references(() => userTable.id),
    expires: timestamp("expires").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow()
})