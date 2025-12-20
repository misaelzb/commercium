import z from "zod";
import { Drizzle } from "../../shared/drizzle";
import { storeTable } from "./store.sql";
import { eq } from "drizzle-orm";
import type { DBQueryResponse } from "..";
import { productsTable } from "./products/products.sql";

export namespace Store {
  export const StoreSchema = z.object({
    id: z.number(),
    name: z.string().min(3).max(35),
    description: z.string().min(3).max(50).optional().nullable().default(null),
    // logoURL: z.url().optional()
    ownerId: z.number(),
    createdAt: z.iso.datetime().default(() => new Date().toISOString()),
  });

  export type StoreType = z.infer<typeof StoreSchema>;
  export type StoreTableType = typeof storeTable.$inferSelect;
  export const StoreCreateSchema = StoreSchema.omit({
    id: true,
    ownerId: true,
    createdAt: true,
  });

  export type StoreCreateType = z.infer<typeof StoreCreateSchema>;

  export const create = async (
    userId: number,
    data: StoreCreateType
  ): Promise<DBQueryResponse<StoreType>> => {
    let [cData] = await Drizzle.db
      .insert(storeTable)
      .values({
        ...data,
        description: data.description ?? "No description provided",
        ownerId: userId,
      })
      .$returningId();

    let store = await fetch(cData?.id!);

    return { success: true, data: store! };
  };
  export const parse = (data: StoreTableType): StoreType => {
    return StoreSchema.parse({
      ...data,
      createdAt: new Date(data.createdAt!.toString()).toISOString(),
    });
  };

  export const fetch = async (id: number): Promise<StoreType | null> => {
    let [store] = await Drizzle.db
      .select()
      .from(storeTable)
      .where(eq(storeTable.id, id));

    return store ? parse(store) : null;
  };

  export const listAll = async (userId: number): Promise<StoreType[]> => {
    let stores = await Drizzle.db
      .select()
      .from(storeTable)
      .where(eq(storeTable.ownerId, userId));

    return stores.map(parse);
  };

  export const remove = async (
    id: number
  ): Promise<DBQueryResponse<string>> => {
    await Drizzle.db.delete(productsTable).where(eq(productsTable.storeId, id));
    await Drizzle.db.delete(storeTable).where(eq(storeTable.id, id));

    return { success: true, data: "OK" };
  };
}
