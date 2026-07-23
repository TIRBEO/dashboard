"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Bell, Mail, Smartphone, Monitor, Clock, Calendar, Save, Plus, Trash2, Check } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "https://api.tirbeo.app";

type NotificationSettings = {
  email: boolean;
  push: boolean;
  desktop: boolean;
  sms: boolean;
  digest: boolean;
  digestFrequency: "hourly" | "daily" | "weekly";
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
  };
  emailDigest: boolean;
  pushDigest: boolean;
  desktopDigest: boolean;
  customizable: boolean;
};

export default function NotificationsPage() {
  const [settings, setSettings] = useState<NotificationSettings>({
    email: true,
    push: true,
    desktop: true,
    sms: false,
    digest: true,
    digestFrequency: "daily",
    quietHours: { enabled: false, start: "22:00", end: "06:00" },
    emailDigest: true,
    pushDigest: true,
    desktopDigest: true,
    customizable: false,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const fetched = useRef(false);

  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;

    fetch(`${API}/api/preferences/notifications`, { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data) {
          setSettings((s) => ({ ...s, ...data }));
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const updateSettings = useCallback(<K extends keyof NotificationSettings>(key: K, value: NotificationSettings[K]) => {
    setSettings((s) => ({ ...s, [key]: value }));
  }, []);

  const updateNested = <K extends keyof NotificationSettings, R extends keyof NotificationSettings[K]>(parentKey: K, childKey: R, value: NotificationSettings[K][R]) => {
    setSettings((s) => ({
      ...s,
      [parentKey]: { ...s[parentKey], [childKey]: value },
    }));
  };

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      const res = await fetch(`${API}/api/preferences/notifications`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (res.ok) {
        setToast("Notification settings saved");
        setTimeout(() => setToast(null), 3000);
      } else {
        setToast("Failed to save notification settings");
        setTimeout(() => setToast(null), 3000);
      }
    } catch {
      setToast("Connection error");
      setTimeout(() => setToast(null), 3000);
    }
    setSaving(false);
  }, [settings]);

  if (loading) {
    return (
      <div className="space-y-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="glass card-section animate-in">
            <div className="skeleton" style={{ height: 80 }} />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {toast && (
        <div className="toast toast-success" style={{ position: "fixed", top: 20, right: 20, zIndex: 9999 }}>{toast}</div>
      )}

      <div className="section-header">
        <h1>Notifications</h1>
        <p>Manage how and when you receive notifications</p>
      </div>

      <div className="glass card-section">
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
          <Bell size={18} style={{ color: "#d8b36a" }} />
          <h3 style={{ fontSize: 14, fontWeight: 600, color: "#ffffff", margin: 0 }}>Notification Channels</h3>
        </div>

        <div style={{ display: "grid", gap: 16 }}>
          <div
            className="table-row"
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "12px 0",
              borderBottom: "1px solid var(--border)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ padding: "8px", borderRadius: 8, background: "rgba(87,212,153,0.1)" }}>
                <Mail size={20} style={{ color: "#59d499" }} />
              </div>
              <div>
                <span style={{ fontSize: 14, color: "#ffffff", fontWeight: 500 }}>Email Notifications</span>
                <p style={{ fontSize: 12, color: "#7b7e84", margin: "2px 0 0" }}>Receive notifications via email</p>
              </div>
            </div>
            <button
              className={`toggle ${settings.email ? "active" : ""}`}
              onClick={() => updateSettings("email", !settings.email)}
            />
          </div>

          <div
            className="table-row"
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "12px 0",
              borderBottom: "1px solid var(--border)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ padding: "8px", borderRadius: 8, background: "rgba(87,212,153,0.1)" }}>
                <Smartphone size={20} style={{ color: "#59d499" }} />
              </div>
              <div>
                <span style={{ fontSize: 14, color: "#ffffff", fontWeight: 500 }}>Push Notifications</span>
                <p style={{ fontSize: 12, color: "#7b7e84", margin: "2px 0 0" }}>Receive push notifications on web and mobile</p>
              </div>
            </div>
            <button
              className={`toggle ${settings.push ? "active" : ""}`}
              onClick={() => updateSettings("push", !settings.push)}
            />
          </div>

          <div
            className="table-row"
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "12px 0",
              borderBottom: "1px solid var(--border)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ padding: "8px", borderRadius: 8, background: "rgba(216,179,106,0.1)" }}>
                <Monitor size={20} style={{ color: "#d8b36a" }} />
              </div>
              <div>
                <span style={{ fontSize: 14, color: "#ffffff", fontWeight: 500 }}>Desktop Notifications</span>
                <p style={{ fontSize: 12, color: "#7b7e84", margin: "2px 0 0" }}>Show desktop notification popups</p>
              </div>
            </div>
            <button
              className={`toggle ${settings.desktop ? "active" : ""}`}
              onClick={() => updateSettings("desktop", !settings.desktop)}
            />
          </div>

          <div
            className="table-row"
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "12px 0",
              borderBottom: "1px solid var(--border)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ padding: "8px", borderRadius: 8, background: "rgba(255,97,97,0.1)" }}>
                <Bell size={20} style={{ color: "#ff6161" }} />
              </div>
              <div>
                <span style={{ fontSize: 14, color: "#ffffff", fontWeight: 500 }}>SMS Notifications</span>
                <p style={{ fontSize: 12, color: "#7b7e84", margin: "2px 0 0" }}>Receive important alerts via SMS</p>
              </div>
            </div>
            <button
              className={`toggle ${settings.sms ? "active" : ""}`}
              onClick={() => updateSettings("sms", !settings.sms)}
            />
          </div>
        </div>
      </div>

      <div className="glass card-section">
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
          <Calendar size={18} style={{ color: "#d8b36a" }} />
          <h3 style={{ fontSize: 14, fontWeight: 600, color: "#ffffff", margin: 0 }}>Digest Notifications</h3>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid var(--border)" }}>
          <div>
            <span style={{ fontSize: 14, color: "#ffffff", fontWeight: 500 }}>Daily Digest</span>
            <p style={{ fontSize: 12, color: "#7b7e84", margin: "2px 0 0" }}>Receive a daily summary of activity</p>
          </div>
          <button
            className={`toggle ${settings.digest ? "active" : ""}`}
            onClick={() => updateSettings("digest", !settings.digest)}
          />
        </div>

        {settings.digest && (
          <div style={{ marginTop: 12, padding: "12px", background: "#162018", borderRadius: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <Calendar size={16} style={{ color: "#d8b36a" }} />
              <span style={{ fontSize: 13, color: "#ffffff" }}>Frequency</span>
            </div>
            <div className="toggle-group">
              {[
                { value: "hourly", label: "Hourly" },
                { value: "daily", label: "Daily" },
                { value: "weekly", label: "Weekly" },
              ].map((opt) => (
                <button
                  key={opt.value}
                  className={`toggle-group-item ${settings.digestFrequency === opt.value ? "active" : ""}`}
                  onClick={() => updateSettings("digestFrequency", opt.value as NotificationSettings["digestFrequency"])}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        )}

        <div style={{ marginTop: 20 }}>
          <div
            className="table-row"
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "12px 0",
              borderBottom: "1px solid var(--border)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Mail size={16} style={{ color: "#7b7e84" }} />
              <span style={{ fontSize: 14, color: "#ffffff" }}>Email Digests</span>
            </div>
            <button
              className={`toggle ${settings.emailDigest ? "active" : ""}`}
              onClick={() => updateSettings("emailDigest", !settings.emailDigest)}
            />
          </div>

          <div
            className="table-row"
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "12px 0",
              borderBottom: "1px solid var(--border)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Smartphone size={16} style={{ color: "#7b7e84" }} />
              <span style={{ fontSize: 14, color: "#ffffff" }}>Push Digests</span>
            </div>
            <button
              className={`toggle ${settings.pushDigest ? "active" : ""}`}
              onClick={() => updateSettings("pushDigest", !settings.pushDigest)}
            />
          </div>

          <div
            className="table-row"
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "12px 0",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Monitor size={16} style={{ color: "#7b7e84" }} />
              <span style={{ fontSize: 14, color: "#ffffff" }}>Desktop Digests</span>
            </div>
            <button
              className={`toggle ${settings.desktopDigest ? "active" : ""}`}
              onClick={() => updateSettings("desktopDigest", !settings.desktopDigest)}
            />
          </div>
        </div>
      </div>

      <div className="glass card-section">
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
          <Clock size={18} style={{ color: "#d8b36a" }} />
          <h3 style={{ fontSize: 14, fontWeight: 600, color: "#ffffff", margin: 0 }}>Quiet Hours</h3>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid var(--border)" }}>
          <div>
            <span style={{ fontSize: 14, color: "#ffffff", fontWeight: 500 }}>Enable Quiet Hours</span>
            <p style={{ fontSize: 12, color: "#7b7e84", margin: "2px 0 0" }}>Mute notifications during specified hours</p>
          </div>
          <button
            className={`toggle ${settings.quietHours.enabled ? "active" : ""}`}
            onClick={() => updateSettings("quietHours", { ...settings.quietHours, enabled: !settings.quietHours.enabled })}
          />
        </div>

        {settings.quietHours.enabled && (
          <div style={{ marginTop: 16, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, color: "#9c9c9d", marginBottom: 8, display: "block" }}>Start Time</label>
              <input
                type="time"
                value={settings.quietHours.start}
                onChange={(e) => updateSettings("quietHours", { ...settings.quietHours, start: e.target.value })}
                className="input-field"
                style={{ height: 40 }}
              />
            </div>
            <div>
              <label style={{ fontSize: 12, color: "#9c9c9d", marginBottom: 8, display: "block" }}>End Time</label>
              <input
                type="time"
                value={settings.quietHours.end}
                onChange={(e) => updateSettings("quietHours", { ...settings.quietHours, end: e.target.value })}
                className="input-field"
                style={{ height: 40 }}
              />
            </div>
          </div>
        )}
      </div>

      <div className="sticky bottom-0 left-0 right-0 p-4" style={{ background: "#0b0b0d", borderTop: "1px solid var(--border)", marginTop: 32, marginBottom: -32 }}>
        <div style={{ maxWidth: "860px", margin: "0 auto", display: "flex", justifyContent: "flex-end", gap: 12 }}>
          <button
            onClick={() => setSettings({
              email: true,
              push: true,
              desktop: true,
              sms: false,
              digest: true,
              digestFrequency: "daily",
              quietHours: { enabled: false, start: "22:00", end: "06:00" },
              emailDigest: true,
              pushDigest: true,
              desktopDigest: true,
              customizable: false,
            })}
            className="btn btn-ghost"
            style={{ height: 40, padding: "0 16px", fontSize: 13 }}
          >
            Reset
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn btn-primary"
            style={{ height: 40, padding: "0 20px", fontSize: 13, opacity: saving ? 0.7 : 1 }}
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
