import { CoProductForm, CoSafeContainer } from "@/components";
import { Palette } from "@/styles/pallete";
import { Stack } from "expo-router";


export default function CreateProduct() {
	return <CoSafeContainer style={{
		height: '90%',
		justifyContent: 'center',
	}}>
		<Stack.Screen
			options={{
				title: "Create a product",
				headerStyle: {
					backgroundColor: Palette.backgroundPrimary,
				},
				headerTintColor: 'white',
			}}
		/>
		<CoProductForm type="create"/>
	</CoSafeContainer>
}