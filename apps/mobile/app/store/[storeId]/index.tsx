import { ScrollView, ToastAndroid, TouchableOpacity, View } from "react-native";
import { router, Stack, useFocusEffect, useLocalSearchParams } from "expo-router";
import { CoButton, CoCard, CoLoadingContainer, CoProductCard, CoSeparator, CoText } from "@/components";
import { StyleSheet } from "react-native";
import { Palette } from "@/styles/pallete";
import { Products, Store } from "@commercium/core";
import { useCallback, useEffect, useState } from "react";
import { client } from "@/services";
import { useAuth } from "@/contexts";
import { CoModal } from "@/components/CoModal";

export default function StoreHome() {
	const { authHeader } = useAuth();
	const [store, setStore] = useState<Store.StoreType>();
	const [products, setProducts] = useState<Products.ProductType[]>();
	const [isScreenLoading, setScreenLoading] = useState(true);
	const [isActionLoading, setActionLoading] = useState(false);
	const [activeTabIndex, setActiveTabIndex] = useState(0);
	const deleteModalState = useState<Products.ProductType | null>(null);


	const params = useLocalSearchParams();
	const storeId = params.storeId.toString();
	const Tabs = { PRODUCTS: 0, SALES: 1, DETAILS: 2 } // to make code easier to understand.
	const tabsData = [
		{
			name: "Products"
		},
		{
			name: "Sales"
		},
		{
			name: "Details"
		}
	]


	const fetchStore = async () => {
		let response1 = await client.api.stores[":id"].$get({ param: { id: storeId } },
			{ headers: authHeader })
		let jsonStore = await response1.json();
		if (jsonStore.error) {
			throw new Error(jsonStore.error);
		}
		let response2 = await client.api.stores[":storeId"].products.s.list.$get({ param: { storeId: storeId } },
			{ headers: authHeader })
		let jsonProducts = await response2.json();

		if (jsonProducts.error) {
			throw new Error(jsonProducts.error);
		}
		return {
			store: jsonStore.data,
			products: jsonProducts.data
		};
	};

	const handleEditProduct = async (sku: string, data: Products.ProductCreateType) => { // always take create type, as every field on a form is mandatory.
		try {
			await client.api.stores[":storeId"].products[":sku"].$put({
				json: data,
				param: { storeId: storeId, sku: sku }
			}, { headers: authHeader })

			setProducts(prevProducts => {
				return prevProducts!.map(p => {
					if (p.sku === sku) {
						return { ...p, ...data }
					}
					return p;
				})
			});
		} catch (err) {
			ToastAndroid.showWithGravityAndOffset(
				'Error ' + err,
				ToastAndroid.LONG,
				ToastAndroid.BOTTOM,
				25,
				50,
			);
		}
	}

	const handleDeleteProduct = async (sku: string) => {
		try {
			setActionLoading(true);
			await client.api.stores[":storeId"].products[":sku"].$delete({
				param: { storeId: storeId, sku: sku }
			}, { headers: authHeader })
			setProducts(prevProducts => {
				return prevProducts!.filter(p => p.sku !== sku)
			});
			deleteModalState[1](null);
		} catch (err) {
			ToastAndroid.showWithGravityAndOffset(
				'Error ' + err,
				ToastAndroid.LONG,
				ToastAndroid.BOTTOM,
				25,
				50,
			);
		} finally {
			setActionLoading(false);
		}
	}


	useFocusEffect( // every time screen is 'focused'
		useCallback(() => {
			fetchStore()
				.then(({ store, products }) => {
					setStore(store);
					setProducts(products);
					setScreenLoading(false);
				})
				.catch(() => {
					router.replace("/auth");
				});
		}, []));

	return !isScreenLoading ? <>
		<Stack.Screen
			options={{
				title: store!.name
			}}
		/>
		{deleteModalState[0] != null && <CoModal visible={true} onClose={() => isActionLoading ? null : deleteModalState[1](null)}>
			<CoText asTitle>Delete product</CoText>
			<CoText>Are you sure you want to delete '{deleteModalState[0].description}'?</CoText>
			<CoText>Statistics for this product may also be deleted.</CoText>
			<View style={{ gap: 5 }}>
				<CoButton
					type='danger'
					text="Yes, delete this product"
					onPress={() => handleDeleteProduct(deleteModalState[0]!.sku)}
					isLoading={isActionLoading} />
				<CoButton
					type='secondary'
					text="Cancel"
					onPress={() => deleteModalState[1](null)}
					disabled={isActionLoading} />
			</View>
		</CoModal>
		}
		<View style={[styles.content]}>
			<CoCard style={[styles.tabSelector]}>
				{tabsData.map((tab, index) => {
					const isSelected = index === activeTabIndex;
					return <TouchableOpacity
						onPress={() => setActiveTabIndex(index)}
						key={index}
						style={[
							styles.tab,
							index === 0 ? styles.firstTab : null, index === tabsData.length - 1 ? styles.lastTab : null,
							isSelected ? styles.tabSelected : null,
						]}>
						<CoText style={[styles.tabText]}>{tab.name}</CoText>
					</TouchableOpacity>
				})}
			</CoCard>
			<ScrollView
				contentContainerStyle={{ paddingBottom: 1 }}>
				<CoCard style={[styles.currentTab]}>
					{activeTabIndex === Tabs.PRODUCTS && <>
						<CoButton
							text="Add a new product"
							icon="add"
							onPress={() => router.push(`/store/${storeId}/product/create`)}
						/>
						{products!.map((product, index) => {
							return <CoProductCard
								key={index}
								data={product}
								handleEdit={handleEditProduct}
								deleteModalState={deleteModalState} />
						})}
					</>}
				</CoCard>
			</ScrollView>
		</View>
	</> : <>
		<Stack.Screen
			options={{
				title: "Loading...",
			}}
		/>
		<CoLoadingContainer />
	</>;
}

const styles = StyleSheet.create({
	tabText: {
		fontSize: 18,
		fontWeight: 'bold',
		textAlign: 'center'
	},
	content: {
		flex: 1,
		marginTop: 20,
	},
	tabSelector: {
		width: '100%',
		flexDirection: 'row',
		justifyContent: 'space-around',
		gap: 0,
		// Card modifiers
		padding: 0,
		borderRadius: 20,
		borderBottomLeftRadius: 0,
		borderBottomRightRadius: 0,
	},
	currentTab: {
		gap: 10,
		padding: 19,
		borderRadius: 0,
		elevation: 0,
		height: '100%',
	},
	tab: {
		padding: 5,
		paddingTop: 10,
		paddingBottom: 10,
		textAlign: 'center',
		width: '33.3%',
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
	}
})