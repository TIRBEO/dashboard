"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Monitor,
  Smartphone,
  Tablet,
  Globe,
  Shield,
  ShieldCheck,
  ShieldAlert,
  LogOut,
  Clock,
  MapPin,
  RefreshCw,
  Trash2,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import { SecuritySkeleton } from "../../components/Skeleton";

const API = process.env.NEXT_PUBLIC_API_URL || "https://api.tirbeo.app";

type Session = {
  id: string;
  createdAt: string;
  userAgent?: string;
  ipAddress?: string;
  location?: string;
};

type DeviceEntry = {
  id: string;
  browser: string;
  os: string;
  deviceType: "desktop" | "mobile" | "tablet";
  lastActive: string;
  ip: string;
  location: string;
  rawUA: string;
  trusted: boolean;
  isCurrent: boolean;
};

function parseUA(ua?: string) {
  if (!ua) return { browser: "Unknown", os: "Unknown", device: "desktop" as const, raw: "" };
  const browser = ua.includes("Firefox") ? "Firefox" : ua.includes("Edg") ? "Edge" : ua.includes("Chrome") ? "Chrome" : ua.includes("Safari") ? "Safari" : "Unknown";
  const os = ua.includes("Windows") ? "Windows" : ua.includes("Mac") ? "macOS" : ua.includes("Linux") ? "Linux" : ua.includes("iPhone") ? "iOS" : ua.includes("Android") ? "Android" : "Unknown";
  const device = (ua.includes("Mobile") || ua.includes("iPhone")) ? "mobile" : ua.includes("Tablet") ? "tablet" : "desktop";
  return { browser, os, device, raw: ua };
}

function getDeviceIcon(type: "desktop" | "mobile" | "tablet") {
  switch (type) {
    case "desktop": return <Monitor size={16} />;
    case "mobile": return <Smartphone size={16} />;
    case "tablet": return <Tablet size={16} />;
  }
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function buildDevices(sessions: Session[]): DeviceEntry[] {
  const grouped = new Map<string, DeviceEntry>();

  for (let i = 0; i < sessions.length; i++) {
    const s = sessions[i];
    const parsed = parseUA(s.userAgent);
    const key = `${parsed.browser}|${parsed.os}|${parsed.device}`;

    if (grouped.has(key)) {
      const existing = grouped.get(key)!;
      if (new Date(s.createdAt) > new Date(existing.lastActive)) {
        existing.lastActive = s.createdAt;
        existing.ip = s.ipAddress || "Unknown";
        existing.location = s.location || "Unknown";
      }
    } else {
      grouped.set(key, {
        id: s.id,
        browser: parsed.browser,
        os: parsed.os,
        deviceType: parsed.device,
        lastActive: s.createdAt,
        ip: s.ipAddress || "Unknown",
        location: s.location || "Unknown",
        rawUA: parsed.raw,
        trusted: false,
        isCurrent: i === 0,
      });
    }
  }

  return Array.from(grouped.values()).sort(
    (a, b) => new Date(b.lastActive).getTime() - new Date(a.lastActive).getTime()
  );
}

export default function DevicesPage() {
  const [devices, setDevices] = useState<DeviceEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const fetched = useRef(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((message: string, type: "success" | "error" = "success") => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ message, type });
    toastTimer.current = setTimeout(() => setToast(null), 3000);
  }, []);

  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;

    fetch(`${API}/api/security/sessions`, { credentials: "include" })
      .then(r => (r.ok ? r.json() : null))
      .then(d => {
        if (d?.sessions) {
          setDevices(buildDevices(d.sessions));
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const toggleTrusted = (id: string) => {
    setDevices(prev =>
      prev.map(d => (d.id === id ? { ...d, trusted: !d.trusted } : d))
    );
    const device = devices.find(d => d.id === id);
    if (device) {
      showToast(device.trusted ? "Device untrusted" : "Device marked as trusted");
    }
  };

  const removeDevice = async (id: string) => {
    if (!window.confirm("Sign out this device? You can't undo this.")) return;
    try {
      const res = await fetch(`${API}/api/security/sessions/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        setDevices(prev => prev.filter(d => d.id !== id));
        showToast("Device signed out");
      } else {
        showToast("Failed to sign out device", "error");
      }
    } catch {
      showToast("Connection error", "error");
    }
  };

  const refreshDevices = () => {
    setLoading(true);
    setDevices([]);
    fetched.current = false;
    fetch(`${API}/api/security/sessions`, { credentials: "include" })
      .then(r => (r.ok ? r.json() : null))
      .then(d => {
        if (d?.sessions) {
          setDevices(buildDevices(d.sessions));
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  if (loading) return <SecuritySkeleton />;

  return (
    <div className="space-y-6">
      {toast && (
        <div
          style={{
            position: "fixed",
            top: 20,
            right: 20,
            zIndex: 9999,
            padding: "10px 18px",
            borderRadius: 10,
            fontSize: 12,
            fontWeight: 500,
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: toast.type === "success" ? "var(--success)" : "var(--danger)",
            color: "#fff",
            boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
            animation: "fadeIn 0.2s ease",
          }}
        >
          {toast.type === "success" ? <CheckCircle size={14} /> : <AlertTriangle size={14} />}
          {toast.message}
        </div>
      )}

      <div className="section-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h1>Devices</h1>
          <p>Manage your trusted and signed-in devices</p>
        </div>
        <button
          onClick={refreshDevices}
          className="btn btn-ghost"
          style={{ fontSize: 11, height: 32, padding: "0 14px", flexShrink: 0 }}
        >
          <RefreshCw size={12} />
          Refresh
        </button>
      </div>

      <div
        className="glass card-section"
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: 12,
          padding: "14px 18px",
          borderRadius: 10,
          borderLeft: "3px solid var(--accent, #2f81f7)",
        }}
      >
        <Shield size={16} style={{ color: "var(--accent, #2f81f7)", marginTop: 2, flexShrink: 0 }} />
        <div>
          <p style={{ fontSize: 12, fontWeight: 500, color: "var(--text)", margin: 0 }}>
            Trusted devices bypass two-factor authentication
          </p>
          <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 3, margin: 0 }}>
            Mark a device as trusted so you won&apos;t need to verify your identity each time you sign in from it. Only do this on devices you own.
          </p>
        </div>
      </div>

      <div className="glass card-section">
        <div className="flex items-center gap-2.5" style={{ marginBottom: 20 }}>
          <Monitor size={15} style={{ color: "var(--text-muted)" }} />
          <h3 style={{ margin: 0 }}>Signed-in devices</h3>
          <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
            ({devices.length} device{devices.length !== 1 ? "s" : ""})
          </span>
        </div>

        {devices.length === 0 ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "48px 24px",
              gap: 12,
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                background: "rgba(255,255,255,0.04)",
                border: "1px solid var(--border)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--text-muted)",
              }}
            >
              <Globe size={22} />
            </div>
            <p style={{ fontSize: 13, fontWeight: 500, color: "var(--text)", margin: 0 }}>
              No devices found
            </p>
            <p style={{ fontSize: 11, color: "var(--text-muted)", margin: 0 }}>
              You don&apos;t have any active sessions yet. Sign in to get started.
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {devices.map(d => (
              <div
                key={d.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "14px 16px",
                  borderRadius: 10,
                  background: d.isCurrent ? "rgba(255,255,255,0.04)" : "transparent",
                  border: `1px solid ${d.isCurrent ? "var(--border)" : "transparent"}`,
                  transition: "background 0.15s ease",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0, flex: 1 }}>
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 8,
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid var(--border)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "var(--text-muted)",
                      flexShrink: 0,
                    }}
                  >
                    {getDeviceIcon(d.deviceType)}
                  </div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                      <p style={{ fontSize: 13, fontWeight: 500, color: "var(--text)", margin: 0 }}>
                        {d.browser} on {d.os}
                      </p>
                      {d.isCurrent && (
                        <span className="badge badge-success" style={{ fontSize: 9, padding: "2px 6px" }}>
                          This device
                        </span>
                      )}
                      {d.trusted && (
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 3,
                            fontSize: 9,
                            padding: "2px 6px",
                            borderRadius: 6,
                            background: "rgba(47,129,247,0.12)",
                            color: "var(--accent, #2f81f7)",
                            fontWeight: 500,
                          }}
                        >
                          <ShieldCheck size={9} />
                          Trusted
                        </span>
                      )}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 3, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 11, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 3 }}>
                        <Clock size={10} />
                        {timeAgo(d.lastActive)}
                      </span>
                      <span style={{ fontSize: 11, color: "var(--text-ash)" }}>·</span>
                      <span style={{ fontSize: 11, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 3 }}>
                        <MapPin size={10} />
                        {d.location}
                      </span>
                      <span style={{ fontSize: 11, color: "var(--text-ash)" }}>·</span>
                      <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
                        {d.ip}
                      </span>
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0, marginLeft: 12 }}>
                  <button
                    onClick={() => toggleTrusted(d.id)}
                    className="btn btn-ghost"
                    style={{
                      fontSize: 11,
                      height: 28,
                      padding: "0 10px",
                      color: d.trusted ? "var(--accent, #2f81f7)" : "var(--text-muted)",
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                    title={d.trusted ? "Remove trust" : "Mark as trusted"}
                  >
                    {d.trusted ? <ShieldCheck size={12} /> : <ShieldAlert size={12} />}
                    {d.trusted ? "Untrust" : "Trust"}
                  </button>
                  {!d.isCurrent && (
                    <button
                      onClick={() => removeDevice(d.id)}
                      className="btn btn-ghost"
                      style={{
                        fontSize: 11,
                        height: 28,
                        padding: "0 10px",
                        color: "var(--danger)",
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                      }}
                      title="Sign out this device"
                    >
                      <Trash2 size={11} />
                      Remove
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
