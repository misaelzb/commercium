import { StyleSheet, Text, TextProps, TextStyle } from "react-native";


export interface CoTextProps extends TextProps {
    white?: boolean;
    asTitle?: boolean;
}

const styles = StyleSheet.create({
    baseTextSize: {
        fontSize: 16,
    },
    baseTextColor: {
        color: '#000',
    },
});


export const CoText = function ({ children, white, asTitle, style, ...props }: CoTextProps): React.ReactNode {
    const textStyles = [
        !asTitle ? styles.baseTextSize : { fontSize: 24, fontWeight: 'bold' },
        !white ? styles.baseTextColor : { color: "white" },
        style, 
    ] as TextStyle[];

    return <Text style={[textStyles]} {...props}>
        {children}
    </Text>
}
