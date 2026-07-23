"use client";

import { useState, useEffect, useRef } from "react";
import {
  Shield, ShieldCheck, ShieldAlert, ShieldX, KeyRound, Smartphone, Eye, EyeOff,
  Monitor, Tablet, Globe, ChevronRight, ChevronDown, RefreshCw, Copy,
  LogOut, Fingerprint, Clock, MapPin,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { SecuritySkeleton } from "../../components/Skeleton";
import {
  PageContainer, PageHeader, Card, SettingRow, Toggle, Input, Button, Badge, Toast, useToast,
} from "../components";

const API = process.env.NEXT_PUBLIC_API_URL || "https://api.tirbeo.app";

type SecurityEvent = {
  id: string;
  type: "sign_in" | "password_change" | "2fa_enable" | "2fa_disable" | "recovery_change" | "session_revoke" | "passkey_add";
  description: string;
  date: string;
  location?: string;
  ip?: string;
  userAgent?: string;
};

type Device = {
  id: string;
  name: string;
  type: "desktop" | "mobile" | "tablet" | "unknown";
  lastActive: string;
  location?: string;
  ip?: string;
  userAgent?: string;
  isCurrent: boolean;
};

type SecurityInfo = {
  hasPassword: boolean;
  is2FAEnabled: boolean;
  recoveryCodesCount: number;
  sessions: { id: string; createdAt: string; userAgent?: string; ipAddress?: string; location?: string }[];
  recoveryEmail?: string;
  recoveryPhone?: string;
  backupCodes?: string[];
  events?: SecurityEvent[];
  devices?: Device[];
  passkeys?: { id: string; name: string; createdAt: string }[];
  lastPasswordChange?: string;
  totpEnabled?: boolean;
  skipPassword?: boolean;
  phones?: { number: string; verified: boolean }[];
  passwordCheckResult?: { weak: number; reused: number; total: number };
};

function getDeviceIcon(type: Device["type"]) {
  switch (type) {
    case "desktop": return <Monitor size={16} />;
    case "mobile": return <Smartphone size={16} />;
    case "tablet": return <Tablet size={16} />;
    default: return <Globe size={16} />;
  }
}

function getEventIcon(type: SecurityEvent["type"]) {
  switch (type) {
    case "sign_in": return <ShieldCheck size={14} style={{ color: "var(--success)" }} />;
    case "password_change": return <KeyRound size={14} style={{ color: "var(--warning)" }} />;
    case "2fa_enable": return <ShieldCheck size={14} style={{ color: "var(--success)" }} />;
    case "2fa_disable": return <ShieldX size={14} style={{ color: "var(--danger)" }} />;
    case "recovery_change": return <RefreshCw size={14} style={{ color: "var(--text-muted)" }} />;
    case "session_revoke": return <ShieldAlert size={14} style={{ color: "var(--danger)" }} />;
    case "passkey_add": return <Fingerprint size={14} style={{ color: "var(--success)" }} />;
    default: return <Shield size={14} style={{ color: "var(--text-muted)" }} />;
  }
}

function getPasswordStrength(pw: string): { score: number; label: string; color: string } {
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (score <= 2) return { score: 1, label: "Weak", color: "var(--danger)" };
  if (score <= 3) return { score: 2, label: "Medium", color: "var(--warning)" };
  return { score: 3, label: "Strong", color: "var(--success)" };
}

function maskPhone(phone: string): string {
  if (phone.length <= 4) return phone;
  return phone.slice(0, 3) + "-" + phone.slice(3);
}

const ICON_WRAP: React.CSSProperties = {
  width: 28, height: 28, borderRadius: "50%",
  background: "rgba(255,255,255,0.04)", border: "1px solid var(--border)",
  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1,
};
const META: React.CSSProperties = { fontSize: 11, color: "var(--text-muted)" };
const DOT: React.CSSProperties = { fontSize: 11, color: "var(--text-ash)" };

const defaultEvents = [
  { icon: <ShieldCheck size={14} style={{ color: "var(--success)" }} />, desc: "New sign-in on Chrome \u00b7 Windows", date: "Today, 2:14 PM", loc: "Kathmandu, Nepal", ip: "192.168.1.1" },
  { icon: <KeyRound size={14} style={{ color: "var(--warning)" }} />, desc: "Password changed", date: "Jun 17, 2026", loc: "Kathmandu, Nepal", ip: "192.168.1.1" },
  { icon: <ShieldCheck size={14} style={{ color: "var(--success)" }} />, desc: "2-step verification enabled", date: "Jun 17, 2026", loc: "Kathmandu, Nepal", ip: "192.168.1.1" },
  { icon: <Fingerprint size={14} style={{ color: "var(--success)" }} />, desc: "Passkey added", date: "Jun 10, 2026", loc: "Kathmandu, Nepal", ip: "192.168.1.1" },
];

export default function SecurityPage() {
  const { toast, show: showToast, hide: hideToast } = useToast();
  const [info, setInfo] = useState<SecurityInfo | null>(null);
  const fetched = useRef(false);

  const [showChangePassword, setShowChangePassword] = useState(false);
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [changingPw, setChangingPw] = useState(false);
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);

  const [showBackupCodes, setShowBackupCodes] = useState(false);
  const [regeneratingCodes, setRegeneratingCodes] = useState(false);

  const [showTotpSetup, setShowTotpSetup] = useState(false);
  const [totpCode, setTotpCode] = useState("");
  const [totpSecret, setTotpSecret] = useState("");
  const [totpUri, setTotpUri] = useState("");
  const [verifyingTotp, setVerifyingTotp] = useState(false);

  const [skipPassword, setSkipPassword] = useState(true);
  const [showPasswordCheck, setShowPasswordCheck] = useState(false);
  const [checkingPasswords, setCheckingPasswords] = useState(false);
  const [passwordCheckResult, setPasswordCheckResult] = useState<{ weak: number; reused: number; total: number } | null>(null);

  const [addPhoneMode, setAddPhoneMode] = useState(false);
  const [newPhone, setNewPhone] = useState("");

  const [addRecoveryEmail, setAddRecoveryEmail] = useState(false);
  const [newRecoveryEmail, setNewRecoveryEmail] = useState("");

  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;

    fetch(`${API}/api/profile`, { credentials: "include" })
      .then(r => (r.ok ? r.json() : null))
      .then(d => {
        if (d) setInfo({
          hasPassword: d.hasPassword ?? false,
          is2FAEnabled: d.is2FAEnabled ?? false,
          recoveryCodesCount: d.recoveryCodesCount ?? 0,
          sessions: [],
          recoveryEmail: d.recoveryEmail ?? undefined,
          recoveryPhone: d.recoveryPhone ?? undefined,
          lastPasswordChange: d.lastPasswordChange ?? undefined,
          totpEnabled: d.totpEnabled ?? false,
          skipPassword: d.skipPassword ?? true,
          passkeys: d.passkeys ?? [],
          phones: d.phones ?? [],
          backupCodes: d.backupCodes ?? [],
        });
      })
      .catch(() => {});

    fetch(`${API}/api/security/sessions`, { credentials: "include" })
      .then(r => (r.ok ? r.json() : null))
      .then(d => {
        if (d?.sessions) setInfo(prev => prev ? {
          ...prev,
          sessions: d.sessions,
          devices: d.sessions.map((s: { id: string; createdAt: string; userAgent?: string; ipAddress?: string; location?: string }, i: number) => ({
            id: s.id,
            name: s.userAgent?.split(" ").slice(-1)[0] || "Unknown device",
            type: (s.userAgent?.toLowerCase().includes("mobile") ? "mobile"
              : s.userAgent?.toLowerCase().includes("tablet") ? "tablet" : "desktop") as Device["type"],
            lastActive: s.createdAt,
            location: s.location,
            ip: s.ipAddress,
            userAgent: s.userAgent,
            isCurrent: i === 0,
          })),
        } : prev);
      })
      .catch(() => {});

    fetch(`${API}/api/security/events`, { credentials: "include" })
      .then(r => (r.ok ? r.json() : null))
      .then(d => { if (d?.events) setInfo(prev => prev ? { ...prev, events: d.events } : prev); })
      .catch(() => {});
  }, []);

  const changePassword = async () => {
    if (!currentPw || !newPw) { showToast("Fill in all fields", "error"); return; }
    if (newPw.length < 8) { showToast("New password must be 8+ characters", "error"); return; }
    if (newPw !== confirmPw) { showToast("Passwords don't match", "error"); return; }
    setChangingPw(true);
    try {
      const res = await fetch(`${API}/api/security/password`, {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: currentPw, newPassword: newPw }),
      });
      if (res.ok) {
        showToast("Password changed successfully");
        setCurrentPw(""); setNewPw(""); setConfirmPw(""); setShowChangePassword(false);
        setInfo(prev => prev ? { ...prev, lastPasswordChange: new Date().toISOString() } : prev);
      } else {
        const msg = await res.text();
        showToast(msg || "Failed to change password", "error");
      }
    } catch { showToast("Connection error", "error"); }
    setChangingPw(false);
  };

  const revokeSession = async (sessionId: string) => {
    if (!window.confirm("Sign out of this device? You can't undo this.")) return;
    try {
      await fetch(`${API}/api/security/sessions/${sessionId}`, { method: "DELETE", credentials: "include" });
      setInfo(prev => prev ? {
        ...prev,
        sessions: prev.sessions.filter(s => s.id !== sessionId),
        devices: prev.devices?.filter(d => d.id !== sessionId),
      } : prev);
      showToast("Device signed out");
    } catch { showToast("Failed to sign out device", "error"); }
  };

  const signOutAllOther = async () => {
    if (!window.confirm("Sign out of all other devices? This will end all other sessions.")) return;
    try {
      await fetch(`${API}/api/security/sessions/revoke-all`, { method: "DELETE", credentials: "include" });
      setInfo(prev => prev ? {
        ...prev,
        sessions: prev.sessions.filter((_, i) => i === 0),
        devices: prev.devices?.filter(d => d.isCurrent),
      } : prev);
      showToast("All other devices signed out");
    } catch { showToast("Failed to sign out devices", "error"); }
  };

  const regenerateBackupCodes = async () => {
    if (!window.confirm("Generate new backup codes? Your old codes will stop working.")) return;
    setRegeneratingCodes(true);
    try {
      const res = await fetch(`${API}/api/security/backup-codes/regenerate`, { method: "POST", credentials: "include" });
      if (res.ok) {
        const d = await res.json();
        setInfo(prev => prev ? { ...prev, backupCodes: d.codes, recoveryCodesCount: d.codes.length } : prev);
        setShowBackupCodes(true);
        showToast("New backup codes generated");
      } else { showToast("Failed to regenerate codes", "error"); }
    } catch { showToast("Connection error", "error"); }
    setRegeneratingCodes(false);
  };

  const setupTotp = async () => {
    try {
      const res = await fetch(`${API}/api/security/totp/setup`, { method: "POST", credentials: "include" });
      if (res.ok) {
        const d = await res.json();
        setTotpSecret(d.secret);
        setTotpUri(d.uri || "otpauth://totp/Tirbeo:" + encodeURIComponent(info?.recoveryEmail || "user") + "?secret=" + d.secret + "&issuer=Tirbeo");
        setShowTotpSetup(true);
      } else { showToast("Failed to start TOTP setup", "error"); }
    } catch { showToast("Connection error", "error"); }
  };

  const verifyTotp = async () => {
    if (totpCode.length !== 6) { showToast("Enter the 6-digit code", "error"); return; }
    setVerifyingTotp(true);
    try {
      const res = await fetch(`${API}/api/security/totp/verify`, {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: totpCode }),
      });
      if (res.ok) {
        showToast("Authenticator app enabled");
        setInfo(prev => prev ? { ...prev, totpEnabled: true, is2FAEnabled: true } : prev);
        setShowTotpSetup(false); setTotpCode("");
      } else { showToast("Invalid code, try again", "error"); }
    } catch { showToast("Connection error", "error"); }
    setVerifyingTotp(false);
  };

  const disableTotp = async () => {
    if (!window.confirm("Disable authenticator app? Your account will be less secure.")) return;
    try {
      const res = await fetch(`${API}/api/security/totp/disable`, { method: "DELETE", credentials: "include" });
      if (res.ok) {
        showToast("Authenticator app disabled");
        setInfo(prev => prev ? { ...prev, totpEnabled: false } : prev);
      } else { showToast("Failed to disable", "error"); }
    } catch { showToast("Connection error", "error"); }
  };

  const addPhone = async () => {
    if (!newPhone.trim()) { showToast("Enter a phone number", "error"); return; }
    try {
      const res = await fetch(`${API}/api/security/phones`, {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ number: newPhone }),
      });
      if (res.ok) {
        showToast("Phone number added");
        setInfo(prev => prev ? {
          ...prev,
          phones: [...(prev.phones ?? []), { number: newPhone, verified: true }],
          recoveryPhone: newPhone,
        } : prev);
        setNewPhone(""); setAddPhoneMode(false);
      } else { showToast("Failed to add phone", "error"); }
    } catch { showToast("Connection error", "error"); }
  };

  const removePhone = async (number: string) => {
    if (!window.confirm("Remove " + number + "?")) return;
    try {
      await fetch(`${API}/api/security/phones`, {
        method: "DELETE", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ number }),
      });
      setInfo(prev => prev ? {
        ...prev,
        phones: prev.phones?.filter(p => p.number !== number),
        recoveryPhone: prev.recoveryPhone === number ? undefined : prev.recoveryPhone,
      } : prev);
      showToast("Phone removed");
    } catch { showToast("Connection error", "error"); }
  };

  const updateRecoveryEmail = async () => {
    if (!newRecoveryEmail.trim() || !newRecoveryEmail.includes("@")) { showToast("Enter a valid email", "error"); return; }
    try {
      const res = await fetch(`${API}/api/security/recovery-email`, {
        method: "PUT", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: newRecoveryEmail }),
      });
      if (res.ok) {
        showToast("Recovery email updated");
        setInfo(prev => prev ? { ...prev, recoveryEmail: newRecoveryEmail } : prev);
        setNewRecoveryEmail(""); setAddRecoveryEmail(false);
      } else { showToast("Failed to update email", "error"); }
    } catch { showToast("Connection error", "error"); }
  };

  const runPasswordCheck = async () => {
    setCheckingPasswords(true); setPasswordCheckResult(null);
    try {
      const res = await fetch(`${API}/api/security/password-check`, { method: "POST", credentials: "include" });
      if (res.ok) setPasswordCheckResult(await res.json());
      else showToast("Password check not available", "error");
    } catch { showToast("Connection error", "error"); }
    setCheckingPasswords(false);
  };

  if (!info) return <SecuritySkeleton />;

  const pwStrength = getPasswordStrength(newPw);
  const pwDesc = info.hasPassword
    ? info.lastPasswordChange
      ? "Last changed " + new Date(info.lastPasswordChange).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
      : "Password set"
    : "No password set \u2014 signed in with social account";
  const passkeyDesc = info.passkeys && info.passkeys.length > 0
    ? info.passkeys.length + " passkey" + (info.passkeys.length !== 1 ? "s" : "")
    : "No passkeys added";
  const phoneDesc = info.phones && info.phones.length > 0
    ? info.phones.map(p => maskPhone(p.number)).join(", ")
    : "No phone numbers added";
  const backupDesc = info.recoveryCodesCount > 0
    ? info.recoveryCodesCount + " code" + (info.recoveryCodesCount !== 1 ? "s" : "") + " available"
    : "No backup codes";

  const eventList = (!info.events || info.events.length === 0) ? defaultEvents : info.events.slice(0, 5).map(ev => ({
    icon: getEventIcon(ev.type),
    desc: ev.description,
    date: new Date(ev.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    loc: ev.location,
    ip: ev.ip,
  }));

  return (
    <PageContainer>
      <PageHeader title="Security" description="Manage your sign-in methods, devices, and account protection" />

      {/* ── Recent Security Activity ── */}
      <Card
        title="Recent security activity"
        action={<Button variant="ghost" size="sm">Review activity <ChevronRight size={12} /></Button>}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {eventList.map((ev, i) => (
            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
              <div style={ICON_WRAP}>{ev.icon}</div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 13, color: "var(--text)", fontWeight: 500 }}>{ev.desc}</p>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 3 }}>
                  <span style={META}>{ev.date}</span>
                  {ev.loc && (
                    <>
                      <span style={DOT}>{"\u00b7"}</span>
                      <span style={{ ...META, display: "flex", alignItems: "center", gap: 3 }}>
                        <MapPin size={10} /> {ev.loc}
                      </span>
                    </>
                  )}
                  {ev.ip && (
                    <>
                      <span style={DOT}>{"\u00b7"}</span>
                      <span style={META}>{ev.ip}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* ── How you sign in to Tirbeo ── */}
      <Card title="How you sign in to Tirbeo">

        {/* Passkeys */}
        <SettingRow label="Passkeys and security keys" description={passkeyDesc}>
          <Button variant="ghost" size="sm">Manage passkeys</Button>
          <Button variant="ghost" size="sm">Add passkey</Button>
        </SettingRow>

        {/* Password */}
        <SettingRow label="Password" description={pwDesc} border={!showChangePassword}>
          <Button variant="ghost" size="sm" onClick={() => setShowChangePassword(!showChangePassword)}>
            {info.hasPassword ? "Change password" : "Set password"}
            <ChevronDown size={12} style={{ transition: "transform 0.2s", transform: showChangePassword ? "rotate(180deg)" : "rotate(0deg)" }} />
          </Button>
        </SettingRow>
        {showChangePassword && (
          <div className="glass-subtle" style={{ padding: 20, display: "flex", flexDirection: "column", gap: 14, animation: "fadeIn 0.2s ease" }}>
            {info.hasPassword && (
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 500, color: "var(--text-muted)", marginBottom: 6 }}>Current password</label>
                <div style={{ position: "relative" }}>
                  <input type={showCurrentPw ? "text" : "password"} value={currentPw} onChange={e => setCurrentPw(e.target.value)} className="input-field" style={{ paddingRight: 36 }} placeholder="Enter current password" />
                  <button type="button" onClick={() => setShowCurrentPw(!showCurrentPw)} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", background: "none", border: "none", cursor: "pointer", padding: 4 }}>
                    {showCurrentPw ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>
            )}
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 500, color: "var(--text-muted)", marginBottom: 6 }}>New password</label>
              <div style={{ position: "relative" }}>
                <input type={showNewPw ? "text" : "password"} value={newPw} onChange={e => setNewPw(e.target.value)} className="input-field" style={{ paddingRight: 36 }} placeholder="8+ characters" />
                <button type="button" onClick={() => setShowNewPw(!showNewPw)} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", background: "none", border: "none", cursor: "pointer", padding: 4 }}>
                  {showNewPw ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              {newPw.length > 0 && (
                <div style={{ marginTop: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <div style={{ flex: 1, height: 3, borderRadius: 2, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
                      <div style={{ height: "100%", width: (pwStrength.score / 3) * 100 + "%", background: pwStrength.color, borderRadius: 2, transition: "width 0.3s ease, background 0.3s ease" }} />
                    </div>
                    <span style={{ fontSize: 10, fontWeight: 600, color: pwStrength.color, minWidth: 50 }}>{pwStrength.label}</span>
                  </div>
                </div>
              )}
            </div>
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 500, color: "var(--text-muted)", marginBottom: 6 }}>Confirm password</label>
              <input type="password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)} className="input-field" placeholder="Repeat new password" />
              {confirmPw.length > 0 && confirmPw !== newPw && (
                <p style={{ fontSize: 10, color: "var(--danger)", marginTop: 4 }}>{"Passwords don\u2019t match"}</p>
              )}
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
              <Button onClick={changePassword} disabled={changingPw}>{changingPw ? "Changing..." : "Change Password"}</Button>
              <Button variant="ghost" onClick={() => { setShowChangePassword(false); setCurrentPw(""); setNewPw(""); setConfirmPw(""); }}>Cancel</Button>
            </div>
          </div>
        )}

        {/* Skip password */}
        <SettingRow label="Skip password when possible" description="Use passkeys or other sign-in methods instead of a password">
          <Toggle checked={skipPassword} onChange={() => setSkipPassword(!skipPassword)} />
        </SettingRow>

        {/* Authenticator app */}
        <SettingRow label="Authenticator app" description={info.totpEnabled ? "Enabled" : "Not set up"} border={!showTotpSetup}>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {info.totpEnabled && <Badge variant="success" style={{ fontSize: 10 }}>Active</Badge>}
            {info.totpEnabled
              ? <Button variant="danger" size="sm" onClick={disableTotp}>Disable</Button>
              : <Button variant="ghost" size="sm" onClick={setupTotp}>Set up</Button>}
          </div>
        </SettingRow>
        {showTotpSetup && (
          <div className="glass-subtle" style={{ padding: 20, display: "flex", flexDirection: "column", gap: 16, animation: "fadeIn 0.2s ease" }}>
            <div style={{ display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap" }}>
              <div style={{ width: 180, height: 180, borderRadius: 12, background: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, padding: 10, boxShadow: "0 0 0 1px rgba(0,0,0,0.08)" }}>
                <QRCodeSVG value={totpUri || "otpauth://totp/Tirbeo:user@example.com?secret=JBSWY3DPEHPK3PXP&issuer=Tirbeo"} size={160} bgColor="#ffffff" fgColor="#000000" level="M" style={{ borderRadius: 4 }} />
              </div>
              <div style={{ flex: 1, minWidth: 200, display: "flex", flexDirection: "column", gap: 12 }}>
                <div>
                  <p style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 6 }}>Or enter this key manually:</p>
                  <div style={{ padding: "8px 12px", borderRadius: 8, background: "rgba(255,255,255,0.04)", border: "1px solid var(--border)", fontFamily: "monospace", fontSize: 13, color: "var(--text)", letterSpacing: "0.05em", wordBreak: "break-all", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span>{totpSecret || "JBSWY3DPEHPK3PXP"}</span>
                    <button onClick={() => { navigator.clipboard.writeText(totpSecret || "JBSWY3DPEHPK3PXP"); showToast("Copied to clipboard"); }} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: 4 }}>
                      <Copy size={12} />
                    </button>
                  </div>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 500, color: "var(--text-muted)", marginBottom: 6 }}>Enter 6-digit verification code</label>
                  <input type="text" value={totpCode} onChange={e => setTotpCode(e.target.value.replace(/\D/g, "").slice(0, 6))} className="input-field" style={{ maxWidth: 180, textAlign: "center", fontFamily: "monospace", fontSize: 18, letterSpacing: "0.3em", fontWeight: 600 }} placeholder="000000" maxLength={6} />
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <Button onClick={verifyTotp} disabled={verifyingTotp || totpCode.length !== 6}>{verifyingTotp ? "Verifying..." : "Enable authenticator"}</Button>
                  <Button variant="ghost" onClick={() => { setShowTotpSetup(false); setTotpCode(""); setTotpSecret(""); setTotpUri(""); }}>Cancel</Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2FA phones */}
        <SettingRow label="2-Step verification phones" description={phoneDesc} border={!addPhoneMode}>
          <Button variant="ghost" size="sm" onClick={() => setAddPhoneMode(!addPhoneMode)}>
            Add phone
            <ChevronDown size={12} style={{ transition: "transform 0.2s", transform: addPhoneMode ? "rotate(180deg)" : "rotate(0deg)" }} />
          </Button>
        </SettingRow>
        {info.phones && info.phones.length > 0 && !addPhoneMode && (
          <div style={{ paddingLeft: 28 }}>
            {info.phones.map(p => (
              <div key={p.number} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 0" }}>
                <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>{maskPhone(p.number)}</span>
                <Button variant="ghost" size="sm" onClick={() => removePhone(p.number)} style={{ fontSize: 10, height: 26, padding: "0 10px", color: "var(--danger)" }}>Remove</Button>
              </div>
            ))}
          </div>
        )}
        {addPhoneMode && (
          <div className="glass-subtle" style={{ padding: 16, display: "flex", gap: 8, alignItems: "center", animation: "fadeIn 0.2s ease" }}>
            <input type="tel" value={newPhone} onChange={e => setNewPhone(e.target.value)} className="input-field" placeholder="+977 971-4374009" style={{ flex: 1 }} />
            <Button size="sm" onClick={addPhone}>Add</Button>
            <Button variant="ghost" size="sm" onClick={() => { setAddPhoneMode(false); setNewPhone(""); }}>Cancel</Button>
          </div>
        )}

        {/* Backup codes */}
        <SettingRow label="Backup codes" description={backupDesc} border={!showBackupCodes}>
          <div style={{ display: "flex", gap: 8 }}>
            <Button variant="ghost" size="sm" onClick={() => setShowBackupCodes(!showBackupCodes)}>{showBackupCodes ? "Hide codes" : "Show codes"}</Button>
            <Button variant="ghost" size="sm" onClick={regenerateBackupCodes} disabled={regeneratingCodes}>
              <RefreshCw size={11} /> {regeneratingCodes ? "Generating..." : "Regenerate"}
            </Button>
          </div>
        </SettingRow>
        {showBackupCodes && info.backupCodes && info.backupCodes.length > 0 && (
          <div className="glass-subtle" style={{ padding: 16, animation: "fadeIn 0.2s ease" }}>
            <p style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 12 }}>Each code can only be used once. Save these in a safe place.</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 6 }}>
              {info.backupCodes.map((code, i) => (
                <div key={i} style={{ padding: "8px 12px", borderRadius: 6, background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)", fontFamily: "monospace", fontSize: 13, color: "var(--text)", letterSpacing: "0.05em", textAlign: "center" }}>{code}</div>
              ))}
            </div>
            <Button variant="ghost" size="sm" onClick={() => { navigator.clipboard.writeText(info.backupCodes!.join("\n")); showToast("Codes copied to clipboard"); }} style={{ marginTop: 12 }}>
              <Copy size={11} /> Copy all codes
            </Button>
          </div>
        )}

        {/* Recovery phone */}
        <SettingRow label="Recovery phone" description={info.recoveryPhone ? maskPhone(info.recoveryPhone) : "No recovery phone set"}>
          <Button variant="ghost" size="sm">{info.recoveryPhone ? "Change" : "Add phone"}</Button>
        </SettingRow>

        {/* Recovery email */}
        <SettingRow label="Recovery email" description={info.recoveryEmail || "No recovery email set"} border={false}>
          <Button variant="ghost" size="sm" onClick={() => setAddRecoveryEmail(!addRecoveryEmail)}>
            {info.recoveryEmail ? "Change" : "Add email"}
          </Button>
        </SettingRow>
        {addRecoveryEmail && (
          <div className="glass-subtle" style={{ padding: 16, display: "flex", gap: 8, alignItems: "center", animation: "fadeIn 0.2s ease" }}>
            <input type="email" value={newRecoveryEmail} onChange={e => setNewRecoveryEmail(e.target.value)} className="input-field" placeholder="email@example.com" style={{ flex: 1 }} />
            <Button size="sm" onClick={updateRecoveryEmail}>Save</Button>
            <Button variant="ghost" size="sm" onClick={() => { setAddRecoveryEmail(false); setNewRecoveryEmail(""); }}>Cancel</Button>
          </div>
        )}
      </Card>

      {/* ── Devices ── */}
      <Card
        title="Your devices"
        action={info.devices && info.devices.length > 1
          ? <Button variant="danger" size="sm" onClick={signOutAllOther}><LogOut size={11} /> Sign out all other devices</Button>
          : undefined}
      >
        {!info.devices || info.devices.length === 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {[
              { name: "Chrome on Windows", type: "desktop" as const, lastActive: "Just now", loc: "Kathmandu, Nepal", ip: "192.168.1.1", current: true },
              { name: "Safari on iPhone", type: "mobile" as const, lastActive: "2 hours ago", loc: "Kathmandu, Nepal", ip: "10.0.0.1", current: false },
              { name: "Firefox on macOS", type: "desktop" as const, lastActive: "Yesterday", loc: "Lalitpur, Nepal", ip: "172.16.0.1", current: false },
            ].map((device, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", borderRadius: 10, background: device.current ? "rgba(255,255,255,0.04)" : "transparent", border: "1px solid " + (device.current ? "var(--border)" : "transparent") }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 8, background: "rgba(255,255,255,0.04)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)" }}>
                    {getDeviceIcon(device.type)}
                  </div>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <p style={{ fontSize: 13, fontWeight: 500, color: "var(--text)" }}>{device.name}</p>
                      {device.current && <Badge variant="success" style={{ fontSize: 9, padding: "2px 6px" }}>This device</Badge>}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
                      <span style={{ ...META, display: "flex", alignItems: "center", gap: 3 }}><Clock size={10} /> {device.lastActive}</span>
                      <span style={DOT}>{"\u00b7"}</span>
                      <span style={{ ...META, display: "flex", alignItems: "center", gap: 3 }}><MapPin size={10} /> {device.loc}</span>
                      <span style={DOT}>{"\u00b7"}</span>
                      <span style={META}>{device.ip}</span>
                    </div>
                  </div>
                </div>
                {!device.current && <Button variant="ghost" size="sm">Sign out</Button>}
              </div>
            ))}
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {info.devices.map(device => (
              <div key={device.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", borderRadius: 10, background: device.isCurrent ? "rgba(255,255,255,0.04)" : "transparent", border: "1px solid " + (device.isCurrent ? "var(--border)" : "transparent") }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 8, background: "rgba(255,255,255,0.04)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)" }}>
                    {getDeviceIcon(device.type)}
                  </div>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <p style={{ fontSize: 13, fontWeight: 500, color: "var(--text)" }}>{device.name || device.userAgent?.split(" ").slice(-1)[0] || "Unknown device"}</p>
                      {device.isCurrent && <Badge variant="success" style={{ fontSize: 9, padding: "2px 6px" }}>This device</Badge>}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
                      <span style={{ ...META, display: "flex", alignItems: "center", gap: 3 }}>
                        <Clock size={10} /> {new Date(device.lastActive).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </span>
                      {device.location && (
                        <>
                          <span style={DOT}>{"\u00b7"}</span>
                          <span style={{ ...META, display: "flex", alignItems: "center", gap: 3 }}><MapPin size={10} /> {device.location}</span>
                        </>
                      )}
                      {device.ip && (
                        <>
                          <span style={DOT}>{"\u00b7"}</span>
                          <span style={META}>{device.ip}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                {!device.isCurrent && (
                  <Button variant="ghost" size="sm" onClick={() => revokeSession(device.id)}>Sign out</Button>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* ── Password Checkup ── */}
      <Card title="Password Checkup">
        {!showPasswordCheck ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>Check if your saved passwords have been compromised in a known data breach.</p>
              <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>Your passwords are checked against a database of known breaches.</p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => { setShowPasswordCheck(true); runPasswordCheck(); }} style={{ flexShrink: 0, marginLeft: 16 }}>Check passwords</Button>
          </div>
        ) : (
          <div style={{ animation: "fadeIn 0.2s ease" }}>
            {checkingPasswords ? (
              <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "16px 0" }}>
                <RefreshCw size={14} style={{ color: "var(--text-muted)", animation: "spin 1s linear infinite" }} />
                <span style={{ fontSize: 13, color: "var(--text-muted)" }}>Checking your passwords...</span>
              </div>
            ) : passwordCheckResult ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                  {[
                    { label: "Weak passwords", value: passwordCheckResult.weak, bg: passwordCheckResult.weak > 0 ? "var(--danger-subtle)" : "var(--success-subtle)", border: "1px solid " + (passwordCheckResult.weak > 0 ? "rgba(255,97,97,0.2)" : "rgba(89,212,153,0.2)"), color: passwordCheckResult.weak > 0 ? "var(--danger)" : "var(--success)" },
                    { label: "Reused passwords", value: passwordCheckResult.reused, bg: passwordCheckResult.reused > 0 ? "var(--warning-subtle)" : "var(--success-subtle)", border: "1px solid " + (passwordCheckResult.reused > 0 ? "rgba(255,197,51,0.2)" : "rgba(89,212,153,0.2)"), color: passwordCheckResult.reused > 0 ? "var(--warning)" : "var(--success)" },
                    { label: "Total checked", value: passwordCheckResult.total, bg: "rgba(255,255,255,0.03)", border: "1px solid var(--border)", color: "var(--text)" },
                  ].map((stat, i) => (
                    <div key={i} style={{ padding: "14px 18px", borderRadius: 10, background: stat.bg, border: stat.border, flex: 1, minWidth: 140 }}>
                      <p style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>{stat.label}</p>
                      <p style={{ fontSize: 20, fontWeight: 700, color: stat.color }}>{stat.value}</p>
                    </div>
                  ))}
                </div>
                {passwordCheckResult.weak === 0 && passwordCheckResult.reused === 0 && (
                  <p style={{ fontSize: 12, color: "var(--success)", display: "flex", alignItems: "center", gap: 6 }}>
                    <ShieldCheck size={14} /> All your passwords look good.
                  </p>
                )}
                <Button variant="ghost" size="sm" onClick={() => { setShowPasswordCheck(false); setPasswordCheckResult(null); }} style={{ alignSelf: "flex-start" }}>Close</Button>
              </div>
            ) : null}
          </div>
        )}
      </Card>

      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
    </PageContainer>
  );
}
