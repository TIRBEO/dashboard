"use client";
import { useEffect, useState } from "react";
import { api, getCurrentUser } from "@/lib/api";
import {
  AlertCircle,
  Check,
  History,
  Key,
  Lock,
  Mail,
  Monitor,
  Shield,
  X,
} from "lucide-react";
import { Skeleton } from "@/components/ui/Skeleton";
import { useI18n } from "@/lib/i18n";

export default function SecurityPage() {
  const { t, lang } = useI18n();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // 2FA
  const [totpEnabled, setTotpEnabled] = useState(false);
  const [show2FASetup, setShow2FASetup] = useState(false);
  const [totpData, setTotpData] = useState<{ secret: string; uri: string } | null>(null);
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

  // Secondary email
  const [secEmail, setSecEmail] = useState("");
  const [secVerified, setSecVerified] = useState(false);
  const [showChangeEmail, setShowChangeEmail] = useState(false);
  const [emailStep, setEmailStep] = useState<"input" | "verify">("input");
  const [newEmail, setNewEmail] = useState("");
  const [verifyCode, setVerifyCode] = useState("");
  const [emailError, setEmailError] = useState("");
  const [emailLoading, setEmailLoading] = useState(false);

  useEffect(() => {
    getCurrentUser()
      .then((u) => {
        setUser(u);
        setTotpEnabled(!!u.totpEnabled);
        setSecEmail(u.recoveryEmail || u.secondaryEmail || "");
        setSecVerified(!!(u.recoveryEmailVerified || u.secondaryEmailVerified));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // ── 2FA handlers ──
  const startSetup = async () => {
    setTotpLoading(true);
    setTotpError("");
    try {
      const data = await api.post<any>("/api/security/totp/setup");
      setTotpData(data);
      setShow2FASetup(true);
    } catch (e: any) {
      setTotpError(e.message || t("security.failed"));
    }
    setTotpLoading(false);
  };

  const verifySetup = async () => {
    if (totpCode.length !== 6) { setTotpError(t("security.enter6")); return; }
    setTotpLoading(true);
    setTotpError("");
    try {
      const data = await api.post<any>("/api/security/totp/verify", { code: totpCode });
      setTotpEnabled(true);
      setShow2FASetup(false);
      setTotpData(null);
      setTotpCode("");
      if (data?.backupCodes) setBackupCodes(data.backupCodes);
    } catch (e: any) {
      setTotpError(e.message || t("security.invalidCode"));
      setTotpCode("");
    }
    setTotpLoading(false);
  };

  const disable2FA = async () => {
    if (disableCode.length !== 6) { setTotpError(t("security.enter6")); return; }
    setTotpLoading(true);
    setTotpError("");
    try {
      await api.request("/api/security/totp/disable", { method: "DELETE", body: JSON.stringify({ totpCode: disableCode }) });
      setTotpEnabled(false);
      setShowDisable2FA(false);
      setDisableCode("");
    } catch (e: any) {
      setTotpError(e.message || t("security.disable2faFailed"));
    }
    setTotpLoading(false);
  };

  // ── Password handlers ──
  const changePassword = async () => {
    if (pwdForm.new !== pwdForm.confirm) { setPwdError(t("security.pwdMismatch")); return; }
    setPwdSaving(true);
    setPwdError("");
    try {
      await api.post("/api/auth/change-password", { currentPassword: pwdForm.current, newPassword: pwdForm.new });
      setShowChangePwd(false);
      setPwdForm({ current: "", new: "", confirm: "" });
      setPwdSuccess(true);
      setTimeout(() => setPwdSuccess(false), 3000);
    } catch (e: any) {
      setPwdError(e.message || t("security.failed"));
    }
    setPwdSaving(false);
  };

  // ── Secondary email handlers ──
  const sendEmailCode = async () => {
    if (!newEmail.includes("@")) { setEmailError(t("security.enterValidEmail")); return; }
    setEmailLoading(true);
    setEmailError("");
    try {
      await api.post("/api/security/recovery-email/send-code", { email: newEmail });
      setEmailStep("verify");
    } catch (e: any) {
      setEmailError(e.message || t("security.sendFailed"));
    }
    setEmailLoading(false);
  };

  const verifyEmailCode = async () => {
    if (!verifyCode || verifyCode.length < 4) { setEmailError(t("security.enterCodeErr")); return; }
    setEmailLoading(true);
    setEmailError("");
    try {
      await api.post("/api/security/recovery-email/verify", { email: newEmail, code: verifyCode });
      setSecEmail(newEmail);
      setSecVerified(true);
      setShowChangeEmail(false);
      setEmailStep("input");
      setNewEmail("");
      setVerifyCode("");
    } catch (e: any) {
      setEmailError(e.message || t("security.invalidCode"));
    }
    setEmailLoading(false);
  };

  const removeEmail = async () => {
    try {
      await api.put("/api/security/recovery-email", { email: null });
      setSecEmail("");
      setSecVerified(false);
    } catch {}
  };

  if (loading) {
    return (
      <div className="page-stack">
        <div><Skeleton width={140} height={24} style={{ marginBottom: 6 }} /><Skeleton width={280} height={14} /></div>
        {[1, 2, 3].map((i) => (
          <div key={i} className="dashboard-card">
            <Skeleton width={180} height={18} style={{ marginBottom: 16 }} />
            <div className="field-row">
              <Skeleton width={120} height={14} />
              <div style={{ flex: 1, display: "flex", justifyContent: "flex-end" }}><Skeleton width={80} height={28} borderRadius={6} /></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

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
      <div className="dashboard-card">
        <h3 className="section-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Shield size={15} /> {t("security.twoFactor")}
        </h3>
        <p className="section-desc">
          {totpEnabled ? t("security.twoFactorOn") : t("security.twoFactorOff")}
        </p>
        <div className="field-row">
          <label className="field-label">{t("security.status")}</label>
          <div className="field-control" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span className={`badge ${totpEnabled ? "badge-success" : "badge-neutral"}`} style={{ fontSize: 11 }}>
              {totpEnabled ? t("security.enabled") : t("security.notEnabled")}
            </span>
            {totpEnabled ? (
              <button className="btn btn-danger btn-sm" onClick={() => setShowDisable2FA(true)}>{t("security.disable2fa")}</button>
            ) : (
              <button className="btn btn-primary btn-sm" onClick={startSetup} disabled={totpLoading}>
                {totpLoading ? <><span className="btn-spinner" /> {t("security.setupLoading")}</> : t("security.enable2fa")}
              </button>
            )}
          </div>
        </div>
        {totpError && (
          <div style={{ padding: "0 16px 8px", display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--tb-red, #ef4444)" }}>
            <AlertCircle size={13} /> {totpError}
          </div>
        )}
      </div>

      {/* ═══ Password ═══ */}
      <div className="dashboard-card">
        <h3 className="section-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Lock size={15} /> {t("security.password")}
        </h3>
        <div className="field-row">
          <label className="field-label">{t("security.passwordLabel")}</label>
          <div className="field-control" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 14, color: "var(--tb-text-muted)", letterSpacing: 4 }}>••••••••</span>
            {pwdSuccess ? (
              <span style={{ fontSize: 12, color: "var(--tb-green)", display: "flex", alignItems: "center", gap: 4 }}><Check size={13} /> {t("security.changed")}</span>
            ) : (
              <button className="btn btn-secondary btn-sm" onClick={() => setShowChangePwd(true)}>{t("security.change")}</button>
            )}
          </div>
        </div>
      </div>

      {/* ═══ Secondary Email ═══ */}
      <div className="dashboard-card">
        <h3 className="section-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Mail size={15} /> {t("security.secondaryEmail")}
        </h3>
        <p className="section-desc">{t("security.secondaryDesc")}</p>
        {secEmail && secVerified ? (
          <div className="field-row">
            <label className="field-label">{t("security.email")}</label>
            <div className="field-control" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 14, color: "var(--tb-text-primary)" }}>{secEmail}</span>
                <span className="badge badge-success" style={{ fontSize: 10 }}>{t("security.verified")}</span>
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <button className="btn btn-secondary btn-sm" onClick={() => { setNewEmail(""); setEmailStep("input"); setShowChangeEmail(true); }}>{t("security.change")}</button>
                <button className="btn btn-ghost btn-sm" style={{ color: "var(--tb-red, #ef4444)" }} onClick={removeEmail}>{t("security.remove")}</button>
              </div>
            </div>
          </div>
        ) : (
          <div className="field-row">
            <label className="field-label">{t("security.email")}</label>
            <div className="field-control" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: 13, color: "var(--tb-text-muted)" }}>{t("security.noSecondaryEmail")}</span>
              <button className="btn btn-primary btn-sm" onClick={() => { setNewEmail(""); setEmailStep("input"); setShowChangeEmail(true); }}>{t("security.addEmail")}</button>
            </div>
          </div>
        )}
      </div>

      {/* ═══ Login History ═══ */}
      <div className="dashboard-card" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ padding: "16px 18px 12px", borderBottom: "1px solid var(--tb-border)" }}>
          <h3 className="section-title" style={{ margin: 0, display: "flex", alignItems: "center", gap: 8, fontSize: 14 }}>
            <History size={14} /> {t("security.loginHistory")}
          </h3>
        </div>
        <div style={{ padding: 0 }}>
          {user?.lastActiveAt ? (
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 18px", borderBottom: "1px solid var(--tb-border)" }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--tb-green, #10b981)", flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, color: "var(--tb-text-primary)" }}>{t("security.lastActive")}</div>
                <div style={{ fontSize: 12, color: "var(--tb-text-muted)" }}>{new Date(user.lastActiveAt).toLocaleString(lang)}</div>
              </div>
            </div>
          ) : (
            <div className="empty-note">{t("security.noLoginHistory")}</div>
          )}
        </div>
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
              <button className="header-control" onClick={() => { setShow2FASetup(false); setTotpData(null); }}>
                <X size={16} />
              </button>
            </div>
            <div className="tb-dialog-body">
              <div style={{ textAlign: "center", marginBottom: 16 }}>
                <div style={{ display: "inline-block", padding: 16, border: "1px solid var(--tb-border)", borderRadius: 12, background: "#fff" }}>
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(totpData.uri)}`}
                    alt="QR Code"
                    width={180}
                    height={180}
                    style={{ display: "block" }}
                  />
                </div>
              </div>
              <div style={{ marginBottom: 12 }}>
                <label className="form-label">{t("security.key")}</label>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <code style={{ flex: 1, fontSize: 13, fontFamily: "monospace", wordBreak: "break-all", color: "var(--tb-text-primary)", padding: "8px 12px", background: "var(--tb-surface-2)", borderRadius: 6, border: "1px solid var(--tb-border)" }}>
                    {totpData.secret}
                  </code>
                  <button className="btn btn-ghost btn-sm" onClick={() => navigator.clipboard.writeText(totpData.secret)}>{t("security.copy")}</button>
                </div>
              </div>
              <div>
                <label className="form-label">{t("security.code")}</label>
                <input
                  className="form-input"
                  value={totpCode}
                  onChange={(e) => setTotpCode(e.target.value)}
                  placeholder={t("security.enter6")}
                  maxLength={6}
                  style={{ letterSpacing: 6, textAlign: "center", fontSize: 20, height: 44 }}
                  autoFocus
                />
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
              <button className="header-control" onClick={() => { setShowDisable2FA(false); setDisableCode(""); }}>
                <X size={16} />
              </button>
            </div>
            <div className="tb-dialog-body">
              <input className="form-input" value={disableCode} onChange={(e) => setDisableCode(e.target.value)} placeholder={t("security.enter6")} maxLength={6} style={{ letterSpacing: 6, textAlign: "center", fontSize: 20, height: 44 }} autoFocus />
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

      {/* ═══ Change Password Dialog ═══ */}
      {showChangePwd && (
        <div className="tb-dialog-overlay" onClick={() => { setShowChangePwd(false); setPwdError(""); }}>
          <div className="tb-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="tb-dialog-header">
              <div>
                <h3 className="tb-dialog-title">{t("security.changeTitle")}</h3>
                <p className="tb-dialog-desc">{t("security.changeDesc")}</p>
              </div>
              <button className="header-control" onClick={() => { setShowChangePwd(false); setPwdError(""); }}><X size={16} /></button>
            </div>
            <div className="tb-dialog-body">
              <div style={{ marginBottom: 12 }}>
                <label className="form-label">{t("security.current")}</label>
                <input className="form-input" type="password" value={pwdForm.current} onChange={(e) => setPwdForm((p) => ({ ...p, current: e.target.value }))} placeholder={t("security.currentPh")} autoFocus />
              </div>
              <div style={{ marginBottom: 12 }}>
                <label className="form-label">{t("security.new")}</label>
                <input className="form-input" type="password" value={pwdForm.new} onChange={(e) => setPwdForm((p) => ({ ...p, new: e.target.value }))} placeholder={t("security.newPh")} />
              </div>
              <div>
                <label className="form-label">{t("security.confirm")}</label>
                <input className="form-input" type="password" value={pwdForm.confirm} onChange={(e) => setPwdForm((p) => ({ ...p, confirm: e.target.value }))} placeholder={t("security.confirmPh")} />
              </div>
              {pwdError && <p style={{ fontSize: 12, color: "var(--tb-red, #ef4444)", marginTop: 8 }}>{pwdError}</p>}
            </div>
            <div className="tb-dialog-footer">
              <button className="btn btn-ghost btn-sm" onClick={() => { setShowChangePwd(false); setPwdError(""); }}>{t("common.cancel")}</button>
              <button className="btn btn-primary btn-sm" onClick={changePassword} disabled={pwdSaving || !pwdForm.current || !pwdForm.new || !pwdForm.confirm}>
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
                <p className="tb-dialog-desc">
                  {emailStep === "input" ? t("security.secondaryDesc") : t("security.sentTo", { email: newEmail })}
                </p>
              </div>
              <button className="header-control" onClick={() => { setShowChangeEmail(false); setEmailStep("input"); setEmailError(""); }}><X size={16} /></button>
            </div>
            <div className="tb-dialog-body">
              {emailStep === "input" ? (
                <div>
                  <label className="form-label">{t("security.newEmailLabel")}</label>
                  <input className="form-input" type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder={t("security.newEmailPh")} autoFocus />
                </div>
              ) : (
                <div>
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
    </div>
  );
}
