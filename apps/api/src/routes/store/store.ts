import { Hono } from "hono";
import { type AuthContext, authMiddleware } from "../../middlewares";
import { describeRoute, resolver } from "hono-openapi";
import { zValidator } from "@hono/zod-validator";
import { HttpResponse, HttpStatus, Store } from "@commercium/core";
import type { StatusCode } from "hono/utils/http-status";
import { AuthHeaderParameter, ErrorResponses, handleInvalidBody, StoreIdParameter } from "../../util";
import z from "zod";


export const storeRoutes = new Hono<AuthContext>()
    .use("*", authMiddleware)
    .post("/create",
        describeRoute({
            tags: ['Store'],
            description: "Create a new store (authorization header required)",
            responses: {
                201: {
                    description: "Store created",
                    content: {
                        'application/json': {
                            schema: resolver(z.object({
                                data: Store.StoreSchema
                            }))
                        }
                    }
                },
                400: ErrorResponses[400]
            },
            parameters: [AuthHeaderParameter]
        }),
        zValidator("json", Store.StoreCreateSchema, (result, c) => {
            if (!result.success) return handleInvalidBody(result.error, c);
        }),
        async (c) => {
            const body = await c.req.json();
            const currentUser = c.get("currentUser");
            let response = await Store.create(currentUser.id, body);

            c.status(HttpStatus.CREATED as StatusCode);
            return c.json(HttpResponse.success(response.data))
        })
    .get("/list", 
        describeRoute({
            tags: ['Store'],
            description: "List all stores owned by logged user",
            parameters: [AuthHeaderParameter],
            responses: {
                200: {
                    description: "Stores found",
                    content: {
                        "application/json": {
                            schema: resolver(z.object({
                                data: z.array(Store.StoreSchema)
                            }))
                        }
                    }
                }
            }
        }), async (c) => {
            let currentUser = c.get("currentUser");
            let stores = await Store.listAll(currentUser.id);

            return c.json(HttpResponse.success(stores));
        })
    .get("/:id",
        describeRoute({
            tags: ['Store'],
            description: "Get a store by ID (authorization header required)",
            parameters: [AuthHeaderParameter, StoreIdParameter],
            responses: {
                200: {
                    description: "Store found",
                    content: {
                        "application/json": {
                            schema: resolver(z.object({
                                data: Store.StoreSchema
                            }))
                        }
                    }
                },
                404: ErrorResponses[404]
            }
        }), async (c) => {
            let id = c.req.param("id");
            let store = await Store.fetch(parseInt(id));

            if (!store || store.ownerId !== c.get("currentUser").id) {
                c.status(404);
                return c.json(HttpResponse.notFound())
            }

            c.status(HttpStatus.OK as StatusCode);
            return c.json(HttpResponse.success(store));
        })