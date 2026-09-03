"use client";

import { useEffect, useRef, useState, useCallback, type ReactNode } from "react";
import { BlockedScreen, DeletionBanner } from "@/components/BlockedScreen";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useThemeToggle } from "@tirbeo/theme";
import {
  AlertTriangle, Bell, Building, Calendar, ChevronDown,
  Clock, Eye, FileText, Home, Inbox, Info, LifeBuoy, Monitor,
  Lock, LogOut, Mail, Menu, Moon, Loader2, Search,
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
import { onNotificationsChanged, notifyNotificationsChanged } from "@/lib/notification-events";

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
      className="relative inline-flex"
    >
      {children}
      {show && (
        <span ref={tipRef} className="absolute top-[calc(100%+7px)] left-1/2 z-[100] pointer-events-none px-2 py-1 rounded-md text-[11px] font-medium whitespace-nowrap bg-tb-surface-3 text-tb-text-primary border border-tb-border shadow-lg animate-[fadeIn_120ms_ease]"
          style={{ transform: `translateX(calc(-50% + ${shiftX}px))` }}
        >
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
      { label: t("nav.getStarted"), href: "/home", icon: <Home size={16} /> },
      { label: t("nav.inbox"), href: "/account/inbox", icon: <Mail size={16} />, badge: badgeCounts.inbox },
      { label: "Forms", href: process.env.NEXT_PUBLIC_FORMS_URL || "https://forms.tirbeo.app", icon: <FileText size={16} />, external: true },
    ]},
    { section: t("nav.account"), items: [
      { label: t("nav.profile"), href: "/account/profile", icon: <User size={16} /> },
      { label: t("nav.preferences"), href: "/account/preferences", icon: <Sliders size={16} /> },
      { label: t("nav.notifications"), href: "/account/notifications", icon: <Bell size={16} /> },
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

function SafeAvatarImg({ src, alt, fallback }: { src?: string | null; alt: string; fallback: ReactNode }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => { setFailed(false); }, [src]);
  if (!src || failed) return <>{fallback}</>;
  return <img src={src} alt={alt} className="w-full h-full object-cover" onError={() => setFailed(true)} referrerPolicy="no-referrer" loading="eager" />;
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
      const link = target?.closest('a[href], [role=menuitem]') as HTMLElement | null;
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
    return (items ?? []).filter((n) => n?.createdAt && new Date(n.createdAt).getTime() >= cutoff);
  };

  const fetchNotifications = useCallback(async () => {
    try {
      const r = await listNotifications(NOTIF_PAGE, 0);
      const seen = applyRetention(r?.notifications ?? []);
      setNotifications(seen);
      notificationsRef.current = seen;
      setUnread(r?.unread ?? 0);
      setNotifTotal(r?.total ?? 0);
      setNotifHasMore(seen.length < (r?.total ?? 0));
    } catch (e) { if (isUnauthorizedError(e)) redirectToAccounts(); }
  }, []);

  const loadMoreNotifications = useCallback(async () => {
    if (notifLoading || !notifHasMore) return;
    setNotifLoading(true);
    try {
      const r = await listNotifications(NOTIF_PAGE, notifications.length);
      const incoming = applyRetention(r?.notifications ?? []);
      setNotifications((prev) => { const merged = [...prev, ...incoming]; notificationsRef.current = merged; return merged; });
      setNotifTotal(r?.total ?? 0);
      setNotifHasMore(notifications.length + incoming.length < (r?.total ?? 0) && incoming.length > 0);
    } catch (e) { if (isUnauthorizedError(e)) redirectToAccounts(); } finally { setNotifLoading(false); }
  }, [notifLoading, notifHasMore, notifications.length]);

  const fetchTickets = useCallback(async () => {
    try { const r = await listTickets({ limit: 10 }); setTickets(Array.isArray(r?.data) ? r.data : []); } catch (e) { if (isUnauthorizedError(e)) redirectToAccounts(); }
  }, []);

  // Simple load-on-open only — no websocket, no auto-reload loop
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
    // Disabled SW registration — old SW was intercepting api.tirbeo.app + cdn.discordapp.com and breaking CORS via respondWith NetworkError
    // Clean up any previously installed SW + caches so h1-check.js and api fetches go direct to network
    if (typeof navigator !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker.getRegistrations().then(regs => regs.forEach(r => r.unregister())).catch(()=>{});
      if ("caches" in window) caches.keys().then(keys => keys.forEach(k => caches.delete(k))).catch(()=>{});
    }
    // Suppress noisy third-party extension errors (h1-check.js detectStore) — not our code
    const suppressExtError = (e: ErrorEvent) => {
      const msg = String(e.message || '');
      const src = String((e as any).filename || '');
      if (msg.includes('detectStore') || src.includes('h1-check')) {
        e.preventDefault();
        e.stopPropagation();
        return true;
      }
    };
    const suppressRejection = (e: PromiseRejectionEvent) => {
      const msg = String((e.reason as any)?.message || e.reason || '');
      if (msg.includes('detectStore') || msg.includes('h1-check')) {
        e.preventDefault();
      }
    };
    window.addEventListener('error', suppressExtError);
    window.addEventListener('unhandledrejection', suppressRejection);
    return () => {
      alive = false;
      window.removeEventListener('error', suppressExtError);
      window.removeEventListener('unhandledrejection', suppressRejection);
    };
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

  // Sync with inbox: when inbox marks read/deletes, bell updates instantly
  useEffect(() => {
    return onNotificationsChanged(() => {
      void fetchNotifications();
      void fetchTickets();
    });
  }, [fetchNotifications, fetchTickets]);

  // Realtime polling — refresh notifications and ticket counts every 15s
  useEffect(() => {
    pollTimer.current = setInterval(() => {
      void fetchNotifications();
      void fetchTickets();
    }, 15_000);
    return () => { if (pollTimer.current) clearInterval(pollTimer.current); };
  }, [fetchNotifications, fetchTickets]);

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

  const badgeCounts = { inbox: notifTotal, notifications: unread, tickets: (Array.isArray(tickets) ? tickets : []).filter((tk) => tk?.status === "open").length };

  // Admin staff get a visible role badge — hidden entirely for normal users.
  const isAdmin = !!user?.adminRole;
  const roleLabel = (user?.adminRole || "").replace(/_/g, " ").toUpperCase();
  const navSections = personalNav(badgeCounts, t);

  const [markingAllNotifs, setMarkingAllNotifs] = useState(false);
  const markAllRead = async () => {
    if (unread === 0) return;
    setMarkingAllNotifs(true);
    try {
      const prev = [...notificationsRef.current];
      const prevUnread = unread;
      const updated = prev.map((n) => ({ ...n, read: true }));
      setNotifications(updated);
      notificationsRef.current = updated;
      setUnread(0);
      notifyNotificationsChanged();
      try { await markAllNotificationsRead(); } catch { setNotifications(prev); notificationsRef.current = prev; setUnread(prevUnread); }
    } finally { setMarkingAllNotifs(false); }
  };

  const redirectToAccounts = () => {
    window.location.href = `${process.env.NEXT_PUBLIC_ACCOUNTS_URL || "https://accounts.tirbeo.app"}/login`;
  };

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const signOut = async () => {
    setShowLogoutConfirm(false);
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
      <div className="flex items-center justify-center h-screen bg-tb-bg text-tb-text-muted">
        <div className="w-7 h-7 border-[3px] border-tb-border border-t-tb-blue rounded-full animate-spin" />
      </div>
    );
  }

  if (blockStatus) {
    return <BlockedScreen status={blockStatus} onRetry={() => { setAuthState("loading"); setBlockStatus(null); }} />;
  }

  const scheduledDeletionAt = (user as any)?.scheduledDeletionAt as string | null;

  return (
    <div className="flex flex-col min-h-screen">
      {/* Deletion banner — full width above everything */}
      {scheduledDeletionAt && (
        <DeletionBanner
          scheduledFor={scheduledDeletionAt}
          reason={(user as any).deletionReason}
          onCancel={async () => { try { await cancelAccountDeletion(); setUser((prev: any) => prev ? ({ ...prev, scheduledDeletionAt: null, deletionReason: null }) : prev); try { window.dispatchEvent(new CustomEvent("tb:deletion-cancelled")); } catch {} } catch {} }}
        />
      )}

      <div className="flex h-screen overflow-hidden bg-tb-bg flex-1">        {mobileOpen && <div className="fixed inset-0 bg-black/60 z-[45] animate-fade-in" onClick={() => setMobileOpen(false)} />}

      {unsavedWarn && (
        <div className="fixed left-1/2 bottom-6 -translate-x-1/2 z-[200] flex items-center gap-2.5 px-[18px] max-w-[min(560px,calc(100vw-32px))] rounded-xl bg-tb-surface-1 border border-tb-red text-tb-text-primary text-[13.5px] font-medium animate-unsaved-in shadow-[0_12px_40px_rgba(0,0,0,0.3)]" role="alert">
          <AlertTriangle size={16} />
          <span>{t("common.unsavedWarn")}</span>
          <button type="button" onClick={() => setUnsavedWarn(false)} aria-label={t("common.close")} className="bg-transparent border-none cursor-pointer text-tb-text-muted p-1">
            <X size={14} />
          </button>
        </div>
      )}

      {/* ═══ SIDEBAR — Material Design 3 ═══ */}
      <aside className={`w-[280px] shrink-0 h-screen relative flex flex-col bg-tb-sidebar z-50 max-lg:fixed max-lg:top-0 max-lg:left-0 max-lg:w-[min(300px,85vw)] max-lg:h-screen max-lg:-translate-x-full max-lg:transition-transform max-lg:duration-300 max-lg:shadow-[8px_0_24px_rgba(0,0,0,0.3)] ${mobileOpen ? 'max-lg:translate-x-0' : ''}`}>

        {/* Brand */}
        <div className="px-5 h-[64px] flex items-center">
          <Link href="/home" className="flex items-center gap-3 no-underline">
            <div className="w-9 h-9 shrink-0 flex items-center justify-center rounded-xl bg-tb-brand text-tb-brand-text">
              <img src="../../logo.png" alt="Tirbeo" className="w-5 h-5" />
            </div>
            <span className="text-[15px] font-semibold text-tb-text-primary tracking-[-0.01em]">Tirbeo</span>
            {scheduledDeletionAt && <span className="ml-1 inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold tracking-wider uppercase bg-tb-red-soft text-tb-red border border-tb-red/20"><span className="w-1 h-1 rounded-full bg-tb-red animate-pulse" />Del</span>}
          </Link>
        </div>

        {/* Deletion warning */}
        {scheduledDeletionAt && (
          <div className="mx-3 mb-2 px-3 py-2.5 rounded-2xl flex items-center gap-2.5 text-[12px] font-medium bg-tb-red-soft border border-tb-red/15">
            <AlertTriangle size={14} className="text-tb-red shrink-0" />
            <span className="truncate text-tb-text-secondary">Account scheduled for deletion</span>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-auto px-3 py-2">
          {navSections.map((section, sIdx) => (
            <div key={section.section} className={sIdx > 0 ? 'mt-4' : ''}>
              <div className="px-3 mb-1 text-[11px] font-semibold text-tb-text-muted tracking-[0.06em] uppercase">{section.section}</div>
              <div className="flex flex-col gap-0.5">
                {section.items.map((item) => {
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-2xl text-[13px] font-medium cursor-pointer transition-all duration-200 no-underline border-none w-full text-left relative ${
                        active
                          ? 'bg-tb-brand/12 text-tb-brand'
                          : 'text-tb-text-secondary hover:bg-[color-mix(in_srgb,var(--tb-text-primary)_6%,transparent)] hover:text-tb-text-primary'
                      }`}
                      aria-current={active ? "page" : undefined}
                      onClick={() => setMobileOpen(false)}
                      target={(item as any).external ? '_blank' : undefined}
                      rel={(item as any).external ? 'noopener noreferrer' : undefined}
                    >
                      <span className={`shrink-0 ${active ? 'text-tb-brand' : 'text-tb-text-muted'}`}>{item.icon}</span>
                      <span className="flex-1 overflow-hidden whitespace-nowrap">{item.label}</span>
                      {item.badge && item.badge > 0 && (
                        <span className={`transition-all duration-[150ms,200ms] overflow-hidden text-[11px] font-semibold rounded-full px-2 py-0.5 min-w-5 text-center ${
                          active
                            ? 'bg-tb-brand text-tb-brand-text'
                            : 'bg-tb-surface-3 text-tb-text-muted'
                        } ${badgePulse && item.href === '/account/inbox' ? 'animate-badge-pulse' : ''}`}>
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* User section */}
        <div className="px-3 pb-3 pt-2">
          <div className="flex items-center gap-3 px-2 py-2.5 rounded-2xl hover:bg-[color-mix(in_srgb,var(--tb-text-primary)_5%,transparent)] transition-colors duration-150 cursor-pointer">
            <div className="w-9 h-9 rounded-full bg-tb-surface-3 flex items-center justify-center text-[13px] font-semibold text-tb-text-secondary overflow-hidden shrink-0">
              <SafeAvatarImg src={user?.photoUrl} alt="" fallback={<User size={16} style={{ opacity: 0.7 }} />} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-medium text-tb-text-primary truncate flex items-center gap-1.5">
                <span className="truncate">{user?.name ?? t("header.user")}</span>
                {isAdmin && <span className="inline-flex items-center bg-tb-red text-white text-[8px] font-bold tracking-wider uppercase leading-none py-0.5 px-1 rounded shrink-0">{roleLabel}</span>}
              </div>
              <div className="text-[11px] text-tb-text-muted truncate">{user?.email}</div>
            </div>
            <Tooltip label={t("header.signOut")}>
              <button type="button" className="flex items-center justify-center w-8 h-8 rounded-xl text-tb-text-muted hover:bg-tb-surface-3 hover:text-tb-text-primary transition-all duration-150 active:scale-95" onClick={() => setShowLogoutConfirm(true)} aria-label={t("header.signOut")}>
                <LogOut size={15} />
              </button>
            </Tooltip>
          </div>
        </div>
      </aside>

      {/* ═══ MAIN ═══ */}
      <div className="flex-1 min-w-0 flex flex-col h-screen overflow-y-auto overflow-x-hidden">
        {/* ═══ Floating mobile menu button ═══ */}
        <button
          type="button"
          className="fixed top-4 left-4 z-50 lg:hidden flex items-center justify-center w-10 h-10 rounded-full border-none bg-tb-surface-1/80 backdrop-blur-md cursor-pointer text-tb-text-secondary transition-all duration-200 shadow-[0_2px_12px_rgba(0,0,0,0.15)] hover:bg-tb-surface-2 hover:text-tb-text-primary active:scale-95"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={t("header.menu")}
        >
          {mobileOpen ? <X size={18} /> : <Menu size={18} />}
        </button>

        {/* ═══ Floating top-right icons ═══ */}
        <div className="fixed top-4 right-4 z-50 flex items-center gap-1.5">
          {/* Notifications */}
          <Tooltip label={t("header.notifications")}>
            <button
              type="button"
              className="flex items-center justify-center w-10 h-10 rounded-full border-none bg-tb-surface-1/80 backdrop-blur-md cursor-pointer text-tb-text-secondary transition-all duration-200 relative shadow-[0_2px_12px_rgba(0,0,0,0.15)] hover:bg-tb-surface-2 hover:text-tb-text-primary hover:shadow-[0_4px_20px_rgba(0,0,0,0.2)] active:scale-95"
              onClick={() => { setNotifOpen(!notifOpen); setUserMenuOpen(false); }}
              aria-label={t("header.notifications")}
            >
              <Bell size={18} />
              {unread > 0 && <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-tb-red text-white text-[10px] font-semibold leading-[18px] text-center pointer-events-none">{unread > 99 ? '99+' : unread}</span>}
            </button>
          </Tooltip>

          {/* Theme toggle */}
          <Tooltip label={isDark ? t("header.switchToLight") : t("header.switchToDark")}>
            <button
              type="button"
              className="flex items-center justify-center w-10 h-10 rounded-full border-none bg-tb-surface-1/80 backdrop-blur-md cursor-pointer text-tb-text-secondary transition-all duration-200 relative shadow-[0_2px_12px_rgba(0,0,0,0.15)] hover:bg-tb-surface-2 hover:text-tb-text-primary hover:shadow-[0_4px_20px_rgba(0,0,0,0.2)] active:scale-95"
              onClick={() => toggle()}
              aria-label={isDark ? t("header.switchToLight") : t("header.switchToDark")}
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </Tooltip>

          {/* Profile avatar */}
          <div ref={userMenuRef} className="relative">
            <Tooltip label={t("header.account")}>
              <button
                type="button"
                className="p-0 bg-transparent border-none cursor-pointer rounded-full transition-transform duration-200 inline-flex items-center justify-center w-10 h-10 leading-none hover:scale-105 shadow-[0_2px_12px_rgba(0,0,0,0.15)]"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                aria-label={t("header.account")}
              >
                <div className="w-10 h-10 rounded-full bg-tb-surface-3 flex items-center justify-center text-xs font-semibold text-tb-text-secondary overflow-hidden border-2 border-tb-border transition-all duration-200 shrink-0 cursor-pointer">
                  <SafeAvatarImg src={user?.photoUrl} alt="" fallback={<User size={18} style={{ opacity: 0.7 }} />} />
                </div>
              </button>
            </Tooltip>
              {userMenuOpen && (
                <>
                  <div className="fixed inset-0 z-[59]" onClick={() => setUserMenuOpen(false)} />
                  <div className="absolute top-[calc(100%+4px)] right-0 min-w-[220px] bg-tb-surface-1 border border-tb-border rounded-xl z-[60] overflow-hidden shadow-[0_16px_48px_rgba(0,0,0,0.3)] animate-dropdown-in" role="menu">
                    <div className="p-3">
                      <div className="flex items-center gap-2.5 px-1 py-2 border-b border-tb-border">
                        <div className="w-10 h-10 rounded-full bg-tb-surface-3 flex items-center justify-center text-[13px] font-semibold text-tb-text-secondary overflow-hidden shrink-0 border border-tb-border">
                          <SafeAvatarImg src={user?.photoUrl} alt="" fallback={<User size={18} style={{ opacity: 0.7 }} />} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-semibold text-tb-text-primary flex items-center gap-1.5 flex-wrap">
                            {user?.name ?? t("header.user")}
                            {isAdmin &&                <span className="inline-flex items-center bg-tb-red text-white text-[9px] font-bold tracking-widest uppercase leading-none py-[3px] px-1.5 rounded-[5px] whitespace-nowrap shrink-0">{roleLabel}</span>}
                          </div>
                          <div className="text-xs text-tb-text-muted">{user?.email ?? ""}</div>
                        </div>

                      </div>
                      <div className="pt-2">
                        <button type="button" role="menuitem" className="flex items-center gap-2 w-full px-3 py-2 rounded-lg border-none bg-transparent cursor-pointer text-left text-sm text-tb-text-secondary transition-all duration-[120ms] hover:bg-tb-surface-3 hover:text-tb-text-primary active:scale-[0.98]" onClick={() => { setUserMenuOpen(false); router.push("/account/profile"); }}>
                          <User size={15} /> <span className="flex-1">{t("nav.profile")}</span>
                        </button>
                        <button type="button" role="menuitem" className="flex items-center gap-2 w-full px-3 py-2 rounded-lg border-none bg-transparent cursor-pointer text-left text-sm text-tb-text-secondary transition-all duration-[120ms] hover:bg-tb-surface-3 hover:text-tb-text-primary active:scale-[0.98]" onClick={() => { setUserMenuOpen(false); router.push("/account/security"); }}>
                          <Lock size={15} /> <span className="flex-1">{t("nav.security")}</span>
                        </button>
                        <div className="border-t border-tb-border my-1" />
                        <button type="button" role="menuitem" className="flex items-center gap-2 w-full px-3 py-2 rounded-lg border-none bg-transparent cursor-pointer text-left text-sm text-tb-text-secondary transition-all duration-[120ms] hover:bg-tb-surface-3 hover:text-tb-text-primary active:scale-[0.98]" onClick={() => { setUserMenuOpen(false); router.push("/account/preferences"); }}>
                          <Settings size={15} /> <span className="flex-1">{t("nav.preferences")}</span>
                        </button>
                        <div className="border-t border-tb-border my-1" />
                        <button type="button" role="menuitem" className="flex items-center gap-2 w-full px-3 py-2 rounded-lg border-none bg-transparent cursor-pointer text-left text-sm text-tb-red transition-all duration-[120ms] hover:bg-tb-red-soft active:scale-[0.98]" onClick={() => { setUserMenuOpen(false); setShowLogoutConfirm(true); }}>
                          <LogOut size={15} /> <span className="flex-1">{t("header.signOut")}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

        {/* ═══ NOTIFICATION SIDEBAR ═══ */}
        {notifOpen && (
          <>
            <div className="fixed inset-0 bg-black/50 z-[99] animate-fade-in backdrop-blur-sm" onClick={() => setNotifOpen(false)} />
            <div className="fixed top-0 right-0 w-[380px] h-screen bg-tb-surface-1 border-l border-tb-border z-[100] translate-x-0 transition-transform duration-200 flex flex-col shadow-[-12px_0_40px_rgba(0,0,0,0.2)] max-sm:w-full" role="dialog" aria-label={t("header.notifications")}>
              <div className="flex items-center justify-between px-5 py-4 border-b border-tb-border">
                <span className="text-base font-semibold flex items-center gap-2">{t("notif.title")}{unread > 0 && <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-[5px] rounded-[9px] bg-tb-red text-white text-[11px] font-semibold leading-none">{unread}</span>}</span>
                <div className="flex gap-2">
                   {unread > 0 && <button type="button" className="inline-flex items-center justify-center gap-2 h-[34px] px-3.5 rounded-[10px] text-[13px] font-medium cursor-pointer transition-all duration-150 border-none bg-transparent text-tb-text-secondary hover:bg-tb-surface-3 hover:text-tb-text-primary disabled:opacity-40 disabled:cursor-not-allowed" onClick={markAllRead} disabled={markingAllNotifs}>
                      {markingAllNotifs ? <Loader2 size={13} className="animate-spin" /> : null}
                      {t("common.markRead")}
                    </button>}
                  <button
                    type="button"
                    className="inline-flex items-center justify-center gap-2 h-[34px] px-3.5 rounded-[10px] text-[13px] font-medium cursor-pointer transition-all duration-150 border-none bg-transparent text-tb-text-secondary hover:bg-tb-surface-3 hover:text-tb-text-primary"
                    onClick={() => { setNotifOpen(false); router.push("/account/inbox"); }}
                  >
                    <Inbox size={14} />
                    {t("nav.inbox")}
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 px-4 py-2 text-xs text-tb-text-secondary border-b border-tb-border">
                <Info size={14} />
                <span>{t("notif.retention")}</span>
              </div>

              <div className="flex-1 overflow-auto">
                {notifications.length === 0 ? (
                  <div className="px-10 text-center text-tb-text-muted text-sm">{t("notif.empty")}</div>
                ) : notifications.map((n) => {
                  const meta = getNotifMeta(n.type, t);
                  const NotifIcon = meta.icon;
                  return (
                    <div
                      key={n.id}
                      className={`flex gap-3 px-5 py-3 border-b border-tb-border transition-all duration-[120ms] cursor-pointer hover:bg-tb-surface-2 ${n.read ? '' : ''}`}
                      onClick={() => {
                        if (!n.read) {
                          void markNotificationsRead([n.id]).catch(() => {});
                          const updated = notificationsRef.current.map((x) => (x.id === n.id ? { ...x, read: true } : x));
                          notificationsRef.current = updated;
                          setNotifications(updated);
                          setUnread((u) => Math.max(0, u - 1));
                          notifyNotificationsChanged();
                        }
                        setNotifOpen(false);
                        router.push(n.link || "/account/inbox");
                      }}
                    >
                      {!n.read && <span className="w-[7px] h-[7px] rounded-full shrink-0 mt-1.5 bg-tb-green" />}
                      <div
                        className="flex items-center justify-center w-9 h-9 rounded-[10px] flex-shrink-0"
                        style={{
                          background: `color-mix(in srgb, ${meta.color} 14%, transparent)`,
                          color: meta.color,
                          border: `1px solid color-mix(in srgb, ${meta.color} 28%, transparent)`,
                        }}
                      >
                        <NotifIcon size={15} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className={`text-sm overflow-hidden text-ellipsis whitespace-nowrap ${n.read ? 'font-normal text-tb-text-secondary' : 'font-semibold text-tb-text-primary'}`}>
                          {translateText(t, n.title, lang)}
                        </div>
                        {n.body && <div className="text-[13px] text-tb-text-muted mt-0.5 overflow-hidden text-ellipsis whitespace-nowrap">{translateText(t, n.body, lang)}</div>}
                      </div>
                      <span className="text-xs text-tb-text-muted whitespace-nowrap mt-0.5" title={notifDate(n.createdAt, lang)}>
                        {notifAgo(n.createdAt, t, lang)}
                      </span>
                    </div>
                  );
                })}
                {notifHasMore && (
                  <div ref={loadMoreRef} className="px-4 py-3.5 text-center text-[13px] font-medium text-tb-text-muted cursor-pointer border-y border-tb-border transition-all duration-[120ms] hover:bg-tb-surface-1 hover:text-tb-text-primary">
                    {notifLoading ? t("common.loading") : t("common.loadMore")}
                  </div>
                )}
              </div>
              {notifTotal > 0 && (
                <button
                  type="button"
                  className="px-4 py-2 text-[11px] font-semibold text-tb-text-muted text-center border-t border-tb-border cursor-pointer w-full border-x-0 border-b-0 bg-transparent text-inherit font-inherit"
                  onClick={() => { setNotifOpen(false); router.push("/account/inbox"); }}
                >
                  {notifTotal} {t("notif.total")} · {t("nav.inbox")}
                </button>
              )}
            </div>
          </>
        )}

        {/* ═══ SEARCH OVERLAY ═══ */}
        {searchOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xl" onClick={() => setSearchOpen(false)}>
            <div className="w-full max-w-[600px] bg-tb-surface-1 border border-tb-border rounded-2xl overflow-hidden animate-dialog-in shadow-[0_24px_80px_rgba(0,0,0,0.35)]" onClick={e => e.stopPropagation()}>
              <div className="flex items-center gap-3 px-5 py-4 border-b border-tb-border text-tb-text-muted">
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
                        [t("search.overview"), "/home"],
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
                <span className="px-[7px] py-0.5 rounded border border-tb-border-strong text-[10px] leading-relaxed text-tb-text-muted shrink-0">ESC</span>
              </div>
              <div className="max-h-[min(52vh,440px)] overflow-y-auto p-2">
                <div className="mb-2">
                  <div className="px-3 py-1.5 text-[11px] font-semibold text-tb-text-muted uppercase tracking-wider">{t("search.pages")}</div>
                  {[
                    { title: t("search.overview"), sub: "/home", href: "/home" },
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
                    <button key={item.href} className="flex items-center gap-3 w-full px-3.5 py-2.5 border-none bg-transparent rounded-lg cursor-pointer text-left transition-all duration-[80ms] font-inherit hover:bg-tb-surface-2" onClick={() => { setSearchOpen(false); router.push(item.href); }}>
                      <div className="flex flex-col">
                        <span className="text-[13.5px] font-medium text-tb-text-primary">{item.title}</span>
                        <span className="text-xs text-tb-text-muted mt-px">{item.sub}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-4 px-5 py-2.5 border-t border-tb-border text-[11px] text-tb-text-muted">
                <span>↑↓ {t("search.navigate")}</span><span>↵ {t("search.open")}</span><span>ESC {t("search.close")}</span>
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 p-[72px_28px_24px_28px] max-w-[1400px] w-full mx-auto max-sm:p-[72px_16px_16px_16px]">
          {children}
        </div>
      </div>
      </div>

      {/* ═══ Logout Confirmation ═══ */}
      {showLogoutConfirm && (
        <>
          <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-[2px] animate-fade-in" onClick={() => setShowLogoutConfirm(false)} />
          <div className="fixed z-[201] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[380px] rounded-2xl border border-tb-border bg-tb-surface-1 shadow-[0_24px_80px_rgba(0,0,0,0.35)] animate-scale-in">
            <div className="p-6 text-center">
              <div className="w-12 h-12 rounded-2xl bg-tb-surface-2 border border-tb-border flex items-center justify-center mx-auto mb-4">
                <LogOut size={20} className="text-tb-text-muted" />
              </div>
              <h3 className="text-[16px] font-semibold text-tb-text-primary mb-1.5">Sign out?</h3>
              <p className="text-[13px] text-tb-text-muted leading-relaxed">You'll be redirected to the sign-in page.</p>
            </div>
            <div className="flex border-t border-tb-border">
              <button onClick={() => setShowLogoutConfirm(false)} className="flex-1 px-4 py-3 text-[13px] font-medium text-tb-text-secondary hover:bg-tb-surface-2 transition-colors cursor-pointer border-none bg-transparent rounded-bl-2xl">Cancel</button>
              <div className="w-px bg-tb-border" />
              <button onClick={signOut} className="flex-1 px-4 py-3 text-[13px] font-semibold text-tb-red hover:bg-tb-red-soft transition-colors cursor-pointer border-none bg-transparent rounded-br-2xl">Sign out</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
