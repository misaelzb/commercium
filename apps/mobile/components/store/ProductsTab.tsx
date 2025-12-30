import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import CoButton from "../CoButton";
import { Products } from "@commercium/core";
import { CoProductCard } from "../products/CoProductCard";
import { FlatList, View } from "react-native";
import { CoCard } from "../CoCard";
import { CoText } from "../CoText";
import CoInput from "../CoInput";
import { useEffect, useState } from "react";
import { Dimensions } from "react-native";
import { getLayoutInfo } from "@/util";
const { isWide } = getLayoutInfo()

export const ProductsTab = ({
  products,
  selectedProductState,
}: {
  products: Products.ProductType[];
  selectedProductState: [
    Products.ProductType | null,
    (value: Products.ProductType | null) => void
  ];
}) => {
  const params = useLocalSearchParams();
  const storeId = params.storeId.toString();
  const [shownProducts, setShownProducts] = useState(products);
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    if (searchText.trim() === "") {
      setShownProducts(products);
    } else {
      const filtered = products.filter(
        (p) =>
          p.description.toLowerCase().includes(searchText.toLowerCase()) ||
          p.sku.toLowerCase().includes(searchText.toLowerCase())
      );
      setShownProducts(filtered);
    }
  }, [products, searchText]);

  return (
    <FlatList
      data={shownProducts}
      numColumns={isWide ? 2 : 1}
      renderItem={({ item }) => {
        return (
          <CoProductCard
            key={item.id}
            data={item}
            selectedProductState={selectedProductState}
          />
        );
      }}
      ListHeaderComponent={
        <View style={{ gap: 10, marginBottom: 15 }}>
          <CoButton
            text="Add a new product"
            icon="add"
            onPress={() => router.push(`/store/${storeId}/product/create`)}
          />
          {products.length === 0 ? (
            <>
              <CoCard>
                <CoText asTitle>🤔 No products yet</CoText>
                <CoText>
                  Take full advantage of Commercium adding your first product!
                </CoText>
              </CoCard>
            </>
          ) : (
            <CoInput
              placeholder="Type here to search products..."
              value={searchText}
              onChangeText={setSearchText}
            />
          )}
        </View>
      }
      keyExtractor={(item) => item.id.toString()}
      ItemSeparatorComponent={() => <View style={{ height: 15 }} />}
      columnWrapperStyle={isWide ? { gap: 15 } : null}
      contentContainerStyle={{
        paddingBottom: 100,
        paddingHorizontal: 2,
        width: isWide ? "50%" : "100%",
        alignSelf: "center"
      }}
    />
  );
};
