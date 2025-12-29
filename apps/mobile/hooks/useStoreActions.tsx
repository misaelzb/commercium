import { client } from "@/services";
import { ApiResponse, Products, Sales, Store } from "@commercium/core";
import { ClientResponse } from "hono/client";
import { useState, useCallback } from "react";
import Toast from "react-native-toast-message";

const parseProduct = (p: any): Products.ProductType => ({
  ...p,
  createdAt: new Date(p.createdAt),
  updatedAt: new Date(p.updatedAt),
});

const parseSale = (s: any): Sales.SaleInfo => ({
  ...s,
  createdAt: new Date(s.createdAt),
  details: s.details.map((d: any) => ({
    ...d,
    product: parseProduct(d.product),
  })),
});

const parseAnalytics = (data: any): Sales.AnalyticsReport => {
  return {
    ...data,
    topProducts: data.topProducts.map(parseProduct),
  };
};

export const useStoreActions = (storeId: string) => {
  const [products, setProducts] = useState<Products.ProductType[]>([]);
  const [store, setStore] = useState<Store.StoreType>();
  const [sales, setSales] = useState<Sales.SaleInfo[]>([]);
  const [isActionLoading, setActionLoading] = useState(false);
  const [salesAnalytics, setSalesAnalytics] = useState<Sales.AnalyticsReport>();

  const fetchData = useCallback(
    async (
      options: {
        products?: boolean;
        store?: boolean;
        sales?: boolean;
      } = { products: true, store: true, sales: true }
    ) => {
      setActionLoading(true);
      try {
        const promises = [];

        if (options.store)
          promises.push(
            client.api.stores[":storeId"].$get({ param: { storeId } })
          );
        if (options.products)
          promises.push(
            client.api.stores[":storeId"].products.s.list.$get({
              param: { storeId },
            })
          );
        if (options.sales)
          promises.push(
            client.api.stores[":storeId"].sales.list.$get({
              param: { storeId },
            })
          );

        const responses = await Promise.all(promises);

        let index = 0;
        if (options.store) {
          const res = await responses[index++].json();
          if (res.data) setStore(res.data);
        }
        if (options.products) {
          const res = await responses[index++].json();
          if (res.data) setProducts(res.data.map(parseProduct));
        }
        if (options.sales) {
          const res = await responses[index++].json();
          if (res.data) setSales(res.data.map(parseSale));
        }
      } catch (err) {
        console.error(err);
        Toast.show({
          text1: "Failed to load data",
          type: "error",
        });
      } finally {
        setActionLoading(false);
      }
    },
    [storeId]
  );

  const deleteProduct = async (sku: string) => {
    setActionLoading(true);
    try {
      const res = await client.api.stores[":storeId"].products[":sku"].$delete({
        param: { storeId, sku },
      });

      if (res.ok) {
        setProducts((prev) => prev.filter((p) => p.sku !== sku));
      }
    } catch (err) {
      console.error(err);
      Toast.show({
        text1: "Failed to delete product",
        type: "error",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const deleteStore = async () => {
    setActionLoading(true);
    try {
      const res = await client.api.stores[":storeId"].$delete({
        param: { storeId },
      });

      if (res.ok) {
        Toast.show({
          text1: "Store deleted successfully",
          type: "success",
        });
      }
    } catch (err) {
      console.error(err);
      Toast.show({
        text1: "Failed to delete store",
        type: "error",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    setActionLoading(true);
    try {
      const res = await client.api.stores[":storeId"].sales.analytics.$get({
        param: { storeId },
      });

      const json = await res.json();
      if (json.error) throw json.error;
      setSalesAnalytics(parseAnalytics(json.data));
    } catch (err) {
      console.error(err);
      Toast.show({
        text1: "Failed to load analytics",
        type: "error",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const fetchProduct = async (
    sku: string
  ): Promise<Products.ProductType | null> => {
    try {
      setActionLoading(true);
      const res = await client.api.stores[":storeId"].products[":sku"].$get({
        param: {
          storeId: storeId,
          sku: sku,
        },
      });
      if (res.ok) {
        const json = await res.json();
        setActionLoading(false);
        return parseProduct(json.data);
      }
    } catch (err) {
      Toast.show({
        text1: "Error while fetching product",
        text2: `${err}`,
        type: "error",
      });
      console.error(err);
    } finally {
      setActionLoading(false);
    }
    return null;
  };

  const editProduct = async (
    sku: string,
    data: Products.ProductCreateType
  ) => {
    // for individual error handling if required
    let response = await client.api.stores[":storeId"].products[":sku"].$put({
      json: { ...data },
      param: {
        storeId: storeId,
        sku: sku, // will exist because it's in an 'edit' context
      },
    });
    return response
  };

  const registerSale = async (data: Sales.SaleCreateType): Promise<boolean> => {
    try {
      setActionLoading(true);
      const res = await client.api.stores[":storeId"].sales.create.$post({
        json: data,
        param: { storeId },
      });
      console.log(res);
      if (res.ok) {
        await fetchData({ sales: true });
        await fetchAnalytics();
        return true;
      } else {
        const json = await res.json();
        if (json.error) {
          Toast.show({
            text1: "Failed to register sale",
            text2: `${json.error}`,
            type: "error",
          });
        }
      }
    } catch (err) {
      console.error(err);
      Toast.show({
        text1: "Failed to register sale",
        text2: `${err}`,
        type: "error",
      });
    } finally {
      setActionLoading(false);
    }
    return false;
  };

  const editStore = async (data: Store.StoreCreateType) => {
    setActionLoading(true);
    try {
      const res = await client.api.stores[":storeId"].$put({
        json: data,
        param: { storeId },
      });
      if (res.ok) {
        if (store) setStore((prev) => ({ ...prev!, ...data }));
        Toast.show({
          text1: "Store updated successfully",
          type: "success",
        });
      } else {
        let json = await res.json().catch(() => ({ error: "Unknown error" }));
        Toast.show({
          text1: "Failed to edit store",
          text2: `${json.error}`,
          type: "error",
        });
      }
    } catch (err) {
      console.error(err);
      Toast.show({
        text1: "Failed to edit store",
        type: "error",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const deleteSale = async (id: number) => {
    setActionLoading(true);
    try {
      const res = await client.api.stores[":storeId"].sales[":saleId"].$delete({
        param: { storeId, saleId: id.toString() },
      });
      if (res.ok) {
        setSales((prev) => prev.filter((s) => s.id !== id));
        await fetchAnalytics();
        Toast.show({
          text1: "Sale deleted successfully",
          type: "success",
        });
      }
    } catch (err) {
      console.error(err);
      Toast.show({
        text1: "Failed to delete sale",
        type: "error",
      });
    } finally {
      setActionLoading(false);
    }
  };

  return {
    products,
    store,
    fetchProduct,
    editProduct,
    fetchAnalytics,
    salesAnalytics,
    editStore,
    sales,
    fetchData,
    deleteProduct,
    registerSale,
    isActionLoading,
    deleteStore,
    deleteSale,
  };
};
