import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { describeRoute } from "hono-openapi";
import { authMiddleware } from "../middlewares/auth";
import type { User } from "@commercium/core";

type AuthContext = {
    Variables: {
        currentUser?: User.InfoType; // Puede no existir debido a que quizás no todas las rutas son restringidas
    };
};
 
export const userRoutes = new Hono<AuthContext>()
    .get("/me", 
        describeRoute({
            
        }),
        authMiddleware,
        async (c) => {
            const user = c.get('currentUser')!;
            return c.json(user);
        }
    )