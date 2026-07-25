// Tracks the offset between this device's clock and the backend's, so the
// rebuttal chess clock (server-authoritative — see debate/services.py) can be
// rendered from a deadline timestamp without trusting the device clock outright.
let offsetMs = 0;

export function syncServerClock(serverIso: string): void {
  offsetMs = Date.parse(serverIso) - Date.now();
}

export function correctedNow(): number {
  return Date.now() + offsetMs;
}
