"use client";

import { useEffect, useRef, useState, useCallback, type ReactNode } from "react";
import { BlockedScreen, DeletionBanner } from "@/components/BlockedScreen";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useThemeToggle } from "@tirbeo/theme";
import {
  AlertTriangle, Bell, Building, Calendar, ChevronDown,
  Clock, Eye, FileText, Home, Inbox, Info, LifeBuoy, Monitor,
  Lock, LogOut, Mail, Menu, Moon, Search,
  Settings, Sliders, Sun, User, X,
} from "lucide-react";
import { MonthCalendar } from "@/components/ui/MonthCalendar";
import {
  getCurrentUser, isUnauthorizedError, listNotifications, getBlockStatus, cancelAccountDeletion, ApiError,
  listTickets, logout, markAllNotificationsRead, markNotificationsRead,
  formatDate, formatDayMonth,
  type NotificationItem, type Profile, type Ticket,
} from "@/lib/api";
import { registerServiceWorker } from "@/lib/push-client";
import {
  getTypeMeta as getNotifMeta,
  notifFullDate as notifDate,
  notifTimeAgo as notifAgo,
} from "@/lib/notif-shared";
import { onDirtyChange, setDirtyGlobal } from "@/lib/unsaved";
import { useI18n, type I18nT, translateNotifText } from "@/lib/i18n";

/* ── Tooltip wrapper (viewport-clamped: never overflows screen edges) ── */
function Tooltip({ label, children }: { label: string; children: React.ReactNode }) {
  const [show, setShow] = useState(false);
  const [shiftX, setShiftX] = useState(0);
  const wrapRef = useRef<HTMLDivElement>(null);
  const tipRef = useRef<HTMLSpanElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const enter = () => { timer.current = setTimeout(() => setShow(true), 400); };
  const leave = () => { if (timer.current) clearTimeout(timer.current); setShow(false); };
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);
  // Header sits at the very top of the viewport, so the bubble opens
  // BELOW the trigger; horizontal position is clamped to stay on screen.
  useEffect(() => {
    if (!show) { setShiftX(0); return; }
    const id = requestAnimationFrame(() => {
      const w = wrapRef.current?.getBoundingClientRect();
      const t = tipRef.current?.getBoundingClientRect();
      if (!w || !t) return;
      const margin = 8;
      let dx = 0;
      if (t.left < margin) dx = margin - t.left;
      else if (t.right > window.innerWidth - margin) dx = window.innerWidth - margin - t.right;
      setShiftX(dx);
    });
    return () => cancelAnimationFrame(id);
  }, [show, label]);
  return (
    <div
      ref={wrapRef}
      onMouseEnter={enter}
      onMouseLeave={leave}
      onFocus={enter}
      onBlur={leave}
      style={{ position: "relative", display: "inline-flex" }}
    >
      {children}
      {show && (
        <span ref={tipRef} style={{
          position: "absolute", top: "calc(100% + 7px)", left: "50%",
          transform: `translateX(calc(-50% + ${shiftX}px))`,
          padding: "4px 8px", borderRadius: 6, fontSize: 11, fontWeight: 500, whiteSpace: "nowrap",
          background: "var(--tb-surface-3)", color: "var(--tb-text-primary)", border: "1px solid var(--tb-border)",
          boxShadow: "0 4px 12px rgba(0,0,0,0.3)", zIndex: 100, pointerEvents: "none",
          animation: "fadeIn 120ms ease",
        }}>
          {label}
        </span>
      )}
    </div>
  );
}

interface NavItem { label: string; href: string; icon: ReactNode; badge?: number; external?: boolean }
interface NavSection { section: string; items: NavItem[] }

function personalNav(badgeCounts: Record<string, number>, t: I18nT): NavSection[] {
  return [
    { section: t("nav.workspace"), items: [
      { label: t("nav.getStarted"), href: "/overview", icon: <Home size={16} /> },
      { label: t("nav.inbox"), href: "/account/inbox", icon: <Mail size={16} />, badge: badgeCounts.inbox },
      { label: "Forms", href: process.env.NEXT_PUBLIC_FORMS_URL || "https://forms.tirbeo.app", icon: <FileText size={16} />, external: true },
    ]},
    { section: t("nav.account"), items: [
      { label: t("nav.profile"), href: "/account/profile", icon: <User size={16} /> },
      { label: t("nav.preferences"), href: "/account/preferences", icon: <Sliders size={16} /> },
      { label: t("nav.notifications"), href: "/account/notifications", icon: <Bell size={16} />, badge: badgeCounts.notifications },
      { label: t("nav.connectedApps"), href: "/account/apps", icon: <Building size={16} /> },
      { label: t("nav.security"), href: "/account/security", icon: <Lock size={16} /> },
      { label: t("nav.privacy"), href: "/account/privacy", icon: <Eye size={16} /> },
      { label: t("nav.sessions"), href: "/account/sessions", icon: <Monitor size={16} /> },
      { label: t("nav.history"), href: "/activity/history", icon: <Clock size={16} /> },
    ]},
    { section: t("nav.support"), items: [
      { label: t("nav.tickets"), href: "/support/tickets", icon: <LifeBuoy size={16} />, badge: badgeCounts.tickets },
    ]},
  ];
}

function initialsOf(name: string | null | undefined): string {
  if (!name) return "?";
  const p = name.trim().split(/\s+/);
  return p.length === 1 ? p[0].slice(0, 2).toUpperCase() : (p[0][0] + p[p.length - 1][0]).toUpperCase();
}

function translateText(t: I18nT, text?: string, lang?: string) {
  if (!text) return text || "";
  if (lang) return translateNotifText(text, lang);
  const translated = t(`notifTexts.${text}`);
  if (translated !== `notifTexts.${text}`) return translated;
  const m = text.match(/^Your recovery email \(([^)]+)\) has been confirmed\.$/);
  if (m) return t("notifTexts.recoveryEmailBody", { email: m[1] });
  return text;
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { t, lang } = useI18n();
  const { isDark, toggle } = useThemeToggle();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [user, setUser] = useState<Profile | null>(null);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const notificationsRef = useRef<NotificationItem[]>([]);
  const [unread, setUnread] = useState(0);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [notifTotal, setNotifTotal] = useState(0);
  const [notifHasMore, setNotifHasMore] = useState(false);
  const [notifLoading, setNotifLoading] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const [calOpen, setCalOpen] = useState(false);
  const calRef = useRef<HTMLDivElement>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [unsavedWarn, setUnsavedWarn] = useState(false);
  const warnTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const unsavedRef = useRef(false);
  const prevUnread = useRef(0);
  const pollTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const pulseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const calTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [badgePulse, setBadgePulse] = useState(false);
  const [authState, setAuthState] = useState<"loading" | "authed" | "offline">("loading");
  const [blockStatus, setBlockStatus] = useState<null | { banned?: boolean; suspended?: boolean; reason?: string; until?: string | null }>(null);

  // Cleanup timers
  useEffect(() => {
    return () => {
      if (warnTimer.current) clearTimeout(warnTimer.current);
      if (pollTimer.current) clearInterval(pollTimer.current);
      if (pulseTimer.current) clearTimeout(pulseTimer.current);
      if (calTimer.current) clearTimeout(calTimer.current);
    };
  }, []);

  // Sync dirty state
  useEffect(() => onDirtyChange((d) => { unsavedRef.current = d; }), []);

  const triggerUnsavedWarn = useCallback(() => {
    if (navigator.vibrate) { try { navigator.vibrate(180); } catch {} }
    setUnsavedWarn(true);
    if (warnTimer.current) clearTimeout(warnTimer.current);
    warnTimer.current = setTimeout(() => setUnsavedWarn(false), 4000);
  }, []);

  // Block nav while dirty
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!unsavedRef.current) return;
      const target = e.target as HTMLElement | null;
      const link = target?.closest('a[href], .sidebar-item, .menu-item') as HTMLElement | null;
      if (!link) return;
      e.preventDefault();
      e.stopPropagation();
      triggerUnsavedWarn();
    };
    document.addEventListener("click", handler, true);
    return () => document.removeEventListener("click", handler, true);
  }, [triggerUnsavedWarn]);

  // Warn on tab close
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => { if (unsavedRef.current) { e.preventDefault(); e.returnValue = ""; } };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, []);

  // Close mobile on nav
  useEffect(() => { setMobileOpen(false); setNotifOpen(false); }, [pathname]);

  // ⌘K search
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); setSearchOpen(p => !p); }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  // Click outside to close popups
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) setUserMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Escape closes popups
  useEffect(() => {
    if (!calOpen && !notifOpen && !userMenuOpen && !mobileOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setCalOpen(false); setNotifOpen(false); setUserMenuOpen(false); setMobileOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [calOpen, notifOpen, userMenuOpen, mobileOpen]);

  // Notification data
  const NOTIF_PAGE = 10;
  const applyRetention = (items: NotificationItem[]) => {
    const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;
    return items.filter((n) => new Date(n.createdAt).getTime() >= cutoff);
  };

  const fetchNotifications = useCallback(async () => {
    try {
      const r = await listNotifications(NOTIF_PAGE, 0);
      const seen = applyRetention(r.notifications);
      setNotifications(seen);
      notificationsRef.current = seen;
      setUnread(r.unread);
      setNotifTotal(r.total);
      setNotifHasMore(seen.length < r.total);
    } catch (e) { if (isUnauthorizedError(e)) redirectToAccounts(); }
  }, []);

  const loadMoreNotifications = useCallback(async () => {
    if (notifLoading || !notifHasMore) return;
    setNotifLoading(true);
    try {
      const r = await listNotifications(NOTIF_PAGE, notifications.length);
      const incoming = applyRetention(r.notifications);
      setNotifications((prev) => { const merged = [...prev, ...incoming]; notificationsRef.current = merged; return merged; });
      setNotifTotal(r.total);
      setNotifHasMore(notifications.length + incoming.length < r.total && incoming.length > 0);
    } catch (e) { if (isUnauthorizedError(e)) redirectToAccounts(); } finally { setNotifLoading(false); }
  }, [notifLoading, notifHasMore, notifications.length]);

  const fetchTickets = useCallback(async () => {
    try { const r = await listTickets({ limit: 10 }); setTickets(r.data); } catch (e) { if (isUnauthorizedError(e)) redirectToAccounts(); }
  }, []);

  useEffect(() => {
    let alive = true;
    getCurrentUser()
      .then((u) => { if (alive) { setUser(u); setBlockStatus(null); setAuthState("authed"); } })
      .catch((e) => {
        if (!alive) return;
        if (isUnauthorizedError(e)) {
          redirectToAccounts();
          return;
        }
        const blocked = getBlockStatus(e);
        if (blocked) { setBlockStatus(blocked); setAuthState("authed"); return; }
        setAuthState("offline");
      });
    fetchNotifications();
    fetchTickets();
    registerServiceWorker();
    pollTimer.current = setInterval(() => { if (document.visibilityState === "visible") fetchNotifications(); }, 30_000);
    const onVisibility = () => { if (document.visibilityState === "visible") fetchNotifications(); };
    document.addEventListener("visibilitychange", onVisibility);
    return () => { alive = false; if (pollTimer.current) clearInterval(pollTimer.current); document.removeEventListener("visibilitychange", onVisibility); };
  }, []);

  // Profile page broadcasts edits (avatar/name) — apply instantly everywhere
  // (header avatar, sidebar user block, mobile menu) without waiting for the
  // next /users/me round-trip.
  useEffect(() => {
    const onUserUpdated = (e: Event) => {
      const detail = (e as CustomEvent).detail || {};
      setUser((prev: any) => (prev ? { ...prev, ...detail } : prev));
    };
    window.addEventListener("tb:user-updated", onUserUpdated);
    return () => window.removeEventListener("tb:user-updated", onUserUpdated);
  }, []);

  // Real-time notification updates via WebSocket
  useEffect(() => {
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL;
    if (!wsUrl || !user?.id) return;
    let ws: WebSocket | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    let pingInterval: ReturnType<typeof setInterval> | null = null;
    let retryCount = 0;
    let alive = true;

    const handleNotification = (notifData: any) => {
      setNotifications((prev) => [notifData, ...prev]);
      setUnread((u) => u + 1);
      setBadgePulse(true);
      if (pulseTimer.current) clearTimeout(pulseTimer.current);
      pulseTimer.current = setTimeout(() => setBadgePulse(false), 700);
      try { const { notifyNotificationsChanged } = require("@/lib/notification-events"); notifyNotificationsChanged(); } catch {}
    };

    const connect = () => {
      if (!alive) return;
      try {
        ws = new WebSocket(wsUrl);
        ws.onopen = () => {
          retryCount = 0;
          // Authenticate with session token
          const token = localStorage.getItem('auth_token');
          if (token && ws?.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'auth', token }));
          }
        };
        ws.onmessage = (event) => {
          try {
            const msg = JSON.parse(event.data);

            // Handle ping → pong keep-alive
            if (msg.type === 'ping') {
              ws?.send(JSON.stringify({ type: 'pong' }));
              return;
            }

            // Auth confirmed — subscribe to user channel
            if (msg.type === 'auth_ok') {
              ws?.send(JSON.stringify({ type: 'subscribe', channel: `user:${user.id}` }));
              // Start periodic ping
              pingInterval = setInterval(() => {
                if (ws?.readyState === WebSocket.OPEN) {
                  ws.send(JSON.stringify({ type: 'ping' }));
                }
              }, 25000);
              return;
            }

            // Auth failed
            if (msg.type === 'auth_error') return;

            // Rate limit — just ignore
            if (msg.type === 'rate_limit_exceeded') return;

            // Direct notification from local WS server
            if (msg.type === 'notification' && msg.data) {
              handleNotification(msg.data);
              return;
            }

            // Realtime platform event: { type: 'event', channel, event: { type: 'notification', payload: {...} } }
            if (msg.type === 'event' && msg.event && typeof msg.event === 'object') {
              const evt = msg.event as Record<string, unknown>;
              if (evt.type === 'notification') {
                const payload = (evt.payload || evt) as Record<string, unknown>;
                if (payload && typeof payload === 'object' && 'title' in payload) {
                  handleNotification(payload);
                }
              }
              return;
            }
          } catch {}
        };
        ws.onclose = (event) => {
          if (pingInterval) { clearInterval(pingInterval); pingInterval = null; }
          if (alive && event.code !== 4001 && event.code !== 4003 && retryCount < 10) {
            const delay = Math.min(1000 * Math.pow(2, retryCount), 30000);
            retryCount++;
            reconnectTimer = setTimeout(connect, delay);
          }
        };
        ws.onerror = () => { ws?.close(); };
      } catch {}
    };
    connect();
    return () => {
      alive = false;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      if (pingInterval) clearInterval(pingInterval);
      ws?.close();
    };
  }, [user?.id]);

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  useEffect(() => {
    if (unread > prevUnread.current) {
      setBadgePulse(true);
      if (pulseTimer.current) clearTimeout(pulseTimer.current);
      pulseTimer.current = setTimeout(() => setBadgePulse(false), 700);
    }
    prevUnread.current = unread;
  }, [unread]);

  useEffect(() => {
    if (!notifOpen) return;
    const node = loadMoreRef.current;
    if (!node || !notifHasMore || notifLoading) return;
    const parent = node.parentElement;
    if (!parent) return;
    const obs = new IntersectionObserver((entries) => { if (entries[0].isIntersecting) void loadMoreNotifications(); }, { root: parent, threshold: 0.6, rootMargin: "120px" });
    obs.observe(node);
    return () => obs.disconnect();
  }, [notifOpen, notifHasMore, notifLoading]);

  const badgeCounts = { inbox: unread, notifications: unread, tickets: tickets.filter((tk) => tk.status === "open").length };

  // Admin staff get a visible role badge — hidden entirely for normal users.
  const isAdmin = !!user?.adminRole;
  const roleLabel = (user?.adminRole || "").replace(/_/g, " ").toUpperCase();
  const navSections = personalNav(badgeCounts, t);

  const markAllRead = async () => {
    await markAllNotificationsRead().catch(() => {});
    const updated = notificationsRef.current.map((n) => ({ ...n, read: true }));
    setNotifications(updated);
    notificationsRef.current = updated;
    setUnread(0);
  };

  const redirectToAccounts = () => {
    window.location.href = `${process.env.NEXT_PUBLIC_ACCOUNTS_URL || "https://accounts.tirbeo.app"}/login`;
  };

  const signOut = async () => {
    await logout();
    redirectToAccounts();
  };

  const now = new Date();
  const dateLabel = formatDate(now.toISOString(), lang);

  /* ── Calendar hover handlers ── */
  const calEnter = () => {
    if (calTimer.current) clearTimeout(calTimer.current);
    setCalOpen(true);
  };
  const calLeave = () => {
    calTimer.current = setTimeout(() => setCalOpen(false), 250);
  };

  if (authState === "loading") {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: "var(--tb-bg)", color: "var(--tb-text-muted)" }}>
        <div style={{ width: 28, height: 28, border: "3px solid var(--tb-border)", borderTopColor: "var(--tb-accent)", borderRadius: "50%", animation: "spin .8s linear infinite" }} />
      </div>
    );
  }

  if (blockStatus) {
    return <BlockedScreen status={blockStatus} onRetry={() => { setAuthState("loading"); setBlockStatus(null); }} />;
  }

  return (
    <div className="dashboard-layout">
      {mobileOpen && <div className="dashboard-sidebar-backdrop" onClick={() => setMobileOpen(false)} />}

      {(user as any)?.scheduledDeletionAt && (
        <DeletionBanner
          scheduledFor={(user as any).scheduledDeletionAt}
          reason={(user as any).deletionReason}
          onCancel={async () => { try { await cancelAccountDeletion(); setUser((prev: any) => prev ? ({ ...prev, scheduledDeletionAt: null, deletionReason: null }) : prev); } catch {} }}
        />
      )}

      {unsavedWarn && (
        <div className="tb-unsaved-banner" role="alert">
          <AlertTriangle size={16} />
          <span>{t("common.unsavedWarn")}</span>
          <button type="button" onClick={() => setUnsavedWarn(false)} aria-label={t("common.close")} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--tb-text-muted)', padding: 4 }}>
            <X size={14} />
          </button>
        </div>
      )}

      {/* ═══ SIDEBAR ═══ */}
      <aside className={`dashboard-sidebar ${mobileOpen ? "open" : ""}`}>
        <div className="sidebar-brand">
          <Link href="/overview" className="sidebar-brand-link">
            <div className="sidebar-brand-mark">
              <img src="../../logo.png" alt="Tirbeo" style={{ width: 20, height: 20 }} />
            </div>
            <span className="sidebar-brand-name">Tirbeo</span>
          </Link>
        </div>

        <nav className="sidebar-nav">
          {navSections.map((section) => (
            <div key={section.section} className="sidebar-section">
              <div className="sidebar-label">{section.section}</div>
              {section.items.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`sidebar-item ${active ? "active" : ""}`}
                    aria-current={active ? "page" : undefined}
                    onClick={() => setMobileOpen(false)}
                    target={(item as any).external ? '_blank' : undefined}
                    rel={(item as any).external ? 'noopener noreferrer' : undefined}
                  >
                    {item.icon}
                    <span className="sidebar-item-text" style={{ flex: 1 }}>{item.label}</span>
                    {item.badge && item.badge > 0 && (
                      <span className={`sidebar-item-badge sidebar-badge ${badgePulse && item.href === "/account/inbox" ? "pulse" : ""}`}>
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user-row">
            <div className="sidebar-user-avatar">
              {user?.photoUrl ? <img src={user.photoUrl} alt="" /> : initialsOf(user?.name ?? user?.email)}
            </div>
            <div className="sidebar-user-info" style={{ flex: 1, minWidth: 0 }}>
              <div className="sidebar-user-name" style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name ?? t("header.user")}</span>
                {isAdmin && <span className="role-badge">{roleLabel}</span>}
              </div>
              <div className="sidebar-user-email">{user?.email}</div>
            </div>
            <div className="sidebar-user-actions">
              <Tooltip label={t("header.signOut")}>
                <button type="button" className="header-control" onClick={signOut} aria-label={t("header.signOut")} style={{ width: 28, height: 28 }}>
                  <LogOut size={15} />
                </button>
              </Tooltip>
            </div>
          </div>
        </div>
      </aside>

      {/* ═══ MAIN ═══ */}
      <div className="dashboard-main">
        <header className="dashboard-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button type="button" className="tb-mobile-menu-btn header-control" onClick={() => setMobileOpen(!mobileOpen)} aria-label={t("header.menu")}>
              {mobileOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
            {/* Search trigger */}
            <button type="button" className="header-search" onClick={() => setSearchOpen(true)} aria-label={t("header.searchPlaceholder")}>
              <Search size={14} style={{ flexShrink: 0 }} />
              <span className="tb-search-placeholder">{t("header.searchPlaceholder")}</span>
              <span className="header-search-kbd">⌘K</span>
            </button>
          </div>

          <div className="header-right-controls">
            {/* Notifications */}
            <Tooltip label={t("header.notifications")}>
              <button
                type="button"
                className="header-control"
                onClick={() => { setNotifOpen(!notifOpen); setUserMenuOpen(false); setCalOpen(false); }}
                aria-label={t("header.notifications")}
              >
                <Bell size={16} />
                {unread > 0 && <span className="header-notif-badge">{unread > 99 ? '99+' : unread}</span>}
              </button>
            </Tooltip>

            {/* Theme toggle */}
            <Tooltip label={isDark ? t("header.switchToLight") : t("header.switchToDark")}>
              <button
                type="button"
                className="header-control tb-theme-btn"
                onClick={() => toggle()}
                aria-label={isDark ? t("header.switchToLight") : t("header.switchToDark")}
              >
                {isDark ? <Sun size={16} /> : <Moon size={16} />}
              </button>
            </Tooltip>

            {/* Date picker — hover on desktop, click on mobile */}
            <div
              ref={calRef}
              className="relative"
              onMouseEnter={calEnter}
              onMouseLeave={calLeave}
            >
              <Tooltip label={t("header.calendar")}>
                <button
                  type="button"
                  className="tb-date-btn"
                  onClick={() => setCalOpen(!calOpen)}
                  aria-label={t("header.calendar")}
                >
                  <Calendar size={14} />
                  <span className="tb-date-btn-label">{dateLabel}</span>
                  <ChevronDown size={12} style={{ color: "var(--tb-text-muted)", transform: calOpen ? "rotate(180deg)" : "rotate(0)", transition: "transform 120ms" }} />
                </button>
              </Tooltip>
              {/* Hover bridge */}
              {calOpen && <div className="calendar-hover-bridge" />}
              {calOpen && <MonthCalendar onClose={() => setCalOpen(false)} />}
            </div>

            {/* User menu */}
            <div ref={userMenuRef} className="relative">
              <Tooltip label={t("header.account")}>
                <button
                  type="button"
                  className="header-btn-link"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  aria-label={t("header.account")}
                >
                  <div className="header-avatar">
                    {user?.photoUrl ? <img src={user.photoUrl} alt="" /> : initialsOf(user?.name ?? user?.email)}
                  </div>
                </button>
              </Tooltip>
              {userMenuOpen && (
                <>
                  <div style={{ position: 'fixed', inset: 0, zIndex: 59 }} onClick={() => setUserMenuOpen(false)} />
                  <div className="header-popover" role="menu">
                    <div style={{ padding: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 4px 12px', borderBottom: '1px solid var(--tb-border)' }}>
                        <div className="sidebar-user-avatar" style={{ width: 40, height: 40 }}>
                          {user?.photoUrl ? <img src={user.photoUrl} alt="" /> : initialsOf(user?.name ?? user?.email)}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--tb-text-primary)', display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                            {user?.name ?? t("header.user")}
                            {isAdmin && <span className="role-badge">{roleLabel}</span>}
                          </div>
                          <div style={{ fontSize: 12, color: 'var(--tb-text-muted)' }}>{user?.email ?? ""}</div>
                        </div>

                      </div>
                      <div style={{ paddingTop: 8 }}>
                        <button type="button" role="menuitem" className="menu-item" onClick={() => { setUserMenuOpen(false); router.push("/account/profile"); }}>
                          <User size={15} /> <span style={{ flex: 1 }}>{t("nav.profile")}</span>
                        </button>
                        <button type="button" role="menuitem" className="menu-item" onClick={() => { setUserMenuOpen(false); router.push("/account/security"); }}>
                          <Lock size={15} /> <span style={{ flex: 1 }}>{t("nav.security")}</span>
                        </button>
                        <div className="menu-divider" />
                        <button type="button" role="menuitem" className="menu-item" onClick={() => { setUserMenuOpen(false); router.push("/account/preferences"); }}>
                          <Settings size={15} /> <span style={{ flex: 1 }}>{t("nav.preferences")}</span>
                        </button>
                        <div className="menu-divider" />
                        <button type="button" role="menuitem" className="menu-item danger" onClick={() => { setUserMenuOpen(false); signOut(); }}>
                          <LogOut size={15} /> <span style={{ flex: 1 }}>{t("header.signOut")}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* ═══ NOTIFICATION SIDEBAR ═══ */}
        {notifOpen && (
          <>
            <div className="notification-sidebar-backdrop" onClick={() => setNotifOpen(false)} />
            <div className="notification-sidebar open" role="dialog" aria-label={t("header.notifications")}>
              <div className="notif-sidebar-header">
                <span className="notif-sidebar-title">{t("notif.title")}{unread > 0 && <span className="notif-sidebar-count">{unread}</span>}</span>
                <div className="notif-sidebar-actions">
                  {unread > 0 && <button type="button" className="btn btn-ghost btn-sm" onClick={markAllRead}>{t("common.markRead")}</button>}
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() => { setNotifOpen(false); router.push("/account/inbox"); }}
                  >
                    <Inbox size={14} />
                    {t("nav.inbox")}
                  </button>
                </div>
              </div>

              <div className="notif-retention-alert">
                <Info size={14} />
                <span>{t("notif.retention")}</span>
              </div>

              <div style={{ flex: 1, overflow: 'auto' }}>
                {notifications.length === 0 ? (
                  <div className="notif-sidebar-empty">{t("notif.empty")}</div>
                ) : notifications.map((n) => {
                  const meta = getNotifMeta(n.type, t);
                  const NotifIcon = meta.icon;
                  return (
                    <div
                      key={n.id}
                      className={`notif-sidebar-item clickable ${n.read ? "read" : "unread"}`}
                      onClick={() => {
                        if (!n.read) {
                          void markNotificationsRead([n.id]).catch(() => {});
                          const updated = notificationsRef.current.map((x) => (x.id === n.id ? { ...x, read: true } : x));
                          notificationsRef.current = updated;
                          setNotifications(updated);
                          setUnread((u) => Math.max(0, u - 1));
                        }
                        setNotifOpen(false);
                        router.push(n.link || "/account/inbox");
                      }}
                    >
                      {!n.read && <span className="notif-sidebar-dot unread" />}
                      <div className="inbox-item-icon" style={{ flexShrink: 0 }}>
                        <NotifIcon size={15} />
                      </div>
                      <div className="notif-sidebar-body">
                        <div className={`notif-sidebar-title-text ${n.read ? "read" : "unread"}`}>
                          {translateText(t, n.title, lang)}
                        </div>
                        {n.body && <div className="notif-sidebar-subtitle">{translateText(t, n.body, lang)}</div>}
                      </div>
                      <span className="notif-sidebar-time" title={notifDate(n.createdAt, lang)}>
                        {notifAgo(n.createdAt, t, lang)}
                      </span>
                    </div>
                  );
                })}
                {notifHasMore && (
                  <div ref={loadMoreRef} className="notif-load-more">
                    {notifLoading ? t("common.loading") : t("common.loadMore")}
                  </div>
                )}
              </div>
              {notifTotal > 0 && (
                <button
                  type="button"
                  className="notif-sidebar-footer"
                  onClick={() => { setNotifOpen(false); router.push("/account/inbox"); }}
                  style={{ cursor: 'pointer', width: '100%', border: 'none', background: 'none', color: 'inherit', font: 'inherit' }}
                >
                  {notifTotal} {t("notif.total")} · {t("nav.inbox")}
                </button>
              )}
            </div>
          </>
        )}

        {/* ═══ SEARCH OVERLAY ═══ */}
        {searchOpen && (
          <div className="tb-search-overlay" onClick={() => setSearchOpen(false)}>
            <div className="tb-search-panel" onClick={e => e.stopPropagation()}>
              <div className="tb-search-input-row">
                <Search size={16} />
                <input
                  type="text"
                  placeholder={t("search.placeholder")}
                  autoFocus
                  onKeyDown={e => {
                    if (e.key === "Escape") setSearchOpen(false);
                    if (e.key === "Enter") {
                      const val = (e.target as HTMLInputElement).value.toLowerCase();
                      setSearchOpen(false);
                      const pages: Array<[string, string]> = [
                        [t("nav.profile"), "/account/profile"],
                        [t("nav.preferences"), "/account/preferences"],
                        [t("nav.notifications"), "/account/notifications"],
                        [t("nav.security"), "/account/security"],
                        [t("nav.privacy"), "/account/privacy"],
                        [t("nav.sessions"), "/account/sessions"],
                        [t("nav.inbox"), "/account/inbox"],
                        [t("nav.tickets"), "/support/tickets"],
                        [t("nav.history"), "/activity/history"],
                        [t("nav.connectedApps"), "/account/apps"],
                        [t("search.overview"), "/overview"],
                        [t("search.notificationsSettings"), "/account/notifications"],
                        [t("search.activityHistory"), "/activity/history"],
                        [t("search.supportTickets"), "/support/tickets"],
                      ];
                      for (const [k, v] of pages) {
                        if (val.includes(k.toLowerCase())) { router.push(v); return; }
                      }
                    }
                  }}
                />
                <span className="tb-search-kbd">ESC</span>
              </div>
              <div className="tb-search-body">
                <div className="tb-search-group-wrap">
                  <div className="tb-search-group">{t("search.pages")}</div>
                  {[
                    { title: t("search.overview"), sub: "/overview", href: "/overview" },
                    { title: t("nav.inbox"), sub: "/account/inbox", href: "/account/inbox" },
                    { title: t("nav.profile"), sub: "/account/profile", href: "/account/profile" },
                    { title: t("nav.preferences"), sub: "/account/preferences", href: "/account/preferences" },
                    { title: t("search.notificationsSettings"), sub: "/account/notifications", href: "/account/notifications" },
                    { title: t("nav.connectedApps"), sub: "/account/apps", href: "/account/apps" },
                    { title: t("nav.security"), sub: "/account/security", href: "/account/security" },
                    { title: t("nav.privacy"), sub: "/account/privacy", href: "/account/privacy" },
                    { title: t("nav.sessions"), sub: "/account/sessions", href: "/account/sessions" },
                    { title: t("search.activityHistory"), sub: "/activity/history", href: "/activity/history" },
                    { title: t("search.supportTickets"), sub: "/support/tickets", href: "/support/tickets" },
                  ].map(item => (
                    <button key={item.href} className="tb-search-item" onClick={() => { setSearchOpen(false); router.push(item.href); }}>
                      <div className="tb-search-item-body">
                        <span className="tb-search-item-title">{item.title}</span>
                        <span className="tb-search-item-sub">{item.sub}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              <div className="tb-search-footer">
                <span>↑↓ {t("search.navigate")}</span><span>↵ {t("search.open")}</span><span>ESC {t("search.close")}</span>
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="dashboard-content">
          {children}
        </div>
      </div>
    </div>
  );
}
