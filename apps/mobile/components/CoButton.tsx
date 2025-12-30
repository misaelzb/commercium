import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextProps,
  TouchableOpacityProps,
} from "react-native";
import { TouchableOpacity } from "react-native";
import { Palette } from "@/styles/pallete";
import { CoText } from "./CoText";
import Ionicons from "@expo/vector-icons/Ionicons";

type IconName = React.ComponentProps<typeof Ionicons>['name'];
interface CoButtonProps extends TouchableOpacityProps {
  text?: string;
  onPress?: () => void;
  disabled?: boolean;
  isLoading?: boolean;
  icon?: IconName;
  type?: "primary" | "secondary" | "danger" | "blank";
  textStyle?: TextProps["style"];
  iconSize?: number;
}

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    padding: 10,
    gap: 8,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: Palette.textWhite,
    fontSize: 13,
    fontWeight: "bold",
  },
});

export const CoButton = ({
  text: title,
  onPress,
  textStyle,
  iconSize,
  icon,
  disabled = false,
  isLoading = false,
  type = "primary",
  ...props
}: CoButtonProps) => {
  const isDisabled = disabled || isLoading;
  const bgColors = {
    primary: Palette.backgroundPrimary,
    secondary: Palette.backgroundSecondary,
    danger: Palette.danger,
    blank: Palette.textWhite,
  };
  const textColors = {
    primary: Palette.textWhite,
    secondary: Palette.textWhite,
    danger: Palette.textWhite,
    blank: Palette.backgroundPrimary,
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      style={[
        styles.button,
        { backgroundColor: isDisabled ? "#b8b8b8ff" : bgColors[type ?? "primary"] },
        props.style
      ]}
    >
      {isLoading ? (
        <ActivityIndicator color="white" />
      ) : (
        <>
          {icon && <Ionicons name={icon as any} size={iconSize ?? 20} color={textColors[type]} />}
          {title && <CoText style={[styles.buttonText, { color: textColors[type] },textStyle]}>{title.toUpperCase()}</CoText>}
        </>
      )}
    </TouchableOpacity>
  );
};

export default CoButton;
