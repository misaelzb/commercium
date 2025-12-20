import { StyleSheet, View } from "react-native";

export const CoSeparator = () => {
  return <View style={styles.separator} />;
};

const styles = StyleSheet.create({
  separator: { borderColor: "#ccc", borderWidth: 1 },
});
