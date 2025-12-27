import { CoLoadingContainer } from '@/components';
import { AuthProvider, useAuth } from '@/contexts';
import { Palette } from '@/styles/pallete';
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from "react-native-toast-message"


const RootStack = () => {
  const { currentUser, isLoading } = useAuth();
  if (isLoading) {
    return <CoLoadingContainer />
  }

  return <Stack screenOptions={{
    title: '',
    headerShown: true,
    headerStyle: {
      backgroundColor: Palette.backgroundPrimary,
    },
    contentStyle: {
      flex: 1, minHeight: 0
    },
    headerTintColor: 'white',
    headerShadowVisible: false
  }}>
    {currentUser ? (
      <Stack.Screen name="(tabs)" />
    ) : (
      <Stack.Screen name="/auth/index" options={{ animation: 'fade' }} />
    )}
  </Stack>
}

export default function Layout() {
  return <SafeAreaProvider>
    <AuthProvider>
      <RootStack />
      <Toast />
    </AuthProvider>
  </SafeAreaProvider>
}
