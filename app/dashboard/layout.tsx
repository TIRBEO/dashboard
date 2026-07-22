"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Home, User, Shield, Building2, Bell, Plug, Settings, Activity,
  HelpCircle, LogOut, Search, Menu, X, ChevronRight, Clock, FileText,
  Palette, Globe, Eye, KeyRound, Smartphone, Fingerprint,
  CreditCard, Database, Sun, Moon, Monitor, Megaphone,
} from "lucide-react";
import DotField from "../components/DotField";

const API = process.env.NEXT_PUBLIC_API_URL || "https://api.tirbeo.app";

type Theme = "dark" | "light" | "system";
type GrayScale = "neutral" | "mauve" | "olive" | "sage" | "sand" | "slate";
type AccentColor = "white" | "blue" | "green" | "cyan" | "purple" | "pink" | "red" | "orange" | "yellow" | "teal" | "violet" | "indigo" | "lime" | "rose";
type RadiusScale = "none" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
type ThemeConfig = {
  mode: Theme; gray: GrayScale; accent: AccentColor;
  fontFamily: string; radius: RadiusScale; fontSize: number; customBgUrl: string;
};

const DEFAULT_CONFIG: ThemeConfig = {
  mode: "dark", gray: "neutral", accent: "white",
  fontFamily: "Inter", radius: "lg", fontSize: 14, customBgUrl: "",
};

type Me = {
  id: string; email: string; name: string | null; photoUrl: string | null;
  adminRole: string | null; is2FAEnabled: boolean;
  preferences?: { theme?: string; themeConfig?: ThemeConfig };
};

const NAV = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/dashboard/profile", label: "Profile", icon: User },
  { href: "/dashboard/security", label: "Security", icon: Shield },
  { href: "/dashboard/workspace", label: "Workspace", icon: Building2 },
  { href: "/dashboard/notifications", label: "Notifications", icon: Bell },
  { href: "/dashboard/integrations", label: "Integrations", icon: Plug },
  { href: "/dashboard/preferences", label: "Preferences", icon: Settings },
  { href: "/dashboard/activity", label: "Activity", icon: Activity },
  { href: "/dashboard/help", label: "Help & Support", icon: HelpCircle },
];

type SearchItem = { label: string; href: string; icon: typeof Home; category: string; keywords: string[] };

const SEARCH_INDEX: SearchItem[] = [
  { label: "Home", href: "/dashboard", icon: Home, category: "Navigation", keywords: ["home", "dashboard", "overview"] },
  { label: "Profile", href: "/dashboard/profile", icon: User, category: "Account", keywords: ["profile", "personal", "name", "avatar"] },
  { label: "Security", href: "/dashboard/security", icon: Shield, category: "Account", keywords: ["security", "password", "2fa", "passkey"] },
  { label: "Workspace", href: "/dashboard/workspace", icon: Building2, category: "Account", keywords: ["workspace", "team"] },
  { label: "Notifications", href: "/dashboard/notifications", icon: Bell, category: "Main", keywords: ["notifications", "alerts"] },
  { label: "Integrations", href: "/dashboard/integrations", icon: Plug, category: "Account", keywords: ["integrations", "google", "github"] },
  { label: "Preferences", href: "/dashboard/preferences", icon: Settings, category: "Main", keywords: ["preferences", "theme", "dark", "light", "appearance"] },
  { label: "Activity", href: "/dashboard/activity", icon: Activity, category: "Account", keywords: ["activity", "audit", "log"] },
  { label: "Help & Support", href: "/dashboard/help", icon: HelpCircle, category: "Main", keywords: ["help", "support", "faq"] },
  { label: "Theme Settings", href: "/dashboard/preferences", icon: Palette, category: "Preferences", keywords: ["theme", "dark", "light", "color", "appearance"] },
  { label: "Typography", href: "/dashboard/preferences", icon: Globe, category: "Preferences", keywords: ["font", "typography", "size"] },
  { label: "Layout", href: "/dashboard/preferences", icon: Eye, category: "Preferences", keywords: ["layout", "sidebar", "width"] },
  { label: "Change Password", href: "/dashboard/security", icon: KeyRound, category: "Security", keywords: ["password", "change"] },
  { label: "Two-Factor Auth", href: "/dashboard/security", icon: Smartphone, category: "Security", keywords: ["2fa", "authenticator"] },
  { label: "Passkeys", href: "/dashboard/security", icon: Fingerprint, category: "Security", keywords: ["passkey", "biometric"] },
  { label: "Data & Privacy", href: "/dashboard/preferences", icon: Database, category: "Preferences", keywords: ["data", "privacy", "export"] },
];

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  if (theme === "system") {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    root.setAttribute("data-theme", prefersDark ? "dark" : "light");
  } else {
    root.setAttribute("data-theme", theme);
  }
}

function getResolvedTheme(theme: Theme): "dark" | "light" {
  if (theme === "system") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  return theme;
}

// ─── Gray Scale Variables ────────────────────────────
const GRAY_DARK: Record<string, Record<string, string>> = {
  neutral: { "--canvas":"#07080a","--surface":"#0d0d0d","--surface-elevated":"#101111","--surface-card":"#121212","--bg":"#07080a","--bg-surface":"#0d0d0d","--bg-card":"#121212","--bg-elevated":"#101111","--bg-hover":"#161717","--bg-active":"#1c1d1d","--bg-input":"#101111","--bg-sidebar":"#0d0d0d","--bg-topbar":"#07080a","--ink":"#f4f4f6","--body":"#cdcdcd","--mute":"#9c9c9d","--ash":"#6a6b6c","--stone":"#434345","--text":"#f4f4f6","--text-primary":"#f4f4f6","--text-secondary":"#cdcdcd","--text-muted":"#9c9c9d","--text-ash":"#6a6b6c","--hairline":"#242728","--hairline-soft":"rgba(255,255,255,0.08)","--hairline-strong":"rgba(255,255,255,0.16)","--border":"#242728","--border-hover":"rgba(255,255,255,0.16)","--border-strong":"rgba(255,255,255,0.24)" },
  mauve: { "--canvas":"#0c0a0b","--surface":"#121011","--surface-elevated":"#181516","--surface-card":"#1c1819","--bg":"#0c0a0b","--bg-surface":"#121011","--bg-card":"#1c1819","--bg-elevated":"#181516","--bg-hover":"#211d1e","--bg-active":"#2a2526","--bg-input":"#181516","--bg-sidebar":"#121011","--bg-topbar":"#0c0a0b","--ink":"#f2edef","--body":"#cdc5c8","--mute":"#9c9396","--ash":"#6a6366","--stone":"#433f41","--text":"#f2edef","--text-primary":"#f2edef","--text-secondary":"#cdc5c8","--text-muted":"#9c9396","--text-ash":"#6a6366","--hairline":"#282325","--hairline-soft":"rgba(255,230,240,0.08)","--hairline-strong":"rgba(255,230,240,0.16)","--border":"#282325","--border-hover":"rgba(255,230,240,0.16)","--border-strong":"rgba(255,230,240,0.24)" },
  olive: { "--canvas":"#0b0c08","--surface":"#11120e","--surface-elevated":"#171813","--surface-card":"#1b1c16","--bg":"#0b0c08","--bg-surface":"#11120e","--bg-card":"#1b1c16","--bg-elevated":"#171813","--bg-hover":"#20211a","--bg-active":"#282a21","--bg-input":"#171813","--bg-sidebar":"#11120e","--bg-topbar":"#0b0c08","--ink":"#f0f1eb","--body":"#c9cabbf","--mute":"#999a8f","--ash":"#68695f","--stone":"#42433a","--text":"#f0f1eb","--text-primary":"#f0f1eb","--text-secondary":"#c9cabbf","--text-muted":"#999a8f","--text-ash":"#68695f","--hairline":"#26271f","--hairline-soft":"rgba(240,255,200,0.08)","--hairline-strong":"rgba(240,255,200,0.14)","--border":"#26271f","--border-hover":"rgba(240,255,200,0.14)","--border-strong":"rgba(240,255,200,0.22)" },
  sage: { "--canvas":"#0a0c0a","--surface":"#101210","--surface-elevated":"#161816","--surface-card":"#1a1c1a","--bg":"#0a0c0a","--bg-surface":"#101210","--bg-card":"#1a1c1a","--bg-elevated":"#161816","--bg-hover":"#1f211f","--bg-active":"#272927","--bg-input":"#161816","--bg-sidebar":"#101210","--bg-topbar":"#0a0c0a","--ink":"#eef2ee","--body":"#c5ccbf","--mute":"#969e96","--ash":"#676e67","--stone":"#414741","--text":"#eef2ee","--text-primary":"#eef2ee","--text-secondary":"#c5ccbf","--text-muted":"#969e96","--text-ash":"#676e67","--hairline":"#242824","--hairline-soft":"rgba(200,255,200,0.07)","--hairline-strong":"rgba(200,255,200,0.14)","--border":"#242824","--border-hover":"rgba(200,255,200,0.14)","--border-strong":"rgba(200,255,200,0.22)" },
  sand: { "--canvas":"#0e0d0b","--surface":"#141310","--surface-elevated":"#1a1916","--surface-card":"#1e1d1a","--bg":"#0e0d0b","--bg-surface":"#141310","--bg-card":"#1e1d1a","--bg-elevated":"#1a1916","--bg-hover":"#23221d","--bg-active":"#2c2a24","--bg-input":"#1a1916","--bg-sidebar":"#141310","--bg-topbar":"#0e0d0b","--ink":"#f4f0e8","--body":"#d0c9bb","--mute":"#a09a8c","--ash":"#6e695e","--stone":"#47443c","--text":"#f4f0e8","--text-primary":"#f4f0e8","--text-secondary":"#d0c9bb","--text-muted":"#a09a8c","--text-ash":"#6e695e","--hairline":"#2a2820","--hairline-soft":"rgba(255,240,200,0.08)","--hairline-strong":"rgba(255,240,200,0.16)","--border":"#2a2820","--border-hover":"rgba(255,240,200,0.16)","--border-strong":"rgba(255,240,200,0.24)" },
  slate: { "--canvas":"#0a0b0e","--surface":"#101115","--surface-elevated":"#16171c","--surface-card":"#1a1b21","--bg":"#0a0b0e","--bg-surface":"#101115","--bg-card":"#1a1b21","--bg-elevated":"#16171c","--bg-hover":"#1f2027","--bg-active":"#282932","--bg-input":"#16171c","--bg-sidebar":"#101115","--bg-topbar":"#0a0b0e","--ink":"#eceef2","--body":"#c5c8d0","--mute":"#9699a3","--ash":"#676a73","--stone":"#41434a","--text":"#eceef2","--text-primary":"#eceef2","--text-secondary":"#c5c8d0","--text-muted":"#9699a3","--text-ash":"#676a73","--hairline":"#23252c","--hairline-soft":"rgba(200,210,255,0.07)","--hairline-strong":"rgba(200,210,255,0.14)","--border":"#23252c","--border-hover":"rgba(200,210,255,0.14)","--border-strong":"rgba(200,210,255,0.22)" },
};
const GRAY_LIGHT: Record<string, Record<string, string>> = {
  neutral: { "--canvas":"#ffffff","--surface":"#f7f7f8","--surface-elevated":"#edecee","--surface-card":"#ffffff","--bg":"#ffffff","--bg-surface":"#f7f7f8","--bg-card":"#ffffff","--bg-elevated":"#edecee","--bg-hover":"#e4e3e5","--bg-active":"#dcdbdd","--bg-input":"#ffffff","--bg-sidebar":"#f7f7f8","--bg-topbar":"#ffffff","--ink":"#1d1d1f","--body":"#4d4d4f","--mute":"#868687","--ash":"#aeaeb0","--stone":"#c7c7c8","--text":"#1d1d1f","--text-primary":"#1d1d1f","--text-secondary":"#4d4d4f","--text-muted":"#868687","--text-ash":"#aeaeb0","--hairline":"#e5e5e7","--hairline-soft":"rgba(0,0,0,0.06)","--hairline-strong":"rgba(0,0,0,0.12)","--border":"#e5e5e7","--border-hover":"rgba(0,0,0,0.12)","--border-strong":"rgba(0,0,0,0.18)" },
  mauve: { "--canvas":"#fdfcfd","--surface":"#f8f6f7","--surface-elevated":"#f0edef","--surface-card":"#ffffff","--bg":"#fdfcfd","--bg-surface":"#f8f6f7","--bg-card":"#ffffff","--bg-elevated":"#f0edef","--bg-hover":"#e9e6e8","--bg-active":"#e0dce0","--bg-input":"#ffffff","--bg-sidebar":"#f8f6f7","--bg-topbar":"#fdfcfd","--ink":"#1f1217","--body":"#4e4347","--mute":"#877e82","--ash":"#b0a8ac","--stone":"#d0c8cc","--text":"#1f1217","--text-primary":"#1f1217","--text-secondary":"#4e4347","--text-muted":"#877e82","--text-ash":"#b0a8ac","--hairline":"#e8dfe3","--hairline-soft":"rgba(80,0,40,0.06)","--hairline-strong":"rgba(80,0,40,0.12)","--border":"#e8dfe3","--border-hover":"rgba(80,0,40,0.12)","--border-strong":"rgba(80,0,40,0.18)" },
  olive: { "--canvas":"#fcfdfb","--surface":"#f7f8f5","--surface-elevated":"#eff0eb","--surface-card":"#ffffff","--bg":"#fcfdfb","--bg-surface":"#f7f8f5","--bg-card":"#ffffff","--bg-elevated":"#eff0eb","--bg-hover":"#e6e8e2","--bg-active":"#dddfda","--bg-input":"#ffffff","--bg-sidebar":"#f7f8f5","--bg-topbar":"#fcfdfb","--ink":"#151a12","--body":"#474c42","--mute":"#7f847a","--ash":"#a8ada3","--stone":"#c8c8bf","--text":"#151a12","--text-primary":"#151a12","--text-secondary":"#474c42","--text-muted":"#7f847a","--text-ash":"#a8ada3","--hairline":"#dde3d6","--hairline-soft":"rgba(30,60,0,0.06)","--hairline-strong":"rgba(30,60,0,0.12)","--border":"#dde3d6","--border-hover":"rgba(30,60,0,0.12)","--border-strong":"rgba(30,60,0,0.18)" },
  sage: { "--canvas":"#fbfcfb","--surface":"#f6f8f6","--surface-elevated":"#eef0ee","--surface-card":"#ffffff","--bg":"#fbfcfb","--bg-surface":"#f6f8f6","--bg-card":"#ffffff","--bg-elevated":"#eef0ee","--bg-hover":"#e5e7e5","--bg-active":"#dcdedc","--bg-input":"#ffffff","--bg-sidebar":"#f6f8f6","--bg-topbar":"#fbfcfb","--ink":"#121a12","--body":"#434e43","--mute":"#7a857a","--ash":"#a4aea4","--stone":"#c4cec4","--text":"#121a12","--text-primary":"#121a12","--text-secondary":"#434e43","--text-muted":"#7a857a","--text-ash":"#a4aea4","--hairline":"#d8e2d8","--hairline-soft":"rgba(0,60,0,0.05)","--hairline-strong":"rgba(0,60,0,0.10)","--border":"#d8e2d8","--border-hover":"rgba(0,60,0,0.10)","--border-strong":"rgba(0,60,0,0.16)" },
  sand: { "--canvas":"#fdfcfb","--surface":"#f9f7f4","--surface-elevated":"#f1efe9","--surface-card":"#ffffff","--bg":"#fdfcfb","--bg-surface":"#f9f7f4","--bg-card":"#ffffff","--bg-elevated":"#f1efe9","--bg-hover":"#eae6df","--bg-active":"#e0dbd3","--bg-input":"#ffffff","--bg-sidebar":"#f9f7f4","--bg-topbar":"#fdfcfb","--ink":"#1c1810","--body":"#545044","--mute":"#8c867a","--ash":"#b4ae9f","--stone":"#d2cdbf","--text":"#1c1810","--text-primary":"#1c1810","--text-secondary":"#545044","--text-muted":"#8c867a","--text-ash":"#b4ae9f","--hairline":"#e6dfd4","--hairline-soft":"rgba(60,40,0,0.06)","--hairline-strong":"rgba(60,40,0,0.12)","--border":"#e6dfd4","--border-hover":"rgba(60,40,0,0.12)","--border-strong":"rgba(60,40,0,0.18)" },
  slate: { "--canvas":"#fbfcfd","--surface":"#f6f7f9","--surface-elevated":"#edeef1","--surface-card":"#ffffff","--bg":"#fbfcfd","--bg-surface":"#f6f7f9","--bg-card":"#ffffff","--bg-elevated":"#edeef1","--bg-hover":"#e4e6ea","--bg-active":"#dcdde2","--bg-input":"#ffffff","--bg-sidebar":"#f6f7f9","--bg-topbar":"#fbfcfd","--ink":"#111520","--body":"#434856","--mute":"#7a7f8e","--ash":"#a4a9b6","--stone":"#c4c8d2","--text":"#111520","--text-primary":"#111520","--text-secondary":"#434856","--text-muted":"#7a7f8e","--text-ash":"#a4a9b6","--hairline":"#d8dce6","--hairline-soft":"rgba(0,20,80,0.06)","--hairline-strong":"rgba(0,20,80,0.12)","--border":"#d8dce6","--border-hover":"rgba(0,20,80,0.12)","--border-strong":"rgba(0,20,80,0.18)" },
};
const ACCENT_DARK: Record<string, Record<string, string>> = {
  white: { "--accent":"#ffffff","--accent-hover":"#e8e8e8","--accent-muted":"rgba(255,255,255,0.08)","--accent-text":"#000000" },
  blue: { "--accent":"#57c1ff","--accent-hover":"#3db4ff","--accent-muted":"rgba(87,193,255,0.12)","--accent-text":"#000000" },
  green: { "--accent":"#59d499","--accent-hover":"#3cc982","--accent-muted":"rgba(89,212,153,0.12)","--accent-text":"#000000" },
  cyan: { "--accent":"#5bc5f2","--accent-hover":"#3db8ef","--accent-muted":"rgba(91,197,242,0.12)","--accent-text":"#000000" },
  purple: { "--accent":"#be7cff","--accent-hover":"#ae5cff","--accent-muted":"rgba(190,124,255,0.12)","--accent-text":"#000000" },
  pink: { "--accent":"#f472b6","--accent-hover":"#f25daa","--accent-muted":"rgba(244,114,182,0.12)","--accent-text":"#000000" },
  red: { "--accent":"#ff6161","--accent-hover":"#ff4545","--accent-muted":"rgba(255,97,97,0.12)","--accent-text":"#000000" },
  orange: { "--accent":"#ff9a3d","--accent-hover":"#ff8822","--accent-muted":"rgba(255,154,61,0.12)","--accent-text":"#000000" },
  yellow: { "--accent":"#ffc533","--accent-hover":"#ffbb11","--accent-muted":"rgba(255,197,51,0.12)","--accent-text":"#000000" },
  teal: { "--accent":"#4dd4ac","--accent-hover":"#35c99b","--accent-muted":"rgba(77,212,172,0.12)","--accent-text":"#000000" },
  violet: { "--accent":"#8b5cf6","--accent-hover":"#7c4ff5","--accent-muted":"rgba(139,92,246,0.12)","--accent-text":"#000000" },
  indigo: { "--accent":"#6366f1","--accent-hover":"#5558e6","--accent-muted":"rgba(99,102,241,0.12)","--accent-text":"#000000" },
  lime: { "--accent":"#a3e635","--accent-hover":"#96e018","--accent-muted":"rgba(163,230,53,0.12)","--accent-text":"#000000" },
  rose: { "--accent":"#fb7185","--accent-hover":"#fa5e76","--accent-muted":"rgba(251,113,133,0.12)","--accent-text":"#000000" },
};
const ACCENT_LIGHT: Record<string, Record<string, string>> = {
  white: { "--accent":"#0066cc","--accent-hover":"#0055aa","--accent-muted":"rgba(0,102,204,0.08)","--accent-text":"#ffffff" },
  blue: { "--accent":"#0077cc","--accent-hover":"#0066b8","--accent-muted":"rgba(0,119,204,0.08)","--accent-text":"#ffffff" },
  green: { "--accent":"#1a9958","--accent-hover":"#15884c","--accent-muted":"rgba(26,153,88,0.08)","--accent-text":"#ffffff" },
  cyan: { "--accent":"#0891b2","--accent-hover":"#0e7c99","--accent-muted":"rgba(8,145,178,0.08)","--accent-text":"#ffffff" },
  purple: { "--accent":"#7c3aed","--accent-hover":"#6d28d9","--accent-muted":"rgba(124,58,237,0.08)","--accent-text":"#ffffff" },
  pink: { "--accent":"#db2777","--accent-hover":"#c5216b","--accent-muted":"rgba(219,39,119,0.08)","--accent-text":"#ffffff" },
  red: { "--accent":"#dc2626","--accent-hover":"#cc2222","--accent-muted":"rgba(220,38,38,0.08)","--accent-text":"#ffffff" },
  orange: { "--accent":"#ea580c","--accent-hover":"#d9500b","--accent-muted":"rgba(234,88,12,0.08)","--accent-text":"#ffffff" },
  yellow: { "--accent":"#ca8a04","--accent-hover":"#b87d04","--accent-muted":"rgba(202,138,4,0.08)","--accent-text":"#ffffff" },
  teal: { "--accent":"#0d9488","--accent-hover":"#0c877d","--accent-muted":"rgba(13,148,136,0.08)","--accent-text":"#ffffff" },
  violet: { "--accent":"#7c3aed","--accent-hover":"#6d28d9","--accent-muted":"rgba(124,58,237,0.08)","--accent-text":"#ffffff" },
  indigo: { "--accent":"#4f46e5","--accent-hover":"#453dd1","--accent-muted":"rgba(79,70,229,0.08)","--accent-text":"#ffffff" },
  lime: { "--accent":"#65a30d","--accent-hover":"#5c950c","--accent-muted":"rgba(101,163,13,0.08)","--accent-text":"#ffffff" },
  rose: { "--accent":"#e11d48","--accent-hover":"#cc1a42","--accent-muted":"rgba(225,29,72,0.08)","--accent-text":"#ffffff" },
};
const RADIUS_MAP: Record<string, string> = { none:"0", xs:"4px", sm:"6px", md:"8px", lg:"10px", xl:"16px", "2xl":"20px" };

const loadedFonts = new Set<string>();
function loadGoogleFont(family: string) {
  if (loadedFonts.has(family) || family === "system-ui" || family === "Georgia") return;
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = `https://fonts.googleapis.com/css2?family=${family.replace(/ /g, "+")}:wght@300;400;500;600;700;800;900&display=swap`;
  document.head.appendChild(link);
  loadedFonts.add(family);
}

function applyThemeConfig(config: ThemeConfig) {
  const root = document.documentElement;
  const isDark = config.mode === "dark" || (config.mode === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  const grayVars = isDark ? (GRAY_DARK[config.gray] || GRAY_DARK.neutral) : (GRAY_LIGHT[config.gray] || GRAY_LIGHT.neutral);
  const accentVars = isDark ? (ACCENT_DARK[config.accent] || ACCENT_DARK.white) : (ACCENT_LIGHT[config.accent] || ACCENT_LIGHT.white);
  const rv = RADIUS_MAP[config.radius] || "10px";
  Object.entries({ ...grayVars, ...accentVars, "--radius-sm": rv, "--radius-md": rv === "0" ? "0" : `calc(${rv} + 2px)`, "--radius-lg": rv, "--radius-xl": rv === "0" ? "0" : `calc(${rv} + 6px)` }).forEach(([k, v]) => root.style.setProperty(k, v));
  root.style.fontSize = `${config.fontSize}px`;
  if (config.fontFamily) { loadGoogleFont(config.fontFamily); document.body.style.fontFamily = `"${config.fontFamily}", -apple-system, BlinkMacSystemFont, system-ui, sans-serif`; }
  // Background image
  const shell = root.querySelector(".app-shell") as HTMLElement;
  if (shell) {
    shell.classList.toggle("app-shell--custom-bg", !!config.customBgUrl);
    if (config.customBgUrl) {
      shell.style.backgroundImage = `url(${config.customBgUrl})`;
      shell.style.backgroundSize = "cover";
      shell.style.backgroundPosition = "center";
    } else {
      shell.style.backgroundImage = "";
    }
  }
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [user, setUser] = useState<Me | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentTime, setCurrentTime] = useState("");
  const [theme, setThemeState] = useState<Theme>("dark");
  const [resolvedTheme, setResolvedTheme] = useState<"dark" | "light">("dark");
  const [announcement, setAnnouncement] = useState<{ title: string; message: string; id: string } | null>(null);
  const [announcementDismissed, setAnnouncementDismissed] = useState(false);

  // Initialize theme from localStorage + apply saved theme config
  useEffect(() => {
    const saved = (localStorage.getItem("tirbeo-theme") as Theme) || "dark";
    setThemeState(saved);
    applyTheme(saved);
    setResolvedTheme(getResolvedTheme(saved));

    // Load saved theme config (Radix-style design tokens)
    try {
      const savedConfig = localStorage.getItem("tirbeo-theme-config");
      if (savedConfig) {
        const config = JSON.parse(savedConfig) as ThemeConfig;
        applyThemeConfig(config);
      }
    } catch {}

    // Check for dismissed announcement
    const dismissed = localStorage.getItem("tirbeo-announcement-dismissed");
    if (dismissed) setAnnouncementDismissed(true);
  }, []);

  // Listen for system theme changes
  useEffect(() => {
    if (theme !== "system") {
      setResolvedTheme(theme as "dark" | "light");
      return;
    }
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => {
      applyTheme("system");
      setResolvedTheme(getResolvedTheme("system"));
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [theme]);

  const cycleTheme = useCallback(() => {
    const order: Theme[] = ["dark", "light", "system"];
    const next = order[(order.indexOf(theme) + 1) % order.length];
    setThemeState(next);
    localStorage.setItem("tirbeo-theme", next);
    applyTheme(next);
    setResolvedTheme(getResolvedTheme(next));
  }, [theme]);

  const themeIcon = theme === "dark" ? Moon : theme === "light" ? Sun : Monitor;
  const ThemeIcon = themeIcon;

  // Fetch user + load theme config from API
  useEffect(() => {
    fetch(`${API}/api/profile`, { credentials: "include" })
      .then(r => (r.ok ? r.json() : null))
      .then(d => {
        if (d) {
          setUser(d);
          // Apply theme config from API (overrides localStorage)
          if (d.preferences?.themeConfig) {
            const config = { ...DEFAULT_CONFIG, ...d.preferences.themeConfig } as ThemeConfig;
            applyThemeConfig(config);
            localStorage.setItem("tirbeo-theme-config", JSON.stringify(config));
          }
        } else window.location.href = `https://accounts.tirbeo.app/login?redirect=${encodeURIComponent(window.location.href)}`;
      })
      .catch(() => { window.location.href = `https://accounts.tirbeo.app/login?redirect=${encodeURIComponent(window.location.href)}`; })
      .finally(() => setLoading(false));
  }, []);

  // Clock
  useEffect(() => {
    const tick = () => setCurrentTime(new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); setSearchOpen(o => !o); }
      if (e.key === "Escape") setSearchOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // Close sidebar on route change
  useEffect(() => { setSidebarOpen(false); }, [pathname]);

  const handleLogout = useCallback(async () => {
    await fetch(`${API}/api/auth/logout`, { method: "POST", credentials: "include" });
    window.location.href = "https://accounts.tirbeo.app/login";
  }, []);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return SEARCH_INDEX.slice(0, 8);
    const q = searchQuery.toLowerCase();
    return SEARCH_INDEX.filter(item =>
      item.label.toLowerCase().includes(q) ||
      item.keywords.some(k => k.includes(q)) ||
      item.category.toLowerCase().includes(q)
    ).slice(0, 12);
  }, [searchQuery]);

  if (loading) {
    return (
      <div className="app-shell">
        <div className="topbar" />
        <div className="app-body">
          <div className="sidebar" />
          <div className="content" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ width: 28, height: 28, border: "2px solid var(--border)", borderTopColor: "var(--accent)", borderRadius: "50%", animation: "spin 0.6s linear infinite" }} />
          </div>
        </div>
      </div>
    );
  }

  const initials = user?.name ? user.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() : user?.email?.[0]?.toUpperCase() || "?";
  const isActive = (href: string) => href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(href);

  return (
    <div className={`app-shell ${resolvedTheme === "light" ? "app-shell--oceanic" : ""}`}>
      {/* Background effects */}
      <div className="app-bg" aria-hidden="true">
        {resolvedTheme === "dark" ? (
          <DotField
            dotRadius={1.5}
            dotSpacing={14}
            cursorRadius={300}
            bulgeStrength={24}
            gradientFrom="rgba(0, 122, 204, 0.25)"
            gradientTo="rgba(60, 60, 80, 0.06)"
            glowRadius={180}
            sparkle={false}
          />
        ) : null}
      </div>
      {/* ═══ TOP BAR — full width ═══ */}
      <header className="topbar">
        <button className="topbar-hamburger" onClick={() => setSidebarOpen(o => !o)}>
          {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
        </button>

        <Link href="/dashboard" className="topbar-logo">
          <div className="topbar-logo-icon">T</div>
          <span className="hidden sm:inline">Tirbeo</span>
        </Link>

        <div className="topbar-search">
          <button className="topbar-search-btn" onClick={() => setSearchOpen(true)}>
            <Search size={14} />
            <span>Search...</span>
            <kbd className="topbar-search-kbd">⌘K</kbd>
          </button>
        </div>

        <div className="topbar-actions">
          <span className="topbar-time hidden sm:inline">{currentTime}</span>
          <div className="topbar-divider hidden sm:block" />
          <button className="topbar-btn" onClick={cycleTheme} title={`Theme: ${theme}`}>
            <ThemeIcon size={16} />
          </button>
          <Link href="/dashboard/notifications" className="topbar-btn">
            <Bell size={16} />
          </Link>
          <div className="topbar-divider" />
          <Link href="/dashboard/profile" className="topbar-avatar">
            {user?.photoUrl ? <img src={user.photoUrl} alt="" /> : initials}
          </Link>
        </div>
      </header>

      {/* ═══ ANNOUNCEMENTS BAR ═══ */}
      {announcement && !announcementDismissed && (
        <div style={{
          position: "fixed", top: "var(--topbar-h)", left: 0, right: 0, zIndex: 55,
          padding: "0 16px",
        }}>
          <div className="announcements-bar" style={{ marginTop: 8, maxWidth: 900, marginLeft: "auto", marginRight: "auto" }}>
            <Megaphone size={14} style={{ color: "var(--accent)", flexShrink: 0 }} />
            <span style={{ fontWeight: 600, color: "var(--ink)", flexShrink: 0, fontSize: 12 }}>{announcement.title}</span>
            <span style={{ flex: 1, fontSize: 12 }}>{announcement.message}</span>
            <button className="announcements-bar-close" onClick={() => {
              setAnnouncementDismissed(true);
              localStorage.setItem("tirbeo-announcement-dismissed", announcement.id);
            }}>
              <X size={12} />
            </button>
          </div>
        </div>
      )}

      {/* ═══ SIDEBAR ═══ */}
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}
      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <nav className="sidebar-nav">
          <div className="sidebar-section-label">Main</div>
          {NAV.filter(n => ["Home", "Notifications", "Preferences", "Help & Support"].includes(n.label)).map(n => {
            const Icon = n.icon;
            const active = isActive(n.href);
            return (
              <Link key={n.href} href={n.href} className={`sidebar-link ${active ? "active" : ""}`}>
                <Icon size={15} className="sidebar-link-icon" />
                <span>{n.label}</span>
              </Link>
            );
          })}

          <div className="sidebar-section-label">Account</div>
          {NAV.filter(n => ["Profile", "Security", "Workspace", "Integrations", "Activity"].includes(n.label)).map(n => {
            const Icon = n.icon;
            const active = isActive(n.href);
            return (
              <Link key={n.href} href={n.href} className={`sidebar-link ${active ? "active" : ""}`}>
                <Icon size={15} className="sidebar-link-icon" />
                <span>{n.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <Link href="/dashboard/profile" className="sidebar-user">
            <div className="topbar-avatar" style={{ width: 32, height: 32, fontSize: 11 }}>
              {user?.photoUrl ? <img src={user.photoUrl} alt="" /> : initials}
            </div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">{user?.name || "User"}</div>
              <div className="sidebar-user-email">{user?.email}</div>
            </div>
          </Link>
          <button onClick={handleLogout} className="sidebar-link" style={{ marginTop: 4, fontSize: 12, color: "var(--text-muted)" }}>
            <LogOut size={15} className="sidebar-link-icon" />
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      {/* ═══ CONTENT ═══ */}
      <div className="content animate-in">
        {children}
      </div>

      {/* ═══ SEARCH OVERLAY ═══ */}
      {searchOpen && (
        <div className="search-overlay" onClick={() => setSearchOpen(false)}>
          <div className="search-modal" onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "0 16px", height: 48, borderBottom: "1px solid var(--border)" }}>
              <Search size={15} style={{ color: "var(--text-muted)" }} />
              <input autoFocus value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search pages, settings..."
                style={{ flex: 1, background: "none", border: "none", outline: "none", color: "var(--text-primary)", fontSize: 14, fontFamily: "inherit" }} />
              <kbd style={{ fontSize: 11, padding: "2px 6px", borderRadius: 4, background: "var(--bg-elevated)", border: "1px solid var(--border)", color: "var(--text-muted)" }}>ESC</kbd>
            </div>
            <div style={{ maxHeight: 360, overflowY: "auto", padding: "4px 8px" }}>
              {searchResults.map(item => {
                const Icon = item.icon;
                return (
                  <Link key={item.href + item.label} href={item.href}
                    onClick={() => { setSearchOpen(false); setSearchQuery(""); }}
                    style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", borderRadius: "var(--radius-md)", color: "var(--text-secondary)", transition: "background 0.1s" }}
                    onMouseEnter={e => (e.currentTarget.style.background = "var(--bg-hover)")}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                    <Icon size={14} style={{ color: "var(--text-muted)" }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, color: "var(--text-primary)" }}>{item.label}</div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{item.category}</div>
                    </div>
                    <ChevronRight size={13} style={{ color: "var(--text-ash)" }} />
                  </Link>
                );
              })}
              {searchResults.length === 0 && (
                <div className="empty-state" style={{ padding: "32px 16px" }}>
                  <Search size={20} style={{ color: "var(--text-ash)", marginBottom: 8 }} />
                  <p style={{ fontSize: 13, color: "var(--text-muted)" }}>No results for &quot;{searchQuery}&quot;</p>
                </div>
              )}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderTop: "1px solid var(--border)" }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--success)" }} />
              <span style={{ fontSize: 11, color: "var(--text-muted)" }}>Press ⌘K to search from anywhere</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
