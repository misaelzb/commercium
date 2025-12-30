import { zValidator } from "@hono/zod-validator";
import type { StatusCode } from "hono/utils/http-status";
import { HttpResponse, HttpStatus, Session, User } from "@commercium/core";
import { Hono, type Context } from "hono";
import { describeRoute, resolver } from "hono-openapi";
import { AuthHeaderParameter, ErrorResponses } from "../util/commonData";
import { handleInvalidBody } from "../util/validationHandler";
import z from "zod";
import { authMiddleware, type AuthContext } from "../middlewares";

// TODO: Poner ejemplos de responses
// TODO: Mover respuestas sin datos adicionales (datos por defecto como "OK") al util/defaultResponses.ts

export const authRoutes = new Hono()
  .post(
    "/register",
    describeRoute({
      tags: ["Authorization"],
      description: "Register a new user",
      responses: {
        [HttpStatus.CREATED]: {
          description: "Successful response",
          content: {
            "application/json": {
              schema: resolver(
                z.object({
                  data: z.string(),
                })
              ),
            },
          },
        },
        [400]: ErrorResponses[400],
      },
      requestBody: {
        content: {
          "application/json": {
            schema: {
              example: {
                firstName: "John",
                lastName: "Doe",
                username: "johndoe",
                password: "password123",
              },
            },
          },
        },
      }
    }),
    zValidator("json", User.CreateSchema, (result, c) => {
      if (!result.success) return handleInvalidBody(result.error, c);
    }),
    async (c) => {
      const data = c.req.valid("json");
      let response = await User.register(data);
      if (!response.success) {
        c.status(HttpStatus.BAD_REQUEST as StatusCode);
        return c.json(HttpResponse.error(response.errorDetail as string));
      }
      c.status(HttpStatus.CREATED as StatusCode);
      return c.json(HttpResponse.success());
    }
  )
  .post(
    "/login",
    describeRoute({
      tags: ["Authorization"],
      description: "Login to your account",
      responses: {
        [HttpStatus.OK]: {
          description: "Successful login",
          content: {
            "application/json": {
              schema: resolver(
                z.object({
                  data: z.string(),
                })
              ),
              example: {
                data: "0471ab.....dfba53",
              },
            },
          },
        },
      },
      requestBody: {
        content: {
          "application/json": {
            schema: {
              example: {
                username: "johndoe",
                password: "password123",
              },
            },
          },
        },
      },
    }),
    zValidator("json", User.LoginSchema, (result, c) => {
      if (!result.success) return handleInvalidBody(result.error, c);
    }),
    async (c) => {
      const data = c.req.valid("json");
      let response = await User.login(data);
      if (response.success) {
        c.status(HttpStatus.OK as StatusCode);
        return c.json(HttpResponse.success(response.data)); // Envía el token de su sesión
      } else {
        c.status(HttpStatus.BAD_REQUEST as StatusCode);
        return c.json(HttpResponse.error(response.errorDetail as string));
      }
    }
  )
  .get(
    "/logout",
    authMiddleware,
    describeRoute({
      tags: ["Authorization"],
      description: "Logout from your account",
      responses: {
        [HttpStatus.OK]: {
          description: "Successful logout",
          content: {
            "application/json": {
              schema: resolver(
                z.object({
                  data: z.string(),
                })
              ),
              example: {
                data: "OK",
              },
            },
          },
        },
      },
      parameters: [AuthHeaderParameter],
    }),
    async (c: Context<AuthContext>) => {
      let session = c.get("sessionToken");
      await Session.remove(session);

      return c.json(HttpResponse.success());
    }
  );
