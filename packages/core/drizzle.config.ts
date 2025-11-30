import { defineConfig } from "drizzle-kit";
import { Config } from "./src/shared/config";

export default defineConfig({
    strict: true,
    verbose: true,
    out: "./migrations",
    dialect: "mysql",
    dbCredentials: { url: Config.DATABASE_URL },
    schema: "./src/db/**/*.sql.ts",
});