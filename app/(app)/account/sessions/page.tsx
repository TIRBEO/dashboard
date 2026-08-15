"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import {
  AlertTriangle,
  Check,
  Monitor,
  Shield,
  X,
} from "lucide-react";
import { Skeleton } from "@/components/ui/Skeleton";
import { useI18n, type I18nT } from "@/lib/i18n";

function parseUserAgent(ua: string | null, t: I18nT): { browser: string; os: string } {
  if (!ua) return { browser: t("sessions.unknownBrowser"), os: t("sessions.unknownOS") };
  let browser = t("sessions.unknownBrowser");
  let os = t("sessions.unknownOS");
  // Browser
  if (ua.includes("Firefox")) browser = "Firefox";
  else if (ua.includes("Edg")) browser = "Edge";
  else if (ua.includes("Chrome") && !ua.includes("Edg")) browser = "Chrome";
  else if (ua.includes("Safari") && !ua.includes("Chrome")) browser = "Safari";
  else if (ua.includes("Opera") || ua.includes("OPR")) browser = "Opera";
  // OS
  if (ua.includes("Windows NT 10")) os = "Windows";
  else if (ua.includes("Windows")) os = "Windows";
  else if (ua.includes("Mac OS X")) os = "macOS";
  else if (ua.includes("Linux") && !ua.includes("Android")) os = "Linux";
  else if (ua.includes("Android")) os = "Android";
  else if (ua.includes("iPhone") || ua.includes("iPad")) os = "iOS";
  return { browser, os };
}

interface Session {
  id: string;
  device: string;
  userAgent: string;
  ipAddress: string;
  ip: string;
  createdAt: string;
  expiresAt: string;
  lastActiveAt: string;
  lastSeenAt: string;
  isCurrent: boolean;
}

export default function SessionsPage() {
  const { t, lang } = useI18n();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [revoking, setRevoking] = useState<string | null>(null);
  const [showRevokeAll, setShowRevokeAll] = useState(false);
  const [showRevokeOne, setShowRevokeOne] = useState<string | null>(null);

  const load = () => {
    api
      .get<Session[]>("/api/security/sessions")
      .then((r) => setSessions(Array.isArray(r) ? r : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const currentSession = sessions.find((s) => s.isCurrent);
  const otherSessions = sessions.filter((s) => !s.isCurrent);

  const revokeOne = async (id: string) => {
    setRevoking(id);
    try {
      await api.delete(`/api/security/sessions/${id}`);
      setSessions((prev) => prev.filter((s) => s.id !== id));
    } catch {}
    setRevoking(null);
    setShowRevokeOne(null);
  };

  const revokeAll = async () => {
    setRevoking("all");
    try {
      await api.delete("/api/security/sessions/revoke-all");
      if (currentSession) setSessions([currentSession]);
      else setSessions([]);
    } catch {}
    setRevoking(null);
    setShowRevokeAll(false);
  };

  const formatTime = (iso: string) => {
    if (!iso) return t("sessions.unknown");
    const d = new Date(iso);
    const diff = Date.now() - d.getTime();
    if (diff < 60_000) return t("common.justNow");
    if (diff < 3600_000) return t("common.agoM", { n: Math.floor(diff / 60_000) });
    if (diff < 86400_000) return t("common.agoH", { n: Math.floor(diff / 3600_000) });
    return d.toLocaleDateString(lang, {
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="page-stack">
      <div className="page-header">
        <div className="page-header-row">
          <div className="page-header-left">
            <h1 className="page-header-title">{t("sessions.title")}</h1>
            <p className="page-header-description">
              {t("sessions.subtitle")}
            </p>
          </div>
          <div className="page-header-actions">
            {otherSessions.length > 0 && (
              <button
                className="btn btn-danger btn-sm"
                onClick={() => setShowRevokeAll(true)}
              >
                {t("sessions.revokeAllOthers")}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="dashboard-card" style={{ padding: 0, overflow: "hidden" }}>
        {loading ? (
          <div>
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "14px 18px",
                  borderBottom: i < 2 ? "1px solid var(--tb-border)" : "none",
                }}
              >
                <Skeleton width={36} height={36} borderRadius={8} />
                <div style={{ flex: 1 }}>
                  <Skeleton width="60%" height={13} style={{ marginBottom: 4 }} />
                  <Skeleton width="40%" height={10} />
                </div>
                <Skeleton width={70} height={28} borderRadius={6} />
              </div>
            ))}
          </div>
        ) : sessions.length === 0 ? (
          <div style={{ padding: 48, textAlign: "center" }}>
            <Shield
              size={32}
              style={{ color: "var(--tb-text-disabled)", marginBottom: 12 }}
            />
            <p
              style={{
                fontSize: 14,
                fontWeight: 500,
                color: "var(--tb-text-primary)",
                margin: "0 0 4px",
              }}
            >
              {t("sessions.noActive")}
            </p>
            <p
              style={{ fontSize: 13, color: "var(--tb-text-muted)", margin: 0 }}
            >
              {t("sessions.noActiveDesc")}
            </p>          </div>
        ) : (
          <div>
            {/* Current session */}
            {currentSession && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "14px 18px",
                  borderBottom: "1px solid var(--tb-border)",
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 8,
                    background: "var(--tb-green-soft, rgba(16,185,129,0.1))",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    color: "var(--tb-green, #10b981)",
                  }}
                >
                  <Monitor size={16} />
                </div>
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
                    {(() => { const p = parseUserAgent(currentSession.userAgent || currentSession.device, t); return `${p.browser} ${t("sessions.on")} ${p.os}`; })()}
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: "var(--tb-text-muted)",
                      marginTop: 1,
                    }}
                  >
                    {currentSession.ipAddress || currentSession.ip || t("sessions.local")} · {t("sessions.lastActive")} {formatTime(currentSession.lastSeenAt || currentSession.lastActiveAt)}
                  </div>
                </div>
                <span
                  className="badge badge-success"
                  style={{ fontSize: 10, padding: "2px 8px" }}
                >
                  {t("sessions.current")}
                </span>
              </div>
            )}

            {/* Other sessions */}
            {otherSessions.map((s) => (
              <div
                key={s.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "14px 18px",
                  borderBottom: "1px solid var(--tb-border)",
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
                    width: 36,
                    height: 36,
                    borderRadius: 8,
                    background: "var(--tb-surface-3)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    color: "var(--tb-text-muted)",
                  }}
                >
                  <Monitor size={16} />
                </div>
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
                    {(() => { const p = parseUserAgent(s.userAgent || s.device, t); return `${p.browser} ${t("sessions.on")} ${p.os}`; })()}
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: "var(--tb-text-muted)",
                      marginTop: 1,
                    }}
                  >
                    {s.ipAddress || s.ip || t("sessions.unknownIp")} · {t("sessions.lastActive")} {formatTime(s.lastSeenAt || s.lastActiveAt)}
                  </div>
                </div>
                <button
                  className="btn btn-ghost btn-sm"
                  style={{
                    color: "var(--tb-red, #ef4444)",
                    fontSize: 12,
                    padding: "4px 10px",
                  }}
                  onClick={() => setShowRevokeOne(s.id)}
                  disabled={revoking === s.id}
                >
                  {revoking === s.id ? (
                    <span className="btn-spinner" />
                  ) : (
                    t("sessions.revoke")
                  )}
                </button>
              </div>
            ))}

            {otherSessions.length === 0 && !currentSession && (
              <div style={{ padding: 32, textAlign: "center" }}>
                <p style={{ fontSize: 13, color: "var(--tb-text-muted)" }}>
                  {t("sessions.noActive")}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Revoke All Popup */}
      {showRevokeAll && (
        <div
          className="tb-dialog-overlay"
          onClick={() => setShowRevokeAll(false)}
        >
          <div className="tb-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="tb-dialog-header">
              <div>
                <h3 className="tb-dialog-title">{t("sessions.revokeAllTitle")}</h3>
                <p className="tb-dialog-desc">
                  {t("sessions.revokeAllDesc")}
                </p>
              </div>
              <button
                className="header-control"
                onClick={() => setShowRevokeAll(false)}
              >
                <X size={16} />
              </button>
            </div>
            <div className="tb-dialog-footer">
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setShowRevokeAll(false)}
              >
                {t("common.cancel")}
              </button>
              <button
                className="btn btn-danger btn-sm"
                onClick={revokeAll}
                disabled={revoking === "all"}
              >
                {revoking === "all" ? (
                  <>
                    <span className="btn-spinner" /> {t("sessions.revoking")}
                  </>
                ) : (
                  t("sessions.revokeAllOthers")
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Revoke One Popup */}
      {showRevokeOne && (
        <div
          className="tb-dialog-overlay"
          onClick={() => setShowRevokeOne(null)}
        >
          <div className="tb-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="tb-dialog-header">
              <div>
                <h3 className="tb-dialog-title">{t("sessions.revokeSessionTitle")}</h3>
                <p className="tb-dialog-desc">
                  {t("sessions.revokeSessionDesc")}
                </p>
              </div>
              <button
                className="header-control"
                onClick={() => setShowRevokeOne(null)}
              >
                <X size={16} />
              </button>
            </div>
            <div className="tb-dialog-footer">
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setShowRevokeOne(null)}
              >
                {t("common.cancel")}
              </button>
              <button
                className="btn btn-danger btn-sm"
                onClick={() => revokeOne(showRevokeOne)}
                disabled={revoking === showRevokeOne}
              >
                {revoking === showRevokeOne ? (
                  <>
                    <span className="btn-spinner" /> {t("sessions.revoking")}
                  </>
                ) : (
                  t("sessions.revoke")
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
