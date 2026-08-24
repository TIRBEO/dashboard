import { api } from "@/lib/api";

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const output = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) output[i] = raw.charCodeAt(i);
  return output;
}

export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return null;
  try {
    return await navigator.serviceWorker.register("/sw.js");
  } catch {
    return null;
  }
}

/**
 * Ensures a service worker + browser push subscription exist and are
 * registered with the backend. Returns false if anything isn't supported
 * or push isn't configured server-side.
 */
export async function subscribeToPush(): Promise<boolean> {
  if (typeof window === "undefined") return false;
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) return false;

  const cfg = await api
    .get<{ configured: boolean; publicKey?: string | null }>("/api/notifications/push/subscribe")
    .catch(() => null);
  if (!cfg?.configured || !cfg.publicKey) return false;

  const registration = await registerServiceWorker();
  if (!registration) return false;

  await navigator.serviceWorker.ready;

  let sub = await registration.pushManager.getSubscription();
  if (!sub) {
    sub = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(cfg.publicKey) as unknown as BufferSource,
    });
  }

  const json = sub.toJSON() as any;
  const keys = json.keys || {};
  await api
    .post("/api/notifications/push/subscribe", {
      endpoint: json.endpoint,
      p256dh: keys.p256dh,
      auth: keys.auth,
    })
    .catch(() => null);
  return true;
}
