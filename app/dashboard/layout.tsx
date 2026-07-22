"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Home, User, Shield, Building2, Bell, Plug, Settings, Activity,
  HelpCircle, LogOut, Search, Menu, X, ChevronRight, Clock, FileText,
  Palette, Globe, Eye, KeyRound, Smartphone, Fingerprint,
  CreditCard, Database, Sun, Moon, Monitor,
} from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "https://api.tirbeo.app";

type Theme = "dark" | "light" | "system";

type Me = {
  id: string; email: string; name: string | null; photoUrl: string | null;
  adminRole: string | null; is2FAEnabled: boolean;
  preferences?: { theme?: string };
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

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [user, setUser] = useState<Me | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentTime, setCurrentTime] = useState("");
  const [theme, setThemeState] = useState<Theme>("dark");

  // Initialize theme from localStorage
  useEffect(() => {
    const saved = (localStorage.getItem("tirbeo-theme") as Theme) || "dark";
    setThemeState(saved);
    applyTheme(saved);
  }, []);

  // Listen for system theme changes
  useEffect(() => {
    if (theme !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => applyTheme("system");
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [theme]);

  const cycleTheme = useCallback(() => {
    const order: Theme[] = ["dark", "light", "system"];
    const next = order[(order.indexOf(theme) + 1) % order.length];
    setThemeState(next);
    localStorage.setItem("tirbeo-theme", next);
    applyTheme(next);
  }, [theme]);

  const themeIcon = theme === "dark" ? Moon : theme === "light" ? Sun : Monitor;
  const ThemeIcon = themeIcon;

  // Fetch user
  useEffect(() => {
    fetch(`${API}/api/profile`, { credentials: "include" })
      .then(r => (r.ok ? r.json() : null))
      .then(d => {
        if (d) setUser(d);
        else window.location.href = `https://accounts.tirbeo.app/login?redirect=${encodeURIComponent(window.location.href)}`;
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
    <div className="app-shell">
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
