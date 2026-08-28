"use client";

import { useEffect, useRef } from "react";
import { API } from "@/lib/api";

const UMAMI_SRC = "https://cloud.umami.is/script.js";
const UMAMI_ID = "60324c6a-e4c2-4e92-b1f6-280cf3ef30a1";
const CONSENT_CACHE_KEY = "tb_consent_cache";
const CONSENT_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

interface ConsentCache {
  allowAnalytics: boolean;
  allowCrashReports: boolean;
  ts: number;
}

function readCachedConsent(): ConsentCache | null {
  try {
    const raw = localStorage.getItem(CONSENT_CACHE_KEY);
    if (!raw) return null;
    const cached: ConsentCache = JSON.parse(raw);
    if (Date.now() - cached.ts > CONSENT_CACHE_TTL) return null;
    return cached;
  } catch {
    return null;
  }
}

function writeCachedConsent(data: { allowAnalytics: boolean; allowCrashReports: boolean }) {
  try {
    localStorage.setItem(
      CONSENT_CACHE_KEY,
      JSON.stringify({ ...data, ts: Date.now() })
    );
  } catch {}
}

// ── Umami loader ──────────────────────────────────────────
function loadUmami() {
  if (document.querySelector(`script[src="${UMAMI_SRC}"]`)) return;
  const s = document.createElement("script");
  s.src = UMAMI_SRC;
  s.dataset.websiteId = UMAMI_ID;
  s.async = true;
  document.head.appendChild(s);
}

function removeUmami() {
  const s = document.querySelector<HTMLScriptElement>(`script[src="${UMAMI_SRC}"]`);
  if (s) s.remove();
  // Remove any Umami cookies
  document.cookie.split(";").forEach((c) => {
    const name = c.split("=")[0].trim();
    if (name.startsWith("umami") || name === "_ga" || name.startsWith("_ga_")) {
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
    }
  });
}

// ── Crash reporter ────────────────────────────────────────
let crashReporterActive = false;
let originalOnError: ((...args: any[]) => void) | null = null;
let originalOnUnhandledRejection: ((...args: any[]) => void) | null = null;

interface CrashReport {
  type: "error" | "unhandledrejection";
  message: string;
  source?: string;
  lineno?: number;
  colno?: number;
  stack?: string;
  timestamp: string;
  url: string;
  userAgent: string;
}

async function sendCrashReport(report: CrashReport) {
  try {
    const token = localStorage.getItem("auth_token") || "";
    await fetch(`${API}/api/cron/client-error`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      credentials: "include",
      body: JSON.stringify(report),
      keepalive: true,
    });
  } catch {
    // Fire-and-forget — never block the page
  }
}

function activateCrashReporter() {
  if (crashReporterActive) return;
  crashReporterActive = true;

  originalOnError = window.onerror;
  window.onerror = (message, source, lineno, colno, error) => {
    sendCrashReport({
      type: "error",
      message: String(message),
      source: String(source || ""),
      lineno: Number(lineno || 0),
      colno: Number(colno || 0),
      stack: error?.stack || "",
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
    });
    // Call original handler if it exists
    if (originalOnError) return originalOnError(message, source, lineno, colno, error);
  };

  originalOnUnhandledRejection = window.onunhandledrejection;
  window.onunhandledrejection = (event: PromiseRejectionEvent) => {
    const reason = event.reason;
    sendCrashReport({
      type: "unhandledrejection",
      message: String(reason?.message || reason || "Unhandled rejection"),
      stack: reason?.stack || "",
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
    });
    if (originalOnUnhandledRejection) return originalOnUnhandledRejection.call(window, event);
  };
}

function deactivateCrashReporter() {
  if (!crashReporterActive) return;
  crashReporterActive = false;
  if (originalOnError) {
    window.onerror = originalOnError;
    originalOnError = null;
  }
  if (originalOnUnhandledRejection) {
    window.onunhandledrejection = originalOnUnhandledRejection;
    originalOnUnhandledRejection = null;
  }
}

// ── React component ───────────────────────────────────────
export function ConsentManager() {
  const initialized = useRef(false);

  useEffect(() => {
    // 1. Apply cached consent immediately (no flash)
    const cached = readCachedConsent();
    if (cached) {
      applyConsent(cached.allowAnalytics, cached.allowCrashReports);
    }

    // 2. Fetch fresh consent from API
    const token = localStorage.getItem("auth_token");
    if (!token) return; // Not logged in — skip

    fetch(`${API}/api/preferences`, {
      credentials: "include",
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((data: any) => {
        const p = data?.preferences?.privacy;
        if (!p) return;

        const allowAnalytics = p.allowAnalytics ?? false;
        const allowCrashReports = p.allowCrashReports ?? true;

        writeCachedConsent({ allowAnalytics, allowCrashReports });
        applyConsent(allowAnalytics, allowCrashReports);
      })
      .catch(() => {});

    // 3. Listen for consent changes from the privacy page
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail) {
        writeCachedConsent(detail);
        applyConsent(detail.allowAnalytics, detail.allowCrashReports);
      }
    };
    window.addEventListener("tb:consent-changed", handler as EventListener);
    return () => window.removeEventListener("tb:consent-changed", handler as EventListener);
  }, []);

  return null; // No UI — side-effect only
}

function applyConsent(allowAnalytics: boolean, allowCrashReports: boolean) {
  // Analytics
  if (allowAnalytics) {
    loadUmami();
  } else {
    removeUmami();
  }

  // Crash reports
  if (allowCrashReports) {
    activateCrashReporter();
  } else {
    deactivateCrashReporter();
  }
}
