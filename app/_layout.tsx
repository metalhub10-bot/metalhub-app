import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { getSessionId } from '@/services/api';
import { ensurePushTokenRegistered } from '@/services/pushNotifications';

export { ErrorBoundary } from 'expo-router';

export const unstable_settings = {
  initialRouteName: 'index',
};

export default function RootLayout() {
  useEffect(() => {
    // Registrar token solo si ya hay sesión activa (usuario que no cerró sesión).
    // Para usuarios nuevos, el registro ocurre en login.tsx tras el login exitoso.
    getSessionId().then((sessionId) => {
      if (sessionId) ensurePushTokenRegistered();
    });
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#0D0D0F' },
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ presentation: 'modal' }} />
        <Stack.Screen name="register" options={{ presentation: 'modal' }} />
        <Stack.Screen name="editar-perfil" options={{ presentation: 'modal' }} />
      </Stack>
    </SafeAreaProvider>
  );
}
