import { Products, Store } from "@commercium/core";

export type ProductInputData = Omit<
  Products.ProductType,
  "costPrice" | "salePrice" | "stock" | "description"
> & {
  description: string;
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
  description: data.description || "",
  costPrice: data.costPrice.toString(),
  salePrice: data.salePrice.toString(),
  stock: data.stock.toString(),
});

export const storeDataApiParse = (
  data: any
): Store.StoreType => {
  return {
    ...data,
    createdAt: new Date(data.createdAt),
    updatedAt: new Date(data.updatedAt),
  };
}
