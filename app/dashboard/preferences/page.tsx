"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Moon, Sun, Monitor, Type, Palette, LayoutGrid, Sparkles, Settings,
  Globe, Clock, Zap, Eye, Bell, RotateCcw, Save, X, Check,
} from "lucide-react";
import { PreferencesSkeleton } from "../../components/Skeleton";
import { useToast } from "../../components/ToastProvider";
import { PREFERENCES_PAGE } from "../../dashboard-config";

const API = process.env.NEXT_PUBLIC_API_URL || "https://api.tirbeo.app";

type Prefs = {
  theme: string | null; language: string | null; timezone: string | null;
  dateFormat: string | null; timeFormat: string | null; fontSize: string | null;
  reduceMotion: boolean; highContrast: boolean;
  weekStart?: string | null; currency?: string | null; defaultLanding?: string | null;
  preferences?: Record<string, any>;
} | null;

function Toggle({ label, desc, value, onChange }: { label: string; desc?: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="table-row">
      <div>
        <p style={{ fontSize: 13, fontWeight: 500, color: "#ffffff" }}>{label}</p>
        {desc && <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 1 }}>{desc}</p>}
      </div>
      <div className={`toggle ${value ? "active" : ""}`} onClick={() => onChange(!value)} />
    </div>
  );
}

function SelectField({ label, value, onChange, options, desc }: { label: string; value: string; onChange: (v: string) => void; options: { label: string; value: string }[]; desc?: string }) {
  return (
    <div>
      <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-muted)" }}>{label}</label>
      <select value={value || ""} onChange={e => onChange(e.target.value)} className="input-field" style={{ cursor: "pointer", width: "100%" }}>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      {desc && <p style={{ fontSize: 10, color: "var(--text-ash)", marginTop: 4 }}>{desc}</p>}
    </div>
  );
}

function ColorSwatch({ colors, value, onChange }: { colors: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex gap-2 flex-wrap">
      {colors.map(c => (
        <button key={c} onClick={() => onChange(c)}
          style={{
            width: 28, height: 28, borderRadius: "50%", background: c, border: "none",
            cursor: "pointer", position: "relative",
            outline: value === c ? "2px solid var(--accent)" : "2px solid transparent",
            outlineOffset: 2,
          }}
        />
      ))}
    </div>
  );
}

function applyPreferenceStyles(prefs: Prefs) {
  const root = document.documentElement;
  const accent = prefs?.preferences?.accentColor || "#ffffff";
  const shell = prefs?.preferences?.shellStyle || "dark";
  const density = prefs?.preferences?.density || "comfortable";
  const sidebarWidth = prefs?.preferences?.sidebarWidth || "wide";
  const fontScale = prefs?.preferences?.fontScale || "default";
  root.style.setProperty("--accent", accent);
  root.style.setProperty("--accent-muted", `${accent}20`);
  root.style.setProperty("--sidebar-w", sidebarWidth === "compact" ? "220px" : "260px");
  root.style.setProperty("--dashboard-density", density === "compact" ? "0.9" : density === "spacious" ? "1.05" : "1");
  root.style.setProperty("--font-scale", fontScale === "large" ? "1.02" : fontScale === "small" ? "0.96" : "1");
  if (shell === "midnight") {
    root.style.setProperty("--bg", "#05060a");
    root.style.setProperty("--bg-surface", "#0b0d12");
    root.style.setProperty("--bg-card", "#12141b");
  } else {
    root.style.setProperty("--bg", "#050507");
    root.style.setProperty("--bg-surface", "#0a0a0c");
    root.style.setProperty("--bg-card", "#0e0e10");
  }
}

const SECTION_ICONS: Record<string, any> = { Globe, Clock, Zap, Palette, LayoutGrid, Type, Moon };

export default function PreferencesPage() {
  const [prefs, setPrefs] = useState<Prefs>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [dirty, setDirty] = useState(false);
  const fetched = useRef(false);
  const toast = useToast();
  const originalPrefs = useRef<Prefs>(null);

  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;
    fetch(`${API}/api/preferences`, { credentials: "include" }).then(r => r.ok ? r.json() : null).then((data) => {
      setPrefs(data);
      originalPrefs.current = JSON.parse(JSON.stringify(data));
      applyPreferenceStyles(data);
    }).catch(() => {});
  }, []);

  const update = useCallback((key: string, val: any) => {
    setPrefs(prev => prev ? { ...prev, [key]: val } : prev);
    setDirty(true);
    setSaved(false);
  }, []);

  const updateAppearance = useCallback((key: string, val: any) => {
    setPrefs(prev => prev ? { ...prev, preferences: { ...(prev.preferences || {}), [key]: val } } : prev);
    setDirty(true);
    setSaved(false);
  }, []);

  const save = useCallback(async () => {
    if (!prefs) return;
    setSaving(true);
    try {
      applyPreferenceStyles(prefs);
      const res = await fetch(`${API}/api/preferences`, {
        method: "PATCH", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(prefs),
      });
      if (res.ok) {
        toast.success("Preferences saved");
        setSaved(true);
        setDirty(false);
        originalPrefs.current = JSON.parse(JSON.stringify(prefs));
      } else {
        toast.error("Failed to save preferences");
      }
    } catch {
      toast.error("Connection error");
    }
    setSaving(false);
  }, [prefs, toast]);

  const reset = useCallback(() => {
    if (originalPrefs.current) {
      setPrefs(JSON.parse(JSON.stringify(originalPrefs.current)));
      applyPreferenceStyles(originalPrefs.current);
      setDirty(false);
      setSaved(false);
      toast.success("Reverted to last saved");
    }
  }, [toast]);

  if (!prefs) return <PreferencesSkeleton />;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between" style={{ marginBottom: 0 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: "#fff", letterSpacing: "-0.03em" }}>Preferences</h1>
          <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4 }}>Customize your experience and dashboard look</p>
        </div>
        <div className="flex items-center gap-2">
          {dirty && (
            <button onClick={reset} className="btn btn-ghost" style={{ fontSize: 12 }}>
              <RotateCcw size={13} /> Revert
            </button>
          )}
          <button onClick={save} disabled={saving || !dirty} className="btn btn-primary" style={{ fontSize: 12, opacity: !dirty ? 0.5 : 1 }}>
            {saving ? "Saving..." : saved ? <><Check size={13} /> Saved</> : <><Save size={13} /> Save</>}
          </button>
        </div>
      </div>

      {/* Sections from config */}
      {PREFERENCES_PAGE.sections.map(section => {
        const SectionIcon = SECTION_ICONS[section.icon] || Settings;
        return (
          <div key={section.id} className="glass card-section space-y-4" style={{ padding: "24px 28px" }}>
            <div className="flex items-center gap-2">
              <SectionIcon size={14} style={{ color: "var(--text-muted)" }} />
              <h3 style={{ marginBottom: 0, fontSize: 15, fontWeight: 600, color: "#fff" }}>{section.label}</h3>
            </div>

            {section.id === "general" && (
              <>
                {/* Theme Picker */}
                <div>
                  <label className="block text-xs font-medium mb-2" style={{ color: "var(--text-muted)" }}>Theme</label>
                  <div className="flex gap-2">
                    {["light", "dark", "system"].map(t => (
                      <button key={t} onClick={() => update("theme", t)}
                        className={`btn ${prefs.theme === t ? "btn-primary" : "btn-ghost"}`}
                        style={{ flex: 1, height: 36, textTransform: "capitalize", fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                        {t === "light" ? <Sun size={13} /> : t === "dark" ? <Moon size={13} /> : <Monitor size={13} />}
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <SelectField label="Language" value={prefs.language || "en"} onChange={v => update("language", v)} options={section.fields.find(f => f.name === "language")?.options || []} />
                  <SelectField label="Timezone" value={prefs.timezone || "UTC"} onChange={v => update("timezone", v)} options={section.fields.find(f => f.name === "timezone")?.options || []} />
                  <SelectField label="Date Format" value={prefs.dateFormat || "MM/DD/YYYY"} onChange={v => update("dateFormat", v)} options={section.fields.find(f => f.name === "dateFormat")?.options || []} />
                  <SelectField label="Time Format" value={prefs.timeFormat || "12h"} onChange={v => update("timeFormat", v)} options={section.fields.find(f => f.name === "timeFormat")?.options || []} />
                  <SelectField label="Week Starts On" value={prefs.weekStart || "monday"} onChange={v => update("weekStart", v)} options={section.fields.find(f => f.name === "weekStart")?.options || []} />
                  <SelectField label="Currency" value={prefs.currency || "USD"} onChange={v => update("currency", v)} options={section.fields.find(f => f.name === "currency")?.options || []} />
                  <SelectField label="Default Landing Page" value={prefs.defaultLanding || "/dashboard"} onChange={v => update("defaultLanding", v)} options={section.fields.find(f => f.name === "defaultLanding")?.options || []} />
                </div>
              </>
            )}

            {section.id === "behavior" && (
              <div>
                {section.fields.map(field => (
                  <Toggle key={field.name} label={field.label} desc={field.description} value={!!(prefs.preferences?.[field.name] ?? field.defaultValue)} onChange={v => updateAppearance(field.name, v)} />
                ))}
              </div>
            )}
          </div>
        );
      })}

      {/* Appearance Settings */}
      <div className="glass card-section space-y-4" style={{ padding: "24px 28px" }}>
        <div className="flex items-center gap-2">
          <Palette size={14} style={{ color: "var(--text-muted)" }} />
          <h3 style={{ marginBottom: 0, fontSize: 15, fontWeight: 600, color: "#fff" }}>Appearance</h3>
        </div>

        <div>
          <label className="block text-xs font-medium mb-2" style={{ color: "var(--text-muted)" }}>Accent Color</label>
          <ColorSwatch
            colors={["#ffffff", "#7aa2f7", "#59d499", "#ffb347", "#f472b6", "#c084fc", "#fb7185", "#38bdf8"]}
            value={prefs.preferences?.accentColor || "#ffffff"}
            onChange={v => updateAppearance("accentColor", v)}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <SelectField label="Shell Style" value={prefs.preferences?.shellStyle || "dark"} onChange={v => updateAppearance("shellStyle", v)} options={[{ label: "Dark", value: "dark" }, { label: "Midnight", value: "midnight" }]} />
          <SelectField label="Density" value={prefs.preferences?.density || "comfortable"} onChange={v => updateAppearance("density", v)} options={[{ label: "Compact", value: "compact" }, { label: "Comfortable", value: "comfortable" }, { label: "Spacious", value: "spacious" }]} />
          <SelectField label="Sidebar Width" value={prefs.preferences?.sidebarWidth || "wide"} onChange={v => updateAppearance("sidebarWidth", v)} options={[{ label: "Wide (260px)", value: "wide" }, { label: "Compact (220px)", value: "compact" }]} />
          <SelectField label="Font Scale" value={prefs.preferences?.fontScale || "default"} onChange={v => updateAppearance("fontScale", v)} options={[{ label: "Small", value: "small" }, { label: "Default", value: "default" }, { label: "Large", value: "large" }]} />
          <SelectField label="Glass Blur" value={String(prefs.preferences?.blurIntensity || 40)} onChange={v => updateAppearance("blurIntensity", v)} options={[{ label: "None", value: "0" }, { label: "Light (20px)", value: "20" }, { label: "Default (40px)", value: "40" }, { label: "Heavy (60px)", value: "60" }]} />
          <SelectField label="Rounded Corners" value={prefs.preferences?.roundedCorners || "16"} onChange={v => updateAppearance("roundedCorners", v)} options={[{ label: "None (0px)", value: "0" }, { label: "Small (8px)", value: "8" }, { label: "Default (16px)", value: "16" }, { label: "Large (24px)", value: "24" }]} />
        </div>

        <div>
          <Toggle label="Glass Effect" desc="Frosted glass panels with backdrop blur" value={prefs.preferences?.glassEffect !== false} onChange={v => updateAppearance("glassEffect", v)} />
          <Toggle label="Transparency" desc="Transparent panel backgrounds" value={prefs.preferences?.transparency !== false} onChange={v => updateAppearance("transparency", v)} />
        </div>
      </div>

      {/* Typography */}
      <div className="glass card-section space-y-4" style={{ padding: "24px 28px" }}>
        <div className="flex items-center gap-2">
          <Type size={14} style={{ color: "var(--text-muted)" }} />
          <h3 style={{ marginBottom: 0, fontSize: 15, fontWeight: 600, color: "#fff" }}>Typography</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <SelectField label="Font Family" value={prefs.preferences?.fontFamily || "Inter"} onChange={v => updateAppearance("fontFamily", v)} options={[{ label: "Inter", value: "Inter" }, { label: "System", value: "system" }, { label: "JetBrains Mono", value: "JetBrains Mono" }, { label: "SF Pro", value: "SF Pro" }]} />
          <SelectField label="Font Size" value={prefs.fontSize || "default"} onChange={v => update("fontSize", v)} options={[{ label: "Small (13px)", value: "small" }, { label: "Default (14px)", value: "default" }, { label: "Large (15px)", value: "large" }, { label: "Extra Large (16px)", value: "extra-large" }]} />
          <SelectField label="Animation Speed" value={prefs.preferences?.animationSpeed || "normal"} onChange={v => updateAppearance("animationSpeed", v)} options={[{ label: "Instant", value: "instant" }, { label: "Fast", value: "fast" }, { label: "Normal", value: "normal" }, { label: "Slow", value: "slow" }]} />
        </div>
        <Toggle label="Reduce Motion" desc="Minimize animations for accessibility" value={!!prefs.reduceMotion} onChange={v => update("reduceMotion", v)} />
        <Toggle label="High Contrast" desc="Increase contrast for visibility" value={!!prefs.highContrast} onChange={v => update("highContrast", v)} />
      </div>
    </div>
  );
}
