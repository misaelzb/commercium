import { Text, TextProps } from "react-native";


export interface CoTextProps extends TextProps {
    white?: boolean;
}

export const CoText = function({ children, white, ...props }: CoTextProps): React.ReactNode {
    return <Text style={[
        {
            color: white ? 'white' : 'black',
        },
        props.style
    ]}>
        {children}
    </Text>
}