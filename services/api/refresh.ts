import { BASE_URL, APP_VERSION } from './config';
import { ApiError } from './errors';
import { tokens } from './tokens';

// Module-level lock — shared by HTTP and WS so concurrent 401s only fire one refresh.
let refreshPromise: Promise<string> | null = null;

async function doRefresh(): Promise<string> {
  const refreshToken = await tokens.getRefresh();
  if (!refreshToken) {
    await tokens.clear();
    throw new ApiError(401, 'SESSION_EXPIRED', 'Please log in again');
  }

  const res = await fetch(`${BASE_URL}/auth/refresh`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-App-Version': APP_VERSION,
    },
    body: JSON.stringify({ refreshToken }),
  });

  if (!res.ok) {
    await tokens.clear();
    throw new ApiError(401, 'SESSION_EXPIRED', 'Please log in again');
  }

  const data = await res.json();
  await tokens.setAccess(data.accessToken);
  if (data.refreshToken) await tokens.setRefresh(data.refreshToken);
  return data.accessToken;
}

export function refreshAccessToken(): Promise<string> {
  if (!refreshPromise) {
    refreshPromise = doRefresh().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}
