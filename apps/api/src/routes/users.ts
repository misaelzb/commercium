import { Hono } from "hono";
import { describeRoute } from "hono-openapi";
import { authMiddleware, type AuthContext } from "../middlewares";


 
export const userRoutes = new Hono<AuthContext>()
    .get("/me", 
        describeRoute({
            tags: ["Authorization"]
        }),
        authMiddleware,
        async (c) => {
            const user = c.get('currentUser');
            return c.json(user);
        }
    )