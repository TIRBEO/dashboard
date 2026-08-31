"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import {
  AlertTriangle,
  Check,
  Monitor,
  Shield,
  X,
  Globe,
  Clock,
  Smartphone,
  Laptop,
} from "lucide-react";
import { Skeleton } from "@/components/ui/Skeleton";
import { Dialog, DialogHeader, DialogBody, DialogFooter, BtnCancel, BtnDanger, WarningBlock, InfoCard } from "@/components/ui/Dialog";
import { useI18n, type I18nT } from "@/lib/i18n";
import { toast } from "sonner";

function parseUserAgent(ua: string | null, t: I18nT): { browser: string; os: string; deviceType: string } {
  if (!ua) return { browser: t("sessions.unknownBrowser"), os: t("sessions.unknownOS"), deviceType: "desktop" };
  let browser = t("sessions.unknownBrowser");
  let os = t("sessions.unknownOS");
  let deviceType = "desktop";
  if (ua.includes("Firefox")) browser = "Firefox";
  else if (ua.includes("Edg")) browser = "Edge";
  else if (ua.includes("Chrome") && !ua.includes("Edg")) browser = "Chrome";
  else if (ua.includes("Safari") && !ua.includes("Chrome")) browser = "Safari";
  else if (ua.includes("Opera") || ua.includes("OPR")) browser = "Opera";
  if (ua.includes("Windows NT 10")) os = "Windows";
  else if (ua.includes("Windows")) os = "Windows";
  else if (ua.includes("Mac OS X")) os = "macOS";
  else if (ua.includes("Linux") && !ua.includes("Android")) os = "Linux";
  else if (ua.includes("Android")) { os = "Android"; deviceType = "mobile"; }
  else if (ua.includes("iPhone") || ua.includes("iPad")) { os = "iOS"; deviceType = "mobile"; }
  return { browser, os, deviceType };
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
  const [removingIds, setRemovingIds] = useState<Set<string>>(new Set());
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

  const currentSession = (Array.isArray(sessions) ? sessions : []).find((s) => s.isCurrent);
  const otherSessions = (Array.isArray(sessions) ? sessions : []).filter((s) => !s.isCurrent);

  const revokeOne = async (id: string) => {
    setRevoking(id);
    setRemovingIds((prev) => new Set(prev).add(id));
    // optimistic real-time feel: animate out first, then hit API
    await new Promise((r) => setTimeout(r, 180));
    try {
      await api.delete(`/api/security/sessions/${id}`);
      setSessions((prev) => prev.filter((s) => s.id !== id));
      toast.success(t("sessions.revoked") || "Session revoked");
    } catch (e: any) {
      toast.error(e?.message || "Failed to revoke session");
      setRemovingIds((prev) => { const n = new Set(prev); n.delete(id); return n; });
    } finally {
      setRevoking(null);
      setShowRevokeOne(null);
      setRemovingIds((prev) => { const n = new Set(prev); n.delete(id); return n; });
    }
  };

  const revokeAll = async () => {
    const ids = otherSessions.map((s) => s.id);
    if (ids.length === 0) return;
    setRevoking("all");
    setRemovingIds(new Set(ids));
    // staggered exit for real-time feel
    await new Promise((r) => setTimeout(r, 220));
    try {
      await api.delete("/api/security/sessions/revoke-all");
      // keep only current session with smooth collapse
      setSessions((prev) => prev.filter((s) => s.isCurrent));
      toast.success(`${ids.length} ${t("sessions.revokedAll") || "sessions revoked"}`);
    } catch (e: any) {
      toast.error(e?.message || "Failed to revoke sessions");
      setRemovingIds(new Set());
    } finally {
      setRevoking(null);
      setShowRevokeAll(false);
      setRemovingIds(new Set());
    }
  };

  const formatTime = (iso: string) => {
    if (!iso) return t("sessions.unknown");
    const d = new Date(iso);
    const diff = Date.now() - d.getTime();
    if (diff < 60_000) return t("common.justNow");
    if (diff < 3600_000) return t("common.agoM", { n: Math.floor(diff / 60_000) });
    if (diff < 86400_000) return t("common.agoH", { n: Math.floor(diff / 3600_000) });
    return d.toLocaleDateString(lang, { month: "short", day: "numeric" });
  };

  const formatFull = (iso: string) => {
    if (!iso) return "";
    return new Intl.DateTimeFormat(lang === "en" ? "en-US" : lang, {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(new Date(iso));
  };

  return (
    <div className="flex flex-col gap-6 max-w-[1200px] mx-auto">
      {/* ── Page Header ── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="min-w-0">
          <h1 className="text-[24px] font-semibold text-tb-text-primary tracking-tight flex items-center gap-2.5">
            <Monitor size={22} className="text-tb-text-muted" />
            {t("sessions.title")}
          </h1>
          <p className="text-sm text-tb-text-muted mt-1">{t("sessions.subtitle")}</p>
        </div>
        {otherSessions.length > 0 && (
          <button
            onClick={() => setShowRevokeAll(true)}
            className="inline-flex items-center gap-1.5 px-3 h-8 rounded-lg text-[15px] font-medium border border-tb-red text-tb-red hover:bg-tb-red-soft transition-all duration-150 active:scale-[0.97]"
          >
            <AlertTriangle size={13} />
            {t("sessions.revokeAllOthers")}
          </button>
        )}
      </div>

      {/* ── Sessions Card ── */}
      <div className="rounded-2xl border border-tb-border bg-tb-surface-1 overflow-hidden">
        {loading ? (
          <div>
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className={`flex items-center gap-3 px-4 py-3.5 ${i < 2 ? 'border-b border-tb-border' : ''}`}
              >
                <Skeleton width={36} height={36} borderRadius={8} />
                <div className="flex-1">
                  <Skeleton width="60%" height={13} className="mb-1" />
                  <Skeleton width="40%" height={10} />
                </div>
                <Skeleton width={70} height={28} borderRadius={6} />
              </div>
            ))}
          </div>
        ) : sessions.length === 0 ? (
          <div className="py-16 px-6 text-center">
            <div className="w-12 h-12 rounded-xl border border-tb-border bg-tb-surface-2 inline-flex items-center justify-center text-tb-text-muted mb-3">
              <Shield size={24} />
            </div>
            <p className="text-[15px] font-medium text-tb-text-primary">{t("sessions.noActive")}</p>
            <p className="text-[15px] text-tb-text-muted mt-1">{t("sessions.noActiveDesc")}</p>
          </div>
        ) : (
          <div>
            {/* Current Session */}
            {currentSession && (() => {
              const p = parseUserAgent(currentSession.userAgent || currentSession.device, t);
              return (
                <div className="flex items-center gap-3.5 px-5 py-4 border-b border-tb-border bg-[rgba(34,197,94,0.03)]">
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 bg-[rgba(16,185,129,0.12)] text-tb-green"
                  >
                    <Monitor size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[15px] font-medium text-tb-text-primary truncate">
                        {p.browser} {t("sessions.on")} {p.os}
                      </span>
                      <span
                        className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[rgba(16,185,129,0.12)] text-tb-green border border-[rgba(16,185,129,0.2)]"
                      >
                        {t("sessions.current")}
                      </span>
                    </div>
                    <div className="text-[15px] text-tb-text-muted mt-0.5 flex items-center gap-1.5">
                      <Globe size={11} className="flex-shrink-0" />
                      {currentSession.ipAddress || currentSession.ip || t("sessions.local")}
                      <span className="text-tb-text-disabled">·</span>
                      <Clock size={11} className="flex-shrink-0" />
                      {t("sessions.lastActive")} {formatTime(currentSession.lastSeenAt || currentSession.lastActiveAt)}
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Other Sessions — real-time exit transition */}
            {otherSessions.map((s) => {
              const p = parseUserAgent(s.userAgent || s.device, t);
              const DeviceIcon = p.deviceType === "mobile" ? Smartphone : Laptop;
              const isRemoving = removingIds.has(s.id);
              return (
                <div
                  key={s.id}
                  className={`flex items-center gap-3.5 px-5 py-4 transition-all duration-300 ease-out hover:bg-tb-surface-2 ${isRemoving ? 'opacity-0 -translate-x-2 scale-[0.98] h-0 py-0 overflow-hidden border-0' : 'opacity-100 translate-x-0 border-b border-tb-border'}`}
                  aria-busy={isRemoving}
                >
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 bg-tb-surface-3 text-tb-text-muted"
                  >
                    <DeviceIcon size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[15px] font-medium text-tb-text-primary truncate">
                      {p.browser} {t("sessions.on")} {p.os}
                    </div>
                    <div className="text-[15px] text-tb-text-muted mt-0.5 flex items-center gap-1.5">
                      <Globe size={11} className="flex-shrink-0" />
                      {s.ipAddress || s.ip || t("sessions.unknownIp")}
                      <span className="text-tb-text-disabled">·</span>
                      <Clock size={11} className="flex-shrink-0" />
                      {t("sessions.lastActive")} {formatTime(s.lastSeenAt || s.lastActiveAt)}
                    </div>
                  </div>
                  <button
                    onClick={() => setShowRevokeOne(s.id)}
                    disabled={revoking === s.id}
                    className="inline-flex items-center gap-1 px-2.5 h-7 rounded-md text-[15px] font-medium text-tb-red hover:bg-tb-red-soft border border-transparent hover:border-tb-red transition-all duration-150 disabled:opacity-40 flex-shrink-0"
                  >
                    {revoking === s.id ? (
                      <span className="w-3 h-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    ) : (
                      t("sessions.revoke")
                    )}
                  </button>
                </div>
              );
            })}

            {otherSessions.length === 0 && !currentSession && (
              <div className="py-8 text-center text-[15px] text-tb-text-muted">
                {t("sessions.noActive")}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ═══ Revoke All — Simple Premium ═══ */}
      <Dialog open={showRevokeAll} onClose={() => setShowRevokeAll(false)}>
        <DialogHeader title="Sign out all other sessions?" description="All other sessions will be signed out. This device will stay signed in." onClose={() => setShowRevokeAll(false)} />
        <DialogBody>
          <div className="flex flex-col items-center text-center py-1">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 bg-tb-red-soft border border-[rgba(232,93,106,0.18)] text-tb-red">
              <AlertTriangle size={18} />
            </div>
            <p className="text-[15px] leading-relaxed max-w-[320px] text-tb-text-secondary">
              This will sign out all other active sessions immediately. They won’t be able to access your account until they sign in again.
            </p>
            <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[15px] font-medium bg-tb-surface-2 border border-tb-border text-tb-text-primary">
              <span className="w-1.5 h-1.5 rounded-full animate-pulse bg-tb-red" />
              {otherSessions.length} session{otherSessions.length !== 1 ? 's' : ''} will be revoked
              <span className="text-[15px] text-tb-text-muted">· current stays active</span>
            </div>
          </div>
        </DialogBody>
        <DialogFooter>
          <BtnCancel onClick={() => setShowRevokeAll(false)}>Keep all sessions</BtnCancel>
          <BtnDanger onClick={revokeAll} loading={revoking === "all"}>
            {revoking === "all" ? "Signing out…" : "Sign out others"}
          </BtnDanger>
        </DialogFooter>
      </Dialog>

      {/* ═══ Revoke One Dialog ═══ */}
      <Dialog open={!!showRevokeOne} onClose={() => setShowRevokeOne(null)}>
        <DialogHeader title={t("sessions.revokeSessionTitle")} description={t("sessions.revokeSessionDesc")} onClose={() => setShowRevokeOne(null)} />
        <DialogBody>
          <WarningBlock>
            This session will be signed out immediately. If this is a device you don{'\u2019'}t recognize, consider changing your password for extra security.
          </WarningBlock>
          {showRevokeOne && (() => {
            const s = otherSessions.find((sess) => sess.id === showRevokeOne);
            if (!s) return null;
            const p = parseUserAgent(s.userAgent || s.device, t);
            return (
              <InfoCard
                icon={<Monitor size={18} />}
                iconBg="var(--tb-surface-3)"
                title={`${p.browser} on ${p.os}`}
                subtitle={`${s.ipAddress || s.ip || t('sessions.unknownIp')} · Last active ${formatTime(s.lastSeenAt || s.lastActiveAt)}`}
              />
            );
          })()}
        </DialogBody>
        <DialogFooter>
          <BtnCancel onClick={() => setShowRevokeOne(null)}>Keep this session</BtnCancel>
          <BtnDanger onClick={() => showRevokeOne && revokeOne(showRevokeOne)} loading={revoking === showRevokeOne}>
            {revoking === showRevokeOne ? t("sessions.revoking") : t("sessions.revoke")}
          </BtnDanger>
        </DialogFooter>
      </Dialog>
    </div>
  );
}
