import { ActivityIndicator, StyleSheet, View } from "react-native";

const styles = StyleSheet.create({
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' }
});


export function CoLoadingContainer() {
    return <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" />
    </View>
}