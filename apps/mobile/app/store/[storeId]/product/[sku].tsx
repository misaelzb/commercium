import { CoLoadingContainer, CoProductForm, CoSafeContainer } from "@/components";
import { useStoreActions } from "@/hooks/useStoreActions";
import { Palette } from "@/styles/pallete";
import { Products } from "@commercium/core";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";


export default function EditProduct() {
	const params = useLocalSearchParams();
	const [product, setProduct] = useState<Products.ProductType | null>(null);
	const { fetchProduct } = useStoreActions(params.storeId.toString());

	useEffect(() => {
		fetchProduct(params.sku.toString()).then((p) => setProduct(p))
		.catch(() => router.back());
	}, []);

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