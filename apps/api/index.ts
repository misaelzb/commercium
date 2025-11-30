import app from "./src/app"
export type ApiType = typeof app;

export default {
    port: 3001,
    fetch: app.fetch,
} 