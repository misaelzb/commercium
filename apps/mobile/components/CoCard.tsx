import { Palette } from "@/styles/pallete";
import { StyleSheet, Text, TextProps, TouchableOpacity, View, ViewProps } from "react-native"
import { CoText, CoTextProps } from "./CoText";

const styles = StyleSheet.create({
    card: {
        elevation: 4,
        gap: 8,
        padding: 20,
        backgroundColor: '#fff',
        borderRadius: 10,
    },
    cardTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    cardText: {
        color: 'inherit',
        fontSize: 16,
    },
});

export interface CoCardProps extends ViewProps {
    touchable?: boolean;
    onPress?: () => void;
    onLongPress?: () => void; // Only use if touchable is true!
}

export const CoCard = function ({ children, ...props }: CoCardProps) {
    if (props.touchable) {
        return <TouchableOpacity onPress={props.onPress} onLongPress={props.onLongPress ?? (() => {})} style={[styles.card, props.style]}>
            {children}
        </TouchableOpacity>
    }
    return <View style={[styles.card, props.style]}>
        {children}
    </View>
}

export const CoCardTitle = function ({ children, ...props }: CoTextProps) {
    return <CoText {...props} style={[styles.cardTitle, props.style]}>
        {children}
    </CoText>
}