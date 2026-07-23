"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Layout, Monitor, Smartphone, Tablet, Maximize2, Minimize2, Move, Crop } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "https://api.tirbeo.app";

type LayoutSettings = {
  sidebarWidth: number;
  sidebarStyle: "fixed" | "floating" | "compact";
  sidebarPosition: "left" | "right";
  contentMaxWidth: "narrow" | "medium" | "wide" | "full";
  denseMode: boolean;
  stickyHeaders: boolean;
  reducedSpacing: boolean;
  compactMode: boolean;
  collapsedSidebar: boolean;
};

export default function AppearanceLayoutPage() {
  const [settings, setSettings] = useState<LayoutSettings>({
    sidebarWidth: 260,
    sidebarStyle: "fixed",
    sidebarPosition: "left",
    contentMaxWidth: "medium",
    denseMode: false,
    stickyHeaders: true,
    reducedSpacing: false,
    compactMode: false,
    collapsedSidebar: false,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const fetched = useRef(false);

  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;

    fetch(`${API}/api/app-appearance/settings/layout`, { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data) {
          setSettings((s) => ({ ...s, ...data }));
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const updateSettings = useCallback(<K extends keyof LayoutSettings>(key: K, value: LayoutSettings[K]) => {
    setSettings((s) => ({ ...s, [key]: value }));
  }, []);

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      const res = await fetch(`${API}/api/app-appearance/settings/layout`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (res.ok) {
        setToast("Layout settings saved");
        setTimeout(() => setToast(null), 3000);
      } else {
        setToast("Failed to save layout settings");
        setTimeout(() => setToast(null), 3000);
      }
    } catch {
      setToast("Connection error");
      setTimeout(() => setToast(null), 3000);
    }
    setSaving(false);
  }, [settings]);

  const getContentWidthClass = () => {
    switch (settings.contentMaxWidth) {
      case "narrow": return "max-w-3xl";
      case "medium": return "max-w-5xl";
      case "wide": return "max-w-7xl";
      case "full": return "max-w-full";
      default: return "max-w-5xl";
    }
  };

  const getSidebarStyle = () => {
    switch (settings.sidebarStyle) {
      case "fixed": return { position: "fixed", width: `${settings.sidebarWidth}px`, left: 0 };
      case "floating": return { position: "absolute", width: `${settings.sidebarWidth}px`, left: 20, borderRadius: 8 };
      case "compact": return { position: "fixed", width: "60px", left: 0 };
      default: return { position: "fixed", width: `${settings.sidebarWidth}px`, left: 0 };
    }
  };

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
        <h1>Layout</h1>
        <p>Configure the layout and spacing of your dashboard</p>
      </div>

      <div className="glass card-section">
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
          <Layout size={18} style={{ color: "#d8b36a" }} />
          <h3 style={{ fontSize: 14, fontWeight: 600, color: "#ffffff", margin: 0 }}>Layout Options</h3>
        </div>

        <div style={{ display: "grid", gap: 20 }}>
          {/* Sidebar Style */}
          <div>
            <div className="table-row" style={{ marginBottom: 12 }}>
              <span style={{ fontSize: 14, color: "#a6a6a6" }}>Sidebar Style</span>
            </div>
            <div className="toggle-group">
              {[
                { value: "fixed", label: "Fixed", icon: Monitor },
                { value: "floating", label: "Floating", icon: Maximize2 },
                { value: "compact", label: "Compact", icon: Minimize2 },
              ].map((opt) => (
                <button
                  key={opt.value}
                  className={`toggle-group-item ${settings.sidebarStyle === opt.value ? "active" : ""}`}
                  onClick={() => updateSettings("sidebarStyle", opt.value as LayoutSettings["sidebarStyle"])}
                >
                  <opt.icon size={16} style={{ marginRight: 8 }} /> {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Content Width */}
          <div>
            <div className="table-row" style={{ marginBottom: 12 }}>
              <span style={{ fontSize: 14, color: "#a6a6a6" }}>Content Width</span>
            </div>
            <div className="toggle-group">
              {[
                { value: "narrow", label: "Narrow (1024px)" },
                { value: "medium", label: "Medium (1280px)" },
                { value: "wide", label: "Wide (1536px)" },
                { value: "full", label: "Full Width" },
              ].map((opt) => (
                <button
                  key={opt.value}
                  className={`toggle-group-item ${settings.contentMaxWidth === opt.value ? "active" : ""}`}
                  onClick={() => updateSettings("contentMaxWidth", opt.value as LayoutSettings["contentMaxWidth"])}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Sidebar Width */}
          <div>
            <div className="table-row" style={{ marginBottom: 12 }}>
              <span style={{ fontSize: 14, color: "#a6a6a6" }}>Sidebar Width</span>
            </div>
            <div className="toggle-group">
              {[
                { value: 180, label: "Narrow (180px)" },
                { value: 220, label: "Compact (220px)" },
                { value: 260, label: "Default (260px)" },
                { value: 320, label: "Wide (320px)" },
              ].map((opt) => (
                <button
                  key={opt.value}
                  className={`toggle-group-item ${settings.sidebarWidth === opt.value ? "active" : ""}`}
                  onClick={() => updateSettings("sidebarWidth", opt.value)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Additional Settings */}
          <div style={{ display: "grid", gap: 12 }}>
            <div
              className="table-row"
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "8px 0",
                borderBottom: "1px solid var(--border)",
              }}
            >
              <div>
                <span style={{ fontSize: 14, color: "#a6a6a6" }}>Sticky Headers</span>
                <p style={{ fontSize: 12, color: "#7b7e84", margin: "2px 0 0" }}>Keep headers visible while scrolling</p>
              </div>
              <button
                className={`toggle ${settings.stickyHeaders ? "active" : ""}`}
                onClick={() => updateSettings("stickyHeaders", !settings.stickyHeaders)}
              />
            </div>

            <div
              className="table-row"
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "8px 0",
                borderBottom: "1px solid var(--border)",
              }}
            >
              <div>
                <span style={{ fontSize: 14, color: "#a6a6a6" }}>Dense Mode</span>
                <p style={{ fontSize: 12, color: "#7b7e84", margin: "2px 0 0" }}>Reduce padding and spacing</p>
              </div>
              <button
                className={`toggle ${settings.denseMode ? "active" : ""}`}
                onClick={() => updateSettings("denseMode", !settings.denseMode)}
              />
            </div>

            <div
              className="table-row"
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "8px 0",
                borderBottom: "1px solid var(--border)",
              }}
            >
              <div>
                <span style={{ fontSize: 14, color: "#a6a6a6" }}>Compact Mode</span>
                <p style={{ fontSize: 12, color: "#7b7e84", margin: "2px 0 0" }}>More compact UI with tighter spacing</p>
              </div>
              <button
                className={`toggle ${settings.compactMode ? "active" : ""}`}
                onClick={() => updateSettings("compactMode", !settings.compactMode)}
              />
            </div>

            <div
              className="table-row"
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "8px 0",
                borderBottom: "1px solid var(--border)",
              }}
            >
              <div>
                <span style={{ fontSize: 14, color: "#a6a6a6" }}>Collapsed Sidebar</span>
                <p style={{ fontSize: 12, color: "#7b7e84", margin: "2px 0 0" }}>Start with sidebar collapsed</p>
              </div>
              <button
                className={`toggle ${settings.collapsedSidebar ? "active" : ""}`}
                onClick={() => updateSettings("collapsedSidebar", !settings.collapsedSidebar)}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="glass card-section">
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
          <Monitor size={18} style={{ color: "#d8b36a" }} />
          <h3 style={{ fontSize: 14, fontWeight: 600, color: "#ffffff", margin: 0 }}>Preview</h3>
        </div>

        <div style={{ border: "1px solid var(--border)", borderRadius: 8, padding: 20, background: "#07080a" }}>
          <div style={{ display: "flex", gap: 20 }}>
            <div style={getSidebarStyle()}>
              <div style={{ padding: 12, background: "#121417", height: "100%" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                  <div style={{ width: 24, height: 24, background: "#d8b36a", borderRadius: 4 }} />
                  <div style={{ width: 60, height: 8, background: "#2a2d31", borderRadius: 4 }} />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} style={{ height: 36, background: "#1c2128", borderRadius: 4 }} />
                  ))}
                </div>
              </div>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                <div style={{ height: 24, width: "60%", background: "#2a2d31", borderRadius: 4 }} />
                <div style={{ display: "flex", gap: 8 }}>
                  <div style={{ height: 24, width: 80, background: "#2a2d31", borderRadius: 4 }} />
                  <div style={{ height: 24, width: 24, background: "#2a2d31", borderRadius: 4 }} />
                </div>
              </div>
              <div style={{ display: "grid", gap: 12 }}>
                {[1, 2, 3].map((i) => (
                  <div key={i} style={{ height: 120, background: "#1c2128", borderRadius: 8 }} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="sticky bottom-0 left-0 right-0 p-4" style={{ background: "#0b0b0d", borderTop: "1px solid var(--border)", marginTop: 32, marginBottom: -32 }}>
        <div style={{ maxWidth: "860px", margin: "0 auto", display: "flex", justifyContent: "flex-end", gap: 12 }}>
          <button
            onClick={() => setSettings({
              sidebarWidth: 260,
              sidebarStyle: "fixed",
              sidebarPosition: "left",
              contentMaxWidth: "medium",
              denseMode: false,
              stickyHeaders: true,
              reducedSpacing: false,
              compactMode: false,
              collapsedSidebar: false,
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
