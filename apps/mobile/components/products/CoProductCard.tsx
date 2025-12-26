import { Image, StyleSheet, Switch, View } from "react-native";
import { CoText } from "../CoText";
import { CoCard } from "../CoCard";
import { Products } from "@commercium/core";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";

type CoProductCardProps = {
  data: Products.ProductType;
  handleEdit: (sku: string, data: Products.ProductCreateType) => void;
  selectedProductState: [
    Products.ProductType | null,
    (value: Products.ProductType | null) => void
  ]; // null = not selected / not showing modal
};
export function CoProductCard({
  data: product,
  handleEdit,
  selectedProductState,
}: CoProductCardProps) {
  const [selectedProduct, setSelectedProduct] = selectedProductState;
  return (
    <>
      <CoCard style={[styles.productCard]}>
        <View style={[styles.productInfoContainer]}>
          <Image
            source={{
              uri: "https://placehold.co/400x400/cccccc/969696.png?font=lato",
              width: 75,
              height: 75,
            }}
          />
          <View style={{ flex: 1, justifyContent: "space-between" }}>
            <CoText
              numberOfLines={1}
              ellipsizeMode="tail"
              style={[styles.productDescription]}
            >
              {product.description}
            </CoText>
            <CoText numberOfLines={1} style={[styles.productSKU]}>
              {product.sku}
            </CoText>

            <CoText>${product.salePrice}</CoText>
          </View>
          <View>
            <View style={[styles.productActions]}>
              <Ionicons
                name="trash"
                size={20}
                color={"red"}
                onPress={() => setSelectedProduct(product)}
              />
              <Ionicons
                name="pencil"
                size={20}
                onPress={() =>
                  router.push(
                    `/store/${product.storeId}/product/${product.sku}`
                  )
                }
              />
            </View>
            <Switch
              value={product.isActive}
              onValueChange={(value) =>
                handleEdit(product.sku, {
                  ...product,
                  isActive: value,
                })
              }
            />
          </View>
        </View>
      </CoCard>
    </>
  );
}

const styles = StyleSheet.create({
  productInfoContainer: {
    flexDirection: "row",
    gap: 10,
  },
  productDescription: {
    fontSize: 18,
    fontWeight: "bold",
  },
  productSKU: {
    fontSize: 14,
    color: "#868686ff",
  },
  productCard: {
    backgroundColor: "#ffffffff",
    margin: 0,
    elevation: 1
  },
  productActions: {
    flexDirection: "row",
    gap: 10,
  },
});
