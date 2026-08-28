"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getCurrentUser,
  listTickets,
  listNotifications,
  type Profile,
  type Ticket,
  type NotificationItem,
} from "@/lib/api";
import {
  ArrowRight,
  Bell,
  BookOpen,
  ChevronRight,
  FileText,
  Inbox as InboxIcon,
  Key,
  LifeBuoy,
  Lock,
  Mail,
  Settings,
  Shield,
  Sliders,
  UserIcon,
  User,
  User2Icon,
  Zap,
} from "lucide-react";
import { Skeleton } from "@/components/ui/Skeleton";
import { Tooltip } from "@/components/ui/Tooltip";
import { useI18n, translateNotifText } from "@/lib/i18n";
import { LOCALES } from "@/lib/locales";

function initialsOf(name: string | null | undefined): string {
  if (!name) return "?";
  const p = name.trim().split(/\s+/);
  return p.length === 1
    ? p[0].slice(0, 2).toUpperCase()
    : (p[0][0] + p[p.length - 1][0]).toUpperCase();
}

function greetingOf(t: (k: string) => string): string {
  const h = new Date().getHours();
  if (h < 5) return t("overview.goodNight");
  if (h < 12) return t("overview.goodMorning");
  if (h < 17) return t("overview.goodAfternoon");
  if (h < 21) return t("overview.goodEvening");
  return t("overview.goodNight");
}

export default function OverviewPage() {
  const router = useRouter();
  const { t, lang } = useI18n();
  const [user, setUser] = useState<Profile | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [totalNotifs, setTotalNotifs] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getCurrentUser().then(setUser).catch(() => {}),
      listTickets({ limit: 5 }).then((r) => setTickets(Array.isArray(r?.data) ? r.data : [])).catch(() => {}),
      listNotifications(10, 0)
        .then((r) => { setNotifications(Array.isArray(r?.notifications) ? r.notifications : []); setTotalNotifs(r?.total ?? 0); })
        .catch(() => {}),
    ]).finally(() => setLoading(false));
  }, []);

  const unread = (Array.isArray(notifications) ? notifications : []).filter((n) => !n?.read).length;
  const openTickets = (Array.isArray(tickets) ? tickets : []).filter((t) => t?.status === "open").length;

  const locale = LOCALES[lang] ?? LOCALES.en;

  const timeAgo = (iso: string) => {
    const d = new Date(iso);
    const diff = Date.now() - d.getTime();
    if (diff < 60_000) return t("common.justNow");
    if (diff < 3600_000) return t("common.agoM", { n: Math.floor(diff / 60_000) });
    if (diff < 86400_000) return t("common.agoH", { n: Math.floor(diff / 3600_000) });
    if (diff < 172800_000) return t("common.yesterday");
    return new Intl.DateTimeFormat(locale, { month: "short", day: "numeric" }).format(d);
  };

  const fullDate = (iso: string) =>
    new Intl.DateTimeFormat(locale, {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(new Date(iso));

  const quickActions = [
    { icon: <InboxIcon size={16} />, label: t("overview.qInbox"), desc: t("overview.qInboxDesc"), href: "/account/inbox" },
    { icon: <User size={16} />, label: t("overview.qProfile"), desc: t("overview.qProfileDesc"), href: "/account/profile" },
    { icon: <Lock size={16} />, label: t("overview.qSecurity"), desc: t("overview.qSecurityDesc"), href: "/account/security" },
    { icon: <LifeBuoy size={16} />, label: t("overview.qSupport"), desc: t("overview.qSupportDesc"), href: "/support/tickets" },
  ];

  const allSections = [
    { icon: <Sliders size={14} />, label: t("overview.sPrefs"), desc: t("overview.sPrefsDesc"), href: "/account/preferences" },
    { icon: <Bell size={14} />, label: t("overview.sNotif"), desc: t("overview.sNotifDesc"), href: "/account/notifications" },
    { icon: <Shield size={14} />, label: t("overview.sApps"), desc: t("overview.sAppsDesc"), href: "/account/apps" },
    { icon: <FileText size={14} />, label: t("overview.sPrivacy"), desc: t("overview.sPrivacyDesc"), href: "/account/privacy" },
    { icon: <Key size={14} />, label: t("overview.sSessions"), desc: t("overview.sSessionsDesc"), href: "/account/sessions" },
    { icon: <Settings size={14} />, label: t("overview.sHistory"), desc: t("overview.sHistoryDesc"), href: "/activity/history" },
  ];

  const today = new Intl.DateTimeFormat(locale, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date());

  return (
    <div className="page-stack">
      {/* ── Page Header ── */}
      <div className="page-header">
        <div className="page-header-row">
          <div className="page-header-left">
            <h1 className="page-header-title">{t("search.overview")}</h1>
            <p className="page-header-description">{t("overview.subtitle")}</p>
          </div>
        </div>
      </div>

      {/* ── Welcome Hero ── */}
      {loading ? (
        <div className="dashboard-card" style={{ padding: 28 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <Skeleton width={52} height={52} borderRadius="50%" />
            <div>
              <Skeleton width={220} height={22} style={{ marginBottom: 6 }} />
              <Skeleton width={160} height={13} />
            </div>
          </div>
        </div>
      ) : (
        <div
          className="dashboard-card"
          style={{ padding: 26, position: "relative", overflow: "hidden" }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 16, position: "relative" }}>
            <div
              className="sidebar-user-avatar"
              style={{
                width: 52,
                height: 52,
                fontSize: 18,
                border: "2px solid var(--tb-border)",
                boxShadow: "0 4px 14px rgba(0,0,0,0.18)",
              }}
            >
              {user?.photoUrl ? (
                <img
                  src={user.photoUrl}
                  alt=""
                  style={{
                    width: "100%",
                    height: "100%",
                    borderRadius: "50%",
                    objectFit: "cover",
                  }}
                />
              ) : (
                initialsOf(user?.name ?? user?.email)
              )}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                  color: "var(--tb-text-muted)",
                }}
              >
                <User2Icon size={12} />
                {t("overview.welcomeBack")}
              </div>
              <h2
                style={{
                  fontSize: 20,
                  fontWeight: 700,
                  margin: "3px 0 0",
                  color: "var(--tb-text-primary)",
                }}
              >
                {greetingOf(t)}
                {user?.name ? `, ${user.name.split(" ")[0]}` : ""}
              </h2>
              <p
                style={{
                  fontSize: 13,
                  color: "var(--tb-text-muted)",
                  margin: "2px 0 0",
                }}
              >
                {today}
              </p>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={() => router.push("/account/inbox")}
                className="btn btn-ghost btn-sm"
                style={{ fontSize: 12, padding: "6px 12px" }}
              >
                {t("overview.openInbox")}
              </button>
              <button
                onClick={() => router.push("/support/tickets")}
                className="btn btn-ghost btn-sm"
                style={{ fontSize: 12, padding: "6px 12px" }}
              >
                {t("overview.openTickets")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Stats Row ── */}
      {loading ? (
        <div className="tb-grid-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="dashboard-card" style={{ padding: "14px 16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <Skeleton width={32} height={32} borderRadius={8} />
                <div>
                  <Skeleton width={70} height={10} style={{ marginBottom: 4 }} />
                  <Skeleton width={28} height={18} />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="tb-grid-3">
          {[
            {
              icon: <Mail size={15} />,
              label: t("overview.statUnread"),
              value: unread,
              accent: unread > 0,
              href: "/account/inbox",
              tip: `${unread} ${t("overview.statUnread").toLowerCase()}`,
            },
            {
              icon: <LifeBuoy size={15} />,
              label: t("overview.statOpenTickets"),
              value: openTickets,
              accent: openTickets > 0,
              href: "/support/tickets",
              tip: `${openTickets} ${t("overview.statOpenTickets").toLowerCase()}`,
            },
            {
              icon: <Bell size={15} />,
              label: t("overview.statTotalNotif"),
              value: totalNotifs,
              accent: false,
              href: "/account/inbox",
              tip: `${totalNotifs} ${t("notif.total").toLowerCase()}`,
            },
          ].map((stat) => (
            <Tooltip key={stat.label} label={stat.tip} side="bottom">
              <button
                onClick={() => router.push(stat.href)}
                className="dashboard-card"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "14px 16px",
                  cursor: "pointer",
                  textAlign: "left",
                  border: "1px solid var(--tb-border)",
                  transition: "border-color 120ms, transform 120ms",
                  fontFamily: "inherit",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.borderColor = "var(--tb-border-strong)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.borderColor = "var(--tb-border)")
                }
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    background: "var(--tb-surface-3)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    color: stat.accent
                      ? "var(--tb-text-primary)"
                      : "var(--tb-text-muted)",
                  }}
                >
                  {stat.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 500,
                      color: "var(--tb-text-muted)",
                      letterSpacing: "0.02em",
                    }}
                  >
                    {stat.label}
                  </div>
                  <div
                    style={{
                      fontSize: 20,
                      fontWeight: 700,
                      color: stat.accent
                        ? "var(--tb-text-primary)"
                        : "var(--tb-text-secondary)",
                      lineHeight: 1.2,
                      marginTop: 2,
                    }}
                  >
                    {stat.value}
                  </div>
                </div>
                <ChevronRight
                  size={14}
                  style={{ color: "var(--tb-text-disabled)", flexShrink: 0 }}
                />
              </button>
            </Tooltip>
          ))}
        </div>
      )}

      {/* ── Quick Actions ── */}
      <div className="dashboard-card">
        <h3
          className="section-title"
          style={{ display: "flex", alignItems: "center", gap: 8 }}
        >
          <Zap size={15} />
          {t("overview.quickTitle")}
        </h3>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 10,
          }}
        >
          {quickActions.map((a) => (
            <Tooltip key={a.href} label={`${t("common.viewAll")} → ${a.label}`}>
              <button
                onClick={() => router.push(a.href)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "12px 14px",
                  borderRadius: 10,
                  border: "1px solid var(--tb-border)",
                  background: "transparent",
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "all 120ms",
                  fontFamily: "inherit",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "var(--tb-border-strong)";
                  e.currentTarget.style.background = "var(--tb-surface-2)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "var(--tb-border)";
                  e.currentTarget.style.background = "transparent";
                }}
              >
                <div
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: 7,
                    background: "var(--tb-surface-3)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    color: "var(--tb-text-muted)",
                  }}
                >
                  {a.icon}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 500,
                      color: "var(--tb-text-primary)",
                    }}
                  >
                    {a.label}
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: "var(--tb-text-muted)",
                      marginTop: 1,
                    }}
                  >
                    {a.desc}
                  </div>
                </div>
                <ArrowRight
                  size={13}
                  style={{ color: "var(--tb-text-disabled)", flexShrink: 0 }}
                />
              </button>
            </Tooltip>
          ))}
        </div>
      </div>

      {/* ── Recent Notifications + Tickets ── */}
      <div className="tb-grid-2">
        {/* Recent notifications */}
        <div
          className="dashboard-card"
          style={{ padding: 0, overflow: "hidden" }}
        >
          <div
            style={{
              padding: "14px 18px 10px",
              borderBottom: "1px solid var(--tb-border)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <h3
              className="section-title"
              style={{
                margin: 0,
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontSize: 14,
              }}
            >
              <Bell size={14} />
              {t("overview.recentNotif")}
            </h3>
            {unread > 0 && (
              <span className="badge badge-brand" style={{ fontSize: 10 }}>
                {unread} {t("common.new").toLowerCase()}
              </span>
            )}
          </div>
          {loading ? (
            <div style={{ padding: 0 }}>
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "10px 18px",
                    borderBottom:
                      i < 3 ? "1px solid var(--tb-border)" : "none",
                  }}
                >
                  <Skeleton
                    width={6}
                    height={6}
                    borderRadius="50%"
                  />
                  <div style={{ flex: 1 }}>
                    <Skeleton
                      width={`${55 + i * 8}%`}
                      height={12}
                      style={{ marginBottom: 4 }}
                    />
                    <Skeleton width="30%" height={9} />
                  </div>
                </div>
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <div className="empty-note" style={{ padding: 28 }}>
              {t("overview.noNotifYet")}
            </div>
          ) : (
            <div>
              {notifications.slice(0, 5).map((n) => (
                <div
                  key={n.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "9px 18px",
                    borderBottom: "1px solid var(--tb-border)",
                    cursor: n.link ? "pointer" : "default",
                    transition: "background 100ms",
                  }}
                  onClick={() => {
                    if (n.link) router.push(n.link);
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "var(--tb-surface-2)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
                >
                  <div
                    style={{
                      width: 5,
                      height: 5,
                      borderRadius: "50%",
                      background: n.read
                        ? "transparent"
                        : "var(--tb-text-primary)",
                      flexShrink: 0,
                    }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: n.read ? 400 : 500,
                        color: "var(--tb-text-primary)",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {translateNotifText(n.title, lang)}
                    </div>
                  </div>
                  <Tooltip label={fullDate(n.createdAt)} side="left">
                    <span
                      style={{
                        fontSize: 11,
                        color: "var(--tb-text-muted)",
                        flexShrink: 0,
                      }}
                    >
                      {timeAgo(n.createdAt)}
                    </span>
                  </Tooltip>
                </div>
              ))}
              <Tooltip label={t("common.viewAll")}>
                <button
                  onClick={() => router.push("/account/inbox")}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "100%",
                    padding: 9,
                    border: "none",
                    borderTop: "1px solid var(--tb-border)",
                    background: "transparent",
                    cursor: "pointer",
                    fontSize: 12,
                    fontWeight: 500,
                    color: "var(--tb-text-muted)",
                    fontFamily: "inherit",
                    transition: "background 100ms",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "var(--tb-surface-2)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
                >
                  {t("common.viewAll")}{" "}
                  <ChevronRight size={13} style={{ marginLeft: 2 }} />
                </button>
              </Tooltip>
            </div>
          )}
        </div>

        {/* Recent tickets */}
        <div
          className="dashboard-card"
          style={{ padding: 0, overflow: "hidden" }}
        >
          <div
            style={{
              padding: "14px 18px 10px",
              borderBottom: "1px solid var(--tb-border)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <h3
              className="section-title"
              style={{
                margin: 0,
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontSize: 14,
              }}
            >
              <LifeBuoy size={14} />
              {t("overview.recentTickets")}
            </h3>
            <Tooltip label={t("common.new")}>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => router.push("/support/tickets/new")}
                style={{ fontSize: 11, padding: "3px 8px" }}
              >
                + {t("common.new")}
              </button>
            </Tooltip>
          </div>
          {loading ? (
            <div style={{ padding: 0 }}>
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "10px 18px",
                    borderBottom:
                      i < 2 ? "1px solid var(--tb-border)" : "none",
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <Skeleton
                      width={`${50 + i * 10}%`}
                      height={12}
                      style={{ marginBottom: 4 }}
                    />
                    <Skeleton width="20%" height={9} />
                  </div>
                  <Skeleton width={40} height={18} borderRadius={10} />
                </div>
              ))}
            </div>
          ) : tickets.length === 0 ? (
            <div className="empty-note" style={{ padding: 28 }}>
              {t("overview.noTicketsYet")}
            </div>
          ) : (
            <div>
              {tickets.slice(0, 5).map((ticket) => (
                <div
                  key={ticket.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "9px 18px",
                    borderBottom: "1px solid var(--tb-border)",
                    cursor: "pointer",
                    transition: "background 100ms",
                  }}
                  onClick={() => router.push(`/support/tickets/${ticket.id}`)}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "var(--tb-surface-2)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 500,
                        color: "var(--tb-text-primary)",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {ticket.subject}
                    </div>
                    <Tooltip label={`${t("nav.tickets")} ${ticket.id}`} side="left">
                      <div
                        style={{
                          fontSize: 11,
                          color: "var(--tb-text-muted)",
                          marginTop: 1,
                        }}
                      >
                        {ticket.id.slice(0, 8)}
                      </div>
                    </Tooltip>
                  </div>
                  <span
                    className={`badge ${
                      ticket.status === "open" ? "badge-success" : "badge-neutral"
                    }`}
                    style={{ fontSize: 10, padding: "2px 7px" }}
                  >
                    {ticket.status}
                  </span>
                </div>
              ))}
              <Tooltip label={t("common.viewAll")}>
                <button
                  onClick={() => router.push("/support/tickets")}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "100%",
                    padding: 9,
                    border: "none",
                    borderTop: "1px solid var(--tb-border)",
                    background: "transparent",
                    cursor: "pointer",
                    fontSize: 12,
                    fontWeight: 500,
                    color: "var(--tb-text-muted)",
                    fontFamily: "inherit",
                    transition: "background 100ms",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "var(--tb-surface-2)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
                >
                  {t("common.viewAll")}{" "}
                  <ChevronRight size={13} style={{ marginLeft: 2 }} />
                </button>
              </Tooltip>
            </div>
          )}
        </div>
      </div>

      {/* ── All Sections ── */}
      <div className="dashboard-card">
        <h3
          className="section-title"
          style={{ display: "flex", alignItems: "center", gap: 8 }}
        >
          <BookOpen size={14} />
          {t("overview.allSections")}
        </h3>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: 8,
          }}
        >
          {allSections.map((s) => (
            <Tooltip key={s.href} label={s.desc}>
              <button
                onClick={() => router.push(s.href)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "10px 12px",
                  borderRadius: 8,
                  border: "1px solid var(--tb-border)",
                  background: "transparent",
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "all 120ms",
                  fontFamily: "inherit",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "var(--tb-surface-2)";
                  e.currentTarget.style.borderColor = "var(--tb-border-strong)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.borderColor = "var(--tb-border)";
                }}
              >
                <span style={{ color: "var(--tb-text-muted)", flexShrink: 0 }}>
                  {s.icon}
                </span>
                <div style={{ minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 500,
                      color: "var(--tb-text-primary)",
                    }}
                  >
                    {s.label}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: "var(--tb-text-muted)",
                      marginTop: 1,
                    }}
                  >
                    {s.desc}
                  </div>
                </div>
              </button>
            </Tooltip>
          ))}
        </div>
      </div>
    </div>
  );
}
