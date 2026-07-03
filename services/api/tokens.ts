import * as SecureStore from 'expo-secure-store';

const KEY_ACCESS = 'auth_access_token';
const KEY_REFRESH = 'auth_refresh_token';

export const tokens = {
  getAccess: () => SecureStore.getItemAsync(KEY_ACCESS),
  setAccess: (t: string) => SecureStore.setItemAsync(KEY_ACCESS, t),
  getRefresh: () => SecureStore.getItemAsync(KEY_REFRESH),
  setRefresh: (t: string) => SecureStore.setItemAsync(KEY_REFRESH, t),
  clear: async () => {
    await SecureStore.deleteItemAsync(KEY_ACCESS);
    await SecureStore.deleteItemAsync(KEY_REFRESH);
  },
};

function decodeJwtPayload(token: string): Record<string, any> {
  try {
    const payload = token.split('.')[1];
    // JWT uses base64url (- and _ instead of + and /); atob needs standard base64
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + (4 - (base64.length % 4)) % 4, '=');
    return JSON.parse(atob(padded));
  } catch {
    return {};
  }
}

export async function getCurrentUserId(): Promise<number | null> {
  const token = await tokens.getAccess();
  if (!token) return null;
  return decodeJwtPayload(token).user_id ?? null;
}
