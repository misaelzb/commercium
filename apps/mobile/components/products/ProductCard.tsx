import { Image, StyleSheet, View } from "react-native";
import { CoText } from "../CoText";
import { CoCard } from "../CoCard";
import { Products } from "@commercium/core";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import CoButton from "../CoButton";
import { getLayoutInfo } from "@/util";

const { isWide } = getLayoutInfo();

type ProductCardProps = {
  data: Products.ProductType;
  selectedProductState: [
    Products.ProductType | null,
    (value: Products.ProductType | null) => void
  ]; // null = not selected / not showing modal
};

export function ProductCard({
  data: product,
  selectedProductState,
}: ProductCardProps) {
  const [selectedProduct, setSelectedProduct] = selectedProductState;
  return (
    <>
      <CoCard style={[styles.productCard]}>
        <View style={[styles.productInfoContainer]}>
          <Ionicons 
            style={{ alignSelf: "center", marginRight: 10 }}
            name="cube" size={40} color="black" />
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
            <View style={styles.productQInfo}>
              <CoText style={styles.productPrice}>
                ${product.salePrice.toFixed(2)}
              </CoText>
              <CoText asLabel style={product.stock === 0 ? { color: "red" } : {}}>(stock: {product.stock})</CoText>
            </View>
          </View>
          <View>
            <View style={[styles.productActions]}>
              <CoButton
                icon={"trash"}
                iconSize={18}
                type="danger"
                style={{ padding: 5 }}
                onPress={() => setSelectedProduct(product)}
              />
              <CoButton
                icon={"pencil"}
                iconSize={18}
                type="secondary"
                style={{ padding: 5 }}
                onPress={() =>
                  router.push(
                    `/store/${product.storeId}/product/${product.sku}`
                  )
                }
              />
            </View>
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
    elevation: 1,
    width: isWide ? "49%" : "99%",
    alignSelf: "center",
  },
  productActions: {
    flexDirection: "column",
    gap: 10,
  },
  productPrice: {
    fontSize: 17,
    fontWeight: "400",
  },
  productQInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
});
