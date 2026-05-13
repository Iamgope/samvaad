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
