import { TouchableOpacity, View } from "react-native";
import {
  router,
  Stack,
  useFocusEffect,
  useLocalSearchParams,
} from "expo-router";
import {
  CoButton,
  CoCard,
  CoLoadingContainer,
  CoText,
  ProductsTab,
} from "@/components";
import { StyleSheet } from "react-native";
import { Palette } from "@/styles/pallete";
import { Ai, Products } from "@commercium/core";
import { useCallback, useState } from "react";
import { CoModal } from "@/components/CoModal";
import { useStoreActions } from "@/hooks/useStoreActions";
import SalesTab from "@/components/store/SalesTab";
import Toast from "react-native-toast-message";
import ConfigTab from "@/components/store/ConfigTab";
import Ionicons from "@expo/vector-icons/Ionicons";
import AiTab from "@/components/store/AiTab";
import { getLayoutInfo } from "@/util";

const { isWide } = getLayoutInfo();

export default function StoreHome() {
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [productSelected, setProductSelected] =
    useState<Products.ProductType | null>(null);

  const params = useLocalSearchParams();
  const storeId = params.storeId.toString();
  const {
    store,
    fetchData,
    isActionLoading,
    deleteProduct,
    products,
    fetchAnalytics,
    sales,
    salesAnalytics,
    editStore,
    deleteStore,
    deleteSale,
  } = useStoreActions(storeId);
  
  const [aiData, setAiData] = useState<Ai.AiGeneratedData | null>();
  const [tabLocked, setTabLocked] = useState(false);

  const Tabs = { ANALYTICS: 0, AI: 1, PRODUCTS: 2, CONFIG: 3 }; // to make code easier to understand.
  const tabsData = [
    {
      icon: <Ionicons name="stats-chart" size={30} style={[styles.tabIcon, activeTabIndex == Tabs.ANALYTICS && styles.tabIconSelected]} />,
      label: "Analytics",
    },
    {
      icon: <Ionicons name="sparkles" size={30} style={[styles.tabIcon, activeTabIndex == Tabs.AI && styles.tabIconSelected]} />,
      label: "AI",
    },
    {
      icon: <Ionicons name="cube" size={30} style={[styles.tabIcon, activeTabIndex == Tabs.PRODUCTS && styles.tabIconSelected]} />,
      label: "Products",
    },
    {
      icon: <Ionicons name="settings" size={30} style={[styles.tabIcon, activeTabIndex == Tabs.CONFIG && styles.tabIconSelected]} />,
      label: "Configuration",
    },
  ];

  const handleDeleteProduct = async (sku: string) => {
    await deleteProduct(sku);
    setProductSelected(null);
  };

  const onDeleteStore = async () => {
    deleteStore()
      .then(() => {
        router.replace("/(tabs)");
      })
      .catch(() => {
        Toast.show({
          text1: "Failed to delete store",
          type: "error",
        });
      });
  };

  useFocusEffect(
    // every time screen is 'focused'
    useCallback(() => {
      fetchData()
        .then(() => {
          fetchAnalytics();
        })
        .catch(() => {
          router.replace("/auth");
        });
    }, [])
  );

  return store ? (
    <>
      <Stack.Screen
        options={{
          title: store!.name,
        }}
      />
      {productSelected != null && (
        <CoModal
          visible={true}
          onClose={() => (isActionLoading ? null : setProductSelected(null))}
        >
          <CoText asTitle>Delete product</CoText>
          <CoText>
            Are you sure you want to delete '{productSelected.description}'?
          </CoText>
          <CoText>Analytics for this product may also be deleted.</CoText>
          <View style={{ gap: 5 }}>
            <CoButton
              type="danger"
              text="Yes, delete this product"
              onPress={() => handleDeleteProduct(productSelected.sku)}
              isLoading={isActionLoading}
            />
            <CoButton
              type="secondary"
              text="Cancel"
              onPress={() => setProductSelected(null)}
              disabled={isActionLoading}
            />
          </View>
        </CoModal>
      )}
      <View style={[styles.content]}>
        <CoCard style={[styles.tabSelector]}>
          {tabsData.map((tab, index) => {
            const isSelected = index === activeTabIndex;
            return (
              <TouchableOpacity
                onPress={() => setActiveTabIndex(index)}
                key={index}
                style={[
                  styles.tab,
                  index === 0 ? styles.firstTab : null,
                  index === tabsData.length - 1 ? styles.lastTab : null,
                  isSelected ? styles.tabSelected : null,
                  tabLocked && activeTabIndex !== index && styles.tabDisabled
                ]}
                disabled={tabLocked && activeTabIndex !== index}
              >
                {tab.icon}
                {isWide && <CoText asTitle style={[isSelected && styles.tabIconSelected]}>{tab.label}</CoText>}
              </TouchableOpacity>
            );
          })}
        </CoCard>
        <View style={{ flex: 1, paddingBottom: 1 }}>
          <CoCard style={[styles.currentTab]}>
            {activeTabIndex === Tabs.ANALYTICS && (
              <>
                {salesAnalytics ? (
                  <SalesTab
                    sales={sales}
                    analytics={salesAnalytics}
                    hasProducts={products.length > 0}
                    deleteSaleFn={deleteSale}
                    isActionLoading={isActionLoading}
                  />
                ) : (
                  <CoLoadingContainer />
                )}
              </>
            )}

            {activeTabIndex === Tabs.PRODUCTS && (
              <ProductsTab
                products={products}
                selectedProductState={[productSelected, setProductSelected]}
              />
            )}
            {activeTabIndex === Tabs.CONFIG && (
              <>
                <ConfigTab
                  store={store}
                  onEdit={editStore}
                  onDelete={onDeleteStore}
                  isActionLoading={isActionLoading}
                />
              </>
            )}
            {
              activeTabIndex === Tabs.AI && <>
                <AiTab
                  aiData={aiData}
                  afterRequest={setAiData}
                  onTabLockToggle={setTabLocked}
                  />
              </>
            }
          </CoCard>
        </View>
      </View>
    </>
  ) : (
    <>
      <Stack.Screen
        options={{
          title: "Loading...",
        }}
      />
      <CoLoadingContainer />
    </>
  );
}

const styles = StyleSheet.create({
  tabIcon: {
    alignSelf: "center",
  },
  tabIconSelected: {
    color: Palette.backgroundPrimary,
  },
  content: {
    flex: 1,
    marginTop: 20,
  },
  tabSelector: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-around",
    gap: 0,
    // Card modifiers
    backgroundColor: "#f8f9fa",
    padding: 0,
    borderRadius: 20,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  currentTab: {
    backgroundColor: "#f8f9fa",
    gap: 10,
    padding: 19,
    borderRadius: 0,
    elevation: 0,
    height: "100%",
  },
  tabDisabled: {
    opacity: 0.5,
  },
  tab: {
    flexDirection: "row",
    gap: 10,
    justifyContent: "center",
    alignItems: "center",
    padding: 5,
    paddingTop: 10,
    paddingBottom: 10,
    width: "25%",
  },
  tabSelected: {
    borderBottomColor: Palette.backgroundPrimary,
    borderBottomWidth: 4,
  },

  firstTab: {
    borderTopLeftRadius: 20,
  },
  lastTab: {
    borderTopRightRadius: 20,
  },
});
