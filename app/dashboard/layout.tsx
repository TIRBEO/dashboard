"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Home, User, Shield, Bell, Settings,
  HelpCircle, LogOut, Search, Menu, X, ChevronRight, Clock,
  Globe, Eye, Database, Download, Sun, Moon, Monitor,
} from "lucide-react";
import { SIDEBAR_GROUPS, SEARCH_INDEX, searchEverything } from "../dashboard-config";
import { applyPreferenceStyles, normalizePreferenceState } from "../preferences-theme";

const API = process.env.NEXT_PUBLIC_API_URL || "https://api.tirbeo.app";

const ICON_MAP: Record<string, any> = {
  Home, User, Shield, Bell, Settings, HelpCircle, Monitor, Eye,
  Globe, Download, Database, Sun, Moon,
};

function getIcon(name: string) {
  return ICON_MAP[name] || Settings;
}

type Me = {
  id: string; email: string; name: string | null; photoUrl: string | null;
  adminRole: string | null; is2FAEnabled: boolean;
  theme?: string; timeFormat?: string;
  lastActiveAt?: string;
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [user, setUser] = useState<Me | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentTime, setCurrentTime] = useState("");
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());
  const [isOnline, setIsOnline] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [theme, setTheme] = useState("dark");
  const heartbeatRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const prefsFetched = useRef(false);

  useEffect(() => {
    fetch(`${API}/api/profile`, { credentials: "include" })
      .then(r => (r.ok ? r.json() : null))
      .then(d => {
        if (d) { setUser(d); setIsOnline(true); }
        else window.location.href = `https://accounts.tirbeo.app/login?redirect=${encodeURIComponent(window.location.href)}`;
      })
      .catch(() => { window.location.href = `https://accounts.tirbeo.app/login?redirect=${encodeURIComponent(window.location.href)}`; })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!user || prefsFetched.current) return;
    prefsFetched.current = true;
    fetch(`${API}/api/preferences`, { credentials: "include" })
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (d) {
          const normalized = normalizePreferenceState(d);
          applyPreferenceStyles(normalized);
          setTheme(normalized.theme || "dark");
        }
      })
      .catch(() => {});
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const beat = () => {
      fetch(`${API}/api/admin/heartbeat`, { method: "POST", credentials: "include" }).catch(() => {});
    };
    beat();
    heartbeatRef.current = setInterval(beat, 60000);
    return () => { if (heartbeatRef.current) clearInterval(heartbeatRef.current); };
  }, [user]);

  useEffect(() => {
    if (!user?.lastActiveAt) return;
    const check = () => {
      const diff = Date.now() - new Date(user.lastActiveAt!).getTime();
      setIsOnline(diff < 300000);
    };
    check();
    const id = setInterval(check, 15000);
    return () => clearInterval(id);
  }, [user?.lastActiveAt]);

  useEffect(() => {
    const tick = () => {
      setCurrentTime(new Date().toLocaleTimeString("en-US",
        user?.timeFormat === "24h" ? { hour: "2-digit", minute: "2-digit", hour12: false } : { hour: "2-digit", minute: "2-digit" }
      ));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [user?.timeFormat]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); setSearchOpen(o => !o); }
      if (e.key === "Escape") setSearchOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => { setSidebarOpen(false); }, [pathname]);

  useEffect(() => {
    fetch(`${API}/api/notifications?limit=1`, { credentials: "include" })
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.unreadCount) setUnreadCount(d.unreadCount); })
      .catch(() => {});
  }, []);

  const toggleTheme = useCallback(async () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    applyPreferenceStyles({ theme: newTheme });
    fetch(`${API}/api/preferences`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ theme: newTheme }),
    }).catch(() => {});
  }, [theme]);

  const handleLogout = useCallback(async () => {
    await fetch(`${API}/api/auth/logout`, { method: "POST", credentials: "include" });
    window.location.href = "https://accounts.tirbeo.app/login";
  }, []);

  const toggleGroup = (groupId: string) => {
    setCollapsedGroups(prev => {
      const next = new Set(prev);
      if (next.has(groupId)) next.delete(groupId); else next.add(groupId);
      return next;
    });
  };

  const searchResults = useMemo(() => searchEverything(searchQuery), [searchQuery]);

  const recentSearches = useMemo(() => {
    try { return JSON.parse(localStorage.getItem("tirbeo-recent-searches") || "[]").slice(0, 5); } catch { return []; }
  }, []);

  const saveRecentSearch = (route: string) => {
    try {
      const recent = JSON.parse(localStorage.getItem("tirbeo-recent-searches") || "[]");
      const updated = [route, ...recent.filter((r: string) => r !== route)].slice(0, 8);
      localStorage.setItem("tirbeo-recent-searches", JSON.stringify(updated));
    } catch {}
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ background: "var(--bg)" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
          <div style={{ width: 32, height: 32, border: "2px solid rgba(255,255,255,0.08)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.6s linear infinite" }} />
          <span style={{ fontSize: 12, color: "var(--text-ash)", letterSpacing: "0.1em" }}>TIRBEO</span>
        </div>
      </div>
    );
  }

  const currentPath = pathname || "/dashboard";
  const initials = user?.name ? user.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() : user?.email?.[0]?.toUpperCase() || "?";
  const isActive = (href: string) => href === "/dashboard" ? currentPath === "/dashboard" : currentPath.startsWith(href);

  const visibleGroups = SIDEBAR_GROUPS.filter(g => g.items.length > 0);

  return (
    <div className="flex min-h-screen" style={{ background: "var(--bg)" }}>
      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setSidebarOpen(false)} />}

      <aside className={`fixed top-0 left-0 h-full z-50 flex flex-col transition-transform duration-300 md:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
        style={{ width: "var(--sidebar-w)", background: "var(--bg-surface)", borderRight: "1px solid var(--border)" }}>

        <div className="flex items-center justify-between px-5 h-14" style={{ borderBottom: "1px solid var(--border)" }}>
          <Link href="/dashboard" className="flex items-center gap-2.5" style={{ textDecoration: "none" }}>
            <span className="text-sm font-bold tracking-[0.2em] uppercase" style={{ color: "var(--text)" }}>Tirbeo</span>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden" style={{ color: "var(--text-muted)" }}><X size={16} /></button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-3 flex flex-col gap-1">
          {visibleGroups.map(group => {
            const GroupIcon = getIcon(group.icon);
            const isCollapsed = collapsedGroups.has(group.id);
            const hasActive = group.items.some(item => isActive(item.route));

            return (
              <div key={group.id}>
                {group.id !== "home" ? (
                  <button
                    onClick={() => toggleGroup(group.id)}
                    className="flex items-center gap-2 w-full px-2 py-1.5 rounded-lg text-left"
                    style={{
                      fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em",
                      color: hasActive ? "var(--text)" : "var(--text-ash)",
                      background: "transparent", border: "none", cursor: "pointer",
                    }}
                  >
                    <GroupIcon size={12} />
                    <span>{group.label}</span>
                    <ChevronRight size={10} style={{
                      marginLeft: "auto", transition: "transform 0.2s",
                      transform: isCollapsed ? "rotate(0deg)" : "rotate(90deg)",
                    }} />
                  </button>
                ) : null}

                {(group.id === "home" || !isCollapsed) && group.items.map(item => {
                  const Icon = getIcon(item.icon);
                  const active = isActive(item.route);
                  return (
                    <Link key={item.id} href={item.route} className={`sidebar-link ${active ? "active" : ""}`}
                      style={{ paddingLeft: group.id === "home" ? undefined : 28 }}>
                      <Icon size={15} strokeWidth={active ? 2 : 1.5} />
                      <span>{item.label}</span>
                      {item.badge === "new" && (
                        <span style={{ marginLeft: "auto", background: "#4f7aff", color: "#fff", fontSize: 9, fontWeight: 600, padding: "1px 5px", borderRadius: 6 }}>NEW</span>
                      )}
                      {item.badge === "beta" && (
                        <span style={{ marginLeft: "auto", background: "var(--warning-subtle)", color: "var(--warning)", fontSize: 9, fontWeight: 600, padding: "1px 5px", borderRadius: 6 }}>BETA</span>
                      )}
                      {item.badge === "future" && (
                        <span style={{ marginLeft: "auto", color: "var(--text-ash)", fontSize: 9, fontWeight: 500 }}>Soon</span>
                      )}
                      {item.badge === "danger" && (
                        <span style={{ marginLeft: "auto", width: 6, height: 6, borderRadius: "50%", background: "var(--danger)" }} />
                      )}
                    </Link>
                  );
                })}
              </div>
            );
          })}
        </nav>

        <div className="px-3 pb-3" style={{ borderTop: "1px solid var(--border)", paddingTop: 10 }}>
          <Link href="/dashboard/profile" className="flex items-center gap-3 px-2 mb-2" style={{ textDecoration: "none" }}>
            <div className="avatar" style={{ width: 32, height: 32, fontSize: 11 }}>
              {user?.photoUrl ? <img src={user.photoUrl} alt="" /> : initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium truncate" style={{ color: "var(--text)" }}>{user?.name || "User"}</p>
              <p className="text-xs truncate" style={{ color: "var(--text-muted)" }}>{user?.email}</p>
            </div>
          </Link>
          <button onClick={handleLogout} className="sidebar-link w-full" style={{ color: "var(--text-muted)", fontSize: 12 }}>
            <LogOut size={15} />
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-h-screen" style={{ marginLeft: "var(--sidebar-w)" }}>

        <header className="sticky top-0 z-30 h-14 flex items-center justify-between px-4 md:px-6"
          style={{ background: "var(--bg-surface)", backdropFilter: "blur(24px)", borderBottom: "1px solid var(--border)" }}>
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="md:hidden" style={{ color: "var(--text-secondary)" }}>
              <Menu size={20} />
            </button>
            <button onClick={() => setSearchOpen(true)} className="flex items-center gap-2 px-3 h-9 rounded-xl text-sm"
              style={{ background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-muted)", minWidth: 220, cursor: "pointer", transition: "border-color 0.2s" }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = "var(--border-hover)")}
              onMouseLeave={e => (e.currentTarget.style.borderColor = "var(--border)")}>
              <Search size={14} />
              <span className="hidden sm:inline">Search everything...</span>
              <kbd className="hidden sm:inline text-xs px-1.5 py-0.5 rounded ml-auto" style={{ background: "var(--accent-muted)", color: "var(--text-ash)", fontSize: 10 }}>⌘K</kbd>
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={toggleTheme} className="flex items-center justify-center w-9 h-9 rounded-xl transition-all duration-200"
              style={{ background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-muted)", cursor: "pointer" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--border-hover)"; e.currentTarget.style.color = "var(--text)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-muted)"; }}>
              {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
            </button>
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 h-9 rounded-xl text-xs font-medium"
              style={{ background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-muted)", fontVariantNumeric: "tabular-nums" }}>
              <Clock size={12} />
              <span>{currentTime}</span>
            </div>
            <Link href="/dashboard/notifications" className="relative flex items-center justify-center w-9 h-9 rounded-xl"
              style={{ background: "var(--bg-card)", border: "1px solid var(--border)", textDecoration: "none" }}>
              <Bell size={14} style={{ color: "var(--text-muted)" }} />
              {unreadCount > 0 && (
                <span style={{ position: "absolute", top: -2, right: -2, width: 8, height: 8, borderRadius: "50%", background: "#4f7aff" }} />
              )}
            </Link>
            <Link href="/dashboard/profile" className="avatar" style={{ width: 32, height: 32, fontSize: 11, textDecoration: "none" }}>
              {user?.photoUrl ? <img src={user.photoUrl} alt="" /> : initials}
            </Link>
          </div>
        </header>

        <main className="flex-1 animate-in" style={{ padding: "28px 24px 48px" }}>
          <div className="max-w-5xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      {searchOpen && (
        <div className="search-overlay" onClick={() => setSearchOpen(false)}>
          <div className="search-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 560 }}>
            <div className="flex items-center gap-3 px-5" style={{ borderBottom: "1px solid var(--border)", height: 56 }}>
              <Search size={16} style={{ color: "var(--text-muted)" }} />
              <input autoFocus value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search pages, settings, actions, anything..."
                className="flex-1 bg-transparent border-none outline-none text-sm" style={{ color: "var(--text)" }} />
              <kbd className="text-xs px-1.5 py-0.5 rounded" style={{ background: "var(--accent-muted)", color: "var(--text-muted)" }}>ESC</kbd>
            </div>

            {!searchQuery.trim() && recentSearches.length > 0 && (
              <div className="px-4 pt-3 pb-1">
                <p style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-ash)" }}>Recent</p>
              </div>
            )}

            <div className="max-h-96 overflow-y-auto px-2 py-2">
              {searchResults.map(item => {
                const Icon = getIcon(item.icon);
                return (
                  <Link key={item.id + item.route} href={item.route} onClick={() => { setSearchOpen(false); setSearchQuery(""); saveRecentSearch(item.route); }}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm"
                    style={{ color: "var(--text-secondary)", textDecoration: "none" }}
                    onMouseEnter={e => (e.currentTarget.style.background = "var(--accent-muted)")}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                    <Icon size={15} style={{ color: "var(--text-muted)" }} />
                    <div className="flex-1 min-w-0">
                      <p style={{ fontSize: 13, color: "var(--text)" }}>{item.title}</p>
                      <p style={{ fontSize: 11, color: "var(--text-ash)" }}>{item.description}</p>
                    </div>
                    <span style={{ fontSize: 10, color: "var(--text-stone)", padding: "2px 6px", background: "var(--accent-muted)", borderRadius: 4 }}>{item.category}</span>
                    <ChevronRight size={14} style={{ color: "var(--text-ash)" }} />
                  </Link>
                );
              })}
              {searchResults.length === 0 && searchQuery.trim() && (
                <div className="empty-state" style={{ padding: "32px 16px" }}>
                  <Search size={24} style={{ color: "var(--text-ash)", marginBottom: 8 }} />
                  <p style={{ fontSize: 13, color: "var(--text-muted)" }}>No results for &quot;{searchQuery}&quot;</p>
                  <p style={{ fontSize: 11, color: "var(--text-ash)", marginTop: 4 }}>Try searching for pages, settings, or actions</p>
                </div>
              )}
            </div>

            <div className="flex items-center gap-4 px-4 py-2.5" style={{ borderTop: "1px solid var(--border)" }}>
              <div className="flex items-center gap-1.5">
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: isOnline ? "var(--success)" : "var(--danger)" }} />
                <span style={{ fontSize: 11, color: "var(--text-ash)" }}>{isOnline ? "Online" : "Offline"}</span>
              </div>
              <span style={{ fontSize: 11, color: "var(--text-stone)" }}>⌘K to search anywhere</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
