"use client";

import { useState, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Home, User, Shield, Building2, Bell, Plug, Settings, Activity,
  HelpCircle, LogOut, Search, Menu, X, ChevronRight, LayoutGrid,
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
  { href: "/dashboard/site-config", label: "Site Config", icon: LayoutGrid },
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
      .then(d => { if (d) setUser(d); else window.location.href = `https://accounts.tirbeo.app/login?redirect=${encodeURIComponent(window.location.href)}`; })
      .catch(() => { window.location.href = `https://accounts.tirbeo.app/login?redirect=${encodeURIComponent(window.location.href)}`; })
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
        <div className="flex items-center justify-between px-5 h-14" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="flex items-center gap-3">
            <div className="traffic-lights">
              <span className="traffic-light red" />
              <span className="traffic-light yellow" />
              <span className="traffic-light green" />
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden" style={{ color: "var(--text-muted)" }}>
            <X size={16} />
          </button>
        </div>

        <div className="px-3 pt-3 pb-1">
          <div className="flex items-center gap-2.5 px-2 mb-4">
            <div className="avatar" style={{ width: 32, height: 32, fontSize: 12, borderRadius: 8 }}>
              {user?.photoUrl ? <img src={user.photoUrl} alt="" /> : initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold truncate" style={{ color: "#ffffff", fontSize: 13 }}>{user?.name || "User"}</p>
              <p className="truncate" style={{ color: "var(--text-muted)", fontSize: 11 }}>{user?.email}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-1 flex flex-col gap-0.5">
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

        <div className="px-3 pb-3" style={{ borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: 8 }}>
          <button onClick={handleLogout} className="sidebar-link w-full" style={{ color: "var(--text-muted)" }}>
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
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
              className="flex items-center gap-2 px-3 h-7 rounded-lg"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)", color: "var(--text-muted)", fontSize: 12 }}
            >
              <Search size={13} />
              <span className="hidden sm:inline">Search</span>
              <kbd className="hidden sm:inline px-1 py-0.5 rounded text-[10px]" style={{ background: "rgba(255,255,255,0.06)", color: "var(--text-muted)" }}>⌘K</kbd>
            </button>
          </div>
          <div className="flex items-center gap-3">
            <div className="avatar" style={{ width: 28, height: 28, fontSize: 10, borderRadius: 7 }}>
              {user?.photoUrl ? <img src={user.photoUrl} alt="" /> : initials}
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
            <div className="flex items-center gap-3 px-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", height: 44 }}>
              <Search size={15} style={{ color: "var(--text-muted)" }} />
              <input autoFocus value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search settings..."
                className="flex-1 bg-transparent border-none outline-none text-sm" style={{ color: "#ffffff" }} />
              <kbd className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: "rgba(255,255,255,0.06)", color: "var(--text-muted)" }}>ESC</kbd>
            </div>
            <div className="max-h-72 overflow-y-auto px-2 py-1.5">
              {filteredNav.map(n => {
                const Icon = n.icon;
                return (
                  <Link key={n.href} href={n.href} onClick={() => setSearchOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm" style={{ color: "var(--text-secondary)" }}
                    onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.06)")}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                    <Icon size={15} />
                    <span className="flex-1">{n.label}</span>
                    <ChevronRight size={13} style={{ color: "var(--text-muted)" }} />
                  </Link>
                );
              })}
              {filteredNav.length === 0 && <p className="text-xs px-3 py-3" style={{ color: "var(--text-muted)" }}>No results</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
