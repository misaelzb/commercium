import { Hono } from "hono";
import { describeRoute, resolver } from "hono-openapi";
import { authMiddleware, type AuthContext } from "../middlewares";
import { HttpResponse, User } from "@commercium/core";
import { AuthHeaderParameter } from "../util";
import z from "zod";

export const userRoutes = new Hono<AuthContext>().get(
  "/me",
  describeRoute({
    tags: ["Authorization"],
    parameters: [AuthHeaderParameter],
    responses: {
      200: {
        description: "Successful response",
        content: {
          "application/json": {
            schema: resolver(
              z.object({
                data: User.InfoSchema,
              })
            ),
          },
        },
      },
    },
  }),
  authMiddleware,
  async (c) => {
    const user = c.get("currentUser");
    return c.json(HttpResponse.success(user));
  }
);
