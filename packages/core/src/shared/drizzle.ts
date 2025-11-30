import { drizzle } from "drizzle-orm/mysql2";
import { Config } from "./config";


export namespace Drizzle {
    export const db = drizzle(Config.DATABASE_URL);
}