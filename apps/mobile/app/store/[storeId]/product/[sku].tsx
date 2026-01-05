import { CoLoadingContainer, ProductForm, CoSafeContainer } from "@/components";
import { useStoreActions } from "@/hooks/useStoreActions";
import { Palette } from "@/styles/pallete";
import { productDataAsForm, ProductInputData } from "@/util";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";


export default function EditProduct() {
	const params = useLocalSearchParams();
	const [product, setProduct] = useState<ProductInputData | null>(null);
	const { fetchProduct } = useStoreActions(params.storeId.toString());

	useEffect(() => {
		fetchProduct(params.sku.toString()).then((p) => {
			if (p) setProduct(productDataAsForm(p));
			else router.back();
		})
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
			<ProductForm type="edit" initialProduct={product} afterEdit={(data) => setProduct(data)}/>
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