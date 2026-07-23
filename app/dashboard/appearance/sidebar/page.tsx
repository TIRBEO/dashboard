"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { PanelLeft, Maximize2, Minimize2, Move, Sidebar } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "https://api.tirbeo.app";

type SidebarSettings = {
  collapsedByDefault: boolean;
  showLabels: boolean;
  collapsedSize: "small" | "medium" | "large";
  animation: "fade" | "slide" | "none";
  hoverExpand: boolean;
  minimizeOnMobile: boolean;
  drawerPosition: "left" | "right";
  tabNavigation: boolean;
  compactMode: boolean;
};

export default function AppearanceSidebarPage() {
  const [settings, setSettings] = useState<SidebarSettings>({
    collapsedByDefault: false,
    showLabels: true,
    collapsedSize: "medium",
    animation: "slide",
    hoverExpand: true,
    minimizeOnMobile: true,
    drawerPosition: "left",
    tabNavigation: false,
    compactMode: false,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const fetched = useRef(false);

  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;

    fetch(`${API}/api/app-appearance/settings/sidebar`, { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data) {
          setSettings((s) => ({ ...s, ...data }));
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const updateSettings = useCallback(<K extends keyof SidebarSettings>(key: K, value: SidebarSettings[K]) => {
    setSettings((s) => ({ ...s, [key]: value }));
  }, []);

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      const res = await fetch(`${API}/api/app-appearance/settings/sidebar`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (res.ok) {
        setToast("Sidebar settings saved");
        setTimeout(() => setToast(null), 3000);
      } else {
        setToast("Failed to save sidebar settings");
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
        <h1>Sidebar Settings</h1>
        <p>Customize your sidebar appearance and behavior</p>
      </div>

      <div className="glass card-section">
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
          <PanelLeft size={18} style={{ color: "#d8b36a" }} />
          <h3 style={{ fontSize: 14, fontWeight: 600, color: "#ffffff", margin: 0 }}>Sidebar Behavior</h3>
        </div>

        <div style={{ display: "grid", gap: 20 }}>
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
              <span style={{ fontSize: 14, color: "#a6a6a6" }}>Collapsed by Default</span>
              <p style={{ fontSize: 12, color: "#7b7e84", margin: "2px 0 0" }}>Start with sidebar collapsed</p>
            </div>
            <button
              className={`toggle ${settings.collapsedByDefault ? "active" : ""}`}
              onClick={() => updateSettings("collapsedByDefault", !settings.collapsedByDefault)}
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
              <span style={{ fontSize: 14, color: "#a6a6a6" }}>Show Labels</span>
              <p style={{ fontSize: 12, color: "#7b7e84", margin: "2px 0 0" }}>Display text labels next to icons</p>
            </div>
            <button
              className={`toggle ${settings.showLabels ? "active" : ""}`}
              onClick={() => updateSettings("showLabels", !settings.showLabels)}
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
              <span style={{ fontSize: 14, color: "#a6a6a6" }}>Hover Expand</span>
              <p style={{ fontSize: 12, color: "#7b7e84", margin: "2px 0 0" }}>Expand sidebar on hover (when collapsed)</p>
            </div>
            <button
              className={`toggle ${settings.hoverExpand ? "active" : ""}`}
              onClick={() => updateSettings("hoverExpand", !settings.hoverExpand)}
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
              <span style={{ fontSize: 14, color: "#a6a6a6" }}>Minimize on Mobile</span>
              <p style={{ fontSize: 12, color: "#7b7e84", margin: "2px 0 0" }}>Convert to hamburger drawer on mobile</p>
            </div>
            <button
              className={`toggle ${settings.minimizeOnMobile ? "active" : ""}`}
              onClick={() => updateSettings("minimizeOnMobile", !settings.minimizeOnMobile)}
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
              <p style={{ fontSize: 12, color: "#7b7e84", margin: "2px 0 0" }}>More compact sidebar with tighter spacing</p>
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
              <span style={{ fontSize: 14, color: "#a6a6a6" }}>Tab Navigation</span>
              <p style={{ fontSize: 12, color: "#7b7e84", margin: "2px 0 0" }}>Use tab-style navigation instead of expandable sections</p>
            </div>
            <button
              className={`toggle ${settings.tabNavigation ? "active" : ""}`}
              onClick={() => updateSettings("tabNavigation", !settings.tabNavigation)}
            />
          </div>
        </div>
      </div>

      <div className="glass card-section">
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
          <Sidebar size={18} style={{ color: "#d8b36a" }} />
          <h3 style={{ fontSize: 14, fontWeight: 600, color: "#ffffff", margin: 0 }}>Drawer Settings</h3>
        </div>

        <div style={{ display: "grid", gap: 20 }}>
          <div>
            <div className="table-row" style={{ marginBottom: 12 }}>
              <span style={{ fontSize: 14, color: "#a6a6a6" }}>Drawer Position</span>
            </div>
            <div className="toggle-group">
              {[
                { value: "left", label: "Left", icon: PanelLeft },
                { value: "right", label: "Right", icon: () => <PanelLeft style={{ transform: "rotate(180deg)" }} /> },
              ].map((opt) => (
                <button
                  key={opt.value}
                  className={`toggle-group-item ${settings.drawerPosition === opt.value ? "active" : ""}`}
                  onClick={() => updateSettings("drawerPosition", opt.value as SidebarSettings["drawerPosition"])}
                >
                  <opt.icon size={16} style={{ marginRight: 8 }} /> {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="table-row" style={{ marginBottom: 12 }}>
              <span style={{ fontSize: 14, color: "#a6a6a6" }}>Collapsed Size</span>
            </div>
            <div className="toggle-group">
              {[
                { value: "small", label: "Small" },
                { value: "medium", label: "Medium" },
                { value: "large", label: "Large" },
              ].map((opt) => (
                <button
                  key={opt.value}
                  className={`toggle-group-item ${settings.collapsedSize === opt.value ? "active" : ""}`}
                  onClick={() => updateSettings("collapsedSize", opt.value as SidebarSettings["collapsedSize"])}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="table-row" style={{ marginBottom: 12 }}>
              <span style={{ fontSize: 14, color: "#a6a6a6" }}>Animation</span>
            </div>
            <div className="toggle-group">
              {[
                { value: "fade", label: "Fade" },
                { value: "slide", label: "Slide" },
                { value: "none", label: "None" },
              ].map((opt) => (
                <button
                  key={opt.value}
                  className={`toggle-group-item ${settings.animation === opt.value ? "active" : ""}`}
                  onClick={() => updateSettings("animation", opt.value as SidebarSettings["animation"])}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="glass card-section">
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
          <Move size={18} style={{ color: "#d8b36a" }} />
          <h3 style={{ fontSize: 14, fontWeight: 600, color: "#ffffff", margin: 0 }}>Preview</h3>
        </div>

        <div style={{ border: "1px solid var(--border)", borderRadius: 8, padding: 20, background: "#07080a" }}>
          <div style={{ display: "flex", gap: 0 }}>
            <div
              style={{
                width: settings.collapsedByDefault ? 60 : 260,
                background: "#121417",
                height: 400,
                borderRight: "1px solid #2a2d31",
                transition: "width 0.3s ease",
              }}
            >
              <div style={{ padding: 12, borderBottom: "1px solid #2a2d31" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {settings.collapsedByDefault ? (
                    <div style={{ width: 24, height: 24, background: "#d8b36a", borderRadius: 4 }} />
                  ) : (
                    <>
                      <div style={{ width: 24, height: 24, background: "#d8b36a", borderRadius: 4 }} />
                      <div style={{ width: 60, height: 8, background: "#2a2d31", borderRadius: 4 }} />
                    </>
                  )}
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4, padding: 12 }}>
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    style={{
                      height: 36,
                      background: settings.showLabels ? "#1c2128" : "#1c2128",
                      borderRadius: 4,
                      padding: settings.showLabels ? "8px 12px" : "8px",
                      display: "flex",
                      alignItems: "center",
                      gap: settings.showLabels ? 8 : 0,
                    }}
                  >
                    <div style={{ width: 20, height: 20, background: "#2a2d31", borderRadius: 4 }} />
                    {settings.showLabels && (
                      <div style={{ width: 40, height: 8, background: "#2a2d31", borderRadius: 4 }} />
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div style={{ flex: 1, padding: 20 }}>
              <div style={{ height: 24, width: "60%", background: "#2a2d31", borderRadius: 4, marginBottom: 16 }} />
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
              collapsedByDefault: false,
              showLabels: true,
              collapsedSize: "medium",
              animation: "slide",
              hoverExpand: true,
              minimizeOnMobile: true,
              drawerPosition: "left",
              tabNavigation: false,
              compactMode: false,
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
