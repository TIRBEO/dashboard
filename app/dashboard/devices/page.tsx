"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Monitor, Smartphone, Tablet, Globe, ShieldCheck, ShieldAlert, Clock, MapPin, RefreshCw, Trash2 } from "lucide-react";
import { PageContainer, PageHeader, Card, Button, Badge, EmptyState, Skeleton, Toast, useToast } from "../components";

const API = process.env.NEXT_PUBLIC_API_URL || "https://api.tirbeo.app";

type Session = {
  id: string; createdAt: string; userAgent?: string; ipAddress?: string; location?: string;
};

type DeviceEntry = {
  id: string; browser: string; os: string; deviceType: "desktop" | "mobile" | "tablet";
  lastActive: string; ip: string; location: string; rawUA: string; trusted: boolean; isCurrent: boolean;
};

function parseUA(ua?: string): { browser: string; os: string; device: "desktop" | "mobile" | "tablet"; raw: string } {
  if (!ua) return { browser: "Unknown", os: "Unknown", device: "desktop", raw: "" };
  var browser = ua.includes("Firefox") ? "Firefox" : ua.includes("Edg") ? "Edge" : ua.includes("Chrome") ? "Chrome" : ua.includes("Safari") ? "Safari" : "Unknown";
  var os = ua.includes("Windows") ? "Windows" : ua.includes("Mac") ? "macOS" : ua.includes("Linux") ? "Linux" : ua.includes("iPhone") ? "iOS" : ua.includes("Android") ? "Android" : "Unknown";
  var device = (ua.includes("Mobile") || ua.includes("iPhone")) ? "mobile" : ua.includes("Tablet") ? "tablet" : "desktop";
  return { browser: browser, os: os, device: device as "desktop" | "mobile" | "tablet", raw: ua };
}

function getDeviceIcon(type: "desktop" | "mobile" | "tablet") {
  if (type === "desktop") return <Monitor size={16} />;
  if (type === "mobile") return <Smartphone size={16} />;
  return <Tablet size={16} />;
}

function timeAgo(dateStr: string): string {
  var diff = Date.now() - new Date(dateStr).getTime();
  var mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return mins + "m ago";
  var hrs = Math.floor(mins / 60);
  if (hrs < 24) return hrs + "h ago";
  var days = Math.floor(hrs / 24);
  if (days < 7) return days + "d ago";
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function buildDevices(sessions: Session[]): DeviceEntry[] {
  var grouped = new Map<string, DeviceEntry>();
  for (var i = 0; i < sessions.length; i++) {
    var s = sessions[i];
    var parsed = parseUA(s.userAgent);
    var key = parsed.browser + "|" + parsed.os + "|" + parsed.device;
    if (grouped.has(key)) {
      var existing = grouped.get(key)!;
      if (new Date(s.createdAt) > new Date(existing.lastActive)) {
        existing.lastActive = s.createdAt;
        existing.ip = s.ipAddress || "Unknown";
        existing.location = s.location || "Unknown";
      }
    } else {
      grouped.set(key, {
        id: s.id, browser: parsed.browser, os: parsed.os, deviceType: parsed.device,
        lastActive: s.createdAt, ip: s.ipAddress || "Unknown", location: s.location || "Unknown",
        rawUA: parsed.raw, trusted: false, isCurrent: i === 0,
      });
    }
  }
  return Array.from(grouped.values()).sort(function(a, b) {
    return new Date(b.lastActive).getTime() - new Date(a.lastActive).getTime();
  });
}

export default function DevicesPage() {
  const [devices, setDevices] = useState<DeviceEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const fetched = useRef(false);
  const toast = useToast();

  useEffect(function() {
    if (fetched.current) return;
    fetched.current = true;
    fetch(API + "/api/security/sessions", { credentials: "include" })
      .then(function(r) { return r.ok ? r.json() : null; })
      .then(function(d) { if (d && d.sessions) setDevices(buildDevices(d.sessions)); })
      .catch(function() {})
      .finally(function() { setLoading(false); });
  }, []);

  var toggleTrusted = function(id: string) {
    setDevices(function(prev) { return prev.map(function(d) { return d.id === id ? Object.assign({}, d, { trusted: !d.trusted }) : d; }); });
    var device = devices.find(function(d) { return d.id === id; });
    if (device) toast.show(device.trusted ? "Device untrusted" : "Device marked as trusted");
  };

  var removeDevice = async function(id: string) {
    if (!window.confirm("Sign out this device? You can't undo this.")) return;
    try {
      var res = await fetch(API + "/api/security/sessions/" + id, { method: "DELETE", credentials: "include" });
      if (res.ok) {
        setDevices(function(prev) { return prev.filter(function(d) { return d.id !== id; }); });
        toast.show("Device signed out");
      } else {
        toast.show("Failed to sign out device", "error");
      }
    } catch (e) {
      toast.show("Connection error", "error");
    }
  };

  var refreshDevices = function() {
    setLoading(true);
    setDevices([]);
    fetched.current = false;
    fetch(API + "/api/security/sessions", { credentials: "include" })
      .then(function(r) { return r.ok ? r.json() : null; })
      .then(function(d) { if (d && d.sessions) setDevices(buildDevices(d.sessions)); })
      .catch(function() {})
      .finally(function() { setLoading(false); });
  };

  if (loading) return <Skeleton count={3} height={80} />;

  return (
    <PageContainer>
      {toast.toast && <Toast message={toast.toast.message} type={toast.toast.type} onClose={toast.hide} />}

      <PageHeader title="Devices" description="Manage your trusted and signed-in devices"
        action={<Button variant="ghost" size="sm" onClick={refreshDevices}><RefreshCw size={12} /> Refresh</Button>} />

      <Card>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "14px 18px", borderRadius: 10, borderLeft: "3px solid var(--accent, #2f81f7)" }}>
          <ShieldCheck size={16} style={{ color: "var(--accent, #2f81f7)", marginTop: 2, flexShrink: 0 }} />
          <div>
            <p style={{ fontSize: 12, fontWeight: 500, color: "var(--text)", margin: 0 }}>
              Trusted devices bypass two-factor authentication
            </p>
            <p style={{ fontSize: 11, color: "var(--text-muted)", margin: 0, marginTop: 3 }}>
              Mark a device as trusted so you won&apos;t need to verify your identity each time you sign in from it. Only do this on devices you own.
            </p>
          </div>
        </div>
      </Card>

      <Card title="Signed-in devices" subtitle={devices.length + " device" + (devices.length !== 1 ? "s" : "")}>
        {devices.length === 0 ? (
          <EmptyState icon={Globe} title="No devices found" description="You don't have any active sessions yet. Sign in to get started." />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {devices.map(function(d) {
              return (
                <div key={d.id} style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "14px 16px", borderRadius: 10,
                  background: d.isCurrent ? "rgba(255,255,255,0.04)" : "transparent",
                  border: "1px solid " + (d.isCurrent ? "var(--border)" : "transparent"),
                  transition: "background 0.15s ease",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0, flex: 1 }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: 8, background: "rgba(255,255,255,0.04)",
                      border: "1px solid var(--border)", display: "flex", alignItems: "center",
                      justifyContent: "center", color: "var(--text-muted)", flexShrink: 0,
                    }}>
                      {getDeviceIcon(d.deviceType)}
                    </div>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                        <p style={{ fontSize: 13, fontWeight: 500, color: "var(--text)", margin: 0 }}>
                          {d.browser} on {d.os}
                        </p>
                        {d.isCurrent && <Badge variant="success">This device</Badge>}
                        {d.trusted && (
                          <Badge variant="info">
                            <ShieldCheck size={9} /> Trusted
                          </Badge>
                        )}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 3, flexWrap: "wrap" }}>
                        <span style={{ fontSize: 11, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 3 }}>
                          <Clock size={10} /> {timeAgo(d.lastActive)}
                        </span>
                        <span style={{ fontSize: 11, color: "var(--text-ash)" }}>·</span>
                        <span style={{ fontSize: 11, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 3 }}>
                          <MapPin size={10} /> {d.location}
                        </span>
                        <span style={{ fontSize: 11, color: "var(--text-ash)" }}>·</span>
                        <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{d.ip}</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0, marginLeft: 12 }}>
                    <Button variant="ghost" size="sm" onClick={function() { toggleTrusted(d.id); }}
                      style={{ color: d.trusted ? "var(--accent, #2f81f7)" : "var(--text-muted)" }}
                      title={d.trusted ? "Remove trust" : "Mark as trusted"}>
                      {d.trusted ? <ShieldCheck size={12} /> : <ShieldAlert size={12} />}
                      {d.trusted ? "Untrust" : "Trust"}
                    </Button>
                    {!d.isCurrent && (
                      <Button variant="ghost" size="sm" onClick={function() { removeDevice(d.id); }}
                        style={{ color: "var(--danger)" }} title="Sign out this device">
                        <Trash2 size={11} /> Remove
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </PageContainer>
  );
}
