import { Platform } from 'react-native';
import * as Application from 'expo-application';
import * as Notifications from 'expo-notifications';
import { api } from './client';

export type DeviceType = 'ANDROID' | 'IOS';

export type DeviceRegistration = {
  device_id: string;
  device_type: DeviceType;
  device_token: string;
};

export async function registerDevice(payload: DeviceRegistration): Promise<void> {
  await api.post('/users/devices/register/', payload);
}

async function getDeviceId(): Promise<string | null> {
  if (Platform.OS === 'android') return Application.getAndroidId();
  if (Platform.OS === 'ios') return Application.getIosIdForVendorAsync();
  return null;
}

async function getNativePushToken(): Promise<string | null> {
  const settings = await Notifications.getPermissionsAsync();
  let granted = settings.granted || settings.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL;
  if (!granted) {
    const req = await Notifications.requestPermissionsAsync();
    granted = req.granted || req.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL;
  }
  if (!granted) return null;
  const token = await Notifications.getDevicePushTokenAsync();
  return typeof token.data === 'string' ? token.data : null;
}

/** Fire-and-forget device registration. Errors are logged, never thrown. */
export function registerDeviceAsync(): void {
  void (async () => {
    try {
      const device_id = await getDeviceId();
      if (!device_id) {
        console.log('[device] no device_id available — skipping registration');
        return;
      }
      const device_type: DeviceType = Platform.OS === 'ios' ? 'IOS' : 'ANDROID';
      const device_token = await getNativePushToken();
      if (!device_token) {
        console.log('[device] no push token — skipping registration');
        return;
      }
      console.log('[device] registering', { device_id, device_type, device_token_len: device_token.length });
      await registerDevice({ device_id, device_type, device_token });
      console.log('[device] registered ok');
    } catch (err: any) {
      if (err?.status === 400) return; // already registered
      console.log('[device] register failed =', err);
    }
  })();
}
