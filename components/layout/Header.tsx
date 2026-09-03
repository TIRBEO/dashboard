"use client";

import { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useThemeToggle } from "@tirbeo/theme";
import {
  Bell, LogOut, Menu, Moon,
  Settings, Sun, User, X,
} from "lucide-react";
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
  const userMenuRef = useRef<HTMLDivElement>(null);

  const isAdmin = !!user?.adminRole;
  const roleLabel = (user?.adminRole || "").replace(/_/g, " ").toUpperCase();

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) setUserMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (!userMenuOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setUserMenuOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [userMenuOpen]);

  return (
    <>
      {/* Floating mobile menu button */}
      <button type="button" className="fixed top-4 left-4 z-50 lg:hidden flex items-center justify-center w-10 h-10 rounded-full border-none bg-tb-surface-1/80 backdrop-blur-md cursor-pointer text-tb-text-secondary transition-all duration-200 shadow-[0_2px_12px_rgba(0,0,0,0.15)] hover:bg-tb-surface-2 hover:text-tb-text-primary active:scale-95" onClick={onToggleMobile} aria-label={t("header.menu")}>
        {mobileOpen ? <X size={18} /> : <Menu size={18} />}
      </button>

      {/* Floating top-right icons */}
      <div className="fixed top-4 right-4 z-50 flex items-center gap-1.5">
        {/* Notification bell */}
        <Tip label={t("header.notifications")}>
          <button type="button" className="flex items-center justify-center w-10 h-10 rounded-full border-none bg-tb-surface-1/80 backdrop-blur-md cursor-pointer text-tb-text-secondary transition-all duration-200 relative shadow-[0_2px_12px_rgba(0,0,0,0.15)] hover:bg-tb-surface-2 hover:text-tb-text-primary active:scale-95" onClick={onToggleNotif} aria-label={t("header.notifications")}>
            <Bell size={18} />
            {unread > 0 && <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-tb-red text-white text-[10px] font-semibold leading-[18px] text-center pointer-events-none">{unread > 99 ? "99+" : unread}</span>}
          </button>
        </Tip>

        {/* Theme toggle */}
        <Tip label={isDark ? t("header.switchToLight") : t("header.switchToDark")}>
          <button type="button" className="flex items-center justify-center w-10 h-10 rounded-full border-none bg-tb-surface-1/80 backdrop-blur-md cursor-pointer text-tb-text-secondary transition-all duration-200 relative shadow-[0_2px_12px_rgba(0,0,0,0.15)] hover:bg-tb-surface-2 hover:text-tb-text-primary active:scale-95" onClick={() => toggle()} aria-label={isDark ? t("header.switchToLight") : t("header.switchToDark")}>
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </Tip>

        {/* Profile avatar */}
        <div ref={userMenuRef} className="relative">
          <Tip label={t("header.account")}>
            <button type="button" className="p-0 bg-transparent border-none cursor-pointer rounded-full transition-transform duration-200 inline-flex items-center justify-center w-10 h-10 leading-none hover:scale-105 shadow-[0_2px_12px_rgba(0,0,0,0.15)]" onClick={() => setUserMenuOpen(!userMenuOpen)} aria-label={t("header.account")}>
              <div className="w-10 h-10 rounded-full bg-tb-surface-3 flex items-center justify-center text-xs font-semibold text-tb-text-secondary overflow-hidden border-2 border-tb-border transition-all duration-200 shrink-0 cursor-pointer">
                {user?.photoUrl ? <img src={user.photoUrl} alt="" referrerPolicy="no-referrer" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} /> : initialsOf(user?.name ?? user?.email)}
              </div>
            </button>
          </Tip>
          {userMenuOpen && (
            <>
              <div className="hdr-menu-backdrop" onClick={() => setUserMenuOpen(false)} />
              <div className="hdr-popover" role="menu">
                <div className="hdr-popover-head">
                  <div className="sb-avatar w-[38px] h-[38px]">
                    {user?.photoUrl ? <img src={user.photoUrl} alt="" referrerPolicy="no-referrer" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} /> : initialsOf(user?.name ?? user?.email)}
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
    </>
  );
}
