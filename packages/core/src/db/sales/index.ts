import z from "zod";
import { Drizzle } from "../../shared/drizzle";
import { saleDetailsTable, salesTable } from "./sales.sql";
import { desc, eq } from "drizzle-orm";
import type { DBQueryResponse } from "..";
import { dateValue } from "../../util/specialTypes";
import { productsTable } from "../store/products/products.sql";
import { Products } from "../store/products";

export namespace Sales {
  export const SaleSchema = z.object({
    id: z.number(),
    storeId: z.number(),
    label: z.string().max(255).optional(),
    total: z.number(),
  });

  export const SaleDetailSchema = z.object({
    id: z.number(),
    saleId: z.number(),
    productId: z.number(),
    quantity: z.number(),
    unitPrice: z.number(),
  });

  export type SaleDetailType = z.infer<typeof SaleDetailSchema>;

  export const SaleDetailCreateSchema = SaleDetailSchema.pick({
    productId: true,
    quantity: true,
    unitPrice: true,
  });

  export const SaleDetailUpdateSchema = SaleDetailCreateSchema.partial();

  export type SaleDetailCreateType = z.infer<typeof SaleDetailCreateSchema>;
  export type SaleDetailUpdateType = z.infer<typeof SaleDetailUpdateSchema>;

  export const SaleCreateSchema = SaleSchema.pick({
    storeId: true,
    label: true,
  })
    .extend({
      details: z.array(SaleDetailCreateSchema),
    }) // total will be handled while creation
    .openapi({
      ref: "SaleCreateObject",
      description: "Data required to create a new sale",
      example: {
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
    });

  export type SaleCreateType = z.infer<typeof SaleCreateSchema>;

  export const create = async (
    data: SaleCreateType
  ): Promise<DBQueryResponse<{ id: number }>> => {
    let total = data.details
      .reduce((prev, curr) => prev + curr.quantity * curr.unitPrice, 0)
      .toFixed(2);
    const [sale] = await Drizzle.db
      .insert(salesTable)
      .values({
        storeId: data.storeId,
        label: data.label,
        total: total,
      })
      .$returningId();
    if (!sale) throw new Error("Failed to create sale");
    await Drizzle.db.insert(saleDetailsTable).values(
      data.details.map((detail) => ({
        saleId: sale.id,
        productId: detail.productId,
        quantity: detail.quantity,
        unitPrice: detail.unitPrice.toFixed(2),
      }))
    );
    return { success: true, data: sale };
  };

  export const SaleListSchema = z.object({
    id: z.number(),
    storeId: z.number(),
    label: z.string().nullable(),
    total: z.number(),
    createdAt: dateValue(),
    details: z.array(
      z.object({
        id: z.number(),
        quantity: z.number(),
        unitPrice: z.string(),
        product: Products.ProductSchema,
      })
    ),
  });

  export type SalesListInfo = {
    id: number;
    storeId: number;
    label: string | null;
    total: string;
    createdAt: Date;
    details: {
      id: number;
      productId: number;
      quantity: number;
      unitPrice: string;
      product: Products.ProductType;
    }[];
  };

  export const listAll = async (storeId: number): Promise<SalesListInfo[]> => {
  const rows = await Drizzle.db
    .select({
      sale: salesTable,
      detail: saleDetailsTable,
      product: productsTable,
    })
    .from(salesTable)
    .where(eq(salesTable.storeId, storeId))
    .leftJoin(saleDetailsTable, eq(salesTable.id, saleDetailsTable.saleId))
    .leftJoin(productsTable, eq(saleDetailsTable.productId, productsTable.id))
    .orderBy(desc(salesTable.createdAt))
    .limit(10);

  const finalSales: SalesListInfo[] = [];

  for (const row of rows) {
    const { sale, detail, product } = row;

    let saleEntry = finalSales.find((s) => s.id === sale.id);

    if (!saleEntry) {
      saleEntry = {
        ...sale,
        details: [],
      };
      finalSales.push(saleEntry);
    }

    if (detail) {
      saleEntry.details.push({
        ...detail,
        product: Products.parse(product),
      });
    }
  }

  return finalSales;
};

  export const AnalyticsReportSchema = z.object({
    period: z.string(),
    totalSales: z.number(),
    totalItems: z.number(),
    revenue: z.number(),
    profit: z.number(),
    averageOrderValue: z.number(),
    topProducts: z.array(
      z.object({
        info: Products.ProductSchema,
        quantity: z.number(),
      })
    ),
  });

  export type AnalyticsReport = z.infer<typeof AnalyticsReportSchema>;

  export const generateAnalyticsReport = async (storeId: number): Promise<AnalyticsReport> => {
    const allSales = await listAll(storeId);

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    let revenue = 0;
    let profit = 0;

    const monthSales = allSales.filter(
      (sale) =>
        sale.createdAt.getMonth() === currentMonth &&
        sale.createdAt.getFullYear() === currentYear
    );

    let totalItems = 0;
    let totalSales = monthSales.length;

    for (const sale of monthSales) {
      for (const detail of sale.details) {
        const saleAmount = detail.quantity * Number(detail.unitPrice);
        const costAmount = detail.product.costPrice * detail.quantity;

        revenue += saleAmount;
        profit += saleAmount - costAmount;
        totalItems += detail.quantity;
      }
    }

    const topProducts = Object.values(
      allSales.reduce(
        (acc, s) => (
          s.details.forEach((d) => {
            acc[d.product.id] ??= { info: d.product, quantity: 0 };
            acc[d.product.id]!.quantity += d.quantity;
          }),
          acc
        ),
        {} as Record<number, { info: Products.ProductType; quantity: number }>
      )
    )
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 3);

    return {
      period: `${currentYear}-${currentMonth + 1}`,
      totalSales,
      totalItems,
      revenue,
      profit,
      averageOrderValue: totalSales ? revenue / totalSales : 0,
      topProducts
    };
  };
}
