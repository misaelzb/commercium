import { Hono } from "hono";
import { authMiddleware, type StoreContext } from "../../middlewares";
import { HttpResponse, HttpStatus, Products } from "@commercium/core";
import { storeCheckMiddleware } from "../../middlewares/store";
import { describeRoute, resolver } from "hono-openapi";
import { AuthHeaderParameter, ErrorResponses, handleInvalidBody, ProductSKUParameter, StoreIdParameter } from "../../util/";
import z from "zod";
import { zValidator } from "@hono/zod-validator";
import type { StatusCode } from "hono/utils/http-status";

// /api/stores/:id/products
export const productRoutes = new Hono<StoreContext>()
    .use("*", authMiddleware, storeCheckMiddleware)
    .get("/:sku",
        describeRoute({
            tags: ["Products"],
            description: "Get a product by SKU from a store users owns (authorization header required)",
            parameters: [AuthHeaderParameter, ProductSKUParameter, StoreIdParameter],
            responses: {
                200: {
                    description: "Product found",
                    content: {
                        "application/json": {
                            schema: resolver(Products.ProductSchema)
                        }
                    }
                },
                404: ErrorResponses[404]
            }
        }), async (c) => {
            let store = c.get("store");
            let sku = c.req.param("sku");

            // storeCheckMiddleware already checks if current user owns the store.
            let product = await Products.fetch(store.id, sku);
            if (!product) {
                c.status(404);
                return c.json(HttpResponse.notFound())
            }

            return c.json(product);
        })

    .post("/create",
        describeRoute({
            tags: ["Products"],
            description: "Create a new product in a store users owns",
            parameters: [AuthHeaderParameter, StoreIdParameter],
            responses: {
                201: {
                    description: "Product created",
                    content: {
                        "application/json": {
                            schema: resolver(z.object({
                                data: Products.ProductSchema
                            }))
                        }
                    }
                },
                400: ErrorResponses[400]
            }
        }),
        zValidator("json", Products.ProductCreateSchema, (result, c) => {
            if (!result.success) return handleInvalidBody(result.error, c);
        }), async (c) => {
            let store = c.get("store");
            let body = await c.req.json();

            let response = await Products.create(store.id, body);
            if (!response.success) {
                c.status(400);
                return c.json(HttpResponse.error(response.errorDetail!));
            }

            c.status(HttpStatus.CREATED as StatusCode);
            return c.json(HttpResponse.success(response.data))
        }
    );