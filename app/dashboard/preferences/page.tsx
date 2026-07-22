"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  Moon, Sun, Monitor, Type, Palette, LayoutGrid, Sparkles, Save, Trash2,
  Plus, Check, X, RotateCcw, Eye, ChevronDown, ChevronRight, Paintbrush,
  Layers, Sliders, Accessibility, Image, Zap, Copy, FolderOpen,
} from "lucide-react";
import { PreferencesSkeleton } from "../../components/Skeleton";

const API = process.env.NEXT_PUBLIC_API_URL || "https://api.tirbeo.app";

type SavedTheme = {
  id: string; name: string; createdAt: string;
  config: ThemeConfig;
};

type ThemeConfig = {
  // Shell
  mode: string;
  bgPrimary: string;
  bgSurface: string;
  bgCard: string;
  bgElevated: string;
  bgHover: string;
  // Text
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  textAsh: string;
  // Accent
  accentPrimary: string;
  accentMuted: string;
  success: string;
  warning: string;
  danger: string;
  // Border
  border: string;
  borderHover: string;
  // Typography
  fontFamily: string;
  fontSize: number;
  fontWeight: number;
  lineHeight: number;
  letterSpacing: number;
  // Spacing
  contentPadding: number;
  sectionGap: number;
  cardPadding: number;
  sidebarWidth: number;
  borderRadius: number;
  // Background
  bgStyle: string;
  bgGradient: string;
  bgImageUrl: string;
};

const DEFAULT_CONFIG: ThemeConfig = {
  mode: "dark", bgPrimary: "#07080a", bgSurface: "#0d0d0d", bgCard: "#101111",
  bgElevated: "#121212", bgHover: "#161717",
  textPrimary: "#f4f4f6", textSecondary: "#cdcdcd", textMuted: "#9c9c9d", textAsh: "#6a6b6c",
  accentPrimary: "#ffffff", accentMuted: "rgba(255,255,255,0.08)",
  success: "#59d499", warning: "#ffc533", danger: "#ff6161",
  border: "#242728", borderHover: "rgba(255,255,255,0.16)",
  fontFamily: "Inter", fontSize: 14, fontWeight: 400, lineHeight: 1.5, letterSpacing: -0.01,
  contentPadding: 24, sectionGap: 24, cardPadding: 24, sidebarWidth: 260, borderRadius: 16,
  bgStyle: "solid", bgGradient: "135deg, #07080a 0%, #0d0d0d 100%", bgImageUrl: "",
};

const PRESET_THEMES: { name: string; config: Partial<ThemeConfig> }[] = [
  { name: "Dark (Default)", config: { mode: "dark", bgPrimary: "#07080a", bgSurface: "#0d0d0d", bgCard: "#101111", textPrimary: "#f4f4f6", accentPrimary: "#ffffff" } },
  { name: "Midnight Blue", config: { mode: "dark", bgPrimary: "#0a0f1a", bgSurface: "#0f1525", bgCard: "#141c30", textPrimary: "#e8ecf4", accentPrimary: "#7aa2f7", accentMuted: "rgba(122,162,247,0.12)" } },
  { name: "Forest", config: { mode: "dark", bgPrimary: "#08150F", bgSurface: "#101c13", bgCard: "#12271D", textPrimary: "#F2EEE8", accentPrimary: "#569578", accentMuted: "rgba(86,149,120,0.12)" } },
  { name: "Amber", config: { mode: "dark", bgPrimary: "#0f0a05", bgSurface: "#1a1208", bgCard: "#221a0e", textPrimary: "#f4ede4", accentPrimary: "#f59e0b", accentMuted: "rgba(245,158,11,0.12)" } },
  { name: "Rose", config: { mode: "dark", bgPrimary: "#0f0508", bgSurface: "#1a0a10", bgCard: "#220f16", textPrimary: "#f4e8ed", accentPrimary: "#ec4899", accentMuted: "rgba(236,72,153,0.12)" } },
  { name: "Light", config: { mode: "light", bgPrimary: "#ffffff", bgSurface: "#f8f9fa", bgCard: "#ffffff", bgElevated: "#f1f3f5", textPrimary: "#1a1a1a", textSecondary: "#495057", textMuted: "#868e96", textAsh: "#adb5bd", accentPrimary: "#228be6", accentMuted: "rgba(34,139,230,0.08)", border: "#dee2e6", borderHover: "rgba(0,0,0,0.15)" } },
];

function ColorInput({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const isGradient = value?.includes("gradient");
  return (
    <div>
      <label style={{ fontSize: 11, fontWeight: 500, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>{label}</label>
      <div className="flex items-center gap-2">
        {!isGradient && (
          <input type="color" value={value?.startsWith("#") ? value : "#ffffff"} onChange={e => onChange(e.target.value)}
            style={{ width: 32, height: 32, border: "1px solid var(--border)", borderRadius: 6, cursor: "pointer", padding: 0, background: "transparent" }} />
        )}
        <input type="text" value={value || ""} onChange={e => onChange(e.target.value)}
          className="input-field" style={{ flex: 1, height: 32, fontSize: 12, fontFamily: "monospace" }} />
      </div>
    </div>
  );
}

function SliderInput({ label, value, onChange, min, max, step = 1, unit = "" }: {
  label: string; value: number; onChange: (v: number) => void;
  min: number; max: number; step?: number; unit?: string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between" style={{ marginBottom: 6 }}>
        <label style={{ fontSize: 11, fontWeight: 500, color: "var(--text-muted)" }}>{label}</label>
        <span style={{ fontSize: 11, color: "var(--text-ash)", fontFamily: "monospace" }}>{value}{unit}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(Number(e.target.value))}
        style={{ width: "100%", height: 4, appearance: "none", background: "rgba(255,255,255,0.08)", borderRadius: 2, cursor: "pointer", accentColor: "var(--text-secondary)" }} />
    </div>
  );
}

function LivePreview({ config }: { config: ThemeConfig }) {
  return (
    <div style={{
      width: "100%", height: 420, borderRadius: 12, overflow: "hidden",
      border: "1px solid var(--border)", background: config.bgPrimary,
      display: "flex", fontFamily: config.fontFamily, fontSize: Math.min(config.fontSize * 0.7, 11),
      position: "relative",
    }}>
      {/* Sidebar preview */}
      <div style={{
        width: Math.min(config.sidebarWidth * 0.5, 100), background: config.bgSurface,
        borderRight: `1px solid ${config.border}`, display: "flex", flexDirection: "column", flexShrink: 0,
      }}>
        <div style={{ padding: "10px 12px", borderBottom: `1px solid ${config.border}` }}>
          <div style={{ fontSize: 9, fontWeight: 700, color: config.textPrimary, letterSpacing: "0.2em", textTransform: "uppercase" }}>Tirbeo</div>
        </div>
        <div style={{ padding: "6px 8px", flex: 1 }}>
          {["Home", "Profile", "Security", "Notifications", "Preferences"].map((item, i) => (
            <div key={item} style={{
              padding: "6px 8px", borderRadius: 6, marginBottom: 2,
              background: i === 0 ? config.accentMuted : "transparent",
              color: i === 0 ? config.textPrimary : config.textMuted,
              fontWeight: i === 0 ? 600 : 400, fontSize: 9,
            }}>{item}</div>
          ))}
        </div>
        <div style={{ padding: "8px", borderTop: `1px solid ${config.border}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 6px" }}>
            <div style={{ width: 18, height: 18, borderRadius: "50%", background: config.accentMuted, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 7, color: config.textPrimary }}>BN</div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 8, fontWeight: 500, color: config.textPrimary, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>Bishnu N.</div>
              <div style={{ fontSize: 7, color: config.textAsh, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>bishnu@...</div>
            </div>
          </div>
        </div>
      </div>

      {/* Content preview */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Top bar */}
        <div style={{
          height: 32, display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "0 12px", borderBottom: `1px solid ${config.border}`,
          background: `${config.bgPrimary}dd`, backdropFilter: "blur(12px)",
        }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 4, padding: "3px 8px",
            borderRadius: 6, background: config.bgCard, border: `1px solid ${config.border}`,
            fontSize: 8, color: config.textMuted,
          }}>🔍 Search...</div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ fontSize: 8, color: config.textMuted, fontVariantNumeric: "tabular-nums" }}>9:41 PM</div>
            <div style={{ width: 16, height: 16, borderRadius: "50%", background: config.accentMuted, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 7, color: config.textPrimary }}>BN</div>
          </div>
        </div>

        {/* Main content */}
        <div style={{ flex: 1, padding: config.contentPadding * 0.4, overflow: "hidden" }}>
          <div style={{ marginBottom: config.sectionGap * 0.3 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: config.textPrimary, letterSpacing: "-0.03em", lineHeight: config.lineHeight }}>
              Good evening, Bishnu!
            </div>
            <div style={{ fontSize: 8, color: config.textMuted, marginTop: 2 }}>Member since Jul 2025 · Nepal</div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 8 }}>
            {[
              { label: "Profile", value: "75%", color: config.accentPrimary },
              { label: "Security", value: "Active", color: config.success },
              { label: "Member", value: "12 mo", color: config.textSecondary },
              { label: "Activity", value: "8", color: "#57c1ff" },
            ].map(s => (
              <div key={s.label} style={{
                padding: config.cardPadding * 0.3, borderRadius: config.borderRadius * 0.4,
                background: config.bgCard, border: `1px solid ${config.border}`,
              }}>
                <div style={{ fontSize: 7, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: config.textMuted, marginBottom: 3 }}>{s.label}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: s.color, letterSpacing: "-0.03em" }}>{s.value}</div>
              </div>
            ))}
          </div>

          <div style={{
            padding: config.cardPadding * 0.3, borderRadius: config.borderRadius * 0.4,
            background: config.bgCard, border: `1px solid ${config.border}`,
          }}>
            <div style={{ fontSize: 9, fontWeight: 600, color: config.textPrimary, marginBottom: 4 }}>Account Status</div>
            {["Name set", "Email verified", "2FA enabled", "Bio added"].map((item, i) => (
              <div key={item} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "3px 0", borderBottom: i < 3 ? `1px solid ${config.border}` : "none" }}>
                <span style={{ fontSize: 8, color: config.textSecondary }}>{item}</span>
                <span style={{ fontSize: 7, color: i < 2 ? config.success : config.textAsh }}>{i < 2 ? "✓" : "○"}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PreferencesPage() {
  const [config, setConfig] = useState<ThemeConfig>(DEFAULT_CONFIG);
  const [savedThemes, setSavedThemes] = useState<SavedTheme[]>([]);
  const [activeThemeId, setActiveThemeId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [newThemeName, setNewThemeName] = useState("");
  const [showNewTheme, setShowNewTheme] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>("shell");
  const fetched = useRef(false);

  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;
    fetch(`${API}/api/preferences`, { credentials: "include" })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.preferences?.themeConfig) setConfig({ ...DEFAULT_CONFIG, ...data.preferences.themeConfig });
      })
      .catch(() => {});
    fetch(`${API}/api/preferences/themes`, { credentials: "include" })
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (Array.isArray(data)) setSavedThemes(data); })
      .catch(() => {});
  }, []);

  const update = useCallback((key: keyof ThemeConfig, val: any) => {
    setConfig(prev => ({ ...prev, [key]: val }));
  }, []);

  const applyConfig = useCallback((cfg: ThemeConfig) => {
    const root = document.documentElement;
    root.style.setProperty("--bg", cfg.bgPrimary);
    root.style.setProperty("--bg-surface", cfg.bgSurface);
    root.style.setProperty("--bg-card", cfg.bgCard);
    root.style.setProperty("--bg-elevated", cfg.bgElevated);
    root.style.setProperty("--bg-hover", cfg.bgHover);
    root.style.setProperty("--text", cfg.textPrimary);
    root.style.setProperty("--text-secondary", cfg.textSecondary);
    root.style.setProperty("--text-muted", cfg.textMuted);
    root.style.setProperty("--text-ash", cfg.textAsh);
    root.style.setProperty("--accent", cfg.accentPrimary);
    root.style.setProperty("--accent-muted", cfg.accentMuted);
    root.style.setProperty("--success", cfg.success);
    root.style.setProperty("--warning", cfg.warning);
    root.style.setProperty("--danger", cfg.danger);
    root.style.setProperty("--border", cfg.border);
    root.style.setProperty("--border-hover", cfg.borderHover);
    root.style.setProperty("--sidebar-w", `${cfg.sidebarWidth}px`);
    document.body.style.fontFamily = `"${cfg.fontFamily}", -apple-system, BlinkMacSystemFont, system-ui, sans-serif`;
    document.body.style.fontSize = `${cfg.fontSize}px`;
    document.body.style.fontWeight = String(cfg.fontWeight);
    document.body.style.lineHeight = String(cfg.lineHeight);
    document.body.style.letterSpacing = `${cfg.letterSpacing}em`;
    document.body.style.background = cfg.bgStyle === "gradient"
      ? `linear-gradient(${cfg.bgGradient})`
      : cfg.bgStyle === "image" && cfg.bgImageUrl
        ? `url(${cfg.bgImageUrl}) center/cover`
        : cfg.bgPrimary;
  }, []);

  useEffect(() => { applyConfig(config); }, [config, applyConfig]);

  const saveToDb = useCallback(async () => {
    setSaving(true);
    try {
      await fetch(`${API}/api/preferences`, {
        method: "PATCH", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ preferences: { themeConfig: config } }),
      });
      setToast("Theme applied & saved");
    } catch { setToast("Failed to save"); }
    setSaving(false);
    setTimeout(() => setToast(null), 3000);
  }, [config]);

  const saveAsTheme = useCallback(async () => {
    if (!newThemeName.trim()) return;
    try {
      const res = await fetch(`${API}/api/preferences/themes`, {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newThemeName.trim(), config }),
      });
      if (res.ok) {
        const theme = await res.json();
        setSavedThemes(prev => [...prev, theme]);
        setActiveThemeId(theme.id);
        setNewThemeName("");
        setShowNewTheme(false);
        setToast(`Theme "${theme.name}" saved`);
      }
    } catch { setToast("Failed to save theme"); }
    setTimeout(() => setToast(null), 3000);
  }, [newThemeName, config]);

  const loadTheme = useCallback((theme: SavedTheme) => {
    setConfig(theme.config);
    setActiveThemeId(theme.id);
  }, []);

  const deleteTheme = useCallback(async (id: string) => {
    if (!confirm("Delete this theme?")) return;
    try {
      await fetch(`${API}/api/preferences/themes/${id}`, { method: "DELETE", credentials: "include" });
      setSavedThemes(prev => prev.filter(t => t.id !== id));
      if (activeThemeId === id) setActiveThemeId(null);
      setToast("Theme deleted");
    } catch { setToast("Failed to delete"); }
    setTimeout(() => setToast(null), 3000);
  }, [activeThemeId]);

  const loadPreset = useCallback((preset: typeof PRESET_THEMES[0]) => {
    setConfig(prev => ({ ...prev, ...preset.config }));
    setActiveThemeId(null);
  }, []);

  const sections = [
    { id: "themes", label: "My Themes", icon: FolderOpen },
    { id: "shell", label: "Shell & Background", icon: Paintbrush },
    { id: "colors", label: "Colors", icon: Palette },
    { id: "typography", label: "Typography", icon: Type },
    { id: "spacing", label: "Spacing & Layout", icon: Sliders },
    { id: "accessibility", label: "Accessibility", icon: Accessibility },
  ];

  return (
    <div className="space-y-6">
      <div className="section-header flex items-center justify-between" style={{ marginBottom: 0 }}>
        <div>
          <h1>Preferences</h1>
          <p>Design your perfect dashboard — every pixel, every color</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={saveToDb} disabled={saving} className="btn btn-ghost" style={{ fontSize: 12 }}>
            <RotateCcw size={13} /> {saving ? "Saving..." : "Apply"}
          </button>
          <button onClick={saveToDb} disabled={saving} className="btn btn-primary" style={{ fontSize: 12 }}>
            <Save size={13} /> Save to Account
          </button>
        </div>
      </div>

      <div className="flex gap-6" style={{ minHeight: 600 }}>
        {/* Left: Controls */}
        <div className="flex-1 min-w-0" style={{ maxWidth: 480 }}>
          {/* Section nav */}
          <div className="flex gap-1 mb-5 flex-wrap">
            {sections.map(s => (
              <button key={s.id} onClick={() => setActiveSection(activeSection === s.id ? null : s.id)}
                className="btn" style={{
                  fontSize: 11, height: 30, padding: "0 10px",
                  background: activeSection === s.id ? "var(--accent-muted)" : "transparent",
                  color: activeSection === s.id ? "var(--text)" : "var(--text-muted)",
                  border: `1px solid ${activeSection === s.id ? "var(--border-hover)" : "var(--border)"}`,
                }}>
                <s.icon size={12} /> {s.label}
              </button>
            ))}
          </div>

          {/* My Themes */}
          {activeSection === "themes" && (
            <div className="glass card-section space-y-4">
              <div className="flex items-center gap-2">
                <FolderOpen size={14} style={{ color: "var(--text-muted)" }} />
                <h3 style={{ marginBottom: 0 }}>My Themes</h3>
                <button onClick={() => setShowNewTheme(!showNewTheme)} className="btn btn-ghost" style={{ marginLeft: "auto", height: 28, fontSize: 11, padding: "0 10px" }}>
                  <Plus size={12} /> New
                </button>
              </div>

              {showNewTheme && (
                <div className="flex items-center gap-2">
                  <input value={newThemeName} onChange={e => setNewThemeName(e.target.value)} placeholder="Theme name..."
                    className="input-field" style={{ height: 32, fontSize: 12, flex: 1 }} onKeyDown={e => e.key === "Enter" && saveAsTheme()} />
                  <button onClick={saveAsTheme} className="btn btn-primary" style={{ height: 32, fontSize: 11, padding: "0 12px" }}><Check size={12} /></button>
                  <button onClick={() => setShowNewTheme(false)} className="btn btn-ghost" style={{ height: 32, fontSize: 11, padding: "0 10px" }}><X size={12} /></button>
                </div>
              )}

              {/* Preset themes */}
              <div>
                <p style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-ash)", marginBottom: 8 }}>Presets</p>
                <div className="grid gap-2" style={{ gridTemplateColumns: "1fr 1fr" }}>
                  {PRESET_THEMES.map(p => (
                    <button key={p.name} onClick={() => loadPreset(p)} className="flex items-center gap-2" style={{
                      padding: "10px 12px", borderRadius: 8, border: "1px solid var(--border)",
                      background: "var(--bg-card)", cursor: "pointer", textAlign: "left",
                    }}>
                      <div style={{ width: 20, height: 20, borderRadius: 4, background: p.config.bgPrimary || "#07080a", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <div style={{ width: 8, height: 8, borderRadius: "50%", background: p.config.accentPrimary || "#fff" }} />
                      </div>
                      <span style={{ fontSize: 11, color: "var(--text-secondary)" }}>{p.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom saved themes */}
              {savedThemes.length > 0 && (
                <div>
                  <p style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-ash)", marginBottom: 8 }}>Saved</p>
                  <div className="space-y-1">
                    {savedThemes.map(t => (
                      <div key={t.id} className="flex items-center gap-2" style={{ padding: "8px 10px", borderRadius: 8, background: activeThemeId === t.id ? "var(--accent-muted)" : "transparent", border: `1px solid ${activeThemeId === t.id ? "var(--border-hover)" : "transparent"}` }}>
                        <div style={{ width: 16, height: 16, borderRadius: 4, background: t.config.bgPrimary, border: "1px solid var(--border)" }} />
                        <span style={{ fontSize: 12, color: "var(--text-secondary)", flex: 1 }}>{t.name}</span>
                        <button onClick={() => loadTheme(t)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: 4 }}><FolderOpen size={12} /></button>
                        <button onClick={() => deleteTheme(t.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-ash)", padding: 4 }}><Trash2 size={12} /></button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Shell & Background */}
          {activeSection === "shell" && (
            <div className="glass card-section space-y-5">
              <div className="flex items-center gap-2"><Paintbrush size={14} style={{ color: "var(--text-muted)" }} /><h3 style={{ marginBottom: 0 }}>Shell & Background</h3></div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 500, color: "var(--text-muted)", display: "block", marginBottom: 8 }}>Mode</label>
                <div className="toggle-group">
                  {[{ v: "dark", l: "Dark", i: Moon }, { v: "light", l: "Light", i: Sun }, { v: "system", l: "System", i: Monitor }].map(m => (
                    <button key={m.v} className={`toggle-group-item ${config.mode === m.v ? "active" : ""}`} onClick={() => update("mode", m.v)}>
                      <m.i size={12} style={{ marginRight: 4 }} />{m.l}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 500, color: "var(--text-muted)", display: "block", marginBottom: 8 }}>Background Style</label>
                <div className="toggle-group">
                  {[{ v: "solid", l: "Solid" }, { v: "gradient", l: "Gradient" }, { v: "image", l: "Image" }].map(s => (
                    <button key={s.v} className={`toggle-group-item ${config.bgStyle === s.v ? "active" : ""}`} onClick={() => update("bgStyle", s.v)}>{s.l}</button>
                  ))}
                </div>
              </div>

              {config.bgStyle === "gradient" && (
                <input value={config.bgGradient} onChange={e => update("bgGradient", e.target.value)}
                  className="input-field" style={{ fontSize: 12, fontFamily: "monospace" }} placeholder="135deg, #07080a 0%, #0d0d0d 100%" />
              )}
              {config.bgStyle === "image" && (
                <input value={config.bgImageUrl} onChange={e => update("bgImageUrl", e.target.value)}
                  className="input-field" style={{ fontSize: 12 }} placeholder="Image URL..." />
              )}

              <div className="grid grid-cols-2 gap-3">
                <ColorInput label="Background" value={config.bgPrimary} onChange={v => update("bgPrimary", v)} />
                <ColorInput label="Surface" value={config.bgSurface} onChange={v => update("bgSurface", v)} />
                <ColorInput label="Card" value={config.bgCard} onChange={v => update("bgCard", v)} />
                <ColorInput label="Elevated" value={config.bgElevated} onChange={v => update("bgElevated", v)} />
              </div>
            </div>
          )}

          {/* Colors */}
          {activeSection === "colors" && (
            <div className="glass card-section space-y-5">
              <div className="flex items-center gap-2"><Palette size={14} style={{ color: "var(--text-muted)" }} /><h3 style={{ marginBottom: 0 }}>Colors</h3></div>

              <p style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-ash)" }}>Text</p>
              <div className="grid grid-cols-2 gap-3">
                <ColorInput label="Primary" value={config.textPrimary} onChange={v => update("textPrimary", v)} />
                <ColorInput label="Secondary" value={config.textSecondary} onChange={v => update("textSecondary", v)} />
                <ColorInput label="Muted" value={config.textMuted} onChange={v => update("textMuted", v)} />
                <ColorInput label="Ash" value={config.textAsh} onChange={v => update("textAsh", v)} />
              </div>

              <p style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-ash)" }}>Accent</p>
              <div className="grid grid-cols-2 gap-3">
                <ColorInput label="Primary" value={config.accentPrimary} onChange={v => update("accentPrimary", v)} />
                <ColorInput label="Muted" value={config.accentMuted} onChange={v => update("accentMuted", v)} />
              </div>

              <p style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-ash)" }}>Semantic</p>
              <div className="grid grid-cols-3 gap-3">
                <ColorInput label="Success" value={config.success} onChange={v => update("success", v)} />
                <ColorInput label="Warning" value={config.warning} onChange={v => update("warning", v)} />
                <ColorInput label="Danger" value={config.danger} onChange={v => update("danger", v)} />
              </div>

              <p style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-ash)" }}>Border</p>
              <div className="grid grid-cols-2 gap-3">
                <ColorInput label="Border" value={config.border} onChange={v => update("border", v)} />
                <ColorInput label="Border Hover" value={config.borderHover} onChange={v => update("borderHover", v)} />
              </div>
            </div>
          )}

          {/* Typography */}
          {activeSection === "typography" && (
            <div className="glass card-section space-y-5">
              <div className="flex items-center gap-2"><Type size={14} style={{ color: "var(--text-muted)" }} /><h3 style={{ marginBottom: 0 }}>Typography</h3></div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 500, color: "var(--text-muted)", display: "block", marginBottom: 8 }}>Font Family</label>
                <div className="grid gap-1" style={{ gridTemplateColumns: "1fr 1fr" }}>
                  {["Inter", "Inter Tight", "Plus Jakarta Sans", "Geist", "system-ui", "Georgia"].map(f => (
                    <button key={f} onClick={() => update("fontFamily", f)} className="flex items-center gap-2" style={{
                      padding: "8px 10px", borderRadius: 6, border: `1px solid ${config.fontFamily === f ? "var(--border-hover)" : "var(--border)"}`,
                      background: config.fontFamily === f ? "var(--accent-muted)" : "var(--bg-card)", cursor: "pointer", textAlign: "left",
                      fontFamily: `"${f}", sans-serif`,
                    }}>
                      <span style={{ fontSize: 12, color: config.fontFamily === f ? "var(--text)" : "var(--text-secondary)" }}>{f}</span>
                    </button>
                  ))}
                </div>
              </div>

              <SliderInput label="Font Size" value={config.fontSize} onChange={v => update("fontSize", v)} min={10} max={20} unit="px" />
              <SliderInput label="Font Weight" value={config.fontWeight} onChange={v => update("fontWeight", v)} min={300} max={700} step={100} />
              <SliderInput label="Line Height" value={config.lineHeight} onChange={v => update("lineHeight", v)} min={1} max={2} step={0.1} />
              <SliderInput label="Letter Spacing" value={config.letterSpacing} onChange={v => update("letterSpacing", v)} min={-0.05} max={0.1} step={0.01} unit="em" />
            </div>
          )}

          {/* Spacing & Layout */}
          {activeSection === "spacing" && (
            <div className="glass card-section space-y-5">
              <div className="flex items-center gap-2"><Sliders size={14} style={{ color: "var(--text-muted)" }} /><h3 style={{ marginBottom: 0 }}>Spacing & Layout</h3></div>

              <SliderInput label="Content Padding" value={config.contentPadding} onChange={v => update("contentPadding", v)} min={8} max={48} unit="px" />
              <SliderInput label="Section Gap" value={config.sectionGap} onChange={v => update("sectionGap", v)} min={8} max={48} unit="px" />
              <SliderInput label="Card Padding" value={config.cardPadding} onChange={v => update("cardPadding", v)} min={8} max={48} unit="px" />
              <SliderInput label="Sidebar Width" value={config.sidebarWidth} onChange={v => update("sidebarWidth", v)} min={180} max={320} unit="px" />
              <SliderInput label="Border Radius" value={config.borderRadius} onChange={v => update("borderRadius", v)} min={0} max={24} unit="px" />
            </div>
          )}

          {/* Accessibility */}
          {activeSection === "accessibility" && (
            <div className="glass card-section space-y-5">
              <div className="flex items-center gap-2"><Accessibility size={14} style={{ color: "var(--text-muted)" }} /><h3 style={{ marginBottom: 0 }}>Accessibility</h3></div>
              <div className="table-row">
                <div><p style={{ fontSize: 13, fontWeight: 500, color: "#fff" }}>Reduce Motion</p><p style={{ fontSize: 11, color: "var(--text-muted)" }}>Minimize animations</p></div>
                <div className={`toggle ${config.mode === "reduce" ? "active" : ""}`} onClick={() => update("mode", config.mode === "reduce" ? "dark" : "reduce")} />
              </div>
              <div className="table-row">
                <div><p style={{ fontSize: 13, fontWeight: 500, color: "#fff" }}>High Contrast</p><p style={{ fontSize: 11, color: "var(--text-muted)" }}>Increase contrast for visibility</p></div>
                <div className={`toggle ${config.textPrimary === "#ffffff" && config.bgPrimary === "#000000" ? "active" : ""}`}
                  onClick={() => {
                    if (config.bgPrimary === "#000000") {
                      update("bgPrimary", "#07080a"); update("textPrimary", "#f4f4f6");
                    } else {
                      update("bgPrimary", "#000000"); update("textPrimary", "#ffffff");
                    }
                  }} />
              </div>
            </div>
          )}
        </div>

        {/* Right: Live Preview (sticky) */}
        <div style={{ width: 380, flexShrink: 0 }} className="hidden lg:block">
          <div className="sticky top-20">
            <div className="flex items-center gap-2 mb-3">
              <Eye size={13} style={{ color: "var(--text-muted)" }} />
              <span style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-muted)" }}>Live Preview</span>
            </div>
            <LivePreview config={config} />
            <p style={{ fontSize: 10, color: "var(--text-ash)", marginTop: 8, textAlign: "center" }}>
              Changes preview in real-time as you adjust settings
            </p>
          </div>
        </div>
      </div>

      {toast && <div className={`toast ${toast.includes("saved") || toast.includes("applied") ? "toast-success" : "toast-error"}`}>{toast}</div>}
    </div>
  );
}
