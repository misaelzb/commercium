import { ScrollView, StyleSheet, Text, View } from "react-native";
import { CoCard } from "../CoCard";
import { CoText } from "../CoText";
import { Sales } from "@commercium/core";
import { Palette } from "@/styles/pallete";
import CoButton from "../CoButton";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import Toast from "react-native-toast-message";
import Ionicons from "@expo/vector-icons/Ionicons";
import { CoModal } from "../CoModal";
import { Dimensions } from "react-native";
const windowWidth = Dimensions.get("window").width;
const isWide = windowWidth >= 600;

export default function SalesTab({
  sales,
  analytics,
  hasProducts,
  deleteSaleFn,
  isActionLoading,
}: {
  sales: Sales.SaleInfo[];
  analytics: Sales.AnalyticsReport;
  hasProducts: boolean;
  deleteSaleFn: (id: number) => Promise<void>;
  isActionLoading: boolean;
}) {
  const params = useLocalSearchParams();
  const storeId = params.storeId.toString();
  const [selectedSale, setSelectedSale] = useState<Sales.SaleInfo | null>(null);

  const handleDelete = async () => {
    if (selectedSale) await deleteSaleFn(selectedSale.id);

    setSelectedSale(null);
  };

  return (
    <>
      <View style={styles.mainContainer}>
        <View style={{ gap: 10 }}>
          <View style={styles.row}>
            <CoCard style={{ flex: 1, marginRight: 10 }}>
              <CoText asLabel>Total Revenue</CoText>
              <CoText asTitle>${analytics.revenue.toFixed(2)}</CoText>
            </CoCard>
            <CoCard style={{ flex: 1 }}>
              <CoText asLabel>Profit</CoText>
              <CoText asTitle>${analytics.profit.toFixed(2)}</CoText>
            </CoCard>
          </View>

          <View style={styles.row}>
            <CoCard style={{ flex: 1, marginRight: 10 }}>
              <CoText asLabel>Total Stock Sold</CoText>
              <CoText style={styles.smallCardValue}>
                {analytics.totalItems}
              </CoText>
            </CoCard>
            <CoCard style={{ flex: 1 }}>
              <CoText asLabel>Average Order Value</CoText>
              <CoText style={styles.smallCardValue}>
                ${analytics.averageOrderValue.toFixed(2)}
              </CoText>
            </CoCard>
          </View>
        </View>

        <View style={styles.historyHeader}>
          <CoText asTitle>Recent Sales</CoText>
          <CoButton
            icon={"add"}
            onPress={() => {
              if (hasProducts) router.push(`/store/${storeId}/sales/register`);
              else
                Toast.show({
                  text1: "At least a product must be added",
                  text2: "You can do it by going to products tab.",
                  type: "error",
                  visibilityTime: 3000,
                });
            }}
          />
        </View>
        <ScrollView
          style={{
            flex: 1,
          }}
          contentContainerStyle={{
            flexDirection: "row",
            flexWrap: "wrap",
            justifyContent: "space-between",
            paddingBottom: 40,
          }}
        >
          {sales.length === 0 && (
            <CoCard style={[styles.row, styles.saleItem, { width: "100%" }]}>
              <View style={styles.iconContainer}>
                <CoText>❌</CoText>
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <CoText style={styles.saleLabel}>No sales yet</CoText>
                <CoText style={styles.saleDate}>
                  Register your first sale!
                </CoText>
              </View>
            </CoCard>
          )}
          {sales.map((item) => {
            const saleProfit = item.details.reduce(
              (a, b) =>
                a +
                Number(b.unitPrice) * b.quantity -
                b.product.costPrice * b.quantity,
              0
            );
            return (
              <CoCard
                onPress={() => setSelectedSale(item)}
                key={item.id}
                style={[styles.row, styles.saleItem]}
              >
                <View style={styles.iconContainer}>
                  <Ionicons name="bag-check" size={24} color="black" />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <CoText style={styles.saleLabel}>
                    {item.label || "Sale"}
                  </CoText>
                  <CoText style={styles.saleDate}>
                    {item.createdAt.toLocaleDateString()}:{" "}
                    {item.createdAt.toLocaleTimeString()}
                  </CoText>
                  <CoText style={styles.saleDate}>
                    {item.details.length} products •{" "}
                    {item.details.reduce((a, b) => a + b.quantity, 0)} units
                  </CoText>
                </View>
                <View style={{ alignItems: "flex-end" }}>
                  <CoText style={styles.saleAmount}>${item.total}</CoText>
                  <View
                    style={[
                      styles.badge,
                      {
                        backgroundColor:
                          saleProfit === 0
                            ? Palette.gray
                            : saleProfit > 0
                            ? Palette.success
                            : Palette.danger,
                        alignSelf: "center",
                      },
                    ]}
                  >
                    <CoText style={[styles.badgeText]}>
                      {saleProfit === 0 ? "*" : saleProfit > 0 ? "+" : "-"}$
                      {Math.abs(saleProfit).toFixed(2)}
                    </CoText>
                  </View>
                </View>
              </CoCard>
            );
          })}
        </ScrollView>
      </View>
      {selectedSale && (
        <CoModal visible={true} onClose={() => setSelectedSale(null)}>
          <CoText asTitle>Sale Details</CoText>
          {selectedSale.label && <CoText>{selectedSale.label}</CoText>}
          <CoText>
            Date: {selectedSale.createdAt.toLocaleDateString()} at{" "}
            {selectedSale.createdAt.toLocaleTimeString()}
          </CoText>
          <CoButton
            text="Delete this sale"
            icon="trash"
            type="danger"
            style={{ paddingVertical: 6 }}
            onPress={handleDelete}
            isLoading={isActionLoading}
          />
          <View>
            <View style={[styles.dataRow]}>
              <View style={styles.colProduct}>
                <Ionicons name="pricetag" size={20} />
              </View>
              <View style={styles.colQty}>
                <Ionicons name="reorder-four" size={20} color="#666" />
              </View>
              <View style={styles.colTotal}>
                <Ionicons name="wallet" size={20} color="#666" />
              </View>
            </View>
            {selectedSale.details.map((sale, index) => (
              <View
                style={[styles.dataRow]}
                key={sale.product.id + index.toString()}
              >
                <CoText style={[styles.colProduct]}>
                  {sale.product.description}
                </CoText>
                <CoText style={[styles.colQty]}>{sale.quantity}</CoText>
                <CoText style={[styles.colTotal]}>
                  ${(Number(sale.unitPrice) * sale.quantity).toFixed(2)}
                </CoText>
              </View>
            ))}
            <View
              style={[
                styles.dataRow,
                {
                  padding: 10,
                  borderRadius: 5,
                  marginTop: 20,
                  borderBottomWidth: 0,
                  justifyContent: "space-between",
                  backgroundColor: Palette.backgroundSecondary,
                },
              ]}
            >
              <CoText white style={styles.detailHeader}>
                Total
              </CoText>
              <CoText white style={styles.detailHeader}>
                ${selectedSale.total}
              </CoText>
            </View>
          </View>
        </CoModal>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  statsContainer: {
    padding: 20,
  },
  mainContainer: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    width: isWide ? "50%" : "100%",
    alignSelf: "center",
  },
  cardValue: { fontSize: 32, fontWeight: "bold", color: "#212529" },
  badge: {
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: "flex-start",
    marginTop: 10,
  },
  badgeText: { color: Palette.textWhite, fontSize: 12, fontWeight: "600" },
  row: { flexDirection: "row" },
  detailHeader: {
    fontWeight: "bold",
    fontSize: 18,
  },
  dataRow: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    paddingVertical: 10,
  },
  colProduct: {
    flex: 3,
    textAlign: "left",
    alignItems: "flex-start",
  },
  colQty: {
    flex: 1,
    textAlign: "center",
    alignItems: "center",
  },
  colTotal: {
    flex: 1.5,
    textAlign: "right",
    alignItems: "flex-end",
  },
  smallCardValue: { fontSize: 18, fontWeight: "bold", marginTop: 5 },
  historyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
  },

  saleItem: {
    elevation: 1,
    alignItems: "center",
    marginBottom: 10,
    width: isWide ? "48%" : "100%",
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 5,
    backgroundColor: "#f0f2f5",
    justifyContent: "center",
    alignItems: "center",
  },

  saleLabel: { fontSize: 15, fontWeight: "600", color: "#212529" },
  saleDate: { fontSize: 12, color: "#606569ff", marginTop: 2 },
  saleAmount: { fontSize: 15, fontWeight: "bold", color: "#212529" },
});
