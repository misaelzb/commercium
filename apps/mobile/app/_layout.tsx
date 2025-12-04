import { AuthProvider, useAuth } from '@/contexts';
import { Stack } from 'expo-router';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

const styles = StyleSheet.create({
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' }
})

const RootStack = () => {
  const { currentUser, isLoading } = useAuth();
  if (isLoading) {
    return <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" />
    </View>
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {currentUser ? (
        <Stack.Screen name="(tabs)" />
      ) : (
        <Stack.Screen name="(auth)/index" options={{ animation: 'fade' }} />
      )}
    </Stack>
  );
}

export default function Layout() {
  return <SafeAreaProvider>
    <AuthProvider>
      <RootStack />
    </AuthProvider>
  </SafeAreaProvider>
}
