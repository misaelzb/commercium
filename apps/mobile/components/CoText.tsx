import { Text, TextProps } from "react-native";


export interface CoTextProps extends TextProps {
    white?: boolean;
    asTitle?: boolean;
}

export const CoText = function({ children, white, ...props }: CoTextProps): React.ReactNode {
    return <Text style={[
        {
            fontSize: props.asTitle ? 24 : 16,
            fontWeight: props.asTitle ? 'bold' : 'normal',
            color: white ? 'white' : 'black',
        },
        props.style
    ]}>
        {children}
    </Text>
}