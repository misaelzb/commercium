import z from "zod";
import { Drizzle } from "../../../shared/drizzle";
import { productsTable } from "./products.sql";
import { and, eq } from "drizzle-orm";
import type { DBQueryResponse } from "../..";

export namespace Products {
  export const ProductSchema = z.object({
    id: z.number(),
    sku: z.string().min(3).max(255),
    description: z.string().min(3).max(255),
    costPrice: z.number(),
    salePrice: z.number(),
    storeId: z.number(),
    stock: z.number().default(0),
    isActive: z.boolean().default(true),
  });

  export type ProductType = z.infer<typeof ProductSchema>;

  export const ProductCreateSchema = ProductSchema.omit({
    id: true,
    storeId: true,
  });
  export const ProductUpdateSchema = ProductCreateSchema.partial().refine(
    (data) => Object.keys(data).length > 0,
    { error: "At least one field must be provided", path: ["data"] }
  );

  export type ProductCreateType = z.infer<typeof ProductCreateSchema>;

  export const create = async (
    storeId: number,
    data: z.infer<typeof ProductCreateSchema>
  ): Promise<DBQueryResponse> => {
    let existingProduct = await fetch(storeId, data.sku);
    if (existingProduct) {
      return {
        success: false,
        errorDetail: "SKU is already in use by another product",
      };
    }

    await Drizzle.db
      .insert(productsTable)
      .values({
        ...data,
        storeId,
        costPrice: data.costPrice.toFixed(2),
        salePrice: data.salePrice.toFixed(2),
      })
      .$returningId();

    return { success: true, data: await fetch(storeId, data.sku) };
  };

  export const fetch = async (
    storeId: number,
    sku: string
  ): Promise<typeof productsTable.$inferSelect | null> => {
    let [product] = await Drizzle.db
      .select()
      .from(productsTable)
      .where(
        and(eq(productsTable.sku, sku), eq(productsTable.storeId, storeId))
      );

    return product ?? null;
  };

  export const update = async (
    storeId: number,
    originalSku: string,
    data: z.infer<typeof ProductUpdateSchema>
  ): Promise<DBQueryResponse> => {
    const product = await fetch(storeId, originalSku);

    if (!product) {
      return { success: false, errorDetail: "Product not found" };
    }

    if (data.sku && data.sku !== product.sku) {
      const existingProduct = await fetch(storeId, data.sku);

      if (existingProduct) {
        return {
          success: false,
          errorDetail: "SKU is already in use by another product",
        };
      }
    }

    const updatePayload: Record<string, any> = {};

    if (data.costPrice !== undefined) {
      updatePayload.costPrice = data.costPrice.toFixed(2);
    }
    if (data.salePrice !== undefined) {
      updatePayload.salePrice = data.salePrice.toFixed(2);
    }

    if (data.sku !== undefined) updatePayload.sku = data.sku;
    if (data.description !== undefined)
      updatePayload.description = data.description;
    if (data.stock !== undefined) updatePayload.stock = data.stock;
    if (data.isActive !== undefined) updatePayload.isActive = data.isActive;
    updatePayload.updatedAt = new Date();

    await Drizzle.db
      .update(productsTable)
      .set(updatePayload)
      .where(eq(productsTable.id, product.id));

    let updatedProduct = await fetch(storeId, data.sku ?? originalSku);

    return { success: true, data: updatedProduct };
  };

  export const listAll = async (
    storeId: number
  ): Promise<(typeof productsTable.$inferSelect)[]> => {
    let products = await Drizzle.db
      .select()
      .from(productsTable)
      .where(eq(productsTable.storeId, storeId));
    return products;
  };

  export const remove = async (
    storeId: number,
    sku: string
  ): Promise<DBQueryResponse> => {
    let product = await fetch(storeId, sku);
    if (!product) return { success: false, errorDetail: "Product not found" };

    await Drizzle.db
      .delete(productsTable)
      .where(eq(productsTable.id, product.id));
    return { success: true, data: "OK" };
  };
}
