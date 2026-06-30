import type { WebSocketClient } from './ws';

let _client: WebSocketClient | null = null;
let _debateId: number | null = null;
let _buffer: unknown[] = [];
let _buffering = false;
let _bufferCleanup: (() => void) | null = null;

export const debateSession = {
  set(client: WebSocketClient, debateId: number) {
    if (_client && _client !== client) _client.close();
    _client = client;
    _debateId = debateId;
  },
  client: (): WebSocketClient | null => _client,
  debateId: (): number | null => _debateId,

  // Call immediately after match found so events aren't lost during the opening overlay.
  startBuffering() {
    if (!_client || _buffering) return;
    _buffering = true;
    _buffer = [];
    _bufferCleanup = _client.on('message', (msg) => {
      if (_buffering) _buffer.push(msg);
    });
  },

  // Call when DebateChatScreen is ready to handle events. Returns buffered events to replay.
  drainBuffer(): unknown[] {
    _buffering = false;
    _bufferCleanup?.();
    _bufferCleanup = null;
    const events = [..._buffer];
    _buffer = [];
    return events;
  },

  clear() {
    _buffering = false;
    _buffer = [];
    _bufferCleanup?.();
    _bufferCleanup = null;
    _client?.close();
    _client = null;
    _debateId = null;
  },
};
