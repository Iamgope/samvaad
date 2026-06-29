import type { WebSocketClient } from './ws';

let _client: WebSocketClient | null = null;
let _debateId: number | null = null;

export const debateSession = {
  set(client: WebSocketClient, debateId: number) {
    if (_client && _client !== client) _client.close();
    _client = client;
    _debateId = debateId;
  },
  client: (): WebSocketClient | null => _client,
  debateId: (): number | null => _debateId,
  clear() {
    _client?.close();
    _client = null;
    _debateId = null;
  },
};
