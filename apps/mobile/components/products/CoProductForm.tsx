import { View } from "react-native";
import { CoCard, CoCardTitle } from "../CoCard";
import CoInput from "../CoInput";
import { CoSeparator } from "../CoSeparator";
import { useState } from "react";
import { CoText } from "../CoText";
import { Palette } from "@/styles/pallete";
import CoButton from "../CoButton";
import { useAuth } from "@/contexts";
import { router, useLocalSearchParams } from "expo-router";
import { client } from "@/services";
import {
  productDataAsForm,
  productFormApiParse,
  ProductInputData,
} from "@/util";
import { Products } from "@commercium/core";
import { CoIncrementInput } from "../CoIncrementInput";
import { StyleSheet } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";

interface CoProductFormProps {
  type: "create" | "edit";
  initialProduct?: Products.ProductType;
}

export const CoProductForm = ({ type, initialProduct }: CoProductFormProps) => {
  const { authHeader } = useAuth();
  const params = useLocalSearchParams();
  const [data, setData] = useState<ProductInputData>(
    initialProduct
      ? productDataAsForm(initialProduct)
      : ({
          sku: "",
          description: "",
          costPrice: "",
          salePrice: "",
          stock: 1,
        } as ProductInputData)
  );
  const [errors, setErrors] = useState<Record<string, string>>({
    global: "",
    sku: "",
    description: "",
    costPrice: "",
    salePrice: "",
    stock: "",
  });

  const [isLoading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const updateInput = (key: string, value: string | number) => {
    setData({ ...data, [key]: value });
  };

  const handleSubmit = async () => {
		setSuccessMsg("");
    if (Object.values(data).some((x) => !x && x !== 0)) {
      setErrors({ ...errors, global: "Make sure all fields are filled" });
      return;
    }
    setLoading(true);
    setErrors({ ...errors, global: "" });
    let response = null;
    if (type == "create") {
      response = await client.api.stores[":storeId"].products.create.$post(
        {
          json: { ...productFormApiParse(data) },
          param: { storeId: params.storeId.toString() },
        },
        { headers: authHeader }
      );
    } else {
      // 'edit'
      response = await client.api.stores[":storeId"].products[":sku"].$put(
        {
          json: { ...productFormApiParse(data) },
          param: {
            storeId: params.storeId.toString(),
            sku: params.sku.toString(),
          },
        },
        { headers: authHeader }
      );
    }

    let json = await response.json();

    if (json.error) {
      let newErrors = json.zodIssues
        ?.map((x: { path: any[]; message: any }) => {
          return { [x.path[0]!.toString()]: x.message };
        })
        .reduce((prev: any, curr: any) => ({ ...prev, ...curr }), {}) || {
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
      setSuccessMsg("Product updated successfully!");
      setLoading(false);
    }
  };

  return (
    <CoCard>
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
					<Ionicons
						name="information-circle"
						color={"#fff"}
						size={17}
						/>
          {errors.global && (
            <CoText style={styles.msgText}>{errors.global}</CoText>
          )}
          {successMsg && (
            <CoText style={styles.msgText}>{successMsg}</CoText>
          )}
        </View>
      )}
      <CoSeparator />
      <CoInput
        label="SKU"
        placeholder="ABC-1234567-ZY"
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
  msgContainer: {
		flexDirection: "row",
		justifyContent: "center",
		alignItems: "center",
    padding: 10,
		borderRadius: 10,
		gap: 10
  },
	msgText: {
		color: "#fff",
		textAlign: "center",
		fontWeight: "bold",
		fontSize: 17
	}
});
