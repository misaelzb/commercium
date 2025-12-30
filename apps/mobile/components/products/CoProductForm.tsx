import { View } from "react-native";
import { CoCard, CoCardTitle } from "../CoCard";
import CoInput from "../CoInput";
import { CoSeparator } from "../CoSeparator";
import { useState } from "react";
import { CoText } from "../CoText";
import { Palette } from "@/styles/pallete";
import CoButton from "../CoButton";
import { router, useLocalSearchParams } from "expo-router";
import { client } from "@/services";
import {
  getLayoutInfo,
  productFormApiParse,
  ProductInputData,
} from "@/util";
import { CoIncrementInput } from "../CoIncrementInput";
import { StyleSheet } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useStoreActions } from "@/hooks/useStoreActions";

interface CoProductFormProps {
  type: "create" | "edit";
  initialProduct?: ProductInputData;
  afterEdit?: (data: ProductInputData) => void;
}

const { isWide } = getLayoutInfo();

export const CoProductForm = ({
  type,
  initialProduct,
  afterEdit,
}: CoProductFormProps) => {
  const params = useLocalSearchParams();
  const { editProduct } = useStoreActions(params.storeId.toString());
  const [data, setData] = useState<ProductInputData>(
    initialProduct ??
      ({
        sku: "",
        description: "",
        costPrice: "",
        salePrice: "",
        stock: 1,
      } as ProductInputData)
  );
  const initalErrorData = {
    global: "",
    sku: "",
    description: "",
    costPrice: "",
    salePrice: "",
    stock: "",
  };
  const [errors, setErrors] = useState<Record<string, string>>(initalErrorData);

  const [isLoading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const updateInput = (key: string, value: string | number) => {
    setData({ ...data, [key]: value });
  };

  const handleSubmit = async () => {
    setSuccessMsg("");

    let { sku, ...requiredFields } = data;

    if (
      Object.values(type == "edit" ? data : requiredFields).some(
        (x) => !x && x !== 0
      )
    ) {
      setErrors({ ...errors, global: "Make sure all fields are filled" });
      return;
    }
    setLoading(true);
    setErrors(initalErrorData);
    let response = null;
    if (type == "create") {
      response = await client.api.stores[":storeId"].products.create.$post(
        {
          json: { ...productFormApiParse(data) },
          param: { storeId: params.storeId.toString() },
        });
    } else {
      // 'edit'
      response = await editProduct(initialProduct!.sku, { ...productFormApiParse(data) });
    }

    let json = await response.json();

    if (json.error) {
      let newErrors = json.zodIssues
        ?.map((x: { path: any[]; message: string }) => {
          return { [x.path[0]!.toString()]: x.message };
        })
        .reduce((prev, curr) => ({ ...prev, ...curr }), {}) || {
        ...errors,
        global: json.error || "Something went wrong. Please try again later.",
      };
      setErrors(newErrors);
      setLoading(false);
      return;
    }

    if (type == "create") {
      router.back();
    } else {
      let updated = {
        ...data, 
        sku: data.sku.toUpperCase()
      };
      afterEdit!(updated);
      setData(updated);
      setSuccessMsg("Product updated successfully!");
      setLoading(false);
    }
  };

  return (
    <CoCard style={styles.formContainer}>
      <CoCardTitle style={{ textAlign: "center" }}>Product Details</CoCardTitle>
      {(errors.global || successMsg) && (
        <View
          style={[
            styles.msgContainer,
            errors.global
              ? { backgroundColor: Palette.danger }
              : { backgroundColor: Palette.success },
          ]}
        >
          <Ionicons name="information-circle" color={"#fff"} size={17} />
          {errors.global && (
            <CoText style={styles.msgText}>{errors.global}</CoText>
          )}
          {successMsg && <CoText style={styles.msgText}>{successMsg}</CoText>}
        </View>
      )}
      <CoSeparator />
      <CoInput
        label={"SKU" + (type == "create" ? " (optional)" : "")}
        placeholder="e.g. ABC-1234567-ZY"
        onChangeText={(value) => updateInput("sku", value)}
        value={data.sku}
        error={errors.sku}
      />
      <CoInput
        label="Description"
        placeholder="X1000 Running Shoes"
        onChangeText={(value) => updateInput("description", value)}
        value={data.description}
        error={errors.description}
        maxLength={120}
      />
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-around",
          gap: 10,
        }}
      >
        <View style={{ flex: 1 }}>
          <CoInput
            label="Cost Price"
            prefix="$"
            placeholder="25"
            keyboardType="numeric"
            onChangeText={(value) => updateInput("costPrice", value)}
            value={data.costPrice}
            error={errors.costPrice}
          />
        </View>
        <View style={{ flex: 1 }}>
          <CoInput
            label="Selling Price"
            prefix="$"
            placeholder="50"
            keyboardType="numeric"
            onChangeText={(value) => updateInput("salePrice", value)}
            value={data.salePrice}
            error={errors.salePrice}
          />
        </View>
      </View>

      <CoText style={{ fontWeight: 600, textAlign: "center", marginTop: 10 }}>
        Stock
      </CoText>
      <CoIncrementInput
        style={{ backgroundColor: "white" }}
        number={data.stock}
        onValueChange={(n) => updateInput("stock", n)}
      />

      <CoButton
        text={type == "create" ? "Submit product" : "Update product"}
        icon={"add"}
        onPress={handleSubmit}
        isLoading={isLoading}
      />
    </CoCard>
  );
};

const styles = StyleSheet.create({
  formContainer: {
    backgroundColor: Palette.almostWhite,
    width: isWide ? "48%" : "95%",
    alignSelf: "center",
  },
  msgContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
    borderRadius: 10,
    gap: 10,
  },
  msgText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 17,
  },
});
