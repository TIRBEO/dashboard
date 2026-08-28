"use client";

import Link from "next/link";
import {
  Building, Clock, Eye, FileText, Home, Inbox, LifeBuoy,
  Lock, LogOut, Mail, Monitor, Sliders, User,
} from "lucide-react";
import type { Profile, NavSection } from "@/lib/types";
import type { I18nT } from "@/lib/i18n";

export function buildNavSections(
  badgeCounts: Record<string, number>,
  t: I18nT,
): NavSection[] {
  return [
    {
      section: t("nav.workspace"),
      items: [
        { label: t("nav.getStarted"), href: "/overview", icon: <Home size={16} /> },
        { label: t("nav.inbox"), href: "/account/inbox", icon: <Mail size={16} />, badge: badgeCounts.inbox },
        { label: "Forms", href: process.env.NEXT_PUBLIC_FORMS_URL || "https://forms.tirbeo.app", icon: <FileText size={16} />, external: true },
      ],
    },
    {
      section: t("nav.account"),
      items: [
        { label: t("nav.profile"), href: "/account/profile", icon: <User size={16} /> },
        { label: t("nav.preferences"), href: "/account/preferences", icon: <Sliders size={16} /> },
        { label: t("nav.notifications"), href: "/account/notifications", icon: <Inbox size={16} /> },
        { label: t("nav.connectedApps"), href: "/account/apps", icon: <Building size={16} /> },
        { label: t("nav.security"), href: "/account/security", icon: <Lock size={16} /> },
        { label: t("nav.privacy"), href: "/account/privacy", icon: <Eye size={16} /> },
        { label: t("nav.sessions"), href: "/account/sessions", icon: <Monitor size={16} /> },
        { label: t("nav.history"), href: "/activity/history", icon: <Clock size={16} /> },
      ],
    },
    {
      section: t("nav.support"),
      items: [
        { label: t("nav.tickets"), href: "/support/tickets", icon: <LifeBuoy size={16} />, badge: badgeCounts.tickets },
      ],
    },
  ];
}

export function initialsOf(name: string | null | undefined): string {
  if (!name) return "?";
  const p = name.trim().split(/\s+/);
  return p.length === 1 ? p[0].slice(0, 2).toUpperCase() : (p[0][0] + p[p.length - 1][0]).toUpperCase();
}

interface SidebarProps {
  user: Profile | null;
  navSections: NavSection[];
  badgePulse: boolean;
  isActive: (href: string) => boolean;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  onSignOut: () => void;
  t: I18nT;
}

export function Sidebar({
  user,
  navSections,
  badgePulse,
  isActive,
  mobileOpen,
  onCloseMobile,
  onSignOut,
  t,
}: SidebarProps) {
  const isAdmin = !!user?.adminRole;
  const roleLabel = (user?.adminRole || "").replace(/_/g, " ").toUpperCase();

    return (
    <aside className={`sb ${mobileOpen ? "open" : ""}`}>
      <div className="sb-head">
        <Link href="/overview" className="sb-brand" onClick={onCloseMobile}>
            <img src="/logo.png" alt="Tirbeo" className="sb-logo-img" />
          <span className="sb-name">Tirbeo</span>
        </Link>
      </div>

      <nav className="sb-nav">
        {navSections.map((section) => (
          <div key={section.section} className="sb-section">
            <div className="sb-label">{section.section}</div>
            <div className="sb-items">
              {section.items.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`sb-item ${active ? "active" : ""}`}
                    aria-current={active ? "page" : undefined}
                    onClick={onCloseMobile}
                    target={item.external ? "_blank" : undefined}
                    rel={item.external ? "noopener noreferrer" : undefined}
                  >
                    <span className="sb-item-icon">{item.icon}</span>
                    <span className="sb-item-label">{item.label}</span>
                    {item.badge && item.badge > 0 && (
                      <span className={`sb-badge ${badgePulse && item.href === "/account/inbox" ? "pulse" : ""}`}>
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

      <div className="sb-foot">
        <div className="sb-user">
          <div className="sb-avatar">
            {user?.photoUrl ? <img src={user.photoUrl} alt="" /> : initialsOf(user?.name ?? user?.email)}
          </div>
            <div className="sb-user-info">
              <div className="sb-user-name">
                <span>{user?.name ?? t("header.user")}</span>
                {isAdmin && <span className="sb-role">{roleLabel}</span>}
              </div>
              <div className="sb-user-email">{user?.email}</div>
            </div>
          <button type="button" className="sb-logout" onClick={onSignOut} aria-label={t("header.signOut")} title={t("header.signOut")}>
              <LogOut size={14} />
            </button>
        </div>
      </div>
    </aside>
  );
}
