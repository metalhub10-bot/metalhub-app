import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';

import { updatePushToken } from '@/services/api';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

function handleRegistrationError(errorMessage: string) {
  // En producción podrías usar un sistema de logging; aquí solo mostramos alerta en desarrollo.
  console.warn('[PushNotifications] Error de registro:', errorMessage);
}

async function registerForPushNotificationsAsync(): Promise<string | null> {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('metalhub', {
      name: 'MetalHub',
      importance: Notifications.AndroidImportance.MAX,
      sound: 'soundnotification.mp3',
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (!Device.isDevice) {
    handleRegistrationError('Debes usar un dispositivo físico para notificaciones push');
    return null;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    handleRegistrationError('Permiso de notificaciones no concedido');
    return null;
  }

  const projectId =
    (Constants?.expoConfig?.extra as any)?.eas?.projectId ?? (Constants as any)?.easConfig?.projectId;

  if (!projectId) {
    handleRegistrationError('Project ID de Expo no encontrado');
    return null;
  }

  try {
    const tokenResponse = await Notifications.getExpoPushTokenAsync({ projectId });
    const pushToken = tokenResponse.data;
    if (!pushToken) {
      handleRegistrationError('No se pudo obtener el token de Expo');
      return null;
    }
    return pushToken;
  } catch (e: any) {
    handleRegistrationError(String(e));
    return null;
  }
}

/**
 * Registra el dispositivo para notificaciones push y envía el token al backend
 * (requiere que exista una sesión activa para asociarlo al usuario).
 */
export async function ensurePushTokenRegistered(): Promise<void> {
  try {
    const token = await registerForPushNotificationsAsync();
    if (!token) return;

    const res = await updatePushToken(token);
    if (!res.success) {
      console.warn('[PushNotifications] No se pudo registrar token en backend:', res.message || res.error);
    }
  } catch (err) {
    console.warn('[PushNotifications] Error general registrando token:', err);
  }
}

