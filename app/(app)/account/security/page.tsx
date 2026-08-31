"use client";
import { useEffect, useState } from "react";
import { api, getCurrentUser } from "@/lib/api";
import {
  AlertCircle,
  Check,
  Copy,
  History,
  Key,
  Lock,
  Mail,
  Monitor,
  Shield,
  Globe,
  Clock,
  Fingerprint,
} from "lucide-react";
import { Skeleton } from "@/components/ui/Skeleton";
import { useI18n } from "@/lib/i18n";
import { Dialog, DialogHeader, DialogBody, DialogFooter, BtnCancel, BtnDanger, BtnPrimary, InfoCard, WarningBlock, ConfirmInput } from "@/components/ui/Dialog";
import TirbeoQRCode from "@/components/TirbeoQRCode";

/* ═══ Card ═══ */
function GlassCard({ children, style, className = "" }: { children: React.ReactNode; style?: React.CSSProperties; className?: string }) {
  return (
    <div
      className={`rounded-2xl border border-tb-border bg-tb-surface-1 overflow-hidden ${className}`}
      style={style}
    >
      {children}
    </div>
  );
}

/* ═══ Icon Tile ═══ */
function GlassIcon({ children, color }: { children: React.ReactNode; color?: string }) {
  return (
    <div className="w-[34px] h-[34px] rounded-[10px] flex items-center justify-center shrink-0 border border-tb-border bg-tb-surface-2" style={{ color }}>
      {children}
    </div>
  );
}

/* ═══ Divider ═══ */
function Divider() { return <div className="h-px bg-tb-border" />; }

/* ═══ Badge ═══ */
function Badge({ color, children }: { color: string; children: React.ReactNode }) {
  return (
    <span
      className="inline-flex items-center text-[11px] font-semibold px-2 py-0.5 rounded-md flex-shrink-0"
      style={{ background: `${color}15`, color, border: `1px solid ${color}25` }}
    >
      {children}
    </span>
  );
}

/* ═══ Glass Button ═══ */
function Btn({
  variant = "secondary",
  onClick,
  disabled,
  children,
  loading,
  className,
}: {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  onClick?: () => void;
  disabled?: boolean;
  children: React.ReactNode;
  loading?: boolean;
  className?: string;
}) {
  const variantCls: Record<string, string> = {
    primary: "bg-tb-brand text-tb-brand-text border-none",
    secondary: "bg-tb-surface-2 text-tb-text-primary border border-tb-border",
    ghost: "bg-transparent text-tb-text-secondary border-none",
    danger: "bg-transparent text-tb-red border border-tb-red-soft",
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`inline-flex items-center gap-[5px] px-3 h-8 rounded-lg text-xs font-medium font-[inherit] transition-all duration-150 ${disabled || loading ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'} ${variantCls[variant]} ${className || ''}`}
    >
      {loading && (
        <span className="inline-block w-3 h-3 rounded-full border-2 border-current border-t-transparent animate-[spin_0.6s_linear_infinite]" />
      )}
      {children}
    </button>
  );
}

/* ═══ Row ═══ */
function Row({
  children,
  last,
  style: sp,
  className,
  onMouseEnter,
  onMouseLeave,
}: {
  children: React.ReactNode;
  last?: boolean;
  style?: React.CSSProperties;
  className?: string;
  onMouseEnter?: (e: React.MouseEvent<HTMLDivElement>) => void;
  onMouseLeave?: (e: React.MouseEvent<HTMLDivElement>) => void;
}) {
  return (
    <div
      className={`flex items-center gap-3 p-3.5 border-b border-tb-border ${className || ""}`}
      style={sp}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {children}
    </div>
  );
}

export default function SecurityPage() {
  const { t, lang } = useI18n();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // 2FA
  const [totpEnabled, setTotpEnabled] = useState(false);
  const [show2FASetup, setShow2FASetup] = useState(false);
  const [totpData, setTotpData] = useState<{ secret?: string; uri: string } | null>(null);
  const totpSecret = totpData?.uri ? new URL(totpData.uri).searchParams.get("secret") || "" : "";
  const [copiedKey, setCopiedKey] = useState(false);
  const [totpCode, setTotpCode] = useState("");
  const [totpError, setTotpError] = useState("");
  const [totpLoading, setTotpLoading] = useState(false);
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [showDisable2FA, setShowDisable2FA] = useState(false);
  const [disableCode, setDisableCode] = useState("");

  // Password
  const [showChangePwd, setShowChangePwd] = useState(false);
  const [pwdForm, setPwdForm] = useState({ current: "", new: "", confirm: "" });
  const [pwdError, setPwdError] = useState("");
  const [pwdSaving, setPwdSaving] = useState(false);
  const [pwdSuccess, setPwdSuccess] = useState(false);
  const [hasPassword, setHasPassword] = useState(true);

  // Recovery email
  const [secEmail, setSecEmail] = useState("");
  const [secVerified, setSecVerified] = useState(false);
  const [showChangeEmail, setShowChangeEmail] = useState(false);
  const [emailStep, setEmailStep] = useState<"input" | "verify">("input");
  const [newEmail, setNewEmail] = useState("");
  const [verifyCode, setVerifyCode] = useState("");
  const [emailError, setEmailError] = useState("");
  const [emailLoading, setEmailLoading] = useState(false);
  const [showRemoveEmail, setShowRemoveEmail] = useState(false);
  const [removeOtp, setRemoveOtp] = useState("");
  const [removeOtpSent, setRemoveOtpSent] = useState(false);
  const [removeOtpLoading, setRemoveOtpLoading] = useState(false);
  const [removeError, setRemoveError] = useState("");

  // Sessions & activity
  const [sessions, setSessions] = useState<any[]>([]);
  const [activity, setActivity] = useState<any[]>([]);
  const [loginHistory, setLoginHistory] = useState<any[]>([]);

  useEffect(() => {
    getCurrentUser()
      .then((u) => { setUser(u); setTotpEnabled(!!u.totpEnabled); setSecEmail(u.recoveryEmail || u.secondaryEmail || ""); setSecVerified(!!(u.recoveryEmailVerified || u.secondaryEmailVerified)); setHasPassword(!!u.hasPassword); })
      .catch(() => {}).finally(() => setLoading(false));
    api.get<any>("/api/security/sessions").then((s) => setSessions(Array.isArray(s) ? s : [])).catch(() => {});
    api.get<any>("/api/user/activity?limit=10").then((a) => setActivity(Array.isArray(a) ? a : (a?.events ?? []))).catch(() => {});
    api.get<any>("/api/security/login-history?limit=15").then((r) => setLoginHistory(Array.isArray(r?.logs) ? r.logs : Array.isArray(r) ? r : [])).catch(() => {});
  }, []);

  // ── 2FA ──
  const startSetup = async () => { setTotpLoading(true); setTotpError(""); try { const d = await api.post<any>("/api/security/totp/setup"); setTotpData(d); setShow2FASetup(true); } catch (e: any) { setTotpError(e.message || t("security.failed")); } setTotpLoading(false); };
  const verifySetup = async () => { if (totpCode.length !== 6) { setTotpError(t("security.enter6")); return; } setTotpLoading(true); setTotpError(""); try { const d = await api.post<any>("/api/security/totp/verify", { code: totpCode }); setTotpEnabled(true); setShow2FASetup(false); setTotpData(null); setTotpCode(""); if (d?.backupCodes) setBackupCodes(d.backupCodes); } catch (e: any) { setTotpError(e.message || t("security.invalidCode")); setTotpCode(""); } setTotpLoading(false); };
  const disable2FA = async () => { if (disableCode.length !== 6) { setTotpError(t("security.enter6")); return; } setTotpLoading(true); setTotpError(""); try { await api.request(`/api/security/totp/disable?code=${encodeURIComponent(disableCode)}`, { method: "DELETE" }); setTotpEnabled(false); setShowDisable2FA(false); setDisableCode(""); } catch (e: any) { setTotpError(e.message || "Failed"); } setTotpLoading(false); };

  // ── Password ──
  const changePassword = async () => { if (pwdForm.new !== pwdForm.confirm) { setPwdError(t("security.pwdMismatch")); return; } if (pwdForm.new.length < 8) { setPwdError(t("security.pwdMinLength")); return; } setPwdSaving(true); setPwdError(""); try { const body: any = { newPassword: pwdForm.new }; if (hasPassword) body.currentPassword = pwdForm.current; await api.post("/api/security/password", body); setShowChangePwd(false); setPwdForm({ current: "", new: "", confirm: "" }); setHasPassword(true); setUser((p: any) => (p ? { ...p, mustChangePassword: false } : p)); setPwdSuccess(true); setTimeout(() => setPwdSuccess(false), 3000); } catch (e: any) { setPwdError(e.message || t("security.failed")); } setPwdSaving(false); };

  // ── Email ──
  const sendEmailCode = async () => { if (!newEmail.includes("@")) { setEmailError(t("security.enterValidEmail")); return; } setEmailLoading(true); setEmailError(""); try { await api.post("/api/security/recovery-email/send-code", { email: newEmail }); setEmailStep("verify"); } catch (e: any) { setEmailError(e.message || t("security.sendFailed")); } setEmailLoading(false); };
  const verifyEmailCode = async () => { if (!verifyCode || verifyCode.length < 4) { setEmailError(t("security.enterCodeErr")); return; } setEmailLoading(true); setEmailError(""); try { await api.post("/api/security/recovery-email/verify", { email: newEmail, code: verifyCode }); setSecEmail(newEmail); setSecVerified(true); setShowChangeEmail(false); setEmailStep("input"); setNewEmail(""); setVerifyCode(""); } catch (e: any) { setEmailError(e.message || t("security.invalidCode")); } setEmailLoading(false); };
  const sendRemoveOtp = async () => { setRemoveError(""); setRemoveOtpLoading(true); try { await api.post("/api/security/recovery-email/send-code", { email: secEmail }); setRemoveOtpSent(true); } catch (e: any) { setRemoveError(e.message || "Failed"); } setRemoveOtpLoading(false); };
  const removeEmail = async () => { if (!removeOtp || removeOtp.length < 4) { setRemoveError("Enter the code"); return; } setRemoveOtpLoading(true); setRemoveError(""); try { await api.post("/api/security/recovery-email/verify", { email: secEmail, code: removeOtp }); await api.put("/api/security/recovery-email", { email: null }); setSecEmail(""); setSecVerified(false); setShowRemoveEmail(false); setRemoveOtp(""); setRemoveOtpSent(false); } catch (e: any) { setRemoveError(e.message || "Invalid code"); } setRemoveOtpLoading(false); };

  // ── Sessions ──
  const revokeSession = async (id: string) => { try { await api.request(`/api/security/sessions?sessionId=${encodeURIComponent(id)}`, { method: "DELETE" }); setSessions((p) => p.filter((s) => s.id !== id)); } catch {} };
  const revokeAllSessions = async () => { try { await api.request("/api/security/sessions/revoke-all", { method: "DELETE" }); setSessions((p) => p.filter((s) => s.isCurrent)); } catch {} };

  const parseUA = (ua: string) => {
    let b = "Unknown", o = "Unknown";
    if (ua.includes("Firefox")) b = "Firefox"; else if (ua.includes("Edg")) b = "Edge"; else if (ua.includes("Chrome")) b = "Chrome"; else if (ua.includes("Safari")) b = "Safari";
    if (ua.includes("Windows")) o = "Windows"; else if (ua.includes("Mac OS X")) o = "macOS"; else if (ua.includes("Linux")) o = "Linux"; else if (ua.includes("Android")) o = "Android"; else if (ua.includes("iPhone") || ua.includes("iPad")) o = "iOS";
    return { browser: b, os: o };
  };

  const inputClassName = "w-full h-10 rounded-lg text-center text-[18px] font-bold tracking-[0.15em] border border-tb-border bg-tb-border text-tb-text-primary outline-none font-family:inherit";

  if (loading) return (
    <div className="flex flex-col gap-6 max-w-[1200px] mx-auto">
      <div><Skeleton width={200} height={22} className="mb-1.5" /><Skeleton width={300} height={13} /></div>
      {[1, 2, 3].map((i) => (
        <GlassCard className="p-6">
          <Skeleton width={160} height={16} className="mb-3" />
          <Skeleton width="100%" height={36} borderRadius={8} />
        </GlassCard>
      ))}
    </div>
  );

  return (
    <div className="flex flex-col gap-6 max-w-[1200px] mx-auto">

      {/* ── Page Header ── */}
      <div>
        <h1 className="text-[28px] font-bold text-tb-text-primary tracking-[-0.03em] flex items-center gap-2.5 m-0">
          <Shield size={24} className="text-tb-text-muted" />
          {t("security.title")}
        </h1>
        <p className="text-[14px] text-tb-text-muted mt-1">{t("security.subtitle")}</p>
      </div>

      {/* ── Must Change Password ── */}
      {user?.mustChangePassword && !hasPassword && (
        <GlassCard className="p-4 flex items-center gap-3 bg-[rgba(59,130,246,0.06)] border border-[rgba(59,130,246,0.15)]">
          <div className="flex-1">
            <div className="text-[15px] font-semibold text-tb-text-primary">{t("security.addPwTitle")}</div>
            <div className="text-[13px] text-tb-text-secondary mt-0.5">{t("security.addPwDesc")}</div>
          </div>
          <Btn variant="primary" onClick={() => setShowChangePwd(true)}>{t("security.addPwTitle")}</Btn>
        </GlassCard>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
           2FA
         ═══════════════════════════════════════════════════════════════════════ */}
      <GlassCard>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-tb-border">
          <div className="flex items-center gap-3">
            <GlassIcon><Fingerprint size={16} /></GlassIcon>
            <div>
              <div className="text-[15px] font-semibold text-tb-text-primary">{t("security.twoFactor")}</div>
              <div className="text-[12px] text-tb-text-muted mt-0.5">{totpEnabled ? t("security.twoFactorOn") : t("security.twoFactorOff")}</div>
            </div>
          </div>
          {totpEnabled
            ? <Badge color="#22C55E">{t("security.enabled")}</Badge>
            : <Badge color="var(--tb-text-muted)">{t("security.notEnabled")}</Badge>}
        </div>
        {/* Body */}
        <Row>
          <div className="flex-1 text-[13px] text-tb-text-secondary">
            {totpEnabled ? t("security.twoFactorEnabledDesc") : t("security.twoFactorDisabledDesc")}
          </div>
          {totpEnabled
            ? <Btn variant="danger" onClick={() => setShowDisable2FA(true)}>{t("security.disable2fa")}</Btn>
            : <Btn onClick={startSetup} disabled={totpLoading}>{totpLoading ? t("security.settingUp") : t("security.enable2fa")}</Btn>}
        </Row>
        {totpError && (
          <div className="px-5 pb-3.5 text-[13px] text-tb-red flex items-center gap-1.5">
            <AlertCircle size={13} /> {totpError}
          </div>
        )}
      </GlassCard>

      {/* ═══════════════════════════════════════════════════════════════════════
           Password
         ═══════════════════════════════════════════════════════════════════════ */}
      <GlassCard>
        <div className="flex items-center justify-between p-4 border-b border-tb-border">
          <div className="flex items-center gap-3">
            <GlassIcon><Lock size={16} /></GlassIcon>
            <div className="text-[15px] font-semibold text-tb-text-primary">{t("security.password")}</div>
          </div>
          {pwdSuccess && (
            <span className="text-[13px] text-[#22C55E] inline-flex items-center gap-1">
              <Check size={13} /> {t("security.changed")}
            </span>
          )}
        </div>
        <Row>
          <span className="flex-1 text-[14px] text-tb-text-primary font-mono tracking-[0.05em]">{hasPassword ? "••••••••" : t("security.notSet")}</span>
          <Btn variant="secondary" onClick={() => setShowChangePwd(true)}>{hasPassword ? t("security.change") : t("security.addPwTitle")}</Btn>
        </Row>
      </GlassCard>

      {/* ═══════════════════════════════════════════════════════════════════════
           Recovery Email
         ═══════════════════════════════════════════════════════════════════════ */}
      <GlassCard>
        <div className="flex items-center justify-between p-4 border-b border-tb-border">
          <div className="flex items-center gap-3">
            <GlassIcon><Mail size={16} /></GlassIcon>
            <div>
              <div className="text-[15px] font-semibold text-tb-text-primary">{t("security.secondaryEmail")}</div>
              <div className="text-[12px] text-tb-text-muted mt-0.5">{t("security.secondaryDesc")}</div>
            </div>
          </div>
          {secVerified && <Badge color="#22C55E">{t("security.verified")}</Badge>}
        </div>
        <Row>
          <span className="flex-1 text-[14px] text-tb-text-primary">{secEmail || t("security.noRecoveryEmail")}</span>
          <div className="flex gap-2">
            <Btn variant="secondary" onClick={() => { setNewEmail(""); setEmailStep("input"); setShowChangeEmail(true); }}>{secEmail ? t("security.change") : t("security.addEmail")}</Btn>
            {secEmail && <Btn variant="ghost" onClick={() => setShowRemoveEmail(true)} className="text-tb-red">{t("security.remove")}</Btn>}
          </div>
        </Row>
      </GlassCard>

      {/* ═══════════════════════════════════════════════════════════════════════
           Login History
         ═══════════════════════════════════════════════════════════════════════ */}
      <GlassCard>
        <div className="flex items-center justify-between p-4 border-b border-tb-border">
          <div className="flex items-center gap-3">
            <GlassIcon><History size={16} /></GlassIcon>
            <div>
              <div className="text-[15px] font-semibold text-tb-text-primary">{t("security.loginHistory")}</div>
              <div className="text-[12px] text-tb-text-muted mt-0.5">{t("security.loginCount").replace("{n}", String(loginHistory.length))}</div>
            </div>
          </div>
        </div>
        {loginHistory.length === 0 ? (
          <div className="py-12 px-6 text-center text-[14px] text-tb-text-muted">{t("security.noLoginHistory")}</div>
        ) : (
          <div>
            {loginHistory.slice(0, 8).map((l: any, idx: number) => {
              const { browser, os } = parseUA(l.userAgent || "");
              const ok = l.success !== false;
              return (
                <Row key={l.id} last={idx === Math.min(loginHistory.length, 8) - 1}>
                  <span className={`w-[7px] h-[7px] rounded-full flex-shrink-0 ${ok ? "bg-[#22C55E]" : "bg-[#EF4444]"}`} />
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-medium text-tb-text-primary">{browser} on {os} · {ok ? t("security.success") : t("security.failedStart")}</div>
                    <div className="text-[12px] text-tb-text-muted mt-0.5 flex items-center gap-1.5">
                      <Globe size={10} className="flex-shrink-0" /> {l.ipAddress || t("security.unknownIP")}
                      <span className="text-tb-text-disabled">·</span> {l.method || "password"}
                      <span className="text-tb-text-disabled">·</span> {new Date(l.createdAt).toLocaleString(lang)}
                    </div>
                  </div>
                </Row>
              );
            })}
          </div>
        )}
      </GlassCard>

      {/* ═══════════════════════════════════════════════════════════════════════
           Active Sessions
         ═══════════════════════════════════════════════════════════════════════ */}
      <GlassCard>
        <div className="flex items-center justify-between p-4 border-b border-tb-border">
          <div className="flex items-center gap-3">
            <GlassIcon><Monitor size={16} /></GlassIcon>
            <div>
              <div className="text-[15px] font-semibold text-tb-text-primary">{t("security.activeSessions")}</div>
              <div className="text-[12px] text-tb-text-muted mt-0.5">{t("security.sessionCount").replace("{n}", String(sessions.length))}</div>
            </div>
          </div>
          {sessions.some((s) => !s.isCurrent) && (
            <Btn variant="ghost" onClick={revokeAllSessions} className="text-tb-red">{t("security.revokeAllOthers")}</Btn>
          )}
        </div>
        {sessions.length === 0 ? (
          <div className="py-12 px-6 text-center text-[14px] text-tb-text-muted">{t("security.noActiveSessions")}</div>
        ) : (
          <div>
            {sessions.slice(0, 5).map((s: any, idx: number) => {
              const { browser, os } = parseUA(s.userAgent || "");
              return (
                <Row
                  key={s.id}
                  last={idx === Math.min(sessions.length, 5) - 1}
                  className="transition-colors duration-150"
                  onMouseEnter={(e: any) => (e.currentTarget.style.background = "var(--tb-surface-2)")}
                  onMouseLeave={(e: any) => (e.currentTarget.style.background = "transparent")}
                >
                  <GlassIcon color={s.isCurrent ? "#22C55E" : undefined}>
                    <Monitor size={14} />
                  </GlassIcon>
                  <div className="flex-1 min-w-0">
                    <div className="text-[14px] font-medium text-tb-text-primary flex items-center gap-2">
                      {browser} on {os}
                      {s.isCurrent && (
                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-[rgba(34,197,94,0.1)] text-[#22C55E] border border-[rgba(34,197,94,0.2)]">{t("security.currentBadge")}</span>
                      )}
                    </div>
                    <div className="text-[12px] text-tb-text-muted mt-0.5 flex items-center gap-1.5">
                      <Globe size={10} className="flex-shrink-0" /> {s.ipAddress || t("security.unknownIP")}
                      <span className="text-tb-text-disabled">·</span> {t("security.lastActive")} {new Date(s.lastSeenAt || s.createdAt).toLocaleString(lang)}
                    </div>
                  </div>
                  {!s.isCurrent && <Btn variant="ghost" onClick={() => revokeSession(s.id)} className="text-tb-red">{t("security.revokeBtn")}</Btn>}
                </Row>
              );
            })}
          </div>
        )}
      </GlassCard>

      {/* ═══════════════════════════════════════════════════════════════════════
           Recent Activity
         ═══════════════════════════════════════════════════════════════════════ */}
      <GlassCard>
        <div className="flex items-center justify-between p-4 border-b border-tb-border">
          <div className="flex items-center gap-3">
            <GlassIcon><Clock size={16} /></GlassIcon>
            <h3 className="text-[15px] font-semibold text-tb-text-primary">{t("security.recentActivity")}</h3>
          </div>
        </div>
        {activity.length === 0 ? (
          <div className="py-12 px-6 text-center text-[14px] text-tb-text-muted">{t("security.noRecentActivity")}</div>
        ) : (
          <div>
            {activity.slice(0, 8).map((a: any, idx: number) => {
              const act = (a.action || a.eventType || "").replace(/_/g, " ").replace(/\./g, " → ").replace(/^./, (c: string) => c.toUpperCase());
              const sev = a.severity || "info";
              const sevColor = sev === "warning" ? "#EAB308" : sev === "error" || sev === "critical" ? "#EF4444" : sev === "success" ? "#22C55E" : "var(--tb-text-muted)";
              const src = a.source === "security" ? t("security.srcSecurity") : a.source === "audit" ? t("security.srcAudit") : a.source === "login" ? t("security.srcAuth") : "";
              return (
                <Row key={a.id} last={idx === Math.min(activity.length, 8) - 1}>
                  <span className={`w-[7px] h-[7px] rounded-full flex-shrink-0`} style={{ background: sevColor }} />
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] text-tb-text-primary flex items-center gap-2">
                      {act}
                      {src && (
                        <span className="text-[10px] font-medium px-1.5 py-0.5 rounded text-tb-text-muted bg-tb-border">{src}</span>
                      )}
                    </div>
                    <div className="text-[12px] text-tb-text-muted mt-0.5 flex items-center gap-1.5">
                      {a.metadata?.ip && <><Globe size={10} className="flex-shrink-0" /> {a.metadata.ip} <span className="text-tb-text-disabled">·</span></>}
                      {new Date(a.createdAt).toLocaleString(lang)}
                    </div>
                  </div>
                </Row>
              );
            })}
          </div>
        )}
      </GlassCard>

      {/* ═══════════════════════════════════════════════════════════════════════
           DIALOGS
         ═══════════════════════════════════════════════════════════════════════ */}

      {/* 2FA Setup */}
      <Dialog open={show2FASetup && !!totpData} onClose={() => { setShow2FASetup(false); setTotpData(null); setTotpCode(""); }}>
        <DialogHeader title={t("security.setupTitle")} description={t("security.setupDesc")} onClose={() => { setShow2FASetup(false); setTotpData(null); setTotpCode(""); }} />
        <DialogBody>
          {totpData && <div className="flex flex-col items-center gap-4">
            <TirbeoQRCode value={totpData.uri} size={200} email={user?.email} />
            <div className="w-full">
              <label className="block text-xs font-medium text-tb-text-muted mb-1.5">{t("security.key")}</label>
              <div className="flex gap-2">
                <code className="flex-1 px-3 py-2 rounded-lg text-[12px] font-mono tracking-[0.05em] break-all border border-tb-border bg-tb-border text-tb-text-primary">{totpSecret}</code>
                <Btn onClick={async () => { try { await navigator.clipboard.writeText(totpSecret); } catch {} setCopiedKey(true); setTimeout(() => setCopiedKey(false), 1600); }}>{copiedKey ? <Check size={12} /> : <Copy size={12} />} {copiedKey ? t("common.saved") : t("security.copy")}</Btn>
              </div>
            </div>
            <div className="w-full">
              <input className={inputClassName} value={totpCode} onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ""))} placeholder="000 000" maxLength={6} inputMode="numeric" autoFocus />
              {totpError && <p className="text-[13px] text-tb-red mt-1.5">{totpError}</p>}
            </div>
          </div>}
        </DialogBody>
        <DialogFooter>
          <BtnCancel onClick={() => { setShow2FASetup(false); setTotpData(null); setTotpCode(""); }}>{t("security.skipForNow")}</BtnCancel>
          <BtnPrimary onClick={verifySetup} disabled={totpLoading || totpCode.length !== 6} loading={totpLoading}>{t("security.verifyEnable")}</BtnPrimary>
        </DialogFooter>
      </Dialog>

      {/* Disable 2FA */}
      <Dialog open={showDisable2FA} onClose={() => { setShowDisable2FA(false); setDisableCode(""); }}>
        <DialogHeader title={t("security.disable2fa")} description={t("security.disableDesc")} onClose={() => { setShowDisable2FA(false); setDisableCode(""); }} />
        <DialogBody>
          <input className="form-input w-full" value={disableCode} onChange={(e) => setDisableCode(e.target.value)} placeholder="000 000" maxLength={6} autoFocus />
          {totpError && <p className="text-[13px] text-tb-red mt-1">{totpError}</p>}
        </DialogBody>
        <DialogFooter>
          <BtnCancel onClick={() => { setShowDisable2FA(false); setDisableCode(""); }}>{t("security.keep2faEnabled")}</BtnCancel>
          <BtnDanger onClick={disable2FA} loading={totpLoading} disabled={disableCode.length !== 6}>{t("security.disable2fa")}</BtnDanger>
        </DialogFooter>
      </Dialog>

      {/* Backup Codes */}
      <Dialog open={backupCodes.length > 0} onClose={() => setBackupCodes([])}>
        <DialogHeader title={t("security.backupTitle")} description={t("security.backupDesc")} onClose={() => setBackupCodes([])} />
        <DialogBody>
          <WarningBlock>{t("security.saveCodesWarning")}</WarningBlock>
          <div className="grid grid-cols-2 gap-1.5">
            {backupCodes.map((c, i) => (
              <code key={i} className="px-3 py-2 rounded-lg text-[12px] font-mono text-center bg-tb-border border border-tb-border text-tb-text-primary">{c}</code>
            ))}
          </div>
        </DialogBody>
        <DialogFooter>
          <BtnPrimary onClick={() => navigator.clipboard.writeText(backupCodes.join("\n")).then(() => alert(t("security.copied")))}>{t("security.copyAll")}</BtnPrimary>
          <BtnCancel onClick={() => setBackupCodes([])}>{t("security.savedCodes")}</BtnCancel>
        </DialogFooter>
      </Dialog>

      {/* Change Password */}
      <Dialog open={showChangePwd} onClose={() => { setShowChangePwd(false); setPwdError(""); }}>
        <DialogHeader title={t("security.changeTitle")} description={hasPassword ? t("security.changeDesc") : t("security.addPwTitle")} onClose={() => { setShowChangePwd(false); setPwdError(""); }} />
        <DialogBody>
          {hasPassword && <ConfirmInput label={t("security.setCurrentPw")} value={pwdForm.current} onChange={(v) => setPwdForm((p) => ({ ...p, current: v }))} placeholder={t("security.enterCurrentPw")} icon={<Lock size={13} />} />}
          {!hasPassword && <WarningBlock>{t("security.addPwDesc")}</WarningBlock>}
          <ConfirmInput label={t("security.newPwPh")} value={pwdForm.new} onChange={(v) => setPwdForm((p) => ({ ...p, new: v }))} placeholder={t("security.newPwPh")} icon={<Key size={13} />} />
          <ConfirmInput label={t("security.reenterPw")} value={pwdForm.confirm} onChange={(v) => setPwdForm((p) => ({ ...p, confirm: v }))} placeholder={t("security.confirmPwPh")} icon={<Key size={13} />} />
          {pwdError && <p className="text-[13px] text-tb-red mt-1">{pwdError}</p>}
        </DialogBody>
        <DialogFooter>
          <BtnCancel onClick={() => { setShowChangePwd(false); setPwdError(""); }}>{t("security.keepCurrentPw")}</BtnCancel>
          <BtnPrimary onClick={changePassword} disabled={pwdSaving || (hasPassword && !pwdForm.current) || !pwdForm.new || !pwdForm.confirm} loading={pwdSaving}>{t("security.changePassword")}</BtnPrimary>
        </DialogFooter>
      </Dialog>

      {/* Change Email */}
      <Dialog open={showChangeEmail} onClose={() => { setShowChangeEmail(false); setEmailStep("input"); setEmailError(""); }}>
        <DialogHeader title={emailStep === "input" ? t("security.changeEmail") : t("security.verifyEmail")} description={emailStep === "input" ? t("security.secondaryDesc") : t("security.sentTo", { email: newEmail })} onClose={() => { setShowChangeEmail(false); setEmailStep("input"); setEmailError(""); }} />
        <DialogBody>
          {emailStep === "input"
            ? <ConfirmInput label={t("security.newEmailLabel")} value={newEmail} onChange={setNewEmail} placeholder={t("security.newEmailPh")} icon={<Mail size={13} />} />
            : <ConfirmInput label={t("security.code")} value={verifyCode} onChange={setVerifyCode} placeholder={t("security.enterCode")} icon={<Key size={13} />} />}
          {emailError && <p className="text-[13px] text-tb-red mt-1">{emailError}</p>}
        </DialogBody>
        <DialogFooter>
          <BtnCancel onClick={() => { setShowChangeEmail(false); setEmailStep("input"); setEmailError(""); }}>{t("security.dontChangeEmail")}</BtnCancel>
          {emailStep === "input"
            ? <BtnPrimary onClick={sendEmailCode} disabled={emailLoading || !newEmail.includes("@")} loading={emailLoading}>{t("security.sendCode")}</BtnPrimary>
            : <BtnPrimary onClick={verifyEmailCode} disabled={emailLoading || !verifyCode} loading={emailLoading}>{t("security.verify")}</BtnPrimary>}
        </DialogFooter>
      </Dialog>

      {/* Remove Recovery Email */}
      <Dialog open={showRemoveEmail} onClose={() => { setShowRemoveEmail(false); setRemoveOtp(""); setRemoveOtpSent(false); setRemoveError(""); }}>
        <DialogHeader title={t("security.removeRecoveryTitle")} description={t("security.removeRecoveryDesc").replace("{email}", secEmail)} onClose={() => { setShowRemoveEmail(false); setRemoveOtp(""); setRemoveOtpSent(false); setRemoveError(""); }} />
        <DialogBody>
          {!removeOtpSent
            ? <Btn variant="primary" onClick={sendRemoveOtp} disabled={removeOtpLoading} className="w-full justify-center h-10">{t("security.sendCodeBtn")}</Btn>
            : <ConfirmInput label={`Enter code sent to ${secEmail}`} value={removeOtp} onChange={(v) => setRemoveOtp(v.replace(/\D/g, ""))} placeholder="000 000" icon={<Key size={13} />} />}
          {removeError && <p className="text-[13px] text-tb-red mt-1">{removeError}</p>}
        </DialogBody>
        <DialogFooter>
          <BtnCancel onClick={() => { setShowRemoveEmail(false); setRemoveOtp(""); setRemoveOtpSent(false); setRemoveError(""); }}>{t("security.keepRecoveryEmail")}</BtnCancel>
          <BtnDanger onClick={removeEmail} disabled={!removeOtpSent || removeOtpLoading || removeOtp.length < 4} loading={removeOtpLoading}>{t("security.removeEmailBtn")}</BtnDanger>
        </DialogFooter>
      </Dialog>

    </div>
  );
}
