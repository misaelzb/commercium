import { HttpResponse, Store } from "@commercium/core";
import { createMiddleware } from "hono/factory";


export const storeCheckMiddleware = createMiddleware(async (c, next) => {
    let currentUser = c.get("currentUser");
    if (!currentUser) { // May not happen because authMiddleware must be invoked before storeCheck.
        c.status(401);
        return c.json(HttpResponse.error("Unauthorized"));
    }

    const storeParam = c.req.param("storeId");
    if (!storeParam || isNaN(parseInt(storeParam))) {
        c.status(404);
        return c.json(HttpResponse.error("Store not found"));
    }
    let storeData = await Store.fetch(parseInt(storeParam!));
    if (!storeData) {
        c.status(404);
        return c.json(HttpResponse.error("Store not found"));
    }

    if (storeData.ownerId !== currentUser.id) {
        c.status(403);
        return c.json(HttpResponse.error("Forbidden"));
    }

    c.set('store', storeData);
    await next();
});