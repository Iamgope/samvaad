import NetInfo from '@react-native-community/netinfo';
import { AppState, type AppStateStatus } from 'react-native';
import type { WebSocketClient } from './ws';

type LastJoinState =
  | { type: 'join_queue'; data: Record<string, number | string | null> }
  | null;

let _state: LastJoinState = null;

// Tracks what the user was doing right before a connection drop, so a
// reconnect can resend join_queue and the backend can resume the right
// session — matchmaking queue (debate_id null) or an active debate the user
// is a participant in (debate_id set).
export const reconnectState = {
  setQueue(data: Record<string, number | string>, debateId?: number | string | null) {
    _state = {
      type: 'join_queue',
      data: { ...data, debate_id: debateId != null ? Number(debateId) : null },
    };
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

/** Fires `callback` when the app returns to the foreground (background/inactive -> active). */
export function onAppForeground(callback: () => void): () => void {
  let prevState: AppStateStatus = AppState.currentState;

  const subscription = AppState.addEventListener('change', (nextState) => {
    if (prevState.match(/inactive|background/) && nextState === 'active') {
      callback();
    }
    prevState = nextState;
  });

  return () => subscription.remove();
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
