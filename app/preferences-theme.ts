export const PREFERENCES_STORAGE_KEY = "tirbeo-dashboard-preferences";

export type PreferenceState = {
  theme?: string | null;
  language?: string | null;
  timezone?: string | null;
  dateFormat?: string | null;
  timeFormat?: string | null;
  fontSize?: string | null;
  reduceMotion?: boolean;
  highContrast?: boolean;
  weekStart?: string | null;
  currency?: string | null;
  defaultLanding?: string | null;
  preferences?: Record<string, any>;
};

export function normalizePreferenceState(input: PreferenceState | null | undefined): PreferenceState {
  const base = input || {};
  const nested = base.preferences || {};
  return {
    ...base,
    theme: base.theme ?? nested.theme ?? "dark",
    reduceMotion: !!(base.reduceMotion ?? nested.reduceMotion ?? false),
    highContrast: !!(base.highContrast ?? nested.highContrast ?? false),
    preferences: {
      ...nested,
      accentColor: nested.accentColor ?? "#ffffff",
      shellStyle: nested.shellStyle ?? "dark",
      density: nested.density ?? "comfortable",
      sidebarWidth: nested.sidebarWidth ?? "wide",
      fontScale: nested.fontScale ?? "default",
      blurIntensity: nested.blurIntensity ?? 40,
      roundedCorners: nested.roundedCorners ?? 16,
      compactMode: !!(nested.compactMode ?? false),
      glassEffect: nested.glassEffect ?? true,
      transparency: nested.transparency ?? true,
      fontFamily: nested.fontFamily ?? "Inter",
      animationSpeed: nested.animationSpeed ?? "normal",
    },
  };
}

export function getStoredPreferences() {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(PREFERENCES_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function persistPreferences(prefs: Record<string, any>) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(prefs));
  } catch {}
}

function resolveTheme(theme: string | undefined) {
  if (theme === "light" || theme === "dark") return theme;
  if (typeof window !== "undefined" && window.matchMedia?.("(prefers-color-scheme: dark)").matches) {
    return "dark";
  }
  return "light";
}

export function applyPreferenceStyles(prefs: Record<string, any> | null | undefined) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  const data = prefs || {};
  const normalized = normalizePreferenceState(data as any);
  const theme = resolveTheme(normalized.theme || "dark");
  const accent = normalized.preferences?.accentColor || "#ffffff";
  const shell = normalized.preferences?.shellStyle || "dark";
  const density = normalized.preferences?.density || "comfortable";
  const sidebarWidth = normalized.preferences?.sidebarWidth || "wide";
  const fontScale = normalized.preferences?.fontScale || "default";
  const blur = normalized.preferences?.blurIntensity ?? 40;
  const rounded = normalized.preferences?.roundedCorners ?? 16;
  const compact = !!normalized.preferences?.compactMode;
  const reduceMotion = !!normalized.reduceMotion || !!normalized.preferences?.reduceMotion;
  const highContrast = !!normalized.highContrast || !!normalized.preferences?.highContrast;
  const fontFamily = normalized.preferences?.fontFamily || "Inter";
  const glassEffect = normalized.preferences?.glassEffect !== undefined ? normalized.preferences.glassEffect : true;
  const transparency = normalized.preferences?.transparency !== undefined ? normalized.preferences.transparency : true;

  persistPreferences(normalized as Record<string, any>);
  root.setAttribute("data-theme", theme);
  root.setAttribute("data-shell", shell);

  if (theme === "light") {
    root.style.setProperty("--bg", "#f8f9fa");
    root.style.setProperty("--bg-surface", "#ffffff");
    root.style.setProperty("--bg-card", "#ffffff");
    root.style.setProperty("--bg-elevated", "#f0f1f3");
    root.style.setProperty("--bg-hover", "#e8e9eb");
    root.style.setProperty("--bg-active", "#dddee0");
    root.style.setProperty("--text", "#1a1a1a");
    root.style.setProperty("--text-secondary", "#4a4a4a");
    root.style.setProperty("--text-muted", "#6b6b6b");
    root.style.setProperty("--text-ash", "#999999");
    root.style.setProperty("--text-stone", "#cccccc");
    root.style.setProperty("--border", "#e0e0e0");
    root.style.setProperty("--border-hover", "rgba(0,0,0,0.12)");
    root.style.setProperty("--border-strong", "rgba(0,0,0,0.2)");
    root.style.setProperty("--accent", "#000000");
    root.style.setProperty("--accent-hover", "#333333");
    root.style.setProperty("--accent-muted", "rgba(0,0,0,0.06)");
    root.style.setProperty("--accent-glow", "rgba(0,0,0,0.08)");
    root.style.setProperty("--success", "#1a8a5a");
    root.style.setProperty("--danger", "#d42a2a");
    root.style.setProperty("--warning", "#c49000");
    root.style.setProperty("--gold", "#b8941f");
    root.style.setProperty("--gold-subtle", "rgba(184,148,31,0.1)");
    root.style.setProperty("--gold-hover", "rgba(184,148,31,0.15)");
  } else {
    if (shell === "midnight") {
      root.style.setProperty("--bg", "#05060a");
      root.style.setProperty("--bg-surface", "#0b0d12");
      root.style.setProperty("--bg-card", "#12141b");
    } else {
      root.style.setProperty("--bg", "#050507");
      root.style.setProperty("--bg-surface", "#0a0a0c");
      root.style.setProperty("--bg-card", "#0e0e10");
    }
    root.style.setProperty("--bg-elevated", "#121214");
    root.style.setProperty("--bg-hover", "#161618");
    root.style.setProperty("--bg-active", "#1a1a1c");
    root.style.setProperty("--text", "#f4f4f6");
    root.style.setProperty("--text-secondary", "#cdcdcd");
    root.style.setProperty("--text-muted", "#9c9c9d");
    root.style.setProperty("--text-ash", "#6a6b6c");
    root.style.setProperty("--text-stone", "#434345");
    root.style.setProperty("--border", "#242728");
    root.style.setProperty("--border-hover", "rgba(255,255,255,0.16)");
    root.style.setProperty("--border-strong", "rgba(255,255,255,0.24)");
    root.style.setProperty("--accent", accent);
    root.style.setProperty("--accent-hover", "#e8e8e8");
    root.style.setProperty("--accent-muted", accent + "20");
    root.style.setProperty("--accent-glow", "rgba(255,255,255,0.12)");
    root.style.setProperty("--success", "#59d499");
    root.style.setProperty("--danger", "#ff6161");
    root.style.setProperty("--warning", "#ffc533");
    root.style.setProperty("--gold", "#d8b36a");
    root.style.setProperty("--gold-subtle", "rgba(216,179,106,0.12)");
    root.style.setProperty("--gold-hover", "rgba(216,179,106,0.2)");
  }

  root.style.setProperty("--sidebar-w", sidebarWidth === "compact" ? "220px" : sidebarWidth === "narrow" ? "180px" : "260px");
  root.style.setProperty("--dashboard-density", compact ? "0.92" : density === "spacious" ? "1.05" : density === "compact" ? "0.95" : "1");
  root.style.setProperty("--font-scale", fontScale === "large" ? "1.02" : fontScale === "small" ? "0.96" : "1");
  root.style.setProperty("--blur", glassEffect ? `${blur}px` : "0px");
  root.style.setProperty("--radius", `${rounded}px`);
  root.style.setProperty("--motion-scale", reduceMotion ? "0.85" : "1");
  root.style.setProperty("--contrast-scale", highContrast ? "1.05" : "1");
  root.style.setProperty("--glass-alpha", transparency ? "0.72" : "1");

  document.body.style.fontFamily = fontFamily === "system" ? "system-ui, sans-serif" : fontFamily === "JetBrains Mono" ? "'JetBrains Mono', monospace" : `${fontFamily}, Inter, sans-serif`;
}
