"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Monitor,
  Smartphone,
  Tablet,
  Globe,
  Shield,
  LogOut,
  Clock,
  MapPin,
  AlertTriangle,
  RefreshCw,
  ChevronRight,
} from "lucide-react";
import { SecuritySkeleton } from "../../components/Skeleton";

const API = process.env.NEXT_PUBLIC_API_URL || "https://api.tirbeo.app";

type Session = {
  id: string;
  createdAt: string;
  userAgent?: string;
  ipAddress?: string;
  location?: string;
  isCurrent?: boolean;
};

function parseUA(ua?: string) {
  if (!ua) return { browser: "Unknown browser", os: "Unknown OS", device: "desktop" as const };
  const browser = ua.includes("Firefox")
    ? "Firefox"
    : ua.includes("Edg")
      ? "Edge"
      : ua.includes("Chrome")
        ? "Chrome"
        : ua.includes("Safari")
          ? "Safari"
          : "Unknown browser";
  const os = ua.includes("Windows")
    ? "Windows"
    : ua.includes("Mac")
      ? "macOS"
      : ua.includes("Linux")
        ? "Linux"
        : ua.includes("iPhone")
          ? "iOS"
          : ua.includes("Android")
            ? "Android"
            : "Unknown OS";
  const device: "mobile" | "tablet" | "desktop" =
    ua.includes("Mobile") || ua.includes("iPhone")
      ? "mobile"
      : ua.includes("Tablet")
        ? "tablet"
        : "desktop";
  return { browser, os, device };
}

function timeAgo(date: string) {
  const secs = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (secs < 60) return "Just now";
  if (secs < 3600) return `${Math.floor(secs / 60)}m ago`;
  if (secs < 86400) return `${Math.floor(secs / 3600)}h ago`;
  if (secs < 604800) return `${Math.floor(secs / 86400)}d ago`;
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getDeviceIcon(type: "mobile" | "tablet" | "desktop") {
  switch (type) {
    case "desktop":
      return <Monitor size={16} />;
    case "mobile":
      return <Smartphone size={16} />;
    case "tablet":
      return <Tablet size={16} />;
    default:
      return <Globe size={16} />;
  }
}

export default function SessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const fetched = useRef(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [revoking, setRevoking] = useState<string | null>(null);
  const [revokingAll, setRevokingAll] = useState(false);

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
          setSessions(
            d.sessions.map(
              (
                s: { id: string; createdAt: string; userAgent?: string; ipAddress?: string; location?: string },
                i: number
              ) => ({
                id: s.id,
                createdAt: s.createdAt,
                userAgent: s.userAgent,
                ipAddress: s.ipAddress,
                location: s.location,
                isCurrent: i === 0,
              })
            )
          );
        }
      })
      .catch(() => {
        showToast("Failed to load sessions", "error");
      });
  }, [showToast]);

  const revokeSession = async (sessionId: string) => {
    if (!window.confirm("Sign out of this session? This action cannot be undone.")) return;
    setRevoking(sessionId);
    try {
      const res = await fetch(`${API}/api/security/sessions/${sessionId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        setSessions(prev => prev.filter(s => s.id !== sessionId));
        showToast("Session signed out");
      } else {
        showToast("Failed to sign out session", "error");
      }
    } catch {
      showToast("Connection error", "error");
    }
    setRevoking(null);
  };

  const revokeAllOther = async () => {
    if (!window.confirm("Sign out of all other devices? This will end all other sessions.")) return;
    setRevokingAll(true);
    try {
      const res = await fetch(`${API}/api/security/sessions/revoke-all`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        setSessions(prev => prev.filter(s => s.isCurrent));
        showToast("All other sessions signed out");
      } else {
        showToast("Failed to sign out sessions", "error");
      }
    } catch {
      showToast("Connection error", "error");
    }
    setRevokingAll(false);
  };

  if (fetched.current && sessions.length === 0 && !toast) {
    return (
      <div className="space-y-8">
        <div className="section-header">
          <h1>Sessions</h1>
          <p>Manage your active sessions and signed-in devices</p>
        </div>
        <div
          className="glass card-section"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "60px 24px",
            textAlign: "center",
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
              marginBottom: 16,
              color: "var(--text-muted)",
            }}
          >
            <Monitor size={22} />
          </div>
          <p style={{ fontSize: 14, fontWeight: 500, color: "var(--text)", marginBottom: 6 }}>
            No active sessions
          </p>
          <p style={{ fontSize: 12, color: "var(--text-muted)", maxWidth: 300 }}>
            Sessions will appear here when you sign in to your account from different devices or browsers.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="section-header" style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
        <div>
          <h1>Sessions</h1>
          <p>Manage your active sessions and signed-in devices</p>
        </div>
        {sessions.length > 1 && (
          <button
            onClick={revokeAllOther}
            disabled={revokingAll}
            className="btn btn-danger"
            style={{ fontSize: 12, height: 34, padding: "0 16px", display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}
          >
            <AlertTriangle size={12} />
            {revokingAll ? "Signing out..." : "Revoke all other sessions"}
          </button>
        )}
      </div>

      <div className="glass card-section">
        {!fetched.current ? (
          <SecuritySkeleton />
        ) : sessions.length === 0 ? null : (
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {sessions.map(session => {
              const { browser, os, device } = parseUA(session.userAgent);
              return (
                <div
                  key={session.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "14px 16px",
                    borderRadius: 10,
                    background: session.isCurrent ? "rgba(255,255,255,0.04)" : "transparent",
                    border: `1px solid ${session.isCurrent ? "var(--border)" : "transparent"}`,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
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
                      {getDeviceIcon(device)}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                        <p style={{ fontSize: 13, fontWeight: 500, color: "var(--text)" }}>
                          {browser} on {os}
                        </p>
                        {session.isCurrent && (
                          <span
                            className="badge badge-success"
                            style={{ fontSize: 9, padding: "2px 6px" }}
                          >
                            Current session
                          </span>
                        )}
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          marginTop: 3,
                          flexWrap: "wrap",
                        }}
                      >
                        {session.ipAddress && (
                          <span
                            style={{
                              fontSize: 11,
                              color: "var(--text-muted)",
                              display: "flex",
                              alignItems: "center",
                              gap: 3,
                            }}
                          >
                            <Globe size={10} /> {session.ipAddress}
                          </span>
                        )}
                        {session.location && (
                          <>
                            <span style={{ fontSize: 11, color: "var(--text-ash)" }}>·</span>
                            <span
                              style={{
                                fontSize: 11,
                                color: "var(--text-muted)",
                                display: "flex",
                                alignItems: "center",
                                gap: 3,
                              }}
                            >
                              <MapPin size={10} /> {session.location}
                            </span>
                          </>
                        )}
                        <span style={{ fontSize: 11, color: "var(--text-ash)" }}>·</span>
                        <span
                          style={{
                            fontSize: 11,
                            color: "var(--text-muted)",
                            display: "flex",
                            alignItems: "center",
                            gap: 3,
                          }}
                        >
                          <Clock size={10} /> {timeAgo(session.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                  {!session.isCurrent && (
                    <button
                      onClick={() => revokeSession(session.id)}
                      disabled={revoking === session.id}
                      className="btn btn-ghost"
                      style={{
                        fontSize: 11,
                        height: 28,
                        padding: "0 10px",
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                        flexShrink: 0,
                        color: "var(--danger)",
                      }}
                    >
                      <LogOut size={11} />
                      {revoking === session.id ? "Signing out..." : "Sign out"}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {toast && (
        <div
          style={{
            position: "fixed",
            bottom: 24,
            right: 24,
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "10px 16px",
            borderRadius: 10,
            background: toast.type === "success" ? "var(--success)" : "var(--danger)",
            color: "#fff",
            fontSize: 12,
            fontWeight: 500,
            boxShadow: "0 8px 30px rgba(0,0,0,0.4)",
            animation: "slideUp 0.2s ease",
          }}
        >
          {toast.type === "success" ? <Shield size={14} /> : <AlertTriangle size={14} />}
          {toast.message}
        </div>
      )}

      <style jsx global>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
