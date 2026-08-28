"use client";

import { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useThemeToggle } from "@tirbeo/theme";
import {
  Bell, Calendar, ChevronDown, LogOut, Menu, Moon,
  Search, Settings, Sun, User, X,
} from "lucide-react";
import { MonthCalendar } from "@/components/ui/MonthCalendar";
import type { Profile } from "@/lib/types";
import type { I18nT } from "@/lib/i18n";
import { initialsOf } from "@/components/layout/Sidebar";

/* ── Tooltip ─────────────────────────────────────────────────── */

function Tip({ label, children }: { label: string; children: React.ReactNode }) {
  const [show, setShow] = useState(false);
  return (
    <div className="hdr-tip-wrap" onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
      {children}
      {show && <span className="hdr-tip">{label}</span>}
    </div>
  );
}

/* ── Header component ──────────────────────────────────────── */

interface HeaderProps {
  user: Profile | null;
  unread: number;
  badgePulse: boolean;
  mobileOpen: boolean;
  onToggleMobile: () => void;
  onToggleNotif: () => void;
  onSignOut: () => void;
  t: I18nT;
}

export function Header({
  user,
  unread,
  badgePulse,
  mobileOpen,
  onToggleMobile,
  onToggleNotif,
  onSignOut,
  t,
}: HeaderProps) {
  const router = useRouter();
  const { isDark, toggle } = useThemeToggle();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [calOpen, setCalOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const calRef = useRef<HTMLDivElement>(null);
  const calTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isAdmin = !!user?.adminRole;
  const roleLabel = (user?.adminRole || "").replace(/_/g, " ").toUpperCase();
  const now = new Date();
  const dateLabel = new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(now);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) setUserMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (!calOpen && !userMenuOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") { setCalOpen(false); setUserMenuOpen(false); }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [calOpen, userMenuOpen]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); setSearchOpen(p => !p); }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  const calEnter = () => { if (calTimer.current) clearTimeout(calTimer.current); setCalOpen(true); };
  const calLeave = () => { calTimer.current = setTimeout(() => setCalOpen(false), 250); };

  const [q, setQ] = useState("");
  const searchPages: Array<[string, string, string]> = [
    [t("nav.profile"), "/account/profile", "profile user account"],
    [t("nav.preferences"), "/account/preferences", "preferences settings language"],
    [t("nav.notifications"), "/account/notifications", "notifications email push"],
    [t("nav.security"), "/account/security", "security 2fa password passkey"],
    [t("nav.privacy"), "/account/privacy", "privacy data consent"],
    [t("nav.sessions"), "/account/sessions", "sessions devices"],
    [t("nav.inbox"), "/account/inbox", "inbox mail notifications"],
    [t("nav.tickets"), "/support/tickets", "tickets support help"],
    [t("nav.history"), "/activity/history", "history activity timeline"],
    [t("nav.connectedApps"), "/account/apps", "apps connected oauth"],
    [t("search.overview"), "/overview", "overview dashboard home"],
  ];
  const filteredPages = (() => {
    const toks = q.trim().toLowerCase().split(/\s+/).filter(Boolean);
    if (toks.length === 0) return searchPages;
    return searchPages.filter(([title, href, kw]) => {
      const hay = `${title} ${href} ${kw}`.toLowerCase();
      return toks.every(tok => hay.includes(tok));
    });
  })();

  return (
    <>
      <header className="hdr">
        <div className="hdr-left">
          <button type="button" className="hdr-mobile-btn" onClick={onToggleMobile} aria-label={t("header.menu")}>
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
          <button type="button" className="hdr-search" onClick={() => setSearchOpen(true)} aria-label={t("header.searchPlaceholder")}>
            <Search size={14} />
            <span className="hdr-search-text">{t("header.searchPlaceholder")}</span>
            <kbd className="hdr-kbd">&#8984;K</kbd>
          </button>
        </div>

        <div className="hdr-right">
          <Tip label={t("header.notifications")}>
            <button type="button" className="flex items-center justify-center w-9 h-9 rounded-lg border border-[var(--tb-border)] text-[var(--tb-text-muted)] transition hover:bg-[var(--tb-surface-1)] hover:border-[var(--tb-border-hover)] hover:text-[var(--tb-text-primary)]" onClick={onToggleNotif} aria-label={t("header.notifications")}>
              <Bell size={16} />
              {unread > 0 && <span className="hdr-badge">{unread > 99 ? "99+" : unread}</span>}
            </button>
          </Tip>

          <Tip label={isDark ? t("header.switchToLight") : t("header.switchToDark")}>
            <button type="button" className="flex items-center justify-center w-9 h-9 rounded-lg border border-[var(--tb-border)] text-[var(--tb-text-muted)] transition hover:bg-[var(--tb-surface-1)] hover:border-[var(--tb-border-hover)] hover:text-[var(--tb-text-primary)]" onClick={() => toggle()} aria-label={isDark ? t("header.switchToLight") : t("header.switchToDark")}>
              {isDark ? <Sun size={15} /> : <Moon size={15} />}
            </button>
          </Tip>

          <div ref={calRef} className="hdr-cal-wrap" onMouseEnter={calEnter} onMouseLeave={calLeave}>
            <button type="button" className="hdr-date" onClick={() => setCalOpen(!calOpen)} aria-label={t("header.calendar")}>
              <Calendar size={13} />
              <span>{dateLabel}</span>
              <ChevronDown size={11} style={{ transform: calOpen ? "rotate(180deg)" : "rotate(0)", transition: "transform 120ms" }} />
            </button>
            {calOpen && <div className="calendar-hover-bridge" />}
            {calOpen && <MonthCalendar onClose={() => setCalOpen(false)} />}
          </div>

          <div ref={userMenuRef} className="hdr-user-wrap">
            <button type="button" className="hdr-avatar-btn" onClick={() => setUserMenuOpen(!userMenuOpen)} aria-label={t("header.account")}>
              <div className="hdr-avatar">
                {user?.photoUrl ? <img src={user.photoUrl} alt="" /> : initialsOf(user?.name ?? user?.email)}
              </div>
            </button>
            {userMenuOpen && (
              <>
                <div className="hdr-menu-backdrop" onClick={() => setUserMenuOpen(false)} />
                <div className="hdr-popover" role="menu">
                  <div className="hdr-popover-head">
                    <div className="sb-avatar" style={{ width: 38, height: 38 }}>
                      {user?.photoUrl ? <img src={user.photoUrl} alt="" /> : initialsOf(user?.name ?? user?.email)}
                    </div>
                    <div className="hdr-popover-info">
                      <div className="hdr-popover-name">
                        {user?.name ?? t("header.user")}
                        {isAdmin && <span className="sb-role">{roleLabel}</span>}
                      </div>
                      <div className="hdr-popover-email">{user?.email ?? ""}</div>
                    </div>
                  </div>
                  <div className="hdr-popover-body">
                    <button type="button" role="menuitem" className="hdr-menu-item" onClick={() => { setUserMenuOpen(false); router.push("/account/profile"); }}>
                      <User size={14} /><span>{t("nav.profile")}</span>
                    </button>
                    <button type="button" role="menuitem" className="hdr-menu-item" onClick={() => { setUserMenuOpen(false); router.push("/account/security"); }}>
                      <Settings size={14} /><span>{t("nav.security")}</span>
                    </button>
                    <div className="hdr-menu-div" />
                    <button type="button" role="menuitem" className="hdr-menu-item" onClick={() => { setUserMenuOpen(false); router.push("/account/preferences"); }}>
                      <Settings size={14} /><span>{t("nav.preferences")}</span>
                    </button>
                    <div className="hdr-menu-div" />
                    <button type="button" role="menuitem" className="hdr-menu-item danger" onClick={() => { setUserMenuOpen(false); onSignOut(); }}>
                      <LogOut size={14} /><span>{t("header.signOut")}</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {searchOpen && (
        <div className="tb-search-overlay" onClick={() => { setSearchOpen(false); setQ(""); }}>
          <div className="tb-search-panel" onClick={e => e.stopPropagation()}>
            <div className="tb-search-input-row">
              <Search size={16} />
              <input type="text" placeholder={t("search.placeholder") || "Search pages, settings…"} autoFocus value={q} onChange={e => setQ(e.target.value)}
                onKeyDown={e => {
                  if (e.key === "Escape") { setSearchOpen(false); setQ(""); }
                  if (e.key === "Enter" && filteredPages[0]) { setSearchOpen(false); setQ(""); router.push(filteredPages[0][1]); }
                }} />
              <span className="tb-search-kbd">ESC</span>
            </div>
            <div className="tb-search-body">
              <div className="tb-search-group-wrap">
                <div className="tb-search-group">{t("search.pages")} · {filteredPages.length}</div>
                {filteredPages.length === 0 ? (
                  <div className="tb-search-empty">No results — try “security”, “inbox”, or “tickets”</div>
                ) : filteredPages.map(([title, href]) => (
                  <button key={href} className="tb-search-item" onClick={() => { setSearchOpen(false); setQ(""); router.push(href); }}>
                    <div className="tb-search-item-body">
                      <span className="tb-search-item-title">{title}</span>
                      <span className="tb-search-item-sub">{href}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
            <div className="tb-search-footer">
              <span>&uarr;&darr; {t("search.navigate")}</span><span>&#8629; {t("search.open")}</span><span>ESC {t("search.close")}</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
