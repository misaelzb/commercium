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
  401: {
    description: "Unauthorized",
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
  500: {
    description: "Internal server error",
    content: {
      "application/json": {
        schema: resolver(
          z.object({
            error: z.string(),
          })
        ),
        example: {
          error: "Internal server error",
        },
      },
    },
  },
};

export const RequestBodyExample = {
  StoreData: {
    name: "My store",
    description: "My store description",
  },
  ProductData: {
    description: "My product description",
    sku: "MY-PROD-9991234",
    costPrice: 10.0,
    salePrice: 15.0,
    stock: 10,
  },

  SaleData: {
    storeId: 1,
    label: "My Sale",
    details: [
      {
        productId: 1,
        quantity: 1,
        unitPrice: 10.0,
      },
    ],
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

export const SaleIdParameter: any = {
  name: "saleId",
  in: "path",
  description: "ID of the sale",
  required: true,
  schema: {
    type: "number",
    example: 1,
  },
};
