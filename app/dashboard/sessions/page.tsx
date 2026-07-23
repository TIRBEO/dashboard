"use client";

import { useState, useEffect, useRef } from "react";
import {
  Monitor, Smartphone, Tablet, Globe, Shield,
  LogOut, Clock, MapPin, AlertTriangle,
} from "lucide-react";
import {
  PageContainer, PageHeader, Card, Badge, Button,
  EmptyState, Skeleton, Toast, useToast,
} from "../components";

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
  if (secs < 3600) return Math.floor(secs / 60) + "m ago";
  if (secs < 86400) return Math.floor(secs / 3600) + "h ago";
  if (secs < 604800) return Math.floor(secs / 86400) + "d ago";
  return new Date(date).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
}

function getDeviceIcon(type: "mobile" | "tablet" | "desktop") {
  switch (type) {
    case "desktop": return <Monitor size={16} />;
    case "mobile": return <Smartphone size={16} />;
    case "tablet": return <Tablet size={16} />;
    default: return <Globe size={16} />;
  }
}

export default function SessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const fetched = useRef(false);
  const [revoking, setRevoking] = useState<string | null>(null);
  const [revokingAll, setRevokingAll] = useState(false);
  const { toast, show, hide } = useToast();

  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;
    fetch(API + "/api/security/sessions", { credentials: "include" })
      .then(r => (r.ok ? r.json() : null))
      .then(d => {
        if (d?.sessions) {
          setSessions(d.sessions.map((s: any, i: number) => ({
            id: s.id, createdAt: s.createdAt, userAgent: s.userAgent,
            ipAddress: s.ipAddress, location: s.location, isCurrent: i === 0,
          })));
        }
      })
      .catch(() => show("Failed to load sessions", "error"));
  }, [show]);

  const revokeSession = async (sessionId: string) => {
    if (!window.confirm("Sign out of this session? This action cannot be undone.")) return;
    setRevoking(sessionId);
    try {
      const res = await fetch(API + "/api/security/sessions/" + sessionId, {
        method: "DELETE", credentials: "include",
      });
      if (res.ok) {
        setSessions(prev => prev.filter(s => s.id !== sessionId));
        show("Session signed out");
      } else {
        show("Failed to sign out session", "error");
      }
    } catch {
      show("Connection error", "error");
    }
    setRevoking(null);
  };

  const revokeAllOther = async () => {
    if (!window.confirm("Sign out of all other devices? This will end all other sessions.")) return;
    setRevokingAll(true);
    try {
      const res = await fetch(API + "/api/security/sessions/revoke-all", {
        method: "DELETE", credentials: "include",
      });
      if (res.ok) {
        setSessions(prev => prev.filter(s => s.isCurrent));
        show("All other sessions signed out");
      } else {
        show("Failed to sign out sessions", "error");
      }
    } catch {
      show("Connection error", "error");
    }
    setRevokingAll(false);
  };

  const loaded = fetched.current;

  if (loaded && sessions.length === 0) {
    return (
      <PageContainer>
        <PageHeader title="Sessions" description="Manage your active sessions and signed-in devices" />
        <EmptyState
          icon={Monitor}
          title="No active sessions"
          description="Sessions will appear here when you sign in to your account from different devices or browsers."
        />
        {toast && <Toast message={toast.message} type={toast.type} onClose={hide} />}
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title="Sessions"
        description="Manage your active sessions and signed-in devices"
        action={
          sessions.length > 1 ? (
            <Button variant="danger" size="sm" onClick={revokeAllOther} disabled={revokingAll}>
              <AlertTriangle size={12} />
              {revokingAll ? "Signing out..." : "Revoke all other sessions"}
            </Button>
          ) : undefined
        }
      />

      <Card>
        {!loaded ? (
          <Skeleton count={3} height={64} />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {sessions.map(session => {
              const { browser, os, device } = parseUA(session.userAgent);
              const rowBg = session.isCurrent ? "rgba(255,255,255,0.04)" : "transparent";
              const rowBorder = session.isCurrent ? "var(--border)" : "transparent";
              return (
                <div
                  key={session.id}
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "14px 16px", borderRadius: 10, background: rowBg,
                    border: "1px solid " + rowBorder,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: 8,
                      background: "rgba(255,255,255,0.04)", border: "1px solid var(--border)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: "var(--text-muted)", flexShrink: 0,
                    }}>
                      {getDeviceIcon(device)}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                        <p style={{ fontSize: 13, fontWeight: 500, color: "var(--text)" }}>
                          {browser} on {os}
                        </p>
                        {session.isCurrent && (
                          <Badge variant="success" style={{ fontSize: 9, padding: "2px 6px" }}>
                            Current session
                          </Badge>
                        )}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 3, flexWrap: "wrap" }}>
                        {session.ipAddress && (
                          <span style={{ fontSize: 11, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 3 }}>
                            <Globe size={10} /> {session.ipAddress}
                          </span>
                        )}
                        {session.location && (
                          <>
                            <span style={{ fontSize: 11, color: "var(--text-ash)" }}>·</span>
                            <span style={{ fontSize: 11, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 3 }}>
                              <MapPin size={10} /> {session.location}
                            </span>
                          </>
                        )}
                        <span style={{ fontSize: 11, color: "var(--text-ash)" }}>·</span>
                        <span style={{ fontSize: 11, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 3 }}>
                          <Clock size={10} /> {timeAgo(session.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                  {!session.isCurrent && (
                    <Button
                      variant="ghost" size="sm"
                      onClick={() => revokeSession(session.id)}
                      disabled={revoking === session.id}
                      className="btn-danger"
                      style={{ color: "var(--danger)" }}
                    >
                      <LogOut size={11} />
                      {revoking === session.id ? "Signing out..." : "Sign out"}
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {toast && <Toast message={toast.message} type={toast.type} onClose={hide} />}
    </PageContainer>
  );
}
