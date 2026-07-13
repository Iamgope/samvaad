import NetInfo from '@react-native-community/netinfo';
import type { WebSocketClient } from './ws';

type LastJoinState =
  | { type: 'join_queue'; data: Record<string, number | string> }
  | { type: 'join_viewer'; data: { debate_id: number } }
  | null;

let _state: LastJoinState = null;

// Tracks what the user was doing right before a connection drop, so a
// reconnect can resend the matching join event and the backend can resume
// the right session (matchmaking queue vs. an active debate).
export const reconnectState = {
  setQueue(data: Record<string, number | string>) {
    _state = { type: 'join_queue', data };
  },
  setViewer(debateId: number | string) {
    _state = { type: 'join_viewer', data: { debate_id: Number(debateId) } };
  },
  get(): LastJoinState {
    return _state;
  },
  clear() {
    _state = null;
  },
};

/** Fires `callback` on the offline->online edge. Ignores NetInfo's immediate initial snapshot. */
export function onConnectivityRestored(callback: () => void): () => void {
  let sawFirstEvent = false;
  let wasOffline = false;

  return NetInfo.addEventListener((state) => {
    const online = !!state.isConnected && state.isInternetReachable !== false;

    if (!sawFirstEvent) {
      sawFirstEvent = true;
      wasOffline = !online;
      return;
    }

    if (online && wasOffline) {
      wasOffline = false;
      callback();
    } else if (!online) {
      wasOffline = true;
    }
  });
}

/** Reopens `client` and resends whatever join event matches the last known state. */
export async function attemptResume(client: WebSocketClient): Promise<boolean> {
  const state = reconnectState.get();
  if (!state) return false;
  try {
    await client.reconnect();
    client.send({ type: state.type, data: state.data });
    return true;
  } catch {
    return false;
  }
}
