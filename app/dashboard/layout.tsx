"use client";

import { useState, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Home, User, Shield, Building2, Bell, Plug, Settings, Activity,
  HelpCircle, LogOut, Search, Menu, X, ChevronRight,
} from "lucide-react";
import DotField from "../components/DotField";

const API = process.env.NEXT_PUBLIC_API_URL || "https://api.tirbeo.app";

type Me = {
  id: string; email: string; name: string | null; photoUrl: string | null;
  adminRole: string | null; is2FAEnabled: boolean;
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
  { href: "/dashboard/help", label: "Help", icon: HelpCircle },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [user, setUser] = useState<Me | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetch(`${API}/api/profile`, { credentials: "include" })
      .then(r => (r.ok ? r.json() : null))
      .then(d => { if (d) setUser(d); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); setSearchOpen(o => !o); }
      if (e.key === "Escape") setSearchOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => { setSidebarOpen(false); }, [pathname]);

  const handleLogout = useCallback(async () => {
    try { await fetch(`${API}/api/auth/logout`, { method: "POST", credentials: "include" }); } catch {}
    window.location.href = "/";
  }, []);

  const filteredNav = NAV.filter(n => n.label.toLowerCase().includes(searchQuery.toLowerCase()));

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ background: "#000" }}>
        <div style={{ width: 28, height: 28, border: "2px solid rgba(255,255,255,0.06)", borderTopColor: "rgba(255,255,255,0.3)", borderRadius: "50%", animation: "spin 0.6s linear infinite" }} />
      </div>
    );
  }

  const initials = user?.name ? user.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() : user?.email?.[0]?.toUpperCase() || "?";
  const isActive = (href: string) => href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(href);

  return (
    <div className="flex min-h-screen" style={{ background: "#000" }}>
      <DotField
        dotRadius={1.2}
        dotSpacing={5}
        cursorRadius={180}
        bulgeStrength={12}
        waveAmplitude={0.3}
        gradientFrom="rgba(255, 255, 255, 0.08)"
        gradientTo="rgba(255, 255, 255, 0.02)"
      />
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 md:hidden"
          style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-full z-50 flex flex-col transition-transform duration-300 md:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
        style={{
          width: "var(--sidebar-w)",
          background: "rgba(0,0,0,0.7)",
          backdropFilter: "blur(60px)",
          WebkitBackdropFilter: "blur(60px)",
          borderRight: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div className="flex items-center justify-end px-5 h-14" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden" style={{ color: "var(--text-muted)" }}>
            <X size={16} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-3 flex flex-col gap-0.5">
          {NAV.map(n => {
            const Icon = n.icon;
            const active = isActive(n.href);
            return (
              <Link key={n.href} href={n.href} className={`sidebar-link ${active ? "active" : ""}`}>
                <Icon size={16} strokeWidth={active ? 2 : 1.5} />
                <span>{n.label}</span>
              </Link>
            );
          })}
        </nav>

        <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
          <div className="px-3 py-3">
            <Link href="/dashboard/profile" className="flex items-center gap-3 px-2 py-2 rounded-xl" style={{ textDecoration: "none", transition: "background 0.15s ease" }}
              onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.04)")}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
              <div className="avatar" style={{ width: 36, height: 36, fontSize: 13, borderRadius: 10, flexShrink: 0 }}>
                {user?.photoUrl ? <img src={user.photoUrl} alt="" /> : initials}
              </div>
              <div className="min-w-0 flex-1">
                <p style={{ fontSize: 13, fontWeight: 600, color: "#ffffff" }} className="truncate">{user?.name || "User"}</p>
                <p style={{ fontSize: 11, color: "var(--text-muted)" }} className="truncate">{user?.email}</p>
              </div>
            </Link>
          </div>
          <div className="px-3 pb-3">
            <button onClick={handleLogout} className="sidebar-link w-full" style={{ color: "var(--text-muted)" }}>
              <LogOut size={16} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-h-screen" style={{ marginLeft: "var(--sidebar-w)" }}>
        <header
          className="sticky top-0 z-30 h-12 flex items-center justify-between px-4 md:px-5"
          style={{
            background: "rgba(0,0,0,0.6)",
            backdropFilter: "blur(40px)",
            WebkitBackdropFilter: "blur(40px)",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="md:hidden" style={{ color: "var(--text-secondary)" }}>
              <Menu size={18} />
            </button>
            <button
              onClick={() => setSearchOpen(true)}
              className="flex items-center gap-2.5 px-4 h-9 rounded-xl"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                color: "var(--text-muted)",
                fontSize: 13,
                transition: "all 0.2s ease",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = "rgba(255,255,255,0.07)";
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
              }}
            >
              <Search size={14} />
              <span className="hidden sm:inline">Search</span>
              <kbd className="hidden sm:inline px-1.5 py-0.5 rounded-md text-[10px] font-medium" style={{ background: "rgba(255,255,255,0.06)", color: "var(--text-muted)", border: "1px solid rgba(255,255,255,0.06)" }}>⌘K</kbd>
            </button>
          </div>
          </div>
        </header>

        <main className="flex-1 animate-in" style={{ padding: "20px 16px 48px" }}>
          <div className="max-w-4xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      {searchOpen && (
        <div className="search-overlay" onClick={() => setSearchOpen(false)}>
          <div className="search-modal" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 px-5" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", height: 54 }}>
              <Search size={17} style={{ color: "rgba(255,255,255,0.4)", flexShrink: 0 }} />
              <input autoFocus value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search settings..."
                className="flex-1 bg-transparent border-none outline-none" style={{ color: "#ffffff", fontSize: 15 }} />
              <kbd className="text-[11px] px-2 py-1 rounded-lg font-medium" style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.4)", border: "1px solid rgba(255,255,255,0.08)" }}>ESC</kbd>
            </div>
            <div className="max-h-80 overflow-y-auto px-2 py-2">
              {filteredNav.map((n, i) => {
                const Icon = n.icon;
                return (
                  <Link key={n.href} href={n.href} onClick={() => setSearchOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm"
                    style={{ color: "var(--text-secondary)", transition: "all 0.12s ease" }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                      e.currentTarget.style.color = "#ffffff";
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = "transparent";
                      e.currentTarget.style.color = "var(--text-secondary)";
                    }}>
                    <Icon size={16} strokeWidth={1.5} />
                    <span className="flex-1">{n.label}</span>
                    <ChevronRight size={13} style={{ color: "rgba(255,255,255,0.2)" }} />
                  </Link>
                );
              })}
              {filteredNav.length === 0 && (
                <div className="flex flex-col items-center py-8">
                  <Search size={24} style={{ color: "rgba(255,255,255,0.15)", marginBottom: 8 }} />
                  <p className="text-sm" style={{ color: "rgba(255,255,255,0.3)" }}>No results found</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
