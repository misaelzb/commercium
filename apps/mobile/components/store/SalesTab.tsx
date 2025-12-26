import { ScrollView, StyleSheet, Text, View } from "react-native";
import { CoCard } from "../CoCard";
import { CoText } from "../CoText";
import { Sales } from "@commercium/core";
import { Palette } from "@/styles/pallete";
import CoButton from "../CoButton";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import Toast from "react-native-toast-message";

export default function SalesTab({
  sales,
  analytics,
  hasProducts
}: {
  sales: Sales.SalesListInfo[];
  analytics: Sales.AnalyticsReport;
  hasProducts: boolean;
}) {
  const params = useLocalSearchParams();
  const storeId = params.storeId.toString();
  return <>
    <View style={{ flex: 1, backgroundColor: "#f8f9fa" }}>
      <View style={{ gap: 10 }}>
        <View style={styles.row}>
          <CoCard style={{ flex: 1, marginRight: 10 }}>
            <CoText asLabel>Total Revenue</CoText>
            <CoText asTitle>${analytics.revenue.toFixed(2)}</CoText>
            {/*<View style={styles.badgeSuccess}>
            <Text style={styles.badgeText}>TODO: show a % of revenue since last month</Text>
          </View> */}
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
            if (hasProducts)
              router.push(`/store/${storeId}/sales/register`)
            else Toast.show({
              text1: "At least a product must be added",
              text2: "You can do it by going to products tab.",
              type: "error",
              visibilityTime: 3000,
            })
          }}
        />
      </View>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {sales.length === 0 && (
          <CoCard style={[styles.row, styles.saleItem]}>
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
        {sales.map((item) => (
          <CoCard
            onPress={() => {}}
            key={item.id}
            style={[styles.row, styles.saleItem]}
          >
            <View style={styles.iconContainer}>
              <Text>💰</Text>
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <CoText style={styles.saleLabel}>
                {item.label || "Sale #" + item.id}
              </CoText>
              <CoText style={styles.saleDate}>
                {item.createdAt.toLocaleDateString()} • {item.details.length}{" "}
                products • {item.details.reduce((a, b) => a + b.quantity, 0)}{" "}
                units
              </CoText>
            </View>
            <View style={{ alignItems: "flex-end" }}>
              <CoText style={styles.saleAmount}>${item.total}</CoText>
              <View style={[styles.badgeSuccess, { alignSelf: "center" }]}>
                <CoText style={styles.badgeText}>+${
                    item.details.reduce((a, b) => a + (Number(b.unitPrice) * b.quantity) - (b.product.costPrice * b.quantity), 0)
                    .toFixed(2)
                  }</CoText>
              </View>
            </View>
          </CoCard>
        ))}
      </ScrollView>
    </View>
  </>;
}

const styles = StyleSheet.create({
  statsContainer: {
    padding: 20,
  },

  cardValue: { fontSize: 32, fontWeight: "bold", color: "#212529" },
  badgeSuccess: {
    backgroundColor: Palette.success,
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: "flex-start",
    marginTop: 10,
  },
  badgeText: { color: Palette.textWhite, fontSize: 12, fontWeight: "600" },
  row: { flexDirection: "row" },
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
