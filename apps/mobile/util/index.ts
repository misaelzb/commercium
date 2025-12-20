import { Products } from "@commercium/core";

export type ProductInputData = Omit<
  Products.ProductType,
  "costPrice" | "salePrice" | "stock"
> & {
  costPrice: string;
  salePrice: string;
  stock: string;
};

export const productFormApiParse = (
  data: ProductInputData
): Products.ProductCreateType => ({
  ...data,
  costPrice: Number(data.costPrice),
  salePrice: Number(data.salePrice),
  stock: Number(data.stock),
});

export const productDataAsForm = (
  data: Products.ProductType
): ProductInputData => ({
  ...data,
  costPrice: data.costPrice.toString(),
  salePrice: data.salePrice.toString(),
  stock: data.stock.toString(),
});
