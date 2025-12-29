import { CoLoadingContainer } from '@/components';
import { AuthProvider, useAuth } from '@/contexts';
import { Palette } from '@/styles/pallete';
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast, { BaseToast, ErrorToast, ToastConfig } from "react-native-toast-message"


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
      <Stack.Screen name="auth/index" options={{ animation: 'fade' }} />
    )}
  </Stack>
}

const toastConfig: ToastConfig = {
  success: (props) => (
    <BaseToast
      {...props}
      style={{ borderLeftColor: Palette.backgroundPrimary }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{
        fontSize: 15,
        fontWeight: 'bold'
      }}
      text2Style={{
        fontSize: 13,
        color: '#666',
      }}
      text2Props={{
        numberOfLines: 2
      }}
    />
  ),
  error: (props) => (
    <ErrorToast
      {...props}
      text1Style={{
        fontSize: 15
      }}
      text2Style={{
        fontSize: 13, 
        color: '#444'
      }}
      text2Props={{
        numberOfLines: 2
      }}
    />
  ),
};

export default function Layout() {
  return <SafeAreaProvider>
    <AuthProvider>
      <RootStack />
      <Toast config={toastConfig} />
    </AuthProvider>
  </SafeAreaProvider>
}
