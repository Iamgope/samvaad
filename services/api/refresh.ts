import { BASE_URL, APP_VERSION } from './config';
import { ApiError } from './errors';
import { tokens } from './tokens';

// Module-level lock — shared by HTTP and WS so concurrent 401s only fire one refresh.
let refreshPromise: Promise<string> | null = null;

async function doRefresh(): Promise<string> {
  const refresh = await tokens.getRefresh();
  if (!refresh) {
    await tokens.clear();
    throw new ApiError(401, 'SESSION_EXPIRED', 'Please log in again');
  }

  const res = await fetch(`${BASE_URL}/authentication/token/refresh/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-App-Version': APP_VERSION,
    },
    body: JSON.stringify({ refresh }),
  });

  if (!res.ok) {
    await tokens.clear();
    throw new ApiError(401, 'SESSION_EXPIRED', 'Please log in again');
  }

  const data = await res.json();
  await tokens.setAccess(data.access);
  if (data.refresh) await tokens.setRefresh(data.refresh);
  return data.access;
}

export function refreshAccessToken(): Promise<string> {
  if (!refreshPromise) {
    refreshPromise = doRefresh().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}
