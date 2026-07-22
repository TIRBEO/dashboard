"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Moon, Sun, Monitor, Type, Palette, Save, Trash2,
  Plus, Check, X, RotateCcw, Eye, Paintbrush, FolderOpen,
} from "lucide-react";
import { PreferencesSkeleton } from "../../components/Skeleton";

const API = process.env.NEXT_PUBLIC_API_URL || "https://api.tirbeo.app";

// ─── Design Token Types ──────────────────────────────
type GrayScale = "neutral" | "mauve" | "olive" | "sage" | "sand" | "slate";
type AccentColor = "white" | "blue" | "green" | "cyan" | "purple" | "pink" | "red" | "orange" | "yellow" | "teal" | "violet" | "indigo" | "lime" | "rose";
type RadiusScale = "none" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl";

type ThemeConfig = {
  mode: "dark" | "light" | "system";
  gray: GrayScale;
  accent: AccentColor;
  fontFamily: string;
  radius: RadiusScale;
  fontSize: number;
  customBgUrl: string;
};

type SavedTheme = {
  id: string;
  name: string;
  createdAt: string;
  config: ThemeConfig;
};

const DEFAULT_CONFIG: ThemeConfig = {
  mode: "dark",
  gray: "neutral",
  accent: "white",
  fontFamily: "Inter",
  radius: "lg",
  fontSize: 14,
  customBgUrl: "",
};

// ─── Gray Scale Palettes ─────────────────────────────
const GRAY_SCALES: Record<GrayScale, { label: string; color: string; vars: Record<string, string> }> = {
  neutral: {
    label: "Neutral",
    color: "#737373",
    vars: {
      "--canvas": "#07080a", "--surface": "#0d0d0d", "--surface-elevated": "#101111", "--surface-card": "#121212",
      "--bg": "#07080a", "--bg-surface": "#0d0d0d", "--bg-card": "#121212", "--bg-elevated": "#101111",
      "--bg-hover": "#161717", "--bg-active": "#1c1d1d", "--bg-input": "#101111", "--bg-sidebar": "#0d0d0d", "--bg-topbar": "#07080a",
      "--ink": "#f4f4f6", "--body": "#cdcdcd", "--mute": "#9c9c9d", "--ash": "#6a6b6c", "--stone": "#434345",
      "--text": "#f4f4f6", "--text-primary": "#f4f4f6", "--text-secondary": "#cdcdcd", "--text-muted": "#9c9c9d", "--text-ash": "#6a6b6c",
      "--hairline": "#242728", "--hairline-soft": "rgba(255,255,255,0.08)", "--hairline-strong": "rgba(255,255,255,0.16)",
      "--border": "#242728", "--border-hover": "rgba(255,255,255,0.16)", "--border-strong": "rgba(255,255,255,0.24)",
    },
  },
  mauve: {
    label: "Mauve",
    color: "#8b8589",
    vars: {
      "--canvas": "#0c0a0b", "--surface": "#121011", "--surface-elevated": "#181516", "--surface-card": "#1c1819",
      "--bg": "#0c0a0b", "--bg-surface": "#121011", "--bg-card": "#1c1819", "--bg-elevated": "#181516",
      "--bg-hover": "#211d1e", "--bg-active": "#2a2526", "--bg-input": "#181516", "--bg-sidebar": "#121011", "--bg-topbar": "#0c0a0b",
      "--ink": "#f2edef", "--body": "#cdc5c8", "--mute": "#9c9396", "--ash": "#6a6366", "--stone": "#433f41",
      "--text": "#f2edef", "--text-primary": "#f2edef", "--text-secondary": "#cdc5c8", "--text-muted": "#9c9396", "--text-ash": "#6a6366",
      "--hairline": "#282325", "--hairline-soft": "rgba(255,230,240,0.08)", "--hairline-strong": "rgba(255,230,240,0.16)",
      "--border": "#282325", "--border-hover": "rgba(255,230,240,0.16)", "--border-strong": "rgba(255,230,240,0.24)",
    },
  },
  olive: {
    label: "Olive",
    color: "#7c7a6e",
    vars: {
      "--canvas": "#0b0c08", "--surface": "#11120e", "--surface-elevated": "#171813", "--surface-card": "#1b1c16",
      "--bg": "#0b0c08", "--bg-surface": "#11120e", "--bg-card": "#1b1c16", "--bg-elevated": "#171813",
      "--bg-hover": "#20211a", "--bg-active": "#282a21", "--bg-input": "#171813", "--bg-sidebar": "#11120e", "--bg-topbar": "#0b0c08",
      "--ink": "#f0f1eb", "--body": "#c9cabbf", "--mute": "#999a8f", "--ash": "#68695f", "--stone": "#42433a",
      "--text": "#f0f1eb", "--text-primary": "#f0f1eb", "--text-secondary": "#c9cabbf", "--text-muted": "#999a8f", "--text-ash": "#68695f",
      "--hairline": "#26271f", "--hairline-soft": "rgba(240,255,200,0.08)", "--hairline-strong": "rgba(240,255,200,0.14)",
      "--border": "#26271f", "--border-hover": "rgba(240,255,200,0.14)", "--border-strong": "rgba(240,255,200,0.22)",
    },
  },
  sage: {
    label: "Sage",
    color: "#7a8c7a",
    vars: {
      "--canvas": "#0a0c0a", "--surface": "#101210", "--surface-elevated": "#161816", "--surface-card": "#1a1c1a",
      "--bg": "#0a0c0a", "--bg-surface": "#101210", "--bg-card": "#1a1c1a", "--bg-elevated": "#161816",
      "--bg-hover": "#1f211f", "--bg-active": "#272927", "--bg-input": "#161816", "--bg-sidebar": "#101210", "--bg-topbar": "#0a0c0a",
      "--ink": "#eef2ee", "--body": "#c5ccbf", "--mute": "#969e96", "--ash": "#676e67", "--stone": "#414741",
      "--text": "#eef2ee", "--text-primary": "#eef2ee", "--text-secondary": "#c5ccbf", "--text-muted": "#969e96", "--text-ash": "#676e67",
      "--hairline": "#242824", "--hairline-soft": "rgba(200,255,200,0.07)", "--hairline-strong": "rgba(200,255,200,0.14)",
      "--border": "#242824", "--border-hover": "rgba(200,255,200,0.14)", "--border-strong": "rgba(200,255,200,0.22)",
    },
  },
  sand: {
    label: "Sand",
    color: "#a39e93",
    vars: {
      "--canvas": "#0e0d0b", "--surface": "#141310", "--surface-elevated": "#1a1916", "--surface-card": "#1e1d1a",
      "--bg": "#0e0d0b", "--bg-surface": "#141310", "--bg-card": "#1e1d1a", "--bg-elevated": "#1a1916",
      "--bg-hover": "#23221d", "--bg-active": "#2c2a24", "--bg-input": "#1a1916", "--bg-sidebar": "#141310", "--bg-topbar": "#0e0d0b",
      "--ink": "#f4f0e8", "--body": "#d0c9bb", "--mute": "#a09a8c", "--ash": "#6e695e", "--stone": "#47443c",
      "--text": "#f4f0e8", "--text-primary": "#f4f0e8", "--text-secondary": "#d0c9bb", "--text-muted": "#a09a8c", "--text-ash": "#6e695e",
      "--hairline": "#2a2820", "--hairline-soft": "rgba(255,240,200,0.08)", "--hairline-strong": "rgba(255,240,200,0.16)",
      "--border": "#2a2820", "--border-hover": "rgba(255,240,200,0.16)", "--border-strong": "rgba(255,240,200,0.24)",
    },
  },
  slate: {
    label: "Slate",
    color: "#7e8490",
    vars: {
      "--canvas": "#0a0b0e", "--surface": "#101115", "--surface-elevated": "#16171c", "--surface-card": "#1a1b21",
      "--bg": "#0a0b0e", "--bg-surface": "#101115", "--bg-card": "#1a1b21", "--bg-elevated": "#16171c",
      "--bg-hover": "#1f2027", "--bg-active": "#282932", "--bg-input": "#16171c", "--bg-sidebar": "#101115", "--bg-topbar": "#0a0b0e",
      "--ink": "#eceef2", "--body": "#c5c8d0", "--mute": "#9699a3", "--ash": "#676a73", "--stone": "#41434a",
      "--text": "#eceef2", "--text-primary": "#eceef2", "--text-secondary": "#c5c8d0", "--text-muted": "#9699a3", "--text-ash": "#676a73",
      "--hairline": "#23252c", "--hairline-soft": "rgba(200,210,255,0.07)", "--hairline-strong": "rgba(200,210,255,0.14)",
      "--border": "#23252c", "--border-hover": "rgba(200,210,255,0.14)", "--border-strong": "rgba(200,210,255,0.22)",
    },
  },
};

const GRAY_SCALES_LIGHT: Record<GrayScale, Record<string, string>> = {
  neutral: {
    "--canvas": "#ffffff", "--surface": "#f7f7f8", "--surface-elevated": "#edecee", "--surface-card": "#ffffff",
    "--bg": "#ffffff", "--bg-surface": "#f7f7f8", "--bg-card": "#ffffff", "--bg-elevated": "#edecee",
    "--bg-hover": "#e4e3e5", "--bg-active": "#dcdbdd", "--bg-input": "#ffffff", "--bg-sidebar": "#f7f7f8", "--bg-topbar": "#ffffff",
    "--ink": "#1d1d1f", "--body": "#4d4d4f", "--mute": "#868687", "--ash": "#aeaeb0", "--stone": "#c7c7c8",
    "--text": "#1d1d1f", "--text-primary": "#1d1d1f", "--text-secondary": "#4d4d4f", "--text-muted": "#868687", "--text-ash": "#aeaeb0",
    "--hairline": "#e5e5e7", "--hairline-soft": "rgba(0,0,0,0.06)", "--hairline-strong": "rgba(0,0,0,0.12)",
    "--border": "#e5e5e7", "--border-hover": "rgba(0,0,0,0.12)", "--border-strong": "rgba(0,0,0,0.18)",
  },
  mauve: {
    "--canvas": "#fdfcfd", "--surface": "#f8f6f7", "--surface-elevated": "#f0edef", "--surface-card": "#ffffff",
    "--bg": "#fdfcfd", "--bg-surface": "#f8f6f7", "--bg-card": "#ffffff", "--bg-elevated": "#f0edef",
    "--bg-hover": "#e9e6e8", "--bg-active": "#e0dce0", "--bg-input": "#ffffff", "--bg-sidebar": "#f8f6f7", "--bg-topbar": "#fdfcfd",
    "--ink": "#1f1217", "--body": "#4e4347", "--mute": "#877e82", "--ash": "#b0a8ac", "--stone": "#d0c8cc",
    "--text": "#1f1217", "--text-primary": "#1f1217", "--text-secondary": "#4e4347", "--text-muted": "#877e82", "--text-ash": "#b0a8ac",
    "--hairline": "#e8dfe3", "--hairline-soft": "rgba(80,0,40,0.06)", "--hairline-strong": "rgba(80,0,40,0.12)",
    "--border": "#e8dfe3", "--border-hover": "rgba(80,0,40,0.12)", "--border-strong": "rgba(80,0,40,0.18)",
  },
  olive: {
    "--canvas": "#fcfdfb", "--surface": "#f7f8f5", "--surface-elevated": "#eff0eb", "--surface-card": "#ffffff",
    "--bg": "#fcfdfb", "--bg-surface": "#f7f8f5", "--bg-card": "#ffffff", "--bg-elevated": "#eff0eb",
    "--bg-hover": "#e6e8e2", "--bg-active": "#dddfda", "--bg-input": "#ffffff", "--bg-sidebar": "#f7f8f5", "--bg-topbar": "#fcfdfb",
    "--ink": "#151a12", "--body": "#474c42", "--mute": "#7f847a", "--ash": "#a8ada3", "--stone": "#c8c8bf",
    "--text": "#151a12", "--text-primary": "#151a12", "--text-secondary": "#474c42", "--text-muted": "#7f847a", "--text-ash": "#a8ada3",
    "--hairline": "#dde3d6", "--hairline-soft": "rgba(30,60,0,0.06)", "--hairline-strong": "rgba(30,60,0,0.12)",
    "--border": "#dde3d6", "--border-hover": "rgba(30,60,0,0.12)", "--border-strong": "rgba(30,60,0,0.18)",
  },
  sage: {
    "--canvas": "#fbfcfb", "--surface": "#f6f8f6", "--surface-elevated": "#eef0ee", "--surface-card": "#ffffff",
    "--bg": "#fbfcfb", "--bg-surface": "#f6f8f6", "--bg-card": "#ffffff", "--bg-elevated": "#eef0ee",
    "--bg-hover": "#e5e7e5", "--bg-active": "#dcdedc", "--bg-input": "#ffffff", "--bg-sidebar": "#f6f8f6", "--bg-topbar": "#fbfcfb",
    "--ink": "#121a12", "--body": "#434e43", "--mute": "#7a857a", "--ash": "#a4aea4", "--stone": "#c4cec4",
    "--text": "#121a12", "--text-primary": "#121a12", "--text-secondary": "#434e43", "--text-muted": "#7a857a", "--text-ash": "#a4aea4",
    "--hairline": "#d8e2d8", "--hairline-soft": "rgba(0,60,0,0.05)", "--hairline-strong": "rgba(0,60,0,0.10)",
    "--border": "#d8e2d8", "--border-hover": "rgba(0,60,0,0.10)", "--border-strong": "rgba(0,60,0,0.16)",
  },
  sand: {
    "--canvas": "#fdfcfb", "--surface": "#f9f7f4", "--surface-elevated": "#f1efe9", "--surface-card": "#ffffff",
    "--bg": "#fdfcfb", "--bg-surface": "#f9f7f4", "--bg-card": "#ffffff", "--bg-elevated": "#f1efe9",
    "--bg-hover": "#eae6df", "--bg-active": "#e0dbd3", "--bg-input": "#ffffff", "--bg-sidebar": "#f9f7f4", "--bg-topbar": "#fdfcfb",
    "--ink": "#1c1810", "--body": "#545044", "--mute": "#8c867a", "--ash": "#b4ae9f", "--stone": "#d2cdbf",
    "--text": "#1c1810", "--text-primary": "#1c1810", "--text-secondary": "#545044", "--text-muted": "#8c867a", "--text-ash": "#b4ae9f",
    "--hairline": "#e6dfd4", "--hairline-soft": "rgba(60,40,0,0.06)", "--hairline-strong": "rgba(60,40,0,0.12)",
    "--border": "#e6dfd4", "--border-hover": "rgba(60,40,0,0.12)", "--border-strong": "rgba(60,40,0,0.18)",
  },
  slate: {
    "--canvas": "#fbfcfd", "--surface": "#f6f7f9", "--surface-elevated": "#edeef1", "--surface-card": "#ffffff",
    "--bg": "#fbfcfd", "--bg-surface": "#f6f7f9", "--bg-card": "#ffffff", "--bg-elevated": "#edeef1",
    "--bg-hover": "#e4e6ea", "--bg-active": "#dcdde2", "--bg-input": "#ffffff", "--bg-sidebar": "#f6f7f9", "--bg-topbar": "#fbfcfd",
    "--ink": "#111520", "--body": "#434856", "--mute": "#7a7f8e", "--ash": "#a4a9b6", "--stone": "#c4c8d2",
    "--text": "#111520", "--text-primary": "#111520", "--text-secondary": "#434856", "--text-muted": "#7a7f8e", "--text-ash": "#a4a9b6",
    "--hairline": "#d8dce6", "--hairline-soft": "rgba(0,20,80,0.06)", "--hairline-strong": "rgba(0,20,80,0.12)",
    "--border": "#d8dce6", "--border-hover": "rgba(0,20,80,0.12)", "--border-strong": "rgba(0,20,80,0.18)",
  },
};

// ─── Accent Color Palettes ───────────────────────────
const ACCENT_COLORS: Record<AccentColor, { label: string; color: string; vars: Record<string, string> }> = {
  white: {
    label: "White", color: "#ffffff",
    vars: { "--accent": "#ffffff", "--accent-hover": "#e8e8e8", "--accent-muted": "rgba(255,255,255,0.08)", "--accent-text": "#000000" },
  },
  blue: {
    label: "Blue", color: "#57c1ff",
    vars: { "--accent": "#57c1ff", "--accent-hover": "#3db4ff", "--accent-muted": "rgba(87,193,255,0.12)", "--accent-text": "#000000" },
  },
  green: {
    label: "Green", color: "#59d499",
    vars: { "--accent": "#59d499", "--accent-hover": "#3cc982", "--accent-muted": "rgba(89,212,153,0.12)", "--accent-text": "#000000" },
  },
  cyan: {
    label: "Cyan", color: "#5bc5f2",
    vars: { "--accent": "#5bc5f2", "--accent-hover": "#3db8ef", "--accent-muted": "rgba(91,197,242,0.12)", "--accent-text": "#000000" },
  },
  purple: {
    label: "Purple", color: "#be7cff",
    vars: { "--accent": "#be7cff", "--accent-hover": "#ae5cff", "--accent-muted": "rgba(190,124,255,0.12)", "--accent-text": "#000000" },
  },
  pink: {
    label: "Pink", color: "#f472b6",
    vars: { "--accent": "#f472b6", "--accent-hover": "#f25daa", "--accent-muted": "rgba(244,114,182,0.12)", "--accent-text": "#000000" },
  },
  red: {
    label: "Red", color: "#ff6161",
    vars: { "--accent": "#ff6161", "--accent-hover": "#ff4545", "--accent-muted": "rgba(255,97,97,0.12)", "--accent-text": "#000000" },
  },
  orange: {
    label: "Orange", color: "#ff9a3d",
    vars: { "--accent": "#ff9a3d", "--accent-hover": "#ff8822", "--accent-muted": "rgba(255,154,61,0.12)", "--accent-text": "#000000" },
  },
  yellow: {
    label: "Yellow", color: "#ffc533",
    vars: { "--accent": "#ffc533", "--accent-hover": "#ffbb11", "--accent-muted": "rgba(255,197,51,0.12)", "--accent-text": "#000000" },
  },
  teal: {
    label: "Teal", color: "#4dd4ac",
    vars: { "--accent": "#4dd4ac", "--accent-hover": "#35c99b", "--accent-muted": "rgba(77,212,172,0.12)", "--accent-text": "#000000" },
  },
  violet: {
    label: "Violet", color: "#8b5cf6",
    vars: { "--accent": "#8b5cf6", "--accent-hover": "#7c4ff5", "--accent-muted": "rgba(139,92,246,0.12)", "--accent-text": "#000000" },
  },
  indigo: {
    label: "Indigo", color: "#6366f1",
    vars: { "--accent": "#6366f1", "--accent-hover": "#5558e6", "--accent-muted": "rgba(99,102,241,0.12)", "--accent-text": "#000000" },
  },
  lime: {
    label: "Lime", color: "#a3e635",
    vars: { "--accent": "#a3e635", "--accent-hover": "#96e018", "--accent-muted": "rgba(163,230,53,0.12)", "--accent-text": "#000000" },
  },
  rose: {
    label: "Rose", color: "#fb7185",
    vars: { "--accent": "#fb7185", "--accent-hover": "#fa5e76", "--accent-muted": "rgba(251,113,133,0.12)", "--accent-text": "#000000" },
  },
};

const ACCENT_COLORS_LIGHT: Record<AccentColor, Record<string, string>> = {
  white: { "--accent": "#0066cc", "--accent-hover": "#0055aa", "--accent-muted": "rgba(0,102,204,0.08)", "--accent-text": "#ffffff" },
  blue: { "--accent": "#0077cc", "--accent-hover": "#0066b8", "--accent-muted": "rgba(0,119,204,0.08)", "--accent-text": "#ffffff" },
  green: { "--accent": "#1a9958", "--accent-hover": "#15884c", "--accent-muted": "rgba(26,153,88,0.08)", "--accent-text": "#ffffff" },
  cyan: { "--accent": "#0891b2", "--accent-hover": "#0e7c99", "--accent-muted": "rgba(8,145,178,0.08)", "--accent-text": "#ffffff" },
  purple: { "--accent": "#7c3aed", "--accent-hover": "#6d28d9", "--accent-muted": "rgba(124,58,237,0.08)", "--accent-text": "#ffffff" },
  pink: { "--accent": "#db2777", "--accent-hover": "#c5216b", "--accent-muted": "rgba(219,39,119,0.08)", "--accent-text": "#ffffff" },
  red: { "--accent": "#dc2626", "--accent-hover": "#cc2222", "--accent-muted": "rgba(220,38,38,0.08)", "--accent-text": "#ffffff" },
  orange: { "--accent": "#ea580c", "--accent-hover": "#d9500b", "--accent-muted": "rgba(234,88,12,0.08)", "--accent-text": "#ffffff" },
  yellow: { "--accent": "#ca8a04", "--accent-hover": "#b87d04", "--accent-muted": "rgba(202,138,4,0.08)", "--accent-text": "#ffffff" },
  teal: { "--accent": "#0d9488", "--accent-hover": "#0c877d", "--accent-muted": "rgba(13,148,136,0.08)", "--accent-text": "#ffffff" },
  violet: { "--accent": "#7c3aed", "--accent-hover": "#6d28d9", "--accent-muted": "rgba(124,58,237,0.08)", "--accent-text": "#ffffff" },
  indigo: { "--accent": "#4f46e5", "--accent-hover": "#453dd1", "--accent-muted": "rgba(79,70,229,0.08)", "--accent-text": "#ffffff" },
  lime: { "--accent": "#65a30d", "--accent-hover": "#5c950c", "--accent-muted": "rgba(101,163,13,0.08)", "--accent-text": "#ffffff" },
  rose: { "--accent": "#e11d48", "--accent-hover": "#cc1a42", "--accent-muted": "rgba(225,29,72,0.08)", "--accent-text": "#ffffff" },
};

// ─── Radius Scale ────────────────────────────────────
const RADIUS_SCALES: { id: RadiusScale; label: string; value: string }[] = [
  { id: "none", label: "None", value: "0" },
  { id: "xs", label: "XS", value: "4px" },
  { id: "sm", label: "SM", value: "6px" },
  { id: "md", label: "MD", value: "8px" },
  { id: "lg", label: "LG", value: "10px" },
  { id: "xl", label: "XL", value: "16px" },
  { id: "2xl", label: "2XL", value: "20px" },
];

// ─── Font Options ────────────────────────────────────
const FONT_OPTIONS = [
  { id: "Inter", label: "Inter", sample: "Aa", feature: '"calt", "kern", "liga", "ss03"' },
  { id: "Inter Tight", label: "Inter Tight", sample: "Aa", feature: '"calt", "kern", "liga"' },
  { id: "Plus Jakarta Sans", label: "Plus Jakarta", sample: "Aa", feature: '"calt", "kern", "liga"' },
  { id: "Geist", label: "Geist", sample: "Aa", feature: '"calt", "kern", "liga"' },
  { id: "system-ui", label: "System UI", sample: "Aa", feature: "normal" },
  { id: "Georgia", label: "Georgia", sample: "Aa", feature: "normal" },
];

// ─── Helper: load Google Font dynamically ─────────────
const loadedFonts = new Set<string>();
function loadGoogleFont(family: string) {
  if (loadedFonts.has(family) || family === "system-ui" || family === "Georgia") return;
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = `https://fonts.googleapis.com/css2?family=${family.replace(/ /g, "+")}:wght@300;400;500;600;700;800;900&display=swap`;
  document.head.appendChild(link);
  loadedFonts.add(family);
}

// ─── Helper: expand config into CSS variables ─────────
function expandThemeVars(config: ThemeConfig): Record<string, string> {
  const isDark = config.mode === "dark" || (config.mode === "system" && typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  const grayVars = isDark ? GRAY_SCALES[config.gray].vars : GRAY_SCALES_LIGHT[config.gray];
  const accentVars = isDark ? ACCENT_COLORS[config.accent].vars : ACCENT_COLORS_LIGHT[config.accent];
  const radiusValue = RADIUS_SCALES.find(r => r.id === config.radius)?.value || "10px";

  return {
    ...grayVars,
    ...accentVars,
    "--radius-sm": radiusValue === "0" ? "0" : radiusValue,
    "--radius-md": radiusValue === "0" ? "0" : `calc(${radiusValue} + 2px)`,
    "--radius-lg": radiusValue,
    "--radius-xl": radiusValue === "0" ? "0" : `calc(${radiusValue} + 6px)`,
  };
}

// ─── Apply theme to DOM ──────────────────────────────
function applyTheme(config: ThemeConfig) {
  const root = document.documentElement;
  const vars = expandThemeVars(config);
  Object.entries(vars).forEach(([key, val]) => root.style.setProperty(key, val));
  root.style.fontSize = `${config.fontSize}px`;
  if (config.fontFamily) {
    loadGoogleFont(config.fontFamily);
    document.body.style.fontFamily = `"${config.fontFamily}", -apple-system, BlinkMacSystemFont, system-ui, sans-serif`;
  }
}

// ─── Components ──────────────────────────────────────
function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h3 style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--mute)", marginBottom: 10 }}>{children}</h3>;
}

function ColorSwatch({ color, selected, onClick, label }: { color: string; selected: boolean; onClick: () => void; label: string }) {
  return (
    <button onClick={onClick} title={label} style={{
      width: 28, height: 28, borderRadius: "50%", background: color,
      border: `2px solid ${selected ? "var(--ink)" : "var(--hairline)"}`,
      cursor: "pointer", transition: "all 0.12s", position: "relative",
      transform: selected ? "scale(1.1)" : "scale(1)",
    }}>
      {selected && <Check size={12} style={{ position: "absolute", inset: 0, margin: "auto", color: color === "#ffffff" || color === "#ffc533" || color === "#a3e635" ? "#000" : "#fff" }} />}
    </button>
  );
}

function SliderControl({ label, value, onChange, min, max, step = 1, unit = "" }: {
  label: string; value: number; onChange: (v: number) => void;
  min: number; max: number; step?: number; unit?: string;
}) {
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
        <label style={{ fontSize: 12, fontWeight: 500, color: "var(--body)" }}>{label}</label>
        <span style={{ fontSize: 11, color: "var(--ash)", fontFamily: "monospace" }}>{value}{unit}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(Number(e.target.value))}
        style={{ width: "100%", height: 4, appearance: "none", background: "var(--surface-elevated)", borderRadius: 2, cursor: "pointer" }} />
    </div>
  );
}

// ─── Live Preview ────────────────────────────────────
function LivePreview({ config }: { config: ThemeConfig }) {
  const vars = expandThemeVars(config);
  const getVar = (key: string) => vars[key] || "var(--" + key + ")";

  return (
    <div style={{
      width: "100%", height: 380, borderRadius: RADIUS_SCALES.find(r => r.id === config.radius)?.value || "10px",
      overflow: "hidden", border: "1px solid var(--hairline)",
      background: getVar("--canvas"), display: "flex",
      fontFamily: `"${config.fontFamily}", sans-serif`, fontSize: 11, position: "relative",
    }}>
      {/* Sidebar */}
      <div style={{
        width: 90, background: getVar("--surface"), borderRight: `1px solid ${getVar("--hairline")}`,
        display: "flex", flexDirection: "column", flexShrink: 0,
      }}>
        <div style={{ padding: "10px 10px", borderBottom: `1px solid ${getVar("--hairline")}` }}>
          <div style={{ fontSize: 8, fontWeight: 700, color: getVar("--ink"), letterSpacing: "0.15em", textTransform: "uppercase" }}>Tirbeo</div>
        </div>
        <div style={{ padding: "6px 6px", flex: 1 }}>
          {["Home", "Profile", "Security", "Preferences"].map((item, i) => (
            <div key={item} style={{
              padding: "5px 7px", borderRadius: RADIUS_SCALES.find(r => r.id === config.radius)?.value || "6px",
              marginBottom: 1, fontSize: 9,
              background: i === 0 ? getVar("--accent-muted") : "transparent",
              color: i === 0 ? getVar("--ink") : getVar("--mute"),
              fontWeight: i === 0 ? 600 : 400,
            }}>{item}</div>
          ))}
        </div>
      </div>
      {/* Content */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <div style={{
          height: 30, display: "flex", alignItems: "center", padding: "0 10px",
          borderBottom: `1px solid ${getVar("--hairline")}`, background: getVar("--canvas"),
        }}>
          <div style={{
            padding: "3px 8px", borderRadius: RADIUS_SCALES.find(r => r.id === config.radius)?.value || "6px",
            background: getVar("--surface"), border: `1px solid ${getVar("--hairline")}`,
            fontSize: 8, color: getVar("--mute"), flex: 1,
          }}>Search...</div>
        </div>
        <div style={{ flex: 1, padding: 12 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: getVar("--ink"), letterSpacing: "-0.02em", marginBottom: 6 }}>Dashboard</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 8 }}>
            {[{ l: "Profile", v: "75%", c: getVar("--accent") }, { l: "Security", v: "Active", c: getVar("--success") }].map(s => (
              <div key={s.l} style={{
                padding: 8, borderRadius: RADIUS_SCALES.find(r => r.id === config.radius)?.value || "6px",
                background: getVar("--surface-card"), border: `1px solid ${getVar("--hairline")}`,
              }}>
                <div style={{ fontSize: 7, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: getVar("--mute"), marginBottom: 2 }}>{s.l}</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: s.c, letterSpacing: "-0.02em" }}>{s.v}</div>
              </div>
            ))}
          </div>
          <div style={{
            padding: 8, borderRadius: RADIUS_SCALES.find(r => r.id === config.radius)?.value || "6px",
            background: getVar("--surface-card"), border: `1px solid ${getVar("--hairline")}`,
          }}>
            <div style={{ fontSize: 9, fontWeight: 600, color: getVar("--ink"), marginBottom: 4 }}>Status</div>
            {["Name set", "Email verified", "2FA enabled"].map((item, i) => (
              <div key={item} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "2px 0" }}>
                <span style={{ fontSize: 8, color: getVar("--body") }}>{item}</span>
                <span style={{ fontSize: 7, color: i < 2 ? getVar("--success") : getVar("--ash") }}>{i < 2 ? "✓" : "○"}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────
export default function PreferencesPage() {
  const [config, setConfig] = useState<ThemeConfig>(DEFAULT_CONFIG);
  const [savedThemes, setSavedThemes] = useState<SavedTheme[]>([]);
  const [activeThemeId, setActiveThemeId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [newThemeName, setNewThemeName] = useState("");
  const [showNewTheme, setShowNewTheme] = useState(false);
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

  const update = useCallback((key: string, val: any) => {
    setConfig(prev => ({ ...prev, [key]: val }));
  }, []);

  useEffect(() => { applyTheme(config); }, [config]);

  const saveToDb = useCallback(async () => {
    setSaving(true);
    try {
      await fetch(`${API}/api/preferences`, {
        method: "PATCH", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ preferences: { themeConfig: config } }),
      });
      localStorage.setItem("tirbeo-theme-config", JSON.stringify(config));
      setToast("Theme saved to account");
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
    try {
      await fetch(`${API}/api/preferences/themes/${id}`, { method: "DELETE", credentials: "include" });
      setSavedThemes(prev => prev.filter(t => t.id !== id));
      if (activeThemeId === id) setActiveThemeId(null);
      setToast("Theme deleted");
    } catch { setToast("Failed to delete"); }
    setTimeout(() => setToast(null), 3000);
  }, [activeThemeId]);

  return (
    <div className="space-y-6">
      <div className="section-header" style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 0 }}>
        <div>
          <h1>Preferences</h1>
          <p>Customize your dashboard appearance</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={saveToDb} disabled={saving} className="btn btn-ghost" style={{ fontSize: 12 }}>
            <RotateCcw size={13} /> {saving ? "Saving..." : "Apply"}
          </button>
          <button onClick={saveToDb} disabled={saving} className="btn btn-primary" style={{ fontSize: 12 }}>
            <Save size={13} /> Save
          </button>
        </div>
      </div>

      <div style={{ display: "flex", gap: 24, minHeight: 600 }}>
        {/* Left: Controls */}
        <div style={{ flex: 1, minWidth: 0, maxWidth: 520 }}>

          {/* ── My Themes ── */}
          <div className="card-section" style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
              <FolderOpen size={14} style={{ color: "var(--mute)" }} />
              <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "var(--ink)" }}>My Themes</h3>
              <button onClick={() => setShowNewTheme(!showNewTheme)} className="btn btn-ghost" style={{ marginLeft: "auto", height: 28, fontSize: 11, padding: "0 10px" }}>
                <Plus size={12} /> Save Current
              </button>
            </div>

            {showNewTheme && (
              <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                <input value={newThemeName} onChange={e => setNewThemeName(e.target.value)} placeholder="Theme name..."
                  className="input-field" style={{ height: 32, fontSize: 12, flex: 1 }} onKeyDown={e => e.key === "Enter" && saveAsTheme()} />
                <button onClick={saveAsTheme} className="btn btn-primary" style={{ height: 32, fontSize: 11, padding: "0 12px" }}><Check size={12} /></button>
                <button onClick={() => setShowNewTheme(false)} className="btn btn-ghost" style={{ height: 32, fontSize: 11, padding: "0 10px" }}><X size={12} /></button>
              </div>
            )}

            {savedThemes.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {savedThemes.map(t => (
                  <div key={t.id} style={{
                    display: "flex", alignItems: "center", gap: 10, padding: "8px 10px",
                    borderRadius: "var(--radius-sm)", background: activeThemeId === t.id ? "var(--accent-muted)" : "transparent",
                    border: `1px solid ${activeThemeId === t.id ? "var(--hairline-strong)" : "transparent"}`,
                  }}>
                    <div style={{ width: 16, height: 16, borderRadius: 4, background: ACCENT_COLORS[t.config.accent]?.color || "#fff", border: "1px solid var(--hairline)" }} />
                    <span style={{ fontSize: 12, color: "var(--body)", flex: 1 }}>{t.name}</span>
                    <button onClick={() => loadTheme(t)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--mute)", padding: 4 }}><FolderOpen size={12} /></button>
                    <button onClick={() => deleteTheme(t.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--ash)", padding: 4 }}><Trash2 size={12} /></button>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ fontSize: 12, color: "var(--ash)" }}>No saved themes yet. Customize below and click "Save Current".</p>
            )}
          </div>

          {/* ── Mode ── */}
          <div className="card-section" style={{ marginBottom: 16 }}>
            <SectionTitle>Mode</SectionTitle>
            <div className="toggle-group">
              {[{ v: "dark" as const, l: "Dark", i: Moon }, { v: "light" as const, l: "Light", i: Sun }, { v: "system" as const, l: "System", i: Monitor }].map(m => (
                <button key={m.v} className={`toggle-group-item ${config.mode === m.v ? "active" : ""}`} onClick={() => update("mode", m.v)}>
                  <m.i size={12} style={{ marginRight: 4 }} />{m.l}
                </button>
              ))}
            </div>
          </div>

          {/* ── Gray Color ── */}
          <div className="card-section" style={{ marginBottom: 16 }}>
            <SectionTitle>Gray Color</SectionTitle>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {(Object.keys(GRAY_SCALES) as GrayScale[]).map(id => (
                <button key={id} onClick={() => update("gray", id)} style={{
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
                  padding: "10px 14px", borderRadius: "var(--radius-sm)", cursor: "pointer",
                  border: `1px solid ${config.gray === id ? "var(--ink)" : "var(--hairline)"}`,
                  background: config.gray === id ? "var(--surface-elevated)" : "transparent",
                  transition: "all 0.12s", minWidth: 64,
                }}>
                  <div style={{ width: 24, height: 24, borderRadius: "50%", background: GRAY_SCALES[id].color, border: "1px solid var(--hairline)" }} />
                  <span style={{ fontSize: 11, fontWeight: 500, color: config.gray === id ? "var(--ink)" : "var(--body)" }}>{GRAY_SCALES[id].label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* ── Accent Color ── */}
          <div className="card-section" style={{ marginBottom: 16 }}>
            <SectionTitle>Accent Color</SectionTitle>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {(Object.keys(ACCENT_COLORS) as AccentColor[]).map(id => (
                <ColorSwatch key={id} color={ACCENT_COLORS[id].color} selected={config.accent === id}
                  onClick={() => update("accent", id)} label={ACCENT_COLORS[id].label} />
              ))}
            </div>
            <div style={{ marginTop: 8, fontSize: 11, color: "var(--ash)" }}>
              {ACCENT_COLORS[config.accent].label} — {ACCENT_COLORS[config.accent].color}
            </div>
          </div>

          {/* ── Font Family ── */}
          <div className="card-section" style={{ marginBottom: 16 }}>
            <SectionTitle>Font Family</SectionTitle>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {FONT_OPTIONS.map(f => (
                <button key={f.id} onClick={() => update("fontFamily", f.id)} style={{
                  display: "flex", alignItems: "center", gap: 12, padding: "10px 14px",
                  borderRadius: "var(--radius-sm)", cursor: "pointer",
                  border: `1px solid ${config.fontFamily === f.id ? "var(--ink)" : "var(--hairline)"}`,
                  background: config.fontFamily === f.id ? "var(--surface-elevated)" : "transparent",
                  transition: "all 0.12s", fontFamily: `"${f.id}", sans-serif`,
                }}>
                  <span style={{ fontSize: 18, fontWeight: 600, color: config.fontFamily === f.id ? "var(--ink)" : "var(--body)", width: 32, textAlign: "center" }}>{f.sample}</span>
                  <div style={{ textAlign: "left" }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: config.fontFamily === f.id ? "var(--ink)" : "var(--body)" }}>{f.label}</div>
                    <div style={{ fontSize: 11, color: "var(--ash)", fontFamily: "monospace" }}>{f.id}</div>
                  </div>
                  {config.fontFamily === f.id && <Check size={14} style={{ marginLeft: "auto", color: "var(--ink)" }} />}
                </button>
              ))}
            </div>
          </div>

          {/* ── Border Radius ── */}
          <div className="card-section" style={{ marginBottom: 16 }}>
            <SectionTitle>Border Radius</SectionTitle>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {RADIUS_SCALES.map(r => (
                <button key={r.id} onClick={() => update("radius", r.id)} style={{
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
                  padding: "10px 12px", borderRadius: "var(--radius-sm)", cursor: "pointer",
                  border: `1px solid ${config.radius === r.id ? "var(--ink)" : "var(--hairline)"}`,
                  background: config.radius === r.id ? "var(--surface-elevated)" : "transparent",
                  transition: "all 0.12s", minWidth: 52,
                }}>
                  <div style={{
                    width: 24, height: 24, borderRadius: r.value === "0" ? 0 : r.value,
                    background: "var(--surface-card)", border: `2px solid ${config.radius === r.id ? "var(--ink)" : "var(--hairline)"}`,
                  }} />
                  <span style={{ fontSize: 10, fontWeight: 500, color: config.radius === r.id ? "var(--ink)" : "var(--body)", fontFamily: "monospace" }}>{r.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* ── Font Size ── */}
          <div className="card-section" style={{ marginBottom: 16 }}>
            <SectionTitle>Font Size</SectionTitle>
            <SliderControl label="Base Size" value={config.fontSize} onChange={v => update("fontSize", v)} min={12} max={18} unit="px" />
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontSize: 11, color: "var(--ash)" }}>
              <span>Small</span>
              <span>Default</span>
              <span>Large</span>
            </div>
          </div>

          {/* ── Custom Background ── */}
          <div className="card-section">
            <SectionTitle>Background Image</SectionTitle>
            <input value={config.customBgUrl} onChange={e => update("customBgUrl", e.target.value)}
              className="input-field" style={{ fontSize: 12 }} placeholder="Paste image URL for custom background..." />
            {config.customBgUrl && (
              <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
                <button onClick={() => update("customBgUrl", "")} className="btn btn-ghost" style={{ fontSize: 11, height: 28 }}>Clear</button>
                <span style={{ fontSize: 11, color: "var(--ash)", alignSelf: "center" }}>Image will be blurred for readability</span>
              </div>
            )}
          </div>
        </div>

        {/* Right: Live Preview (sticky) */}
        <div style={{ width: 400, flexShrink: 0 }} className="hidden lg:block">
          <div style={{ position: "sticky", top: 72 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
              <Eye size={13} style={{ color: "var(--mute)" }} />
              <span style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--mute)" }}>Live Preview</span>
            </div>
            <LivePreview config={config} />
            <p style={{ fontSize: 10, color: "var(--ash)", marginTop: 8, textAlign: "center" }}>
              Changes apply in real-time
            </p>
          </div>
        </div>
      </div>

      {toast && <div className={`toast ${toast.includes("saved") || toast.includes("applied") ? "toast-success" : "toast-error"}`}>{toast}</div>}
    </div>
  );
}
