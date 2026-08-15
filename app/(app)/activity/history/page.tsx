"use client";
import { useEffect, useState } from "react";
import {
  Clock,
  Key,
  LogIn,
  LogOut,
  Shield,
  Settings,
  User,
  AlertTriangle,
  Bell,
  CreditCard,
  Mail,
} from "lucide-react";
import { getUserActivity, type ApiError } from "@/lib/api";
import { Skeleton } from "@/components/ui/Skeleton";
import { useI18n } from "@/lib/i18n";

interface ActivityItem {
  id: string;
  action: string;
  targetType: string;
  targetId: string;
  metadata: any;
  severity: string;
  createdAt: string;
}

const ACTION_META: Record<string, { icon: typeof LogIn; color: string }> = {
  "user.login": { icon: LogIn, color: "#10b981" },
  "user.logout": { icon: LogOut, color: "#6b7280" },
  "user.signup": { icon: User, color: "#3b82f6" },
  "user.password_changed": { icon: Key, color: "#f59e0b" },
  "user.profile_updated": { icon: Settings, color: "#8b5cf6" },
  "user.2fa_enabled": { icon: Shield, color: "#10b981" },
  "user.2fa_disabled": { icon: Shield, color: "#ef4444" },
  "user.session_revoked": { icon: LogOut, color: "#ef4444" },
  "user.email_verified": { icon: Mail, color: "#10b981" },
  "user.account_deleted": { icon: AlertTriangle, color: "#ef4444" },
  "user.data_exported": { icon: CreditCard, color: "#3b82f6" },
  "user.notification_read": { icon: Bell, color: "#6b7280" },
  "ticket.created": { icon: Bell, color: "#3b82f6" },
  "ticket.replied": { icon: Mail, color: "#10b981" },
  "ticket.closed": { icon: Shield, color: "#6b7280" },
};

function getActionMeta(action: string) {
  for (const [key, meta] of Object.entries(ACTION_META)) {
    if (action.includes(key.split(".")[1])) return meta;
  }
  return { icon: Clock, color: "var(--tb-text-muted)" };
}

function formatAction(action: string, t: (k: string, vars?: Record<string, string | number>) => string) {
  const map: [string, string][] = [
    ["login", "history.act.login"],
    ["logout", "history.act.logout"],
    ["signup", "history.act.signup"],
    ["password_changed", "history.act.passwordChanged"],
    ["profile_updated", "history.act.profileUpdated"],
    ["2fa_enabled", "history.act.twofaEnabled"],
    ["2fa_disabled", "history.act.twofaDisabled"],
    ["session_revoked", "history.act.sessionRevoked"],
    ["email_verified", "history.act.emailVerified"],
    ["account_deleted", "history.act.accountDeleted"],
    ["data_exported", "history.act.dataExported"],
    ["notification_read", "history.act.notificationRead"],
    ["ticket.created", "history.act.ticketCreated"],
    ["ticket.replied", "history.act.ticketReplied"],
    ["ticket.closed", "history.act.ticketClosed"],
  ];
  for (const [token, key] of map) {
    if (action.includes(token)) return t(key);
  }
  return t("history.act.unknown");
}

function timeAgo(iso: string, t: (k: string, vars?: Record<string, string | number>) => string) {
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  if (diff < 60_000) return t("common.justNow");
  if (diff < 3600_000) return t("common.agoM", { n: Math.floor(diff / 60_000) });
  if (diff < 86400_000) return t("common.agoH", { n: Math.floor(diff / 3600_000) });
  if (diff < 172800_000) return t("common.yesterday");
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function fullDate(iso: string) {
  return new Date(iso).toLocaleString();
}

export default function HistoryPage() {
  const { t } = useI18n();
  const [items, setItems] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUserActivity(50)
      .then((r) => setItems(Array.isArray(r) ? r : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page-stack">
      <div className="page-header">
        <div className="page-header-row">
          <div className="page-header-left">
            <h1 className="page-header-title">{t("history.title")}</h1>
            <p className="page-header-description">
              {t("history.subtitle")}
            </p>
          </div>
        </div>
      </div>

      <div className="dashboard-card" style={{ padding: 0, overflow: "hidden" }}>
        {loading ? (
          <div>
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "12px 18px",
                  borderBottom:
                    i < 7 ? "1px solid var(--tb-border)" : "none",
                }}
              >
                <Skeleton width={32} height={32} borderRadius={8} />
                <div style={{ flex: 1 }}>
                  <Skeleton
                    width={`${40 + i * 5}%`}
                    height={13}
                    style={{ marginBottom: 4 }}
                  />
                  <Skeleton width="25%" height={10} />
                </div>
                <Skeleton width={60} height={10} />
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div
            style={{
              padding: 48,
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                background: "var(--tb-surface-3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 12,
                color: "var(--tb-text-muted)",
              }}
            >
              <Clock size={20} />
            </div>
            <p
              style={{
                fontSize: 14,
                fontWeight: 500,
                color: "var(--tb-text-primary)",
                margin: "0 0 4px",
              }}
            >
              {t("history.noActivity")}
            </p>
            <p
              style={{ fontSize: 13, color: "var(--tb-text-muted)", margin: 0 }}
            >
              {t("history.noActivityDesc")}
            </p>          </div>
        ) : (
          <div>
            {items.map((item, i) => {
              const meta = getActionMeta(item.action);
              const Icon = meta.icon;
              return (
                <div
                  key={item.id || i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "11px 18px",
                    borderBottom:
                      i < items.length - 1
                        ? "1px solid var(--tb-border)"
                        : "none",
                    transition: "background 100ms",
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
                      width: 32,
                      height: 32,
                      borderRadius: 8,
                      background: `${meta.color}15`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      color: meta.color,
                    }}
                  >
                    <Icon size={15} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 500,
                        color: "var(--tb-text-primary)",
                      }}
                    >
                      {formatAction(item.action, t)}
                    </div>
                    {item.targetType && (
                      <div
                        style={{
                          fontSize: 12,
                          color: "var(--tb-text-muted)",
                          marginTop: 1,
                        }}
                      >
                        {item.targetType}
                        {item.targetId
                          ? ` · ${item.targetId.slice(0, 8)}`
                          : ""}
                      </div>
                    )}
                  </div>
                  <span
                    title={fullDate(item.createdAt)}
                    style={{
                      fontSize: 12,
                      color: "var(--tb-text-muted)",
                      whiteSpace: "nowrap",
                      flexShrink: 0,
                    }}
                  >
                    {timeAgo(item.createdAt, t)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
