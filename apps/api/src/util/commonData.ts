import { resolver } from "hono-openapi";
import { z } from "zod";
export const ErrorResponses = {
  400: {
    description: "Bad request",
    content: {
      "application/json": {
        schema: resolver(
          z.object({
            error: z.string(),
          })
        ),
        example: {
          error: "username: Invalid input: expected string, received undefined",
        },
      },
    },
  },
  404: {
    description: "Not found",
    content: {
      "application/json": {
        schema: resolver(
          z.object({
            error: z.string(),
          })
        ),
        example: {
          error: "Not found",
        },
      },
    },
  },
};

export const AuthHeaderParameter: any = {
  // ParameterObject
  name: "Authorization",
  in: "header",
  description: "Authorization token",
  required: true,
  schema: {
    type: "string",
    example: "Bearer <token>",
  },
};

export const StoreIdParameter: any = {
  name: "storeId",
  in: "path",
  description: "ID of the store",
  required: true,
  schema: {
    type: "integer",
  },
};

export const ProductSKUParameter: any = {
  name: "sku",
  in: "path",
  description: "SKU of the product",
  required: true,
  schema: {
    type: "string",
  },
};
