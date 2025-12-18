import { Hono } from "hono";
import { authMiddleware, type StoreContext } from "../../middlewares";
import { describeRoute, resolver } from "hono-openapi";
import { zValidator } from "@hono/zod-validator";
import { HttpResponse, HttpStatus, Products, Store } from "@commercium/core";
import type { StatusCode } from "hono/utils/http-status";
import { AuthHeaderParameter, ErrorResponses, handleInvalidBody, ProductSKUParameter, StoreIdParameter } from "../../util";
import z from "zod";
import { storeCheckMiddleware } from "../../middlewares/store";


export const storeRoutes = new Hono<StoreContext>()
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

            return c.json(HttpResponse.success<Store.StoreType[]>(stores));
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
    .delete("/:id",
        describeRoute({
            tags: ['Store'],
            description: "Delete a store",
            parameters: [AuthHeaderParameter, StoreIdParameter]
        }), async (c) => {
            let id = c.req.param("id");
            let store = await Store.fetch(parseInt(id));
            if (!store) {
                c.status(404);
                return c.json(HttpResponse.notFound())
            }
            if (store.ownerId !== c.get("currentUser").id) {
                c.status(403);
                return c.json(HttpResponse.error("You are not the owner of this store"))
            }

            await Store.remove(parseInt(id));
            return c.json(HttpResponse.success("OK"))
        }
    )
    // Product related routes.
    .get("/:storeId/products/s/list",
        storeCheckMiddleware,
        describeRoute({
            description: "List all products in a store",
            tags: ["Products"],
            parameters: [AuthHeaderParameter, StoreIdParameter],
            responses: {
                200: {
                    description: "Products found",
                    content: {
                        "application/json": {
                            schema: resolver(z.object({
                                data: z.array(Products.ProductSchema)
                            }))
                        }
                    }
                }
            }
        }), async (c) => {
            let store = c.get("store");
            console.log(store)
            let products = await Products.listAll(store.id);

            return c.json(HttpResponse.success(products));
        })
    .get("/:storeId/products/:sku",
        storeCheckMiddleware,
        describeRoute({
            tags: ["Products"],
            description: "Get a product by SKU from a store users owns",
            parameters: [AuthHeaderParameter, ProductSKUParameter, StoreIdParameter],
            responses: {
                200: {
                    description: "Product found",
                    content: {
                        "application/json": {
                            schema: resolver(z.object({
                                data: Products.ProductSchema
                            }))
                        }
                    }
                },
                404: ErrorResponses[404]
            }
        }), storeCheckMiddleware, async (c) => {
            let store = c.get("store");
            let sku = c.req.param("sku");

            // storeCheckMiddleware already checks if current user owns the store.
            let product = await Products.fetch(store.id, sku);
            if (!product) {
                c.status(404);
                return c.json(HttpResponse.notFound())
            }

            return c.json(HttpResponse.success(product));
        })

    .post("/:storeId/products/create",
        describeRoute({
            tags: ["Products"],
            description: "Create a new product in a store",
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
        }), storeCheckMiddleware,
        zValidator("json", Products.ProductCreateSchema, (result, c) => {
            if (!result.success) return handleInvalidBody(result.error, c);
        }), async (c) => {
            let store = c.get("store");
            let body = c.req.valid("json");

            let response = await Products.create(store.id, body);
            if (!response.success) {
                c.status(400);
                return c.json(HttpResponse.error(response.errorDetail!));
            }

            c.status(HttpStatus.CREATED as StatusCode);
            return c.json(HttpResponse.success(response.data))
        }
    )
    .put("/:storeId/products/:sku",
        describeRoute({
            tags: ["Products"],
            description: "Update a product in a store",
            parameters: [AuthHeaderParameter, ProductSKUParameter, StoreIdParameter],
            responses: {
                200: {
                    description: "Product updated",
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
        }), storeCheckMiddleware,
        zValidator("json", Products.ProductUpdateSchema, (result, c) => {
            if (!result.success) return handleInvalidBody(result.error, c);
        }), async (c) => {
            let store = c.get("store");
            let sku = c.req.param("sku");
            let body = c.req.valid("json")

            let response = await Products.update(store.id, sku, body);
            if (!response.success) {
                c.status(400);
                return c.json(HttpResponse.error(response.errorDetail!));
            }

            return c.json(HttpResponse.success(response.data));
        }
    )
    .delete("/:storeId/products/:sku",
        describeRoute({
            tags: ["Products"],
            description: "Delete a product in a store",
            parameters: [AuthHeaderParameter, StoreIdParameter, ProductSKUParameter],
            responses: {
                200: {
                    description: "Product deleted",
                    content: {
                        "application/json": {
                            schema: resolver(z.object({
                                data: z.literal("OK")
                            }))
                        }
                    }
                },
                400: ErrorResponses[400]
            }
        }), storeCheckMiddleware, async (c) => {
            let store = c.get("store");
            let sku = c.req.param("sku");

            let response = await Products.remove(store.id, sku);
            if (!response.success) {
                c.status(400)
                return c.json(HttpResponse.error(response.errorDetail!))
            }

            return c.json(HttpResponse.success(response.data))
        }
    );