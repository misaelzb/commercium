import {
  CoButton,
  CoIncrementInput,
  CoInput,
  CoLoadingContainer,
  CoText,
} from "@/components";
import { useStoreActions } from "@/hooks/useStoreActions";
import { getLayoutInfo } from "@/util";
import { Sales } from "@commercium/core";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import Toast from "react-native-toast-message";

const { isWide } = getLayoutInfo();


export default function RegisterSale() {
  const params = useLocalSearchParams();
  const storeId = params.storeId.toString();
  const { fetchData, products, registerSale, isActionLoading } =
    useStoreActions(storeId);

  const [data, setData] = useState<Sales.SaleCreateType>({
    storeId: Number(storeId),
    label: "",
    details: [
      {
        productId: -1,
        quantity: 1,
        unitPrice: 0,
      },
    ],
  });

  const [pickableItems, setPickableItems] = useState<
    {
      label: string;
      value: string;
    }[]
  >([]);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  useEffect(() => {
    fetchData({
      products: true,
    });
  }, []);

  useEffect(() => {
    if (products.length > 0) {
      setPickableItems(
        products
          .sort((a, b) => a.description.localeCompare(b.description))
          .map((p) => ({
            label: p.description + " (" + p.stock + ")",
            value: p.id.toString(),
          }))
      );
    }
  }, [products]);

  const stocksDisponibles = useMemo(() => {
    const baseStocks: { [key: string]: number } = {};
    for (const p of products) baseStocks[p.id] = p.stock;

    data.details.forEach((detail) => {
      const id = detail.productId?.toString();
      if (id && detail.productId !== -1 && baseStocks[id] !== undefined) {
        baseStocks[id] -= detail.quantity || 0;
      }
    });
    return baseStocks;
  }, [data.details, products]);

  const addNewItem = () => {
    let newItems = [...data.details];
    newItems.push({
      productId: -1,
      quantity: 1,
      unitPrice: 0,
    });
    setData({ ...data, details: newItems });
  };

  const updateItem = (
    index: number,
    field: "quantity" | "productId",
    value: any
  ) => {
    let newItems = [...data.details];
    newItems[index][field] = Number(value);
    if (field === "productId")
      newItems[index].unitPrice = products.find(
        (p) => p.id.toString() === value
      )!.salePrice;
    setData({ ...data, details: newItems });
  };

  const removeItem = (index: number) => {
    setData((prev) => ({
      ...prev,
      details: prev.details.filter((_, i) => i !== index),
    }));
  };

  const submitSale = async () => {
    if (data.details.length === 0) {
      Toast.show({
        text1: "At least one product must be selected",
        type: "error",
      });
      return;
    }
    if (data.details.some((p) => p.productId === -1)) {
      Toast.show({
        text1: "You cannot leave any product blank",
        type: "error",
      });
      return;
    }
    if (data.details.some((p) => p.quantity === 0)) {
      Toast.show({
        text1: "You cannot leave any quantity as zero",
        type: "error",
      });
      return;
    }
    registerSale(data)
      .then((success) => {
        if (success) {
          Toast.show({
            text1: "Sale registered successfully",
            type: "success",
          });
          router.back();
        }
      })
      .catch((err) => {
        Toast.show({
          text1: "Failed to register sale",
          text2: `${err}`,
          type: "error",
        });
        console.error(err);
      });
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: "Register a new sale",
        }}
      />
      <View style={[styles.formContainer]}>
        <View style={{ margin: 10 }}>
          <CoInput
            label="Sale Label (optional)"
            placeholder="e.g., Morning Rush Sale"
            value={data.label}
            onChangeText={(text) => setData({ ...data, label: text })}
          />
        </View>
        {pickableItems.length > 0 ? (
          <>
            <ScrollView
              style={{ flex: 1 }}
              contentContainerStyle={styles.productsListContainer}
            >
              <View style={[styles.row]}>
                <CoText style={styles.columnHeader}>Product</CoText>
                <CoText style={styles.columnHeader}>Quantity</CoText>
                <CoText style={styles.columnHeader}>Total</CoText>
              </View>
              {data.details.map((item, i) => {
                let strProductId = item.productId.toString();
                let product = products.find(
                  (p) => p.id.toString() === strProductId
                )!;
                let availStock = product
                  ? (stocksDisponibles[product.id] || 0) + (item.quantity || 0)
                  : undefined;
                let toastStockMessage = product && {
                  text1: `Stock exceeded for ${product.description}`,
                  text2: `There's only ${product.stock} units available for this sale`,
                  type: "error",
                };
                return (
                  <View style={[styles.row]} key={i}>
                    <DropDownPicker
                      key={`${i}-product`}
                      open={openIndex === i}
                      value={strProductId == "-1" ? null : strProductId}
                      items={pickableItems}
                      setOpen={(v) => {
                        // maybe a typing error, because it's a boolean, not a function.
                        //@ts-ignore
                        setOpenIndex(v ? i : null)
                      }}
                      setValue={(cb) => {
                        let newId = cb(item.productId.toString());
                        let stock = stocksDisponibles[newId];
                        updateItem(i, "productId", newId);
                        updateItem(
                          i,
                          "quantity",
                          stock !== undefined && (stock > 0 ? 1 : 0)
                        );
                      }}
                      placeholder="Select..."
                      containerStyle={styles.dataContainer}
                      labelProps={{
                        numberOfLines: 2,
                        ellipsizeMode: "tail",
                      }}
                      labelStyle={{
                        flexShrink: 1,
                      }}
                      searchable
                      listMode="MODAL"
                      zIndex={1000 - i}
                      zIndexInverse={i}
                    />
                    <CoIncrementInput
                      key={`${i}-quantity`}
                      number={item.quantity ?? 0}
                      onValueChange={(number) => {
                        if (availStock !== undefined && number > availStock)
                          Toast.show(toastStockMessage);
                        else updateItem(i, "quantity", number);
                      }}
                      max={availStock}
                      onMaxReached={() => Toast.show(toastStockMessage)}
                      style={styles.dataContainer}
                    />
                    <View style={[styles.dataContainer, styles.row]}>
                      <CoText style={styles.price}>
                        ${(item.unitPrice * item.quantity).toFixed(2)}
                      </CoText>

                      <CoButton
                        icon={"trash-outline"}
                        type={"danger"}
                        onPress={() => removeItem(i)}
                        style={styles.deleteBtn}
                        iconSize={16}
                      />
                    </View>
                  </View>
                );
              })}
              <View style={{ marginTop: 20 }}>
                <CoButton
                  text="Add Product"
                  type="secondary"
                  onPress={addNewItem}
                />
              </View>
            </ScrollView>
            <View style={styles.footer}>
              <View style={styles.totalsRow}>
                <CoText asTitle>Total:</CoText>
                <CoText asTitle style={styles.totalAmount}>
                  $
                  {data.details
                    .reduce((a, b) => a + b.unitPrice * b.quantity, 0)
                    .toFixed(2)}
                </CoText>
              </View>

              <CoButton
                text="submit"
                type="primary"
                style={{ marginTop: 10 }}
                textStyle={styles.submitButton}
                onPress={submitSale}
                isLoading={isActionLoading}
              />
            </View>
          </>
        ) : (
          <CoLoadingContainer />
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  formContainer: {
    flex: 1,
    margin: 10,
    gap: 20,
    paddingHorizontal: isWide ? "25%" : 0
  },
  productsListContainer: {
    gap: 1,
    backgroundColor: "#ecececff",
    padding: 5,
    borderRadius: 5,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    gap: 5,
  },

  footer: {
    padding: 18,
    gap: 0,
  },
  totalsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 10,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 5,
  },
  totalAmount: {
    fontWeight: "500",
  },
  submitButton: {
    fontSize: 18,
    padding: 5,
  },
  columnHeader: {
    width: "33%",
    paddingTop: 10,
    paddingBottom: 10,
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    justifyContent: "center",
  },
  dataContainer: {
    width: "33%",
  },
  price: {
    textAlign: "center",
    flex: 4,
    fontWeight: "500",
  },
  deleteBtn: {
    flex: 1,
    alignItems: "flex-end",
    paddingHorizontal: 8,
  },
});
