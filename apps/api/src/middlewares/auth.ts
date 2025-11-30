import { HttpResponse, Session } from "@commercium/core";
import { createMiddleware } from "hono/factory";


export const authMiddleware = createMiddleware(async (c, next) => {
    const authHeader = c.req.header("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        c.status(401);
        return c.json(HttpResponse.error("Unauthorized"))
    } 

    const token = authHeader.split(" ")[1] as string;
    const sessionUser = await Session.getUser(token);
    
    if (!sessionUser) {
        c.status(401);
        return c.json(HttpResponse.error("Unauthorized"))
    } 

    c.set('currentUser', sessionUser);
    await next();
});