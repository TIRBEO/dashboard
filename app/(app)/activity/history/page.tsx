"use client";
import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Bell,
  Clock,
  CreditCard,
  Fingerprint,
  Globe,
  KeyRound,
  LifeBuoy,
  LogIn,
  LogOut,
  Mail,
  Monitor,
  MonitorSmartphone,
  Merge,
  Shield,
  ShieldAlert,
  Smartphone,
  User,
  UserCog,
} from "lucide-react";
import { getUserActivity } from "@/lib/api";
import { Skeleton } from "@/components/ui/Skeleton";
import { useI18n } from "@/lib/i18n";

interface ActivityItem {
  id: string;
  source?: string;
  action: string;
  targetType?: string | null;
  targetId?: string | null;
  metadata?: any;
  severity?: string;
  createdAt: string;
}

type FilterType = "all" | "security" | "account" | "tickets";

interface ActionMeta {
  icon: typeof LogIn;
  color: string;
  labelKey: string;
  category: FilterType;
}

/* action token → meta. Matched by "includes" against the raw action/eventType. */
const ACTIONS: Array<ActionMeta & { match: string[] }> = [
  { match: ["login_failed", "auth.login_failed"], icon: ShieldAlert, color: "#ef4444", labelKey: "history.act.loginFailed", category: "security" },
  { match: ["suspicious", "denied", "blocked"], icon: ShieldAlert, color: "#ef4444", labelKey: "history.act.suspiciousLoginDenied", category: "security" },
  { match: ["login_2fa", "auth.login_2fa"], icon: KeyRound, color: "#10b981", labelKey: "history.act.login2fa", category: "security" },
  { match: ["login_otp", "auth.login_otp", "suspicious_login_otp"], icon: KeyRound, color: "#10b981", labelKey: "history.act.loginOtp", category: "security" },
  { match: ["backup_code", "auth.login_recovery_2fa"], icon: KeyRound, color: "#8b5cf6", labelKey: "history.act.backupCodesRegenerated", category: "security" },
  { match: ["recovery_email", "auth.login_recovery_email"], icon: Mail, color: "#3b82f6", labelKey: "history.act.recoveryEmailVerified", category: "security" },
  { match: ["magic_link", "auth.login_magic_link"], icon: Mail, color: "#3b82f6", labelKey: "history.act.loginOtp", category: "security" },
  { match: ["passkey.authenticated", "passkey_authenticated", "cli_login", "CLI_LOGIN"], icon: Fingerprint, color: "#8b5cf6", labelKey: "history.act.passkeyAuth", category: "security" },
  { match: ["user.login", "auth.login_success", "login_success", "auth.login_password"], icon: LogIn, color: "#10b981", labelKey: "history.act.login", category: "security" },
  { match: ["logout", "session.revoked_all", "sessions_revoked"], icon: LogOut, color: "#6b7280", labelKey: "history.act.sessionsRevokedAll", category: "security" },
  { match: ["session.revoked"], icon: LogOut, color: "#ef4444", labelKey: "history.act.sessionRevoked", category: "security" },
  { match: ["device.seen", "device_seen"], icon: MonitorSmartphone, color: "#3b82f6", labelKey: "history.act.deviceSeen", category: "security" },
  { match: ["password.reset", "password_reset"], icon: KeyRound, color: "#f59e0b", labelKey: "history.act.passwordReset", category: "security" },
  { match: ["password.changed", "password_changed"], icon: KeyRound, color: "#f59e0b", labelKey: "history.act.passwordChanged", category: "security" },
  { match: ["backup_codes"], icon: KeyRound, color: "#f59e0b", labelKey: "history.act.backupCodesRegenerated", category: "security" },
  { match: ["2fa.enabled", "totp.enabled", "2fa_enabled"], icon: Shield, color: "#10b981", labelKey: "history.act.twofaEnabled", category: "security" },
  { match: ["2fa.disabled", "totp.disabled", "2fa_disabled"], icon: Shield, color: "#ef4444", labelKey: "history.act.twofaDisabled", category: "security" },
  { match: ["passkey.registered"], icon: Fingerprint, color: "#8b5cf6", labelKey: "history.act.passkeyRegistered", category: "security" },
  { match: ["passkey.deleted"], icon: Fingerprint, color: "#ef4444", labelKey: "history.act.passkeyDeleted", category: "security" },
  { match: ["recovery_email.verified"], icon: Mail, color: "#10b981", labelKey: "history.act.recoveryEmailVerified", category: "account" },
  { match: ["recovery_email.updated"], icon: Mail, color: "#3b82f6", labelKey: "history.act.recoveryEmailUpdated", category: "account" },
  { match: ["recovery_email.removed"], icon: Mail, color: "#ef4444", labelKey: "history.act.recoveryEmailUpdated", category: "account" },
  { match: ["phone.added"], icon: Smartphone, color: "#3b82f6", labelKey: "history.act.phoneAdded", category: "account" },
  { match: ["phone.verified"], icon: Smartphone, color: "#10b981", labelKey: "history.act.phoneVerified", category: "account" },
  { match: ["phone.removed"], icon: Smartphone, color: "#ef4444", labelKey: "history.act.phoneRemoved", category: "account" },
  { match: ["email_verified", "email.verified"], icon: Mail, color: "#10b981", labelKey: "history.act.emailVerified", category: "account" },
  { match: ["merge.login"], icon: Merge, color: "#8b5cf6", labelKey: "history.act.mergeLogin", category: "account" },
  { match: ["merge"], icon: Merge, color: "#8b5cf6", labelKey: "history.act.oauthMerged", category: "account" },
  { match: ["avatar", "photoUrl"], icon: User, color: "#8b5cf6", labelKey: "history.act.avatarUpdated", category: "account" },
  { match: ["username"], icon: UserCog, color: "#8b5cf6", labelKey: "history.act.usernameUpdated", category: "account" },
  { match: ["profile.updated", "profile_updated", "user.updated"], icon: UserCog, color: "#8b5cf6", labelKey: "history.act.profileUpdated", category: "account" },
  { match: ["data_export", "DATA_EXPORT"], icon: CreditCard, color: "#3b82f6", labelKey: "history.act.dataExportRequested", category: "account" },
  { match: ["DELETE_ACCOUNT", "account_deleted"], icon: AlertTriangle, color: "#ef4444", labelKey: "history.act.deleteAccountRequested", category: "account" },
  { match: ["user.created", "signup"], icon: User, color: "#10b981", labelKey: "history.act.signup", category: "account" },
  { match: ["ticket.created", "TICKET_CREATED"], icon: LifeBuoy, color: "#3b82f6", labelKey: "history.act.ticketCreated", category: "tickets" },
  { match: ["ticket.replied", "TICKET_REPLIED"], icon: Mail, color: "#10b981", labelKey: "history.act.ticketReplied", category: "tickets" },
  { match: ["ticket.closed", "TICKET_CLOSED"], icon: LifeBuoy, color: "#6b7280", labelKey: "history.act.ticketClosed", category: "tickets" },
];

function getActionMeta(action: string): ActionMeta {
  const lower = (action || "").toLowerCase();
  for (const rule of ACTIONS) {
    for (const token of rule.match) {
      if (lower.includes(token.toLowerCase())) {
        return { icon: rule.icon, color: rule.color, labelKey: rule.labelKey, category: rule.category };
      }
    }
  }
  return { icon: Bell, color: "var(--tb-text-muted)", labelKey: "history.act.unknown", category: "account" };
}

function categorize(action: string): FilterType {
  return getActionMeta(action).category;
}

/* ── Device parsing from user-agent ── */
function parseDevice(ua?: string): string | null {
  if (!ua) return null;
  let browser = "Unknown browser";
  if (/edg\//i.test(ua)) browser = "Edge";
  else if (/opr\/|opera/i.test(ua)) browser = "Opera";
  else if (/chrome|crios/i.test(ua)) browser = "Chrome";
  else if (/firefox|fxios/i.test(ua)) browser = "Firefox";
  else if (/safari/i.test(ua)) browser = "Safari";

  let os = "Unknown OS";
  if (/windows/i.test(ua)) os = "Windows";
  else if (/android/i.test(ua)) os = "Android";
  else if (/iphone|ipad|ipod/i.test(ua)) os = "iOS";
  else if (/mac os x|macintosh/i.test(ua)) os = "macOS";
  else if (/linux/i.test(ua)) os = "Linux";

  return `${browser} · ${os}`;
}

const METHOD_LABELS: Record<string, string> = {
  password: "Password",
  magic_link: "Magic link",
  totp: "Authenticator app",
  otp: "One-time code",
  passkey: "Passkey",
  admin_password: "Admin password",
  backup_code: "Backup code",
  recovery_email: "Recovery email",
  google: "Google",
  github: "GitHub",
  discord: "Discord",
};

/* Human detail chips built from metadata */
function buildDetails(item: ActivityItem): Array<{ key: string; value: string }> {
  const m = item.metadata || {};
  const chips: Array<{ key: string; value: string }> = [];

  const method = typeof m.method === "string" ? m.method : m.reason === "password" ? "password" : undefined;
  if (method && METHOD_LABELS[method.toLowerCase()]) {
    chips.push({ key: "method", value: METHOD_LABELS[method.toLowerCase()] });
  }
  if (typeof m.provider === "string") {
    chips.push({ key: "provider", value: m.provider.charAt(0).toUpperCase() + m.provider.slice(1) });
  }
  if (typeof m.email === "string" && m.email) {
    chips.push({ key: "email", value: m.email });
  }
  const ip = typeof m.ip === "string" ? m.ip : typeof m.ipAddress === "string" ? m.ipAddress : undefined;
  if (ip) chips.push({ key: "ip", value: ip });
  const device = parseDevice(typeof m.userAgent === "string" ? m.userAgent : undefined);
  if (device) chips.push({ key: "device", value: device });
  if (Array.isArray(m.fields) && m.fields.length > 0) {
    chips.push({ key: "fields", value: m.fields.slice(0, 3).join(", ") });
  }
  if (typeof m.reason === "string" && !METHOD_LABELS[m.reason] && m.reason !== method) {
    chips.push({ key: "reason", value: m.reason.replace(/_/g, " ") });
  }
  return chips;
}

function timeAgo(iso: string, t: (k: string, vars?: Record<string, string | number>) => string) {
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  if (diff < 60_000) return t("common.justNow");
  if (diff < 3600_000) return t("common.agoM", { n: Math.floor(diff / 60_000) });
  if (diff < 86400_000) return t("common.agoH", { n: Math.floor(diff / 3600_000) });
  if (diff < 172800_000) return t("common.yesterday");
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function fullDate(iso: string, lang: string) {
  return new Date(iso).toLocaleString(lang, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function dayLabel(iso: string, lang: string, t: (k: string) => string): string {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date(Date.now() - 86_400_000);
  const sameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

  if (sameDay(d, today)) return t("history.today");
  if (sameDay(d, yesterday)) return t("common.yesterday");
  return d.toLocaleDateString(lang, { weekday: "long", month: "long", day: "numeric", year: "numeric" });
}

export default function HistoryPage() {
  const { t, lang } = useI18n();
  const [items, setItems] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>("all");

  useEffect(() => {
    getUserActivity(80)
      .then((r) => setItems(Array.isArray(r) ? r : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(
    () =>
      items.filter((item) => {
        if (filter === "all") return true;
        return categorize(item.action) === filter;
      }),
    [items, filter],
  );

  /* Group by calendar day */
  const groups = useMemo(() => {
    const out: Array<{ label: string; items: ActivityItem[] }> = [];
    for (const item of filtered) {
      const label = dayLabel(item.createdAt, lang, t);
      const last = out[out.length - 1];
      if (last && last.label === label) last.items.push(item);
      else out.push({ label, items: [item] });
    }
    return out;
  }, [filtered, lang, t]);

  const tabs: Array<{ key: FilterType; label: string; count: number }> = [
    { key: "all", label: t("history.tabAll"), count: items.length },
    { key: "security", label: t("history.tabSecurity"), count: items.filter((i) => categorize(i.action) === "security").length },
    { key: "account", label: t("history.tabAccount"), count: items.filter((i) => categorize(i.action) === "account").length },
    { key: "tickets", label: t("history.tabTickets"), count: items.filter((i) => categorize(i.action) === "tickets").length },
  ];

  return (
    <div className="page-stack">
      <div className="page-header">
        <div className="page-header-row">
          <div className="page-header-left">
            <h1 className="page-header-title">{t("history.title")}</h1>
            <p className="page-header-description">{t("history.subtitle")}</p>
          </div>
        </div>
      </div>

      <section className="activity-card">
        <div className="activity-tabs" role="tablist">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={filter === tab.key}
              className={`activity-tab ${filter === tab.key ? "active" : ""}`}
              onClick={() => setFilter(tab.key)}
            >
              <span>{tab.label}</span>
              {tab.count > 0 && <span className="activity-tab-count">{tab.count}</span>}
            </button>
          ))}
        </div>

        {loading ? (
          <div aria-hidden="true">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="activity-skeleton-row">
                <Skeleton width={34} height={34} borderRadius={10} />
                <div style={{ flex: 1 }}>
                  <Skeleton width={`${38 + i * 6}%`} height={13} style={{ marginBottom: 5 }} />
                  <Skeleton width="30%" height={10} />
                </div>
                <Skeleton width={56} height={10} />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="activity-empty">
            <div className="activity-empty-icon">
              <Clock size={22} />
            </div>
            <p className="activity-empty-title">{t("history.noActivity")}</p>
            <p className="activity-empty-desc">{t("history.noActivityDesc")}</p>
          </div>
        ) : (
          groups.map((group) => (
            <div key={group.label}>
              <div className="activity-day-header">
                <span>{group.label}</span>
                <span className="activity-day-count">
                  {group.items.length} {group.items.length === 1 ? "event" : "events"}
                </span>
              </div>

              {group.items.map((item, i) => {
                const meta = getActionMeta(item.action);
                const Icon = meta.icon;
                const chips = buildDetails(item);
                const isWarning = item.severity === "warning" || item.severity === "error" || item.severity === "critical";
                const isLast = i === group.items.length - 1;

                return (
                  <div key={item.id} className={`activity-row ${isWarning ? "warning" : ""}`}>
                    <div className="activity-rail" aria-hidden="true">
                      <div className="activity-icon">
                        <Icon size={15} />
                      </div>
                      {!isLast && <div className="activity-line" />}
                    </div>

                    <div className="activity-body">
                      <div className="activity-title-row">
                        <span className="activity-title">{t(meta.labelKey)}</span>
                        <time className="activity-time" dateTime={item.createdAt} title={fullDate(item.createdAt, lang)}>
                          {timeAgo(item.createdAt, t)}
                        </time>
                      </div>

                      {chips.length > 0 && (
                        <div className="activity-chips">
                          {chips.map((chip) => (
                            <span
                              key={chip.key}
                              className={`activity-chip ${chip.key === "reason" ? "warn" : ""}`}
                              title={
                                chip.key === "ip"
                                  ? "IP address"
                                  : chip.key === "device"
                                    ? "Browser & operating system"
                                    : chip.key === "method"
                                      ? t("history.chipMethod")
                                      : chip.key === "provider"
                                        ? "Provider"
                                        : chip.key === "fields"
                                          ? "Changed fields"
                                          : chip.key === "email"
                                            ? "Email"
                                            : t("history.chipReason")
                              }
                            >
                              {chip.key === "ip" && <Globe size={11} />}
                              {chip.key === "device" && <Monitor size={11} />}
                              {(chip.key === "method" || chip.key === "provider") && <LogIn size={11} />}
                              {chip.value}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ))
        )}
      </section>
    </div>
  );
}
