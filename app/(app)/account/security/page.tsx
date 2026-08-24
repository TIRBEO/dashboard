"use client";
import { useEffect, useState } from "react";
import { api, getCurrentUser } from "@/lib/api";
import { setDirtyGlobal } from "@/lib/unsaved";
import {
  AlertCircle, Check, Copy, History, Key, Lock, Mail,
  Monitor, Shield, X,
} from "lucide-react";
import { Skeleton } from "@/components/ui/Skeleton";
import { useI18n } from "@/lib/i18n";
import TirbeoQRCode from "@/components/TirbeoQRCode";

export default function SecurityPage() {
  const { t, lang } = useI18n();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // 2FA
  const [totpEnabled, setTotpEnabled] = useState(false);
  const [show2FASetup, setShow2FASetup] = useState(false);
  const [totpData, setTotpData] = useState<{ secret: string; uri: string } | null>(null);
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
      .then((u) => {
        setUser(u);
        setTotpEnabled(!!u.totpEnabled);
        setSecEmail(u.recoveryEmail || u.secondaryEmail || "");
        setSecVerified(!!(u.recoveryEmailVerified || u.secondaryEmailVerified));
        setHasPassword(!!u.hasPassword);
      })
      .catch(() => {})
      .finally(() => setLoading(false));

    // Fetch sessions, activity & login history
    api.get<any>('/api/security/sessions').then(s => setSessions(Array.isArray(s) ? s : [])).catch(() => {});
    api.get<any>('/api/user/activity?limit=10').then(a => setActivity(Array.isArray(a) ? a : [])).catch(() => {});
    api.get<any>('/api/security/login-history?limit=15').then(r => setLoginHistory(Array.isArray(r?.logs) ? r.logs : Array.isArray(r) ? r : [])).catch(() => {});
  }, []);

  // ── 2FA ──
  const startSetup = async () => {
    setTotpLoading(true); setTotpError("");
    try {
      const data = await api.post<any>("/api/security/totp/setup");
      setTotpData(data); setShow2FASetup(true);
    } catch (e: any) { setTotpError(e.message || t("security.failed")); }
    setTotpLoading(false);
  };

  const verifySetup = async () => {
    if (totpCode.length !== 6) { setTotpError(t("security.enter6")); return; }
    setTotpLoading(true); setTotpError("");
    try {
      const data = await api.post<any>("/api/security/totp/verify", { code: totpCode, secret: totpData?.secret });
      setTotpEnabled(true); setShow2FASetup(false); setTotpData(null); setTotpCode("");
      if (data?.backupCodes) setBackupCodes(data.backupCodes);
    } catch (e: any) { setTotpError(e.message || t("security.invalidCode")); setTotpCode(""); }
    setTotpLoading(false);
  };

  const disable2FA = async () => {
    if (disableCode.length !== 6) { setTotpError(t("security.enter6")); return; }
    setTotpLoading(true); setTotpError("");
    try {
      await api.request("/api/security/totp/disable", { method: "DELETE", body: JSON.stringify({ totpCode: disableCode }) });
      setTotpEnabled(false); setShowDisable2FA(false); setDisableCode("");
    } catch (e: any) { setTotpError(e.message || t("security.disable2faFailed")); }
    setTotpLoading(false);
  };

  // ── Password ──
  const changePassword = async () => {
    if (pwdForm.new !== pwdForm.confirm) { setPwdError(t("security.pwdMismatch")); return; }
    if (pwdForm.new.length < 8) { setPwdError("Password must be at least 8 characters"); return; }
    setPwdSaving(true); setPwdError("");
    try {
      const body: any = { newPassword: pwdForm.new };
      if (hasPassword) body.currentPassword = pwdForm.current;
      await api.post("/api/security/password", body);
      setShowChangePwd(false); setPwdForm({ current: "", new: "", confirm: "" }); setHasPassword(true); setUser((p: any) => p ? ({ ...p, mustChangePassword: false }) : p);
      setPwdSuccess(true); setTimeout(() => setPwdSuccess(false), 3000);
    } catch (e: any) { setPwdError(e.message || t("security.failed")); }
    setPwdSaving(false);
  };

  // ── Recovery email ──
  const sendEmailCode = async () => {
    if (!newEmail.includes("@")) { setEmailError(t("security.enterValidEmail")); return; }
    setEmailLoading(true); setEmailError("");
    try { await api.post("/api/security/recovery-email/send-code", { email: newEmail }); setEmailStep("verify"); }
    catch (e: any) { setEmailError(e.message || t("security.sendFailed")); }
    setEmailLoading(false);
  };

  const verifyEmailCode = async () => {
    if (!verifyCode || verifyCode.length < 4) { setEmailError(t("security.enterCodeErr")); return; }
    setEmailLoading(true); setEmailError("");
    try {
      await api.post("/api/security/recovery-email/verify", { email: newEmail, code: verifyCode });
      setSecEmail(newEmail); setSecVerified(true); setShowChangeEmail(false); setEmailStep("input"); setNewEmail(""); setVerifyCode("");
    } catch (e: any) { setEmailError(e.message || t("security.invalidCode")); }
    setEmailLoading(false);
  };

  const sendRemoveOtp = async () => {
    setRemoveError(""); setRemoveOtpLoading(true);
    try {
      await api.post("/api/security/recovery-email/send-code", { email: secEmail });
      setRemoveOtpSent(true);
    } catch (e: any) { setRemoveError(e.message || "Failed to send code"); }
    setRemoveOtpLoading(false);
  };

  const removeEmail = async () => {
    if (!removeOtp || removeOtp.length < 4) { setRemoveError("Enter the verification code"); return; }
    setRemoveOtpLoading(true); setRemoveError("");
    try {
      await api.post("/api/security/recovery-email/verify", { email: secEmail, code: removeOtp });
      await api.put("/api/security/recovery-email", { email: null });
      setSecEmail(""); setSecVerified(false); setShowRemoveEmail(false); setRemoveOtp(""); setRemoveOtpSent(false);
    } catch (e: any) { setRemoveError(e.message || "Invalid code"); }
    setRemoveOtpLoading(false);
  };

  // ── Sessions ──
  const revokeSession = async (sessionId: string) => {
    try {
      await api.request('/api/security/sessions', { method: 'DELETE', body: JSON.stringify({ sessionId }) });
      setSessions(prev => prev.filter(s => s.id !== sessionId));
    } catch (e: any) { console.error('Failed to revoke session', e); }
  };

  const revokeAllSessions = async () => {
    try {
      await api.request('/api/security/sessions/revoke-all', { method: 'DELETE' });
      setSessions(prev => prev.filter(s => s.isCurrent));
    } catch (e: any) { console.error('Failed to revoke sessions', e); }
  };

  if (loading) return (
    <div className="page-stack">
      <div><Skeleton width={140} height={24} style={{ marginBottom: 6 }} /><Skeleton width={280} height={14} /></div>
      {[1, 2, 3].map((i) => (
        <div key={i} className="dashboard-card">
          <Skeleton width={180} height={18} style={{ marginBottom: 16 }} />
          <div className="field-row"><Skeleton width={120} height={14} /><div style={{ flex: 1, display: "flex", justifyContent: "flex-end" }}><Skeleton width={80} height={28} borderRadius={6} /></div></div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="page-stack">
      <div className="page-header">
        <div className="page-header-row">
          <div className="page-header-left">
            <h1 className="page-header-title">{t("security.title")}</h1>
            <p className="page-header-description">{t("security.subtitle")}</p>
          </div>
        </div>
      </div>

      {/* ═══ 2FA ═══ */}
      <div className="dashboard-card" style={{ padding: 0 }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--tb-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: totpEnabled ? 'rgba(16,185,129,0.12)' : 'var(--tb-surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Shield size={16} style={{ color: totpEnabled ? 'var(--tb-green)' : 'var(--tb-text-muted)' }} />
            </div>
            <div>
              <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--tb-text-primary)', margin: 0 }}>{t('security.twoFactor')}</h3>
              <p style={{ fontSize: 13, color: 'var(--tb-text-muted)', margin: 0 }}>{totpEnabled ? t('security.twoFactorOn') : t('security.twoFactorOff')}</p>
            </div>
          </div>
        </div>
        <div style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 13, color: 'var(--tb-text-secondary)' }}>{t('security.status')}</span>
            <span className={`badge ${totpEnabled ? 'badge-success' : 'badge-neutral'}`}>{totpEnabled ? t('security.enabled') : t('security.notEnabled')}</span>
          </div>
          {totpEnabled ? (
            <button className="btn btn-danger btn-sm" onClick={() => setShowDisable2FA(true)}>{t('security.disable2fa')}</button>
          ) : (
            <button className="btn btn-primary btn-sm" onClick={startSetup} disabled={totpLoading}>
              {totpLoading ? <><span className="btn-spinner" /> {t('security.setupLoading')}</> : t('security.enable2fa')}
            </button>
          )}
        </div>
        {totpError && <div style={{ padding: '0 20px 12px', fontSize: 12, color: 'var(--tb-red, #ef4444)', display: 'flex', alignItems: 'center', gap: 5 }}><AlertCircle size={13} /> {totpError}</div>}
      </div>

      {/* ═══ Password ═══ */}
      <div className="dashboard-card" style={{ padding: 0 }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--tb-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--tb-surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Lock size={16} style={{ color: 'var(--tb-text-muted)' }} />
            </div>
            <div>
              <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--tb-text-primary)', margin: 0 }}>{t('security.password')}</h3>
            </div>
          </div>
        </div>
        <div style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 13, color: 'var(--tb-text-secondary)' }}>{t('security.passwordLabel')}</span>
            {hasPassword ? (
              <span style={{ fontSize: 14, color: 'var(--tb-text-muted)', letterSpacing: 4, fontFamily: 'monospace' }}>••••••••</span>
            ) : (
              <span style={{ fontSize: 13, fontStyle: 'italic', color: 'var(--tb-text-muted)' }}>Not set — sign in with email login</span>
            )}
          </div>
          {pwdSuccess ? (
            <span style={{ fontSize: 12, color: 'var(--tb-green)', display: 'flex', alignItems: 'center', gap: 4 }}><Check size={13} /> {t('security.changed')}</span>
          ) : (
            <button className="btn btn-secondary btn-sm" onClick={() => setShowChangePwd(true)}>{hasPassword ? t('security.change') : "Add password"}</button>
          )}
        </div>
      </div>

      {/* ═══ Recovery Email ═══ */}
      <div className="dashboard-card" style={{ padding: 0 }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--tb-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: secVerified ? 'rgba(16,185,129,0.12)' : 'var(--tb-surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Mail size={16} style={{ color: secVerified ? 'var(--tb-green)' : 'var(--tb-text-muted)' }} />
            </div>
            <div>
              <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--tb-text-primary)', margin: 0 }}>{t('security.secondaryEmail')}</h3>
              <p style={{ fontSize: 13, color: 'var(--tb-text-muted)', margin: 0 }}>{t('security.secondaryDesc')}</p>
            </div>
          </div>
        </div>
        {secEmail && secVerified ? (
          <div style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 13, color: 'var(--tb-text-secondary)' }}>{t('security.email')}</span>
              <span style={{ fontSize: 14, color: 'var(--tb-text-primary)' }}>{secEmail}</span>
              <span className="badge badge-success" style={{ fontSize: 10 }}>{t('security.verified')}</span>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <button className="btn btn-secondary btn-sm" onClick={() => { setNewEmail(''); setEmailStep('input'); setShowChangeEmail(true); }}>{t('security.change')}</button>
              <button className="btn btn-ghost btn-sm" style={{ color: 'var(--tb-red, #ef4444)' }} onClick={() => setShowRemoveEmail(true)}>{t('security.remove')}</button>
            </div>
          </div>
        ) : (
          <div style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 13, color: 'var(--tb-text-muted)' }}>{t('security.noSecondaryEmail')}</span>
            <button className="btn btn-primary btn-sm" onClick={() => { setNewEmail(''); setEmailStep('input'); setShowChangeEmail(true); }}>{t('security.addEmail')}</button>
          </div>
        )}
      </div>

      {/* ═══ Login History ═══ */}
      <div className="dashboard-card" style={{ padding: 0 }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--tb-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--tb-surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <History size={16} style={{ color: 'var(--tb-text-muted)' }} />
            </div>
            <div>
              <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--tb-text-primary)', margin: 0 }}>Login History</h3>
              <p style={{ fontSize: 13, color: 'var(--tb-text-muted)', margin: 0 }}>{loginHistory.length} login{loginHistory.length !== 1 ? 's' : ''} recorded</p>
            </div>
          </div>
        </div>
        {loginHistory.length === 0 ? (
          <div style={{ padding: '20px', textAlign: 'center', fontSize: 13, color: 'var(--tb-text-muted)' }}>No login history yet</div>
        ) : loginHistory.slice(0, 8).map((l: any) => {
          const ua = l.userAgent || '';
          let browser = 'Unknown';
          if (ua.includes('Firefox')) browser = 'Firefox';
          else if (ua.includes('Edg')) browser = 'Edge';
          else if (ua.includes('Chrome')) browser = 'Chrome';
          else if (ua.includes('Safari')) browser = 'Safari';
          let os = 'Unknown';
          if (ua.includes('Windows')) os = 'Windows';
          else if (ua.includes('Mac OS X')) os = 'macOS';
          else if (ua.includes('Linux')) os = 'Linux';
          else if (ua.includes('Android')) os = 'Android';
          else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';
          const success = l.success !== false;
          return (
            <div key={l.id} style={{ padding: '10px 20px', borderBottom: '1px solid var(--tb-border)', display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: success ? 'var(--tb-green, #10b981)' : 'var(--tb-red, #ef4444)', flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, color: 'var(--tb-text-primary)' }}>{browser} on {os} · {success ? 'Success' : 'Failed'}</div>
                <div style={{ fontSize: 12, color: 'var(--tb-text-muted)', marginTop: 1 }}>
                  {l.ipAddress || 'Unknown IP'} · {l.method || 'password'} · {new Date(l.createdAt).toLocaleString(lang)}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ═══ Active Sessions ═══ */}
      <div className="dashboard-card" style={{ padding: 0 }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--tb-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--tb-surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Monitor size={16} style={{ color: 'var(--tb-text-muted)' }} />
            </div>
            <div>
              <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--tb-text-primary)', margin: 0 }}>Active Sessions</h3>
              <p style={{ fontSize: 13, color: 'var(--tb-text-muted)', margin: 0 }}>{sessions.length} session{sessions.length !== 1 ? 's' : ''} active</p>
            </div>
            {sessions.filter((s: any) => !s.isCurrent).length > 0 && (
              <button className="btn btn-ghost btn-sm" style={{ color: 'var(--tb-red, #ef4444)', fontSize: 12 }} onClick={revokeAllSessions}>Revoke all others</button>
            )}
          </div>
        </div>
        {sessions.length === 0 ? (
          <div style={{ padding: '20px', textAlign: 'center', fontSize: 13, color: 'var(--tb-text-muted)' }}>No active sessions</div>
        ) : sessions.slice(0, 5).map((s: any) => {
          const ua = s.userAgent || '';
          let browser = 'Unknown';
          if (ua.includes('Firefox')) browser = 'Firefox';
          else if (ua.includes('Edg')) browser = 'Edge';
          else if (ua.includes('Chrome')) browser = 'Chrome';
          else if (ua.includes('Safari')) browser = 'Safari';
          let os = 'Unknown';
          if (ua.includes('Windows')) os = 'Windows';
          else if (ua.includes('Mac OS X')) os = 'macOS';
          else if (ua.includes('Linux')) os = 'Linux';
          else if (ua.includes('Android')) os = 'Android';
          else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';
          return (
            <div key={s.id} style={{ padding: '12px 20px', borderBottom: '1px solid var(--tb-border)', display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: s.isCurrent ? 'rgba(16,185,129,0.12)' : 'var(--tb-surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Monitor size={14} style={{ color: s.isCurrent ? 'var(--tb-green)' : 'var(--tb-text-muted)' }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--tb-text-primary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  {browser} on {os}
                  {s.isCurrent && <span className="badge badge-success" style={{ fontSize: 10 }}>Current</span>}
                </div>
                <div style={{ fontSize: 12, color: 'var(--tb-text-muted)', marginTop: 2 }}>
                  {s.ipAddress || 'Unknown IP'} · Last active {new Date(s.lastSeenAt || s.createdAt).toLocaleString(lang)}
                </div>
              </div>
              {!s.isCurrent && (
                <button className="btn btn-ghost btn-sm" style={{ color: 'var(--tb-red, #ef4444)', fontSize: 12, flexShrink: 0 }} onClick={() => revokeSession(s.id)}>Revoke</button>
              )}
            </div>
          );
        })}
      </div>

      {/* ═══ Recent Activity ═══ */}
      <div className="dashboard-card" style={{ padding: 0 }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--tb-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--tb-surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <History size={16} style={{ color: 'var(--tb-text-muted)' }} />
            </div>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--tb-text-primary)', margin: 0 }}>Recent Activity</h3>
          </div>
        </div>
        {activity.length === 0 ? (
          <div style={{ padding: '20px', textAlign: 'center', fontSize: 13, color: 'var(--tb-text-muted)' }}>No recent activity</div>
        ) : activity.slice(0, 8).map((a: any) => {
          const action = a.action || a.eventType || 'unknown';
          const severity = a.severity || 'info';
          const sevColor = severity === 'warning' ? 'var(--tb-yellow, #eab308)' : severity === 'error' || severity === 'critical' ? 'var(--tb-red, #ef4444)' : severity === 'success' ? 'var(--tb-green, #10b981)' : 'var(--tb-text-muted)';
          const sourceLabel = a.source === 'security' ? 'Security' : a.source === 'audit' ? 'Audit' : '';
          const friendlyAction = action.replace(/_/g, ' ').replace(/\./g, ' → ').replace(/^./, (c: string) => c.toUpperCase());
          return (
            <div key={a.id} style={{ padding: '10px 20px', borderBottom: '1px solid var(--tb-border)', display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: sevColor, flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, color: 'var(--tb-text-primary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  {friendlyAction}
                  {sourceLabel && <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 4, background: 'var(--tb-surface-2)', color: 'var(--tb-text-muted)' }}>{sourceLabel}</span>}
                </div>
                <div style={{ fontSize: 12, color: 'var(--tb-text-muted)', marginTop: 1 }}>
                  {a.metadata?.ip && <span>{a.metadata.ip} · </span>}
                  {new Date(a.createdAt).toLocaleString(lang)}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ═══ 2FA Setup Dialog ═══ */}
      {show2FASetup && totpData && (
        <div className="tb-dialog-overlay" onClick={() => { setShow2FASetup(false); setTotpData(null); setTotpCode(""); }}>
          <div className="tb-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="tb-dialog-header">
              <div>
                <h3 className="tb-dialog-title">{t("security.setupTitle")}</h3>
                <p className="tb-dialog-desc">{t("security.setupDesc")}</p>
              </div>
              <button className="header-control" onClick={() => { setShow2FASetup(false); setTotpData(null); }}><X size={16} /></button>
            </div>
            <div className="tb-dialog-body">
              <div className="qr-stage">
                <TirbeoQRCode value={totpData.uri} size={220} email={user?.email} />
              </div>
              <div className="field-group">
                <label className="form-label">{t("security.key")}</label>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <code className="form-input" style={{ flex: 1, fontSize: 12.5, fontFamily: "monospace", letterSpacing: "0.06em", wordBreak: "break-all" }}>{totpData.secret}</code>
                  <button className={`btn btn-ghost btn-sm ${copiedKey ? "qr-copied" : ""}`} onClick={async () => { try { await navigator.clipboard.writeText(totpData.secret); } catch {} setCopiedKey(true); setTimeout(() => setCopiedKey(false), 1600); }}>
                    {copiedKey ? <Check size={13} /> : <Copy size={13} />} {copiedKey ? t("common.saved") : t("security.copy")}
                  </button>
                </div>
              </div>
              <div className="field-group">
                <input className="form-input" value={totpCode} onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ""))} placeholder="000 000" maxLength={6} inputMode="numeric" autoComplete="one-time-code" autoFocus style={{ letterSpacing: 1, textAlign: "center", fontSize: 20, fontWeight: 600, height: 46 }} />
                {totpError && <p style={{ fontSize: 12, color: "var(--tb-red, #ef4444)", marginTop: 6 }}>{totpError}</p>}
              </div>
            </div>
            <div className="tb-dialog-footer">
              <button className="btn btn-ghost btn-sm" onClick={() => { setShow2FASetup(false); setTotpData(null); setTotpCode(""); }}>{t("common.cancel")}</button>
              <button className="btn btn-primary btn-sm" onClick={verifySetup} disabled={totpLoading || totpCode.length !== 6}>
                {totpLoading ? <><span className="btn-spinner" /> {t("security.verifying")}</> : t("security.verifyEnable")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ Disable 2FA Dialog ═══ */}
      {showDisable2FA && (
        <div className="tb-dialog-overlay" onClick={() => { setShowDisable2FA(false); setDisableCode(""); }}>
          <div className="tb-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="tb-dialog-header">
              <div>
                <h3 className="tb-dialog-title">{t("security.disable2fa")}</h3>
                <p className="tb-dialog-desc">{t("security.disableDesc")}</p>
              </div>
              <button className="header-control" onClick={() => { setShowDisable2FA(false); setDisableCode(""); }}><X size={16} /></button>
            </div>
            <div className="tb-dialog-body">
              <input className="form-input" value={disableCode} onChange={(e) => setDisableCode(e.target.value)} placeholder="000 000" maxLength={6} style={{ letterSpacing: 1, textAlign: "center", fontSize: 20, height: 44 }} autoFocus />
            </div>
            <div className="tb-dialog-footer">
              <button className="btn btn-ghost btn-sm" onClick={() => { setShowDisable2FA(false); setDisableCode(""); }}>{t("common.cancel")}</button>
              <button className="btn btn-danger btn-sm" onClick={disable2FA} disabled={totpLoading || disableCode.length !== 6}>
                {totpLoading ? <><span className="btn-spinner" /> {t("security.disabling")}</> : t("security.disable2fa")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ Backup Codes Dialog ═══ */}
      {backupCodes.length > 0 && (
        <div className="tb-dialog-overlay" onClick={() => setBackupCodes([])}>
          <div className="tb-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="tb-dialog-header">
              <div>
                <h3 className="tb-dialog-title">{t("security.backupTitle")}</h3>
                <p className="tb-dialog-desc">{t("security.backupDesc")}</p>
              </div>
              <button className="header-control" onClick={() => setBackupCodes([])}><X size={16} /></button>
            </div>
            <div className="tb-dialog-body">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                {backupCodes.map((c, i) => (
                  <code key={i} style={{ padding: "8px 12px", border: "1px solid var(--tb-border)", borderRadius: 6, fontSize: 13, fontFamily: "monospace", textAlign: "center", background: "var(--tb-surface-2)" }}>{c}</code>
                ))}
              </div>
            </div>
            <div className="tb-dialog-footer">
              <button className="btn btn-primary btn-sm" onClick={() => navigator.clipboard.writeText(backupCodes.join("\n")).then(() => alert(t("security.copied")))}>{t("security.copyAll")}</button>
              <button className="btn btn-ghost btn-sm" onClick={() => setBackupCodes([])}>{t("security.done")}</button>
            </div>
          </div>
        </div>
      )}

      {(user as any)?.mustChangePassword && !hasPassword && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', padding: '13px 18px', borderRadius: 12, border: '1px solid var(--tb-accent)', background: 'var(--tb-surface-2)', marginBottom: 16 }}>
          <div style={{ flex: 1, minWidth: 220 }}>
            <div style={{ fontSize: 13.5, fontWeight: 700 }}>Add a password to your account</div>
            <div style={{ fontSize: 12.5, color: 'var(--tb-text-secondary)' }}>You signed up with a social login and don&apos;t have a password yet. Adding one lets you sign in with your email too.</div>
          </div>
          <button className="btn btn-primary btn-sm" onClick={() => setShowChangePwd(true)}>Add password</button>
        </div>
      )}

      {/* ═══ Change Password Dialog ═══ */}
      {showChangePwd && (
        <div className="tb-dialog-overlay" onClick={() => { setShowChangePwd(false); setPwdError(""); }}>
          <div className="tb-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="tb-dialog-header">
              <div>
                <h3 className="tb-dialog-title">{t("security.changeTitle")}</h3>
                <p className="tb-dialog-desc">{hasPassword ? t("security.changeDesc") : "Set a password for your account"}</p>
              </div>
              <button className="header-control" onClick={() => { setShowChangePwd(false); setPwdError(""); }}><X size={16} /></button>
            </div>
            <div className="tb-dialog-body">
              {hasPassword ? (
                <div className="field-group">
                  <label className="form-label">{t("security.current")}</label>
                  <input className="form-input" type="password" value={pwdForm.current} onChange={(e) => setPwdForm((p) => ({ ...p, current: e.target.value }))} placeholder={t("security.currentPh")} autoFocus />
                </div>
              ) : (
                <p style={{ fontSize: 12.5, color: 'var(--tb-text-secondary)', margin: '0 0 12px' }}>Your email is already verified — just choose a password and you&apos;ll be able to sign in with it too.</p>
              )}
              <div className="field-group">
                <label className="form-label">{t("security.new")}</label>
                <input className="form-input" type="password" value={pwdForm.new} onChange={(e) => setPwdForm((p) => ({ ...p, new: e.target.value }))} placeholder={t("security.newPh")} autoFocus={!hasPassword} />
              </div>
              <div className="field-group">
                <label className="form-label">{t("security.confirm")}</label>
                <input className="form-input" type="password" value={pwdForm.confirm} onChange={(e) => setPwdForm((p) => ({ ...p, confirm: e.target.value }))} placeholder={t("security.confirmPh")} />
              </div>
              {pwdError && <p style={{ fontSize: 12, color: "var(--tb-red, #ef4444)", marginTop: 8 }}>{pwdError}</p>}
            </div>
            <div className="tb-dialog-footer">
              <button className="btn btn-ghost btn-sm" onClick={() => { setShowChangePwd(false); setPwdError(""); }}>{t("common.cancel")}</button>
              <button className="btn btn-primary btn-sm" onClick={changePassword} disabled={pwdSaving || (hasPassword && !pwdForm.current) || !pwdForm.new || !pwdForm.confirm}>
                {pwdSaving ? <><span className="btn-spinner" /> {t("common.saving")}</> : t("security.changePassword")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ Change Email Dialog ═══ */}
      {showChangeEmail && (
        <div className="tb-dialog-overlay" onClick={() => { setShowChangeEmail(false); setEmailStep("input"); setEmailError(""); }}>
          <div className="tb-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="tb-dialog-header">
              <div>
                <h3 className="tb-dialog-title">{emailStep === "input" ? t("security.changeEmail") : t("security.verifyEmail")}</h3>
                <p className="tb-dialog-desc">{emailStep === "input" ? t("security.secondaryDesc") : t("security.sentTo", { email: newEmail })}</p>
              </div>
              <button className="header-control" onClick={() => { setShowChangeEmail(false); setEmailStep("input"); setEmailError(""); }}><X size={16} /></button>
            </div>
            <div className="tb-dialog-body">
              {emailStep === "input" ? (
                <div className="field-group">
                  <label className="form-label">{t("security.newEmailLabel")}</label>
                  <input className="form-input" type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder={t("security.newEmailPh")} autoFocus />
                </div>
              ) : (
                <div className="field-group">
                  <label className="form-label">{t("security.code")}</label>
                  <input className="form-input" value={verifyCode} onChange={(e) => setVerifyCode(e.target.value)} placeholder={t("security.enterCode")} maxLength={8} autoFocus />
                </div>
              )}
              {emailError && <p style={{ fontSize: 12, color: "var(--tb-red, #ef4444)", marginTop: 8 }}>{emailError}</p>}
            </div>
            <div className="tb-dialog-footer">
              <button className="btn btn-ghost btn-sm" onClick={() => { setShowChangeEmail(false); setEmailStep("input"); setEmailError(""); }}>{t("common.cancel")}</button>
              {emailStep === "input" ? (
                <button className="btn btn-primary btn-sm" onClick={sendEmailCode} disabled={emailLoading || !newEmail.includes("@")}>
                  {emailLoading ? <><span className="btn-spinner" /> {t("security.sending")}</> : t("security.sendCode")}
                </button>
              ) : (
                <button className="btn btn-primary btn-sm" onClick={verifyEmailCode} disabled={emailLoading || !verifyCode}>
                  {emailLoading ? <><span className="btn-spinner" /> {t("security.verifying")}</> : t("security.verify")}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ═══ Remove Recovery Email Confirmation ═══ */}
      {showRemoveEmail && (
        <div className="tb-dialog-overlay" onClick={() => { setShowRemoveEmail(false); setRemoveOtp(""); setRemoveOtpSent(false); setRemoveError(""); }}>
          <div className="tb-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="tb-dialog-header">
              <div>
                <h3 className="tb-dialog-title">Remove recovery email</h3>
                <p className="tb-dialog-desc">A verification code will be sent to <strong>{secEmail}</strong>. Enter it to confirm removal.</p>
              </div>
              <button className="header-control" onClick={() => { setShowRemoveEmail(false); setRemoveOtp(""); setRemoveOtpSent(false); setRemoveError(""); }}><X size={16} /></button>
            </div>
            <div className="tb-dialog-body">
              {!removeOtpSent ? (
                <button className="btn btn-primary btn-sm" onClick={sendRemoveOtp} disabled={removeOtpLoading} style={{ width: "100%" }}>
                  {removeOtpLoading ? <><span className="btn-spinner" /> Sending code</> : "Send verification code"}
                </button>
              ) : (
                <div className="field-group">
                  <label className="form-label">Enter the code sent to {secEmail}</label>
                  <input className="form-input" value={removeOtp} onChange={(e) => setRemoveOtp(e.target.value.replace(/\D/g, ""))} placeholder="000 000" maxLength={6} autoFocus style={{ letterSpacing: 1, textAlign: "center", fontSize: 18, height: 44 }} />
                </div>
              )}
              {removeError && <p style={{ fontSize: 12, color: "var(--tb-red, #ef4444)", marginTop: 8 }}>{removeError}</p>}
            </div>
            <div className="tb-dialog-footer">
              <button className="btn btn-ghost btn-sm" onClick={() => { setShowRemoveEmail(false); setRemoveOtp(""); setRemoveOtpSent(false); setRemoveError(""); }}>{t("common.cancel")}</button>
              <button className="btn btn-danger btn-sm" onClick={removeEmail} disabled={!removeOtpSent || removeOtpLoading || removeOtp.length < 4}>
                {removeOtpLoading ? <><span className="btn-spinner" /> Removing</> : "Remove email"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
