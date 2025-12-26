import { CoProductForm, CoSafeContainer } from "@/components";
import { Stack } from "expo-router";


export default function CreateProduct() {
	return <CoSafeContainer style={{
		height: '90%',
		justifyContent: 'center',
	}}>
		<Stack.Screen
			options={{
				title: "Create a product"
			}}
		/>
		<CoProductForm type="create"/>
	</CoSafeContainer>
}