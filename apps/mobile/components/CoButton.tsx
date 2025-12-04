import { ActivityIndicator, StyleSheet, Text } from "react-native";
import { TouchableOpacity } from "react-native";
import { Palette } from "@/styles/pallete";
interface CoButtonProps {
    title: string;
    onPress?: () => void;
    disabled?: boolean;
    isLoading?: boolean;
    type?: 'primary' | 'secondary';
}

const styles = StyleSheet.create({
    button: {
        padding: 10,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonText: {
        color: Palette.textWhite,
        fontSize: 13,
        fontWeight: 'bold',
    }
})

export const CoButton: React.FC<CoButtonProps> = ({
    title,
    onPress = () => {},
    disabled = false,
    isLoading = false,
    type = "primary"
}) => {
    const isDisabled = disabled || isLoading;
    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={isDisabled}
            style={[
                styles.button,
                { backgroundColor: isDisabled ? 'gray' : (
                    type === 'primary' ? Palette.backgroundPrimary : Palette.backgroundSecondary
                ) },
            ]}
        >
            {isLoading ? (
                <ActivityIndicator size="small" color="white" />
            ) : (
                <Text style={styles.buttonText}>{title.toUpperCase()}</Text>
            )}
        </TouchableOpacity>
    );
}

export default CoButton;