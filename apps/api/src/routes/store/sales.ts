import { Hono } from "hono";
import { type StoreContext } from "../../middlewares";
import { storeCheckMiddleware } from "../../middlewares/store";
import { HttpResponse, Sales, Store } from "@commercium/core";
import { describeRoute, resolver } from "hono-openapi";
import { zValidator } from "@hono/zod-validator";
import {
  AuthHeaderParameter,
  ErrorResponses,
  handleInvalidBody,
  StoreIdParameter,
} from "../../util";
import z from "zod";
import { RequestBodyExample, SaleIdParameter } from "../../util/commonData";

export const salesRoutes = new Hono<StoreContext>()
  .use("*", storeCheckMiddleware)
  .get("/list", async (c) => {
    let store = c.get("store");
    let sales = await Sales.listAll(store.id);

    return c.json(HttpResponse.success(sales));
  })
  .post(
    "/create",
    describeRoute({
      tags: ["Sales"],
      description: "Create a new sale",
      responses: {
        201: {
          description: "Sale created",
          content: {
            "application/json": {
              schema: resolver(
                z.object({
                  data: z.object({ id: z.number() }),
                })
              ),
            },
          },
        },
        400: ErrorResponses[400],
      },
      parameters: [AuthHeaderParameter, StoreIdParameter],
      requestBody: {
        content: {
          "application/json": {
            schema: {
              example: RequestBodyExample.SaleData,
            }
          },
        },
      },
    }),
    zValidator("json", Sales.SaleCreateSchema, (result, c) => {
      if (!result.success) return handleInvalidBody(result.error, c);
    }),
    async (c) => {
      let store = c.get("store");
      let body = c.req.valid("json");

      let response = await Sales.create({
        storeId: store.id,
        label: body.label,
        details: body.details.map((detail: Sales.SaleDetailCreateType) => ({
          productId: detail.productId,
          quantity: detail.quantity,
          unitPrice: detail.unitPrice,
        })),
      });
      if (!response.success) {
        c.status(400);
        return c.json(HttpResponse.error(response.errorDetail!));
      }
      return c.json(HttpResponse.success(response.data));
    }
  )
  .get(
    "/list",
    describeRoute({
      tags: ["Sales"],
      description: "List all sales in a store",
      parameters: [AuthHeaderParameter, StoreIdParameter],
      responses: {
        200: {
          description: "Sales found",
          content: {
            "application/json": {
              schema: resolver(
                z.object({
                  data: z.array(Sales.SaleInfoSchema),
                })
              ),
            },
          },
        },
      },
    }),
    async (c) => {
      let store = c.get("store");
      let dat = await Sales.listAll(store.id);

      return c.json(HttpResponse.success(dat));
    }
  )
  .get(
    "/analytics",
    describeRoute({
      tags: ["Sales"],
      description: "Get sales analytics in a store",
      parameters: [AuthHeaderParameter, StoreIdParameter],
      responses: {
        200: {
          description: "Analytics found",
          content: {
            "application/json": {
              schema: resolver(
                z.object({
                  data: Sales.AnalyticsReportSchema,
                })
              ),
            },
          },
        },
      },
    }),
    async (c) => {
      let store = c.get("store");
      let report = await Sales.generateAnalyticsReport(store.id);

      return c.json(HttpResponse.success(report));
    }
  )
  .get(
    "/:saleId",
    describeRoute({
      tags: ["Sales"],
      description: "Get a sale by ID",
      parameters: [
        AuthHeaderParameter,
        StoreIdParameter,
        SaleIdParameter,
      ],
      responses: {
        200: {
          description: "Sale found",
          content: {
            "application/json": {
              schema: resolver(
                z.object({
                  data: Sales.SaleInfoSchema,
                })
              ),
            },
          },
        },
        404: ErrorResponses[404],
      },
    }),
    async (c) => {
      let store = c.get("store");
      let id = c.req.param("saleId");
      let sale = await Sales.fetch(store.id, parseInt(id));

      if (!sale) {
        c.status(404);
        return c.json(HttpResponse.notFound());
      }

      return c.json(HttpResponse.success(sale));
    }
  )
  .delete(
    "/:saleId",
    describeRoute({
      tags: ["Sales"],
      description: "Delete a sale by ID",
      parameters: [
        AuthHeaderParameter,
        StoreIdParameter,
        SaleIdParameter
      ],
      responses: {
        200: {
          description: "Sale deleted",
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
        404: ErrorResponses[404],
      },
    }),
    async (c) => {
      let store = c.get("store");
      let id = c.req.param("saleId");

      let res = await Sales.remove(store.id, parseInt(id));
      if (!res.success) {
        c.status(404);
        return c.json(HttpResponse.notFound());
      }

      return c.json(HttpResponse.success("OK"))
    }
  );
