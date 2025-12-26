import { StyleSheet, Text, TextProps, TextStyle, ColorValue } from "react-native";

export interface CoTextProps extends TextProps {
  white?: boolean;
  asTitle?: boolean;
  asLabel?: boolean;
  color?: ColorValue;
}

export const CoText = function ({
  children,
  white,
  asTitle,
  asLabel,
  color,
  style,
  ...props
}: CoTextProps): React.ReactNode {
  
  const variant = asTitle ? styles.title : asLabel ? styles.label : styles.base;

  const finalStyle = [
    variant,
    white && styles.textWhite,
    color && { color },
    style,
  ];

  return (
    <Text style={finalStyle} {...props}>
      {children}
    </Text>
  );
};

const styles = StyleSheet.create({
  base: {
    fontSize: 16,
    color: "#000",
  },
  title: {
    fontSize: 21,
    fontWeight: "bold",
    color: "#000",
  },
  label: {
    fontSize: 14,
    color: "#6c757d",
    fontWeight: "500",
  },
  textWhite: {
    color: "#fff",
  },
});