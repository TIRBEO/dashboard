/**
 * Lightweight event bus to sync notification state between
 * the AppShell bell sidebar and the inbox page.
 *
 * Events:
 *   "notifications-changed" — fired when notifications are read/deleted/updated
 */

type Listener = () => void;

const listeners: Set<Listener> = new Set();

export function onNotificationsChanged(fn: Listener): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function notifyNotificationsChanged(): void {
  for (const fn of listeners) {
    try { fn(); } catch { /* ignore */ }
  }
}
