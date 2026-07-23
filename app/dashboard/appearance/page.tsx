"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Sun,
  Moon,
  Monitor,
  Palette,
  Type,
  Layout,
  PanelLeft,
  Zap,
  Accessibility,
  Eye,
  Paintbrush,
  Check,
  Save,
  RotateCcw,
  Loader2,
} from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "https://api.tirbeo.app";

const STORAGE_KEY = "tirbeo-appearance-settings";

const DEFAULT_DIRECT = {
  theme: "dark" as "light" | "dark" | "system",
  fontSize: "14",
  reduceMotion: false,
  highContrast: false,
};

const DEFAULT_PREFS = {
  accentColor: "#4f7aff",
  sidebarStyle: "fixed" as "fixed" | "floating" | "compact",
  density: "comfortable" as "compact" | "comfortable" | "spacious",
  glassEffect: true,
  transparency: false,
  roundedCorners: 12,
  fontFamily: "Inter",
  animationSpeed: "normal",
  showLabels: true,
  collapseByDefault: false,
  iconSize: 18,
};

type DirectFields = typeof DEFAULT_DIRECT;
type AppearancePrefs = typeof DEFAULT_PREFS;

const ACCENT_COLORS = [
  { name: "White", value: "#ffffff" },
  { name: "Blue", value: "#4f7aff" },
  { name: "Purple", value: "#9f7aea" },
  { name: "Green", value: "#59d499" },
  { name: "Orange", value: "#ff9f43" },
  { name: "Red", value: "#ff6161" },
  { name: "Pink", value: "#f56ebf" },
];

function loadLocal(): { direct: DirectFields; prefs: AppearancePrefs } | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return {
      direct: { ...DEFAULT_DIRECT, ...parsed.direct },
      prefs: { ...DEFAULT_PREFS, ...parsed.prefs },
    };
  } catch {
    return null;
  }
}

function saveLocal(direct: DirectFields, prefs: AppearancePrefs) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ direct, prefs }));
  } catch {}
}

function clearLocal() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {}
}

export default function AppearancePage() {
  const [directFields, setDirectFields] = useState<DirectFields>(DEFAULT_DIRECT);
  const [appearancePrefs, setAppearancePrefs] = useState<AppearancePrefs>(DEFAULT_PREFS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    const local = loadLocal();
    if (local) {
      setDirectFields(local.direct);
      setAppearancePrefs(local.prefs);
    }

    fetch(`${API}/api/preferences`, { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!data) return;
        setDirectFields({
          theme: data.theme || DEFAULT_DIRECT.theme,
          fontSize: data.fontSize || DEFAULT_DIRECT.fontSize,
          reduceMotion: !!data.reduceMotion,
          highContrast: !!data.highContrast,
        });
        setAppearancePrefs({
          ...DEFAULT_PREFS,
          ...(data.preferences || {}),
        });
        saveLocal(
          {
            theme: data.theme || DEFAULT_DIRECT.theme,
            fontSize: data.fontSize || DEFAULT_DIRECT.fontSize,
            reduceMotion: !!data.reduceMotion,
            highContrast: !!data.highContrast,
          },
          { ...DEFAULT_PREFS, ...(data.preferences || {}) }
        );
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const showToast = useCallback((msg: string, type: "success" | "error") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const updateDirect = useCallback(<K extends keyof DirectFields>(key: K, value: DirectFields[K]) => {
    setDirectFields((prev) => ({ ...prev, [key]: value }));
  }, []);

  const updatePrefs = useCallback(<K extends keyof AppearancePrefs>(key: K, value: AppearancePrefs[K]) => {
    setAppearancePrefs((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      saveLocal(directFields, appearancePrefs);
      const res = await fetch(`${API}/api/preferences`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          theme: directFields.theme,
          fontSize: directFields.fontSize,
          reduceMotion: directFields.reduceMotion,
          highContrast: directFields.highContrast,
          preferences: appearancePrefs,
        }),
      });
      if (res.ok) {
        showToast("Appearance settings saved", "success");
      } else {
        showToast("Failed to save — settings cached locally", "error");
      }
    } catch {
      showToast("Connection error — settings cached locally", "error");
    }
    setSaving(false);
  }, [directFields, appearancePrefs, showToast]);

  const handleReset = useCallback(async () => {
    setDirectFields(DEFAULT_DIRECT);
    setAppearancePrefs(DEFAULT_PREFS);
    clearLocal();
    try {
      await fetch(`${API}/api/preferences`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          theme: DEFAULT_DIRECT.theme,
          fontSize: DEFAULT_DIRECT.fontSize,
          reduceMotion: DEFAULT_DIRECT.reduceMotion,
          highContrast: DEFAULT_DIRECT.highContrast,
          preferences: DEFAULT_PREFS,
        }),
      });
    } catch {}
    showToast("Reset to defaults", "success");
  }, [showToast]);

  if (loading) {
    return (
      <div style={{ maxWidth: 860, margin: "0 auto", padding: "32px 24px" }}>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 300 }}>
          <Loader2 size={24} style={{ color: "#d8b36a", animation: "spin 1s linear infinite" }} />
        </div>
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 860, margin: "0 auto", padding: "32px 24px" }}>
      {toast && (
        <div
          style={{
            position: "fixed",
            bottom: 32,
            right: 32,
            background: toast.type === "success" ? "#162018" : "#2d1518",
            color: toast.type === "success" ? "#59d499" : "#ff6161",
            padding: "12px 20px",
            borderRadius: 10,
            fontSize: 14,
            border: `1px solid ${toast.type === "success" ? "#2a3d2c" : "#3d2a2a"}`,
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          {toast.type === "success" ? <Check size={14} /> : <span style={{ fontWeight: 600 }}>!</span>}
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 32,
        }}
      >
        <div>
          <h1
            style={{
              fontSize: 28,
              fontWeight: 700,
              color: "#f2eee8",
              margin: 0,
            }}
          >
            Appearance
          </h1>
          <p style={{ fontSize: 14, color: "#7b7e84", margin: "4px 0 0" }}>
            Customize how Tirbeo looks and feels
          </p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button className="btn btn-ghost" onClick={handleReset} style={{ fontSize: 13 }}>
            <RotateCcw size={13} style={{ marginRight: 6 }} />
            Reset Defaults
          </button>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving} style={{ fontSize: 13, opacity: saving ? 0.7 : 1 }}>
            {saving ? (
              <>
                <Loader2 size={13} style={{ marginRight: 6, animation: "spin 1s linear infinite" }} />
                Saving...
              </>
            ) : (
              <>
                <Save size={13} style={{ marginRight: 6 }} />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>

      {/* Theme Section */}
      <div className="glass card-section" style={{ marginBottom: 20 }}>
        <div className="section-header">
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Palette size={18} style={{ color: "#d8b36a" }} />
            <span style={{ fontWeight: 600, color: "#f2eee8", fontSize: 15 }}>
              Theme
            </span>
          </div>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 12,
            padding: "16px 20px 20px",
          }}
        >
          {[
            {
              value: "light" as const,
              icon: <Sun size={22} />,
              label: "Light",
              desc: "Clean and bright",
            },
            {
              value: "dark" as const,
              icon: <Moon size={22} />,
              label: "Dark",
              desc: "Easy on the eyes",
            },
            {
              value: "system" as const,
              icon: <Monitor size={22} />,
              label: "System",
              desc: "Match your OS",
            },
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => updateDirect("theme", opt.value)}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 8,
                padding: "20px 12px",
                borderRadius: 12,
                border:
                  directFields.theme === opt.value
                    ? "2px solid #d8b36a"
                    : "1px solid #2a2d31",
                background:
                  directFields.theme === opt.value
                    ? "rgba(216,179,106,0.08)"
                    : "#121417",
                cursor: "pointer",
                transition: "all 0.2s",
                color: "#f2eee8",
                position: "relative",
              }}
            >
              {directFields.theme === opt.value && (
                <div
                  style={{
                    position: "absolute",
                    top: 10,
                    right: 10,
                    width: 20,
                    height: 20,
                    borderRadius: "50%",
                    background: "#d8b36a",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Check size={12} color="#0b0b0d" strokeWidth={3} />
                </div>
              )}
              <div style={{ color: directFields.theme === opt.value ? "#d8b36a" : "#7b7e84" }}>
                {opt.icon}
              </div>
              <span style={{ fontWeight: 600, fontSize: 14 }}>{opt.label}</span>
              <span style={{ fontSize: 12, color: "#7b7e84" }}>{opt.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Accent Color Section */}
      <div className="glass card-section" style={{ marginBottom: 20 }}>
        <div className="section-header">
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Paintbrush size={18} style={{ color: "#d8b36a" }} />
            <span style={{ fontWeight: 600, color: "#f2eee8", fontSize: 15 }}>
              Accent Color
            </span>
          </div>
        </div>
        <div
          style={{
            display: "flex",
            gap: 14,
            padding: "16px 20px 20px",
            flexWrap: "wrap",
          }}
        >
          {ACCENT_COLORS.map((c) => (
            <button
              key={c.value}
              onClick={() => updatePrefs("accentColor", c.value)}
              className={`color-swatch ${appearancePrefs.accentColor === c.value ? "selected" : ""}`}
              title={c.name}
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                border:
                  appearancePrefs.accentColor === c.value
                    ? "3px solid #f2eee8"
                    : "2px solid #2a2d31",
                background: c.value,
                cursor: "pointer",
                position: "relative",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.2s",
                boxShadow:
                  appearancePrefs.accentColor === c.value
                    ? `0 0 0 3px ${c.value}33`
                    : "none",
              }}
            >
              {appearancePrefs.accentColor === c.value && (
                <Check
                  size={14}
                  color={c.value === "#ffffff" || c.value === "#59d499" ? "#0b0b0d" : "#ffffff"}
                  strokeWidth={3}
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Layout Section */}
      <div className="glass card-section" style={{ marginBottom: 20 }}>
        <div className="section-header">
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Layout size={18} style={{ color: "#d8b36a" }} />
            <span style={{ fontWeight: 600, color: "#f2eee8", fontSize: 15 }}>
              Layout
            </span>
          </div>
        </div>
        <div style={{ padding: "16px 20px 20px" }}>
          {/* Sidebar Style */}
          <div style={{ marginBottom: 20 }}>
            <div className="table-row" style={{ marginBottom: 10 }}>
              <span style={{ fontSize: 14, color: "#a6a6a6" }}>Sidebar Style</span>
            </div>
            <div className="toggle-group">
              {[
                { value: "fixed", label: "Fixed" },
                { value: "floating", label: "Floating" },
                { value: "compact", label: "Compact" },
              ].map((opt) => (
                <button
                  key={opt.value}
                  className={`toggle-group-item ${appearancePrefs.sidebarStyle === opt.value ? "active" : ""}`}
                  onClick={() => updatePrefs("sidebarStyle", opt.value as AppearancePrefs["sidebarStyle"])}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Density */}
          <div style={{ marginBottom: 20 }}>
            <div className="table-row" style={{ marginBottom: 10 }}>
              <span style={{ fontSize: 14, color: "#a6a6a6" }}>Density</span>
            </div>
            <div className="toggle-group">
              {[
                { value: "compact", label: "Compact" },
                { value: "comfortable", label: "Comfortable" },
                { value: "spacious", label: "Spacious" },
              ].map((opt) => (
                <button
                  key={opt.value}
                  className={`toggle-group-item ${appearancePrefs.density === opt.value ? "active" : ""}`}
                  onClick={() => updatePrefs("density", opt.value as AppearancePrefs["density"])}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Glass Effect */}
          <div
            className="table-row"
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 14,
            }}
          >
            <div>
              <span style={{ fontSize: 14, color: "#a6a6a6" }}>Glass Effect</span>
              <p style={{ fontSize: 12, color: "#7b7e84", margin: "2px 0 0" }}>
                Frosted glass effect on cards and panels
              </p>
            </div>
            <button
              className={`toggle ${appearancePrefs.glassEffect ? "active" : ""}`}
              onClick={() => updatePrefs("glassEffect", !appearancePrefs.glassEffect)}
            />
          </div>

          {/* Transparency */}
          <div
            className="table-row"
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 14,
            }}
          >
            <div>
              <span style={{ fontSize: 14, color: "#a6a6a6" }}>Transparency</span>
              <p style={{ fontSize: 12, color: "#7b7e84", margin: "2px 0 0" }}>
                Semi-transparent backgrounds
              </p>
            </div>
            <button
              className={`toggle ${appearancePrefs.transparency ? "active" : ""}`}
              onClick={() => updatePrefs("transparency", !appearancePrefs.transparency)}
            />
          </div>

          {/* Rounded Corners */}
          <div>
            <div className="table-row" style={{ marginBottom: 10 }}>
              <span style={{ fontSize: 14, color: "#a6a6a6" }}>Rounded Corners</span>
            </div>
            <div className="toggle-group">
              {[
                { value: 8, label: "Small (8)" },
                { value: 12, label: "Default (12)" },
                { value: 16, label: "Large (16)" },
                { value: 20, label: "Extra (20)" },
              ].map((opt) => (
                <button
                  key={opt.value}
                  className={`toggle-group-item ${appearancePrefs.roundedCorners === opt.value ? "active" : ""}`}
                  onClick={() => updatePrefs("roundedCorners", opt.value)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Typography Section */}
      <div className="glass card-section" style={{ marginBottom: 20 }}>
        <div className="section-header">
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Type size={18} style={{ color: "#d8b36a" }} />
            <span style={{ fontWeight: 600, color: "#f2eee8", fontSize: 15 }}>
              Typography
            </span>
          </div>
        </div>
        <div style={{ padding: "16px 20px 20px" }}>
          {/* Font Family */}
          <div style={{ marginBottom: 20 }}>
            <div className="table-row" style={{ marginBottom: 10 }}>
              <span style={{ fontSize: 14, color: "#a6a6a6" }}>Font Family</span>
            </div>
            <div className="toggle-group">
              {[
                { value: "Inter", label: "Inter" },
                { value: "System", label: "System" },
                { value: "JetBrains Mono", label: "JetBrains Mono" },
                { value: "SF Pro", label: "SF Pro" },
              ].map((opt) => (
                <button
                  key={opt.value}
                  className={`toggle-group-item ${appearancePrefs.fontFamily === opt.value ? "active" : ""}`}
                  onClick={() => updatePrefs("fontFamily", opt.value)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Font Size */}
          <div style={{ marginBottom: 20 }}>
            <div className="table-row" style={{ marginBottom: 10 }}>
              <span style={{ fontSize: 14, color: "#a6a6a6" }}>Font Size</span>
            </div>
            <div className="toggle-group">
              {["13", "14", "15", "16"].map((size) => (
                <button
                  key={size}
                  className={`toggle-group-item ${directFields.fontSize === size ? "active" : ""}`}
                  onClick={() => updateDirect("fontSize", size)}
                >
                  {size}px
                </button>
              ))}
            </div>
          </div>

          {/* Animation Speed */}
          <div style={{ marginBottom: 20 }}>
            <div className="table-row" style={{ marginBottom: 10 }}>
              <span style={{ fontSize: 14, color: "#a6a6a6" }}>Animation Speed</span>
            </div>
            <div className="toggle-group">
              {[
                { value: "instant", label: "Instant" },
                { value: "fast", label: "Fast" },
                { value: "normal", label: "Normal" },
                { value: "slow", label: "Slow" },
              ].map((opt) => (
                <button
                  key={opt.value}
                  className={`toggle-group-item ${appearancePrefs.animationSpeed === opt.value ? "active" : ""}`}
                  onClick={() => updatePrefs("animationSpeed", opt.value)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Reduce Motion */}
          <div
            className="table-row"
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 14, color: "#a6a6a6" }}>Reduce Motion</span>
                <Accessibility size={14} style={{ color: "#7b7e84" }} />
              </div>
              <p style={{ fontSize: 12, color: "#7b7e84", margin: "2px 0 0" }}>
                Minimize animations for accessibility
              </p>
            </div>
            <button
              className={`toggle ${directFields.reduceMotion ? "active" : ""}`}
              onClick={() => updateDirect("reduceMotion", !directFields.reduceMotion)}
            />
          </div>
        </div>
      </div>

      {/* Sidebar Section */}
      <div className="glass card-section" style={{ marginBottom: 20 }}>
        <div className="section-header">
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <PanelLeft size={18} style={{ color: "#d8b36a" }} />
            <span style={{ fontWeight: 600, color: "#f2eee8", fontSize: 15 }}>
              Sidebar
            </span>
          </div>
        </div>
        <div style={{ padding: "16px 20px 20px" }}>
          {/* Show Labels */}
          <div
            className="table-row"
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 14,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Eye size={14} style={{ color: "#7b7e84" }} />
              <span style={{ fontSize: 14, color: "#a6a6a6" }}>Show Labels</span>
            </div>
            <button
              className={`toggle ${appearancePrefs.showLabels ? "active" : ""}`}
              onClick={() => updatePrefs("showLabels", !appearancePrefs.showLabels)}
            />
          </div>

          {/* Collapse by Default */}
          <div
            className="table-row"
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 20,
            }}
          >
            <div>
              <span style={{ fontSize: 14, color: "#a6a6a6" }}>
                Collapse by Default
              </span>
              <p style={{ fontSize: 12, color: "#7b7e84", margin: "2px 0 0" }}>
                Start with sidebar collapsed
              </p>
            </div>
            <button
              className={`toggle ${appearancePrefs.collapseByDefault ? "active" : ""}`}
              onClick={() =>
                updatePrefs("collapseByDefault", !appearancePrefs.collapseByDefault)
              }
            />
          </div>

          {/* Icon Size */}
          <div>
            <div className="table-row" style={{ marginBottom: 10 }}>
              <span style={{ fontSize: 14, color: "#a6a6a6" }}>Icon Size</span>
            </div>
            <div className="toggle-group">
              {[14, 16, 18, 20].map((size) => (
                <button
                  key={size}
                  className={`toggle-group-item ${appearancePrefs.iconSize === size ? "active" : ""}`}
                  onClick={() => updatePrefs("iconSize", size)}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Preview Section */}
      <div className="glass card-section" style={{ marginBottom: 20 }}>
        <div className="section-header">
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Eye size={18} style={{ color: "#d8b36a" }} />
            <span style={{ fontWeight: 600, color: "#f2eee8", fontSize: 15 }}>
              Preview
            </span>
          </div>
        </div>
        <div style={{ padding: "16px 20px 20px" }}>
          <div
            style={{
              borderRadius: appearancePrefs.roundedCorners,
              background: "rgba(18,20,23,0.6)",
              backdropFilter: appearancePrefs.glassEffect ? "blur(24px)" : "none",
              border: "1px solid #2a2d31",
              padding: 20,
              fontFamily:
                appearancePrefs.fontFamily === "System"
                  ? "system-ui, -apple-system, sans-serif"
                  : appearancePrefs.fontFamily === "JetBrains Mono"
                    ? "'JetBrains Mono', monospace"
                    : appearancePrefs.fontFamily === "SF Pro"
                      ? "-apple-system, 'SF Pro Display', sans-serif"
                      : "'Inter', sans-serif",
              fontSize: Number(directFields.fontSize),
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                marginBottom: 16,
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: appearancePrefs.roundedCorners,
                  background: appearancePrefs.accentColor,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Palette size={20} color="#0b0b0d" />
              </div>
              <div>
                <div style={{ fontWeight: 600, color: "#f2eee8" }}>Sample Card</div>
                <div style={{ fontSize: 12, color: "#7b7e84" }}>
                  Your current appearance settings
                </div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                style={{
                  padding: "8px 16px",
                  borderRadius: appearancePrefs.roundedCorners,
                  background: appearancePrefs.accentColor,
                  color: "#0b0b0d",
                  border: "none",
                  fontWeight: 600,
                  fontSize: Number(directFields.fontSize) - 1,
                  cursor: "pointer",
                }}
              >
                Primary Button
              </button>
              <button
                style={{
                  padding: "8px 16px",
                  borderRadius: appearancePrefs.roundedCorners,
                  background: "transparent",
                  color: "#a6a6a6",
                  border: "1px solid #2a2d31",
                  fontSize: Number(directFields.fontSize) - 1,
                  cursor: "pointer",
                }}
              >
                Ghost Button
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
