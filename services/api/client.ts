import { BASE_URL, APP_VERSION } from './config';
import { tokens } from './tokens';

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

type RequestOptions = {
  body?: unknown;
  headers?: Record<string, string>;
};

// Module-level lock — deduplicates concurrent 401s so only one refresh fires.
let refreshPromise: Promise<string> | null = null;

async function buildHeaders(extra?: Record<string, string>): Promise<Record<string, string>> {
  const accessToken = await tokens.getAccess();
  return {
    'Content-Type': 'application/json',
    'X-App-Version': APP_VERSION,
    ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
    ...extra,
  };
}

async function doFetch(
  method: string,
  path: string,
  options: RequestOptions,
  tokenOverride?: string,
): Promise<Response> {
  const headers = await buildHeaders({
    ...options.headers,
    ...(tokenOverride && { Authorization: `Bearer ${tokenOverride}` }),
  });

  return fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });
}

async function refreshAccessToken(): Promise<string> {
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

async function parseError(res: Response): Promise<never> {
  let code = 'UNKNOWN_ERROR';
  let message = `Request failed with status ${res.status}`;
  try {
    const body = await res.json();
    if (body.code) code = body.code;
    if (body.message) message = body.message;
  } catch {
    // non-JSON error body, keep defaults
  }
  throw new ApiError(res.status, code, message);
}

async function parseBody<T>(res: Response): Promise<T> {
  if (res.status === 204) return undefined as T;
  const text = await res.text();
  return text ? (JSON.parse(text) as T) : (undefined as T);
}

export async function request<T>(
  method: string,
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  let res: Response;

  try {
    res = await doFetch(method, path, options);
  } catch {
    throw new ApiError(0, 'NETWORK_ERROR', 'Network request failed');
  }

  if (res.status === 401) {
    if (!refreshPromise) {
      refreshPromise = refreshAccessToken().finally(() => {
        refreshPromise = null;
      });
    }

    const newToken = await refreshPromise;
    res = await doFetch(method, path, options, newToken);
  }

  if (!res.ok) await parseError(res);
  return parseBody<T>(res);
}

export const api = {
  get: <T>(path: string, options?: Omit<RequestOptions, 'body'>) =>
    request<T>('GET', path, options),

  post: <T>(path: string, body?: unknown, options?: Omit<RequestOptions, 'body'>) =>
    request<T>('POST', path, { ...options, body }),

  put: <T>(path: string, body?: unknown, options?: Omit<RequestOptions, 'body'>) =>
    request<T>('PUT', path, { ...options, body }),

  patch: <T>(path: string, body?: unknown, options?: Omit<RequestOptions, 'body'>) =>
    request<T>('PATCH', path, { ...options, body }),

  delete: <T>(path: string, options?: Omit<RequestOptions, 'body'>) =>
    request<T>('DELETE', path, options),
};
