import z from "zod";
import { Drizzle } from "../../../shared/drizzle";
import { productsTable } from "./products.sql";
import { and, eq } from "drizzle-orm";
import type { DBQueryResponse } from "../..";
import { storeTable } from "../store.sql";


export namespace Products {
    export const ProductSchema = z.object({
        id: z.number(),
        sku: z.string().min(3).max(255),
        description: z.string().min(3).max(255),
        costPrice: z.number(),
        salePrice: z.number(),
        storeId: z.number(),
        stock: z.number().default(0),
        isActive: z.boolean().default(true)
    });

    export const ProductCreateSchema = ProductSchema.omit({ id: true, storeId: true, isActive: true });

    export const create = async (storeId: number, data: z.infer<typeof ProductCreateSchema>): Promise<DBQueryResponse> => {

        let existingProduct = await fetch(storeId, data.sku);
        if (existingProduct) {
            return {
                success: false,
                errorDetail: "SKU is already in use by another product"
            }
        }

        await Drizzle.db.insert(productsTable).values({
            ...data,
            storeId,
            costPrice: data.costPrice.toFixed(2),
            salePrice: data.salePrice.toFixed(2)
        }).$returningId();

        return { success: true, data: await fetch(storeId, data.sku) };   
    }

    export const fetch = async (storeId: number, sku: string): Promise<typeof productsTable.$inferSelect | null> => {
        let product = await Drizzle.db.select().from(productsTable).where(
            and(eq(productsTable.sku, sku), eq(productsTable.storeId, storeId))
        );

        return product[0] ?? null;
    }
}