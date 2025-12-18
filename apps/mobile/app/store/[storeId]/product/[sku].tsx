import { CoLoadingContainer, CoProductForm, CoSafeContainer } from "@/components";
import { useAuth } from "@/contexts";
import { client } from "@/services";
import { Palette } from "@/styles/pallete";
import { Products } from "@commercium/core";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";


export default function EditProduct() {
	const { authHeader } = useAuth();
	const params = useLocalSearchParams();
	const [product, setProduct] = useState<Products.ProductType | null>(null);

	useEffect(() => {
		client.api.stores[":storeId"].products[":sku"].$get({
			param: { storeId: params.storeId.toString(), sku: params.sku.toString() }
		}, {
			headers: {
				...authHeader,
			}
		}).then(async (response) => {
			console.log(params)
			let res = await response.json();
			if (res.error) {
				console.log(res.error);
				router.back();
			} else {
				setProduct(res.data);
			}
		})
	}, [])
	return <CoSafeContainer style={{
		height: '90%',
		justifyContent: 'center',
	}}>
		{product ? <>
			<Stack.Screen
				options={{
					title: `${product.description}`,
					headerStyle: {
						backgroundColor: Palette.backgroundPrimary,
					},
					headerTintColor: 'white',
				}}
			/>
			<CoProductForm type="edit" initialProduct={product} />
		</> : <>
			<Stack.Screen
				options={{
					title: "Loading product...",
				}}
			/>
			<CoLoadingContainer />
		</>}
	</CoSafeContainer>
}