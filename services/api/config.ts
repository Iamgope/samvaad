import Constants from 'expo-constants';

const DEV_API_PORT = 8000;

function devHost(): string {
  const hostUri = Constants.expoConfig?.hostUri;
  return hostUri?.split(':')[0] || 'localhost';
}

export const BASE_URL = __DEV__
  ? `https://vaad-vivaad-production.up.railway.app`
  : 'https://vaad-vivaad-production.up.railway.app';

export const APP_VERSION = "1";

export function rewriteDevHost(url: string): string {
  if (!__DEV__) return url;
  return url.replace(/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?/, `http://${devHost()}:${DEV_API_PORT}`);
}
