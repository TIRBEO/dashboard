"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Palette, Check } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "https://api.tirbeo.app";

type ColorTheme = {
  id: string;
  name: string;
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  border: string;
  isCustom: boolean;
  createdAt: string;
};

export default function AppearanceColorsPage() {
  const [themes, setThemes] = useState<ColorTheme[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTheme, setSelectedTheme] = useState<string>("");
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: "", primary: "#d8b36a", secondary: "#f2eee8", accent: "#59d499", background: "#0b0b0d", surface: "#121417", text: "#f2eee8", border: "#2a2d31" });
  const fetched = useRef(false);

  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;

    Promise.all([
      fetch(`${API}/api/app-appearance/themes`, { credentials: "include" }).then((r) => (r.ok ? r.json() : [])),
      fetch(`${API}/api/app-appearance/settings`, { credentials: "include" }).then((r) => (r.ok ? r.json() : null)),
    ])
      .then(([themesData, settingsData]) => {
        setThemes(themesData || []);
        if (settingsData?.theme) {
          setSelectedTheme(settingsData.theme);
        } else if (themesData && themesData.length > 0) {
          setSelectedTheme(themesData[0].id);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const createTheme = useCallback(async () => {
    if (!form.name) return;
    try {
      const res = await fetch(`${API}/api/app-appearance/themes", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, isCustom: true }),
      });
      if (res.ok) {
        const newTheme = await res.json();
        setThemes((prev) => [...prev, newTheme]);
        setShowCreate(false);
        setForm({ name: "", primary: "#d8b36a", secondary: "#f2eee8", accent: "#59d499", background: "#0b0b0d", surface: "#121417", text: "#f2eee8", border: "#2a2d31" });
      }
    } catch {
    }
  }, [form]);

  const applyTheme = useCallback(async (themeId: string) => {
    const theme = themes.find((t) => t.id === themeId);
    if (!theme) return;
    try {
      const res = await fetch(`${API}/api/app-appearance/settings", {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ theme: themeId }),
      });
      if (res.ok) {
        setSelectedTheme(themeId);
      }
    } catch {
    }
  }, [themes]);

  const getColorPreviewStyle = (theme: ColorTheme) => ({
    backgroundColor: theme.background,
    borderColor: theme.border,
    color: theme.text,
  });

  if (loading) {
    return (
      <div className="space-y-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="glass card-section animate-in">
            <div className="skeleton" style={{ height: 80 }} />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="section-header">
        <h1>Colors</h1>
        <p>Manage color themes and presets for your workspace</p>
      </div>

      <div className="glass card-section">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <div>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: "#ffffff", margin: 0 }}>Available Themes</h3>
            <p style={{ fontSize: 13, color: "#7b7e84", margin: "4px 0 0" }}>{themes.length} total themes</p>
          </div>
          <button onClick={() => setShowCreate(!showCreate)} className="btn btn-primary">
            <Palette size={13} /> New Theme
          </button>
        </div>

        {themes.length === 0 ? (
          <div className="text-center py-12">
            <Palette size={48} style={{ color: "var(--text-muted)", margin: "0 auto 12px" }} />
            <p style={{ fontSize: 15, color: "var(--text-muted)" }}>No custom themes created</p>
            <p style={{ fontSize: 13, color: "var(--text-ash)", marginTop: 4 }}>Create your first color theme to customize your workspace</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {themes.map((theme) => (
              <div
                key={theme.id}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${selectedTheme === theme.id ? "border-accent bg-accent/10" : "border-border hover:border-text/20"}`}
                style={getColorPreviewStyle(theme)}
                onClick={() => applyTheme(theme.id)}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                  <p style={{ fontSize: 13, fontWeight: 600 }}>{theme.name}</p>
                  {selectedTheme === theme.id && <Check size={16} style={{ color: "var(--accent)" }} />}
                </div>
                <div style={{ display: "flex", gap: 4, marginBottom: 8 }}>
                  <div style={{ width: 20, height: 20, borderRadius: "50%", background: theme.primary }} />
                  <div style={{ width: 20, height: 20, borderRadius: "50%", background: theme.secondary }} />
                  <div style={{ width: 20, height: 20, borderRadius: "50%", background: theme.accent }} />
                </div>
                {theme.isCustom && (
                  <span className="badge badge-default" style={{ fontSize: 10 }}>Custom</span>
                )}
              </div>
            ))}
          </div>
        )}

        {showCreate && (
          <div className="mt-6 pt-4 border-t" style={{ borderColor: "var(--border)" }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: "#ffffff", margin: "0 0 12px" }}>Create New Theme</h3>
            <div className="space-y-4">
              <input
                placeholder="Theme name"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="input-field"
              />
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 12 }}>
                <div>
                  <label style={{ fontSize: 11, color: "#9c9c9d", marginBottom: 4, display: "block" }}>Primary</label>
                  <input
                    type="color"
                    value={form.primary}
                    onChange={(e) => setForm((f) => ({ ...f, primary: e.target.value }))}
                    style={{ width: "100%", height: 36, border: "none", borderRadius: 6, cursor: "pointer", background: "none" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 11, color: "#9c9c9d", marginBottom: 4, display: "block" }}>Secondary</label>
                  <input
                    type="color"
                    value={form.secondary}
                    onChange={(e) => setForm((f) => ({ ...f, secondary: e.target.value }))}
                    style={{ width: "100%", height: 36, border: "none", borderRadius: 6, cursor: "pointer", background: "none" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 11, color: "#9c9c9d", marginBottom: 4, display: "block" }}>Accent</label>
                  <input
                    type="color"
                    value={form.accent}
                    onChange={(e) => setForm((f) => ({ ...f, accent: e.target.value }))}
                    style={{ width: "100%", height: 36, border: "none", borderRadius: 6, cursor: "pointer", background: "none" }}
                  />
                </div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={createTheme} className="btn btn-primary">Create Theme</button>
                <button onClick={() => setShowCreate(false)} className="btn btn-ghost">Cancel</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
