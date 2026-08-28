"use client";
// Silent client error telemetry — never reloads, never shows toast
export function trackWsClose(code: number, retryCount: number, wsUrl: string) {
  try {
    const payload = JSON.stringify({
      type: "ws_close",
      code,
      retryCount,
      wsHost: (() => { try { return new URL(wsUrl).host; } catch { return wsUrl; } })(),
      ts: Date.now(),
      url: typeof window !== "undefined" ? window.location.pathname : "",
    });
    if (navigator.sendBeacon) {
      navigator.sendBeacon("/api/cron/client-error", new Blob([payload], { type: "application/json" }));
    } else {
      fetch("/api/cron/client-error", { method: "POST", body: payload, headers: { "Content-Type": "application/json" }, keepalive: true }).catch(() => {});
    }
  } catch {}
}

export function trackClientError(message: string, meta?: Record<string, unknown>) {
  try {
    const payload = JSON.stringify({ type: "client_error", message, ...meta, ts: Date.now(), url: typeof window !== "undefined" ? window.location.pathname : "" });
    if (navigator.sendBeacon) navigator.sendBeacon("/api/cron/client-error", new Blob([payload], { type: "application/json" }));
  } catch {}
}
