import { BASE_URL, APP_VERSION } from './config';
import { refreshAccessToken } from './refresh';
import { tokens } from './tokens';

export const WS_BASE_URL = BASE_URL.replace(/^http/, 'ws');

// Close codes that signal the access token was rejected.
// 4401 = Unauthorized (custom), 4001 = common alt convention.
const DEFAULT_AUTH_FAIL_CODES = [4001, 4401];

type CloseInfo = { code: number; reason: string };

type EventMap = {
  open: void;
  message: unknown;
  close: CloseInfo;
  error: unknown;
};

type Listener<K extends keyof EventMap> = (arg: EventMap[K]) => void;

export type WebSocketClientOptions = {
  protocols?: string | string[];
  headers?: Record<string, string>;
  /** Close codes that should trigger a token refresh + reconnect. */
  authFailCodes?: number[];
};

function tryParse(data: unknown): unknown {
  if (typeof data !== 'string') return data;
  try {
    return JSON.parse(data);
  } catch {
    return data;
  }
}

async function openSocket(
  path: string,
  options: WebSocketClientOptions,
): Promise<WebSocket> {
  const accessToken = await tokens.getAccess();
  const headers: Record<string, string> = {
    'X-App-Version': APP_VERSION,
    ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
    ...options.headers,
  };

  // RN's WebSocket accepts (url, protocols, { headers }), but the global
  // DOM lib type only allows (url, protocols).
  const Ctor = WebSocket as unknown as new (
    url: string,
    protocols?: string | string[],
    options?: { headers?: Record<string, string> },
  ) => WebSocket;

  return new Ctor(`${WS_BASE_URL}${path}`, options.protocols, { headers });
}

export class WebSocketClient {
  private ws: WebSocket | null = null;
  private listeners: { [K in keyof EventMap]: Set<Listener<K>> } = {
    open: new Set(),
    message: new Set(),
    close: new Set(),
    error: new Set(),
  };
  private didRefresh = false;

  constructor(
    private readonly path: string,
    private readonly options: WebSocketClientOptions = {},
  ) {}

  on<K extends keyof EventMap>(event: K, handler: Listener<K>): () => void {
    this.listeners[event].add(handler);
    return () => this.listeners[event].delete(handler);
  }

  private emit<K extends keyof EventMap>(event: K, arg: EventMap[K]): void {
    this.listeners[event].forEach((h) => h(arg));
  }

  /** Open the connection. Resolves on `open`, rejects if it closes/errors first. */
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.attempt(resolve, reject);
    });
  }

  private async attempt(
    resolve: () => void,
    reject: (err: unknown) => void,
  ): Promise<void> {
    let ws: WebSocket;
    try {
      ws = await openSocket(this.path, this.options);
    } catch (err) {
      reject(err);
      return;
    }
    this.ws = ws;
    let opened = false;

    ws.onopen = () => {
      opened = true;
      this.didRefresh = false;
      this.emit('open', undefined);
      resolve();
    };

    ws.onmessage = (e: MessageEvent) => {
      this.emit('message', tryParse(e.data));
    };

    ws.onerror = (e) => {
      this.emit('error', e);
    };

    ws.onclose = async (e: CloseEvent) => {
      this.ws = null;
      const codes = this.options.authFailCodes ?? DEFAULT_AUTH_FAIL_CODES;
      const isAuthFail = codes.includes(e.code);

      if (isAuthFail && !this.didRefresh) {
        this.didRefresh = true;
        try {
          await refreshAccessToken();
          this.attempt(resolve, reject);
          return;
        } catch (err) {
          this.emit('error', err);
          if (!opened) reject(err);
          return;
        }
      }

      this.emit('close', { code: e.code, reason: e.reason });
      if (!opened) {
        reject(new Error(`WebSocket closed before open (code ${e.code})`));
      }
    };
  }

  send(data: unknown): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error('WebSocket is not open');
    }
    const payload = typeof data === 'string' ? data : JSON.stringify(data);
    this.ws.send(payload);
  }

  close(code?: number, reason?: string): void {
    this.ws?.close(code, reason);
  }

  get readyState(): number {
    return this.ws?.readyState ?? WebSocket.CLOSED;
  }
}

/** Convenience: build a client and connect it in one call. */
export async function connectWebSocket(
  path: string,
  options: WebSocketClientOptions = {},
): Promise<WebSocketClient> {
  const client = new WebSocketClient(path, options);
  await client.connect();
  return client;
}
