import { router, useLocalSearchParams } from "expo-router";
import CoButton from "../CoButton";
import { Products } from "@commercium/core";
import { CoProductCard } from "../products/CoProductCard";
import { FlatList, View } from "react-native";
import { CoCard } from "../CoCard";
import { CoText } from "../CoText";

export const ProductsTab = ({
  products,
  onEdit,
  selectedProductState,
}: {
  products: Products.ProductType[];
  selectedProductState: [
    Products.ProductType | null,
    (value: Products.ProductType | null) => void
  ];
  onEdit: (sku: string, data: Products.ProductCreateType) => any;
}) => {
  const params = useLocalSearchParams();
  const storeId = params.storeId.toString();

  return (
    <>
      <CoButton
        text="Add a new product"
        icon="add"
        onPress={() => router.push(`/store/${storeId}/product/create`)}
      />
      {products.length === 0 && <View>
        <CoCard>
          <CoText asTitle>🤔 No products yet</CoText>
          <CoText>
            Take full advantage of Commercium by adding your first product!
          </CoText>

        </CoCard>  
      </View>}
      <FlatList
        data={products}
        renderItem={({ item }) => {
          return (
            <CoProductCard
              key={item.id}
              data={item}
              selectedProductState={selectedProductState}
            />
          );
        }}
        keyExtractor={(item) => item.id.toString()}
        ItemSeparatorComponent={() => <View style={{ height: 15 }} />}
        contentContainerStyle={{
          paddingBottom: 100,
          paddingHorizontal: 2,
        }}
      />
    </>
  );
};
