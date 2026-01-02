import { Hono } from "hono";
import { authMiddleware, type StoreContext } from "../../middlewares";
import { describeRoute, resolver } from "hono-openapi";
import { zValidator } from "@hono/zod-validator";
import {
  HttpResponse,
  HttpStatus,
  Sales,
  Store,
  AiClient,
  Ai,
} from "@commercium/core";
import type { StatusCode } from "hono/utils/http-status";
import {
  AuthHeaderParameter,
  ErrorResponses,
  handleInvalidBody,
  StoreIdParameter,
} from "../../util";
import z from "zod";
import { productRoutes } from "./products";
import { salesRoutes } from "./sales";
import { storeCheckMiddleware } from "../../middlewares/store";
import { RequestBodyExample } from "../../util/commonData";

export const storeRoutes = new Hono<StoreContext>()
  .use("*", authMiddleware)
  .post(
    "/create",
    describeRoute({
      tags: ["Store"],
      description: "Create a new store (authorization header required)",
      responses: {
        201: {
          description: "Store created",
          content: {
            "application/json": {
              schema: resolver(
                z.object({
                  data: Store.StoreSchema,
                })
              ),
            },
          },
        },
        400: ErrorResponses[400],
      },
      parameters: [AuthHeaderParameter],
      requestBody: {
        content: {
          "application/json": {
            schema: {
              example: RequestBodyExample.StoreData,
            },
          },
        },
      }
    }),
    zValidator("json", Store.StoreCreateSchema, (result, c) => {
      if (!result.success) return handleInvalidBody(result.error, c);
    }),
    async (c) => {
      const body = await c.req.json();
      const currentUser = c.get("currentUser");
      let response = await Store.create(currentUser.id, body);

      c.status(HttpStatus.CREATED as StatusCode);
      return c.json(HttpResponse.success(response.data));
    }
  )
  .get(
    "/list",
    describeRoute({
      tags: ["Store"],
      description: "List all stores owned by logged user",
      parameters: [AuthHeaderParameter],
      responses: {
        200: {
          description: "Stores found",
          content: {
            "application/json": {
              schema: resolver(
                z.object({
                  data: z.array(Store.StoreSchema),
                })
              ),
            },
          },
        },
      },
    }),
    async (c) => {
      let currentUser = c.get("currentUser");
      let stores = await Store.listAll(currentUser.id);

      return c.json(HttpResponse.success<Store.StoreType[]>(stores));
    }
  )
  .get(
    "/:storeId",
    describeRoute({
      tags: ["Store"],
      description: "Get a store by ID (authorization header required)",
      parameters: [AuthHeaderParameter, StoreIdParameter],
      responses: {
        200: {
          description: "Store found",
          content: {
            "application/json": {
              schema: resolver(
                z.object({
                  data: Store.StoreSchema,
                })
              ),
            },
          },
        },
        404: ErrorResponses[404],
      },
    }),
    async (c) => {
      let id = c.req.param("storeId");
      let store = await Store.fetch(parseInt(id));

      if (!store || store.ownerId !== c.get("currentUser").id) {
        c.status(404);
        return c.json(HttpResponse.notFound());
      }

      c.status(HttpStatus.OK as StatusCode);
      return c.json(HttpResponse.success(store));
    }
  )
  .delete(
    "/:storeId",
    storeCheckMiddleware,
    describeRoute({
      tags: ["Store"],
      description: "Delete a store",
      parameters: [AuthHeaderParameter, StoreIdParameter],
    }),
    async (c) => {
      let id = c.req.param("storeId");
      let store = await Store.fetch(parseInt(id));
      if (!store) {
        c.status(404);
        return c.json(HttpResponse.notFound());
      }
      if (store.ownerId !== c.get("currentUser").id) {
        c.status(403);
        return c.json(
          HttpResponse.error("You are not the owner of this store")
        );
      }

      await Store.remove(parseInt(id));
      return c.json(HttpResponse.success("OK"));
    }
  )
  .put(
    "/:storeId",
    describeRoute({
      tags: ["Store"],
      description: "Update a store",
      parameters: [AuthHeaderParameter, StoreIdParameter],
      responses: {
        200: {
          description: "Store updated",
          content: {
            "application/json": {
              schema: resolver(
                z.object({
                  data: z.string("OK"),
                })
              ),
            },
          },
        },
        400: ErrorResponses[400],
      },
      requestBody: {
        content: {
          "application/json": {
            schema: {
              example: RequestBodyExample.StoreData,
            },
          },
        },
      }
    }),
    storeCheckMiddleware,
    zValidator("json", Store.StoreCreateSchema, (result, c) => {
      if (!result.success) return handleInvalidBody(result.error, c);
    }),
    async (c) => {
      await Store.update(parseInt(c.req.param("storeId")), c.req.valid("json"));
      return c.json(HttpResponse.success("OK"));
    }
  )
  .get(
    "/:storeId/ai/suggestions/generate",
    storeCheckMiddleware,
    describeRoute({
      tags: ["Store"],
      description: "Generate AI suggestions for a store",
      parameters: [AuthHeaderParameter, StoreIdParameter],
      responses: {
        200: {
          description: "Suggestions generated",
          content: {
            "application/json": {
              schema: resolver(
                z.object({
                  data: Ai.AiGeneratedDataSchema,
                })
              ),
            },
          },
        },
        500: ErrorResponses[500],
      },
    }),
    async (c) => {
      const store = c.get("store");

      let analytics = await Sales.generateAnalyticsReport(store.id);
      try {
        let aiResponse = await AiClient.generateStoreSuggestions(
          store,
          analytics
        );
        await Ai.saveAiSuggestions(store.id, aiResponse);
        return c.json(
          HttpResponse.success<Ai.AiGeneratedData>({
            response: aiResponse,
            isFromDb: false,
            createdAt: new Date(),
            label: "suggestions",
          })
        );
      } catch (e: any) {
        c.status(500);
        return c.json(HttpResponse.error(`${e?.message || e?.error?.message || e || "Unknown error"}`));
      }
    }
  )
  .get(
    "/:storeId/ai/suggestions/get",
    storeCheckMiddleware,
    describeRoute({
      tags: ["Store"],
      description: "Get a previously generated AI suggestion for a store",
      parameters: [AuthHeaderParameter, StoreIdParameter],
      responses: {
        200: {
          description: "Previous AI suggestions response found",
          content: {
            "application/json": {
              schema: resolver(
                z.object({
                  data: Ai.AiGeneratedDataSchema,
                })
              ),
            },
          },
        },
        404: ErrorResponses[404],
      },
    }),
    async (c) => {
      const store = c.get("store");
      let data = await Ai.fetchLastSuggestions(store.id);
      if (!data) {
        c.status(404);
        return c.json(HttpResponse.notFound());
      }
      return c.json(HttpResponse.success<Ai.AiGeneratedData>(data));
    }
  )
  .route("/:storeId/products", productRoutes)
  .route("/:storeId/sales", salesRoutes);
