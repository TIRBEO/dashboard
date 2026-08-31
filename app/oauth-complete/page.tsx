"use client";
import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { api, getCurrentUser, ApiError } from "@/lib/api";
import { Loader2, CheckCircle2, Camera, ArrowRight, AlertCircle, Lock, Check, X } from "lucide-react";
import { GoogleIcon, GitHubIcon, DiscordIcon } from "@/components/SocialIcons";
import { useI18n } from "@/lib/i18n";

const PROVIDER_LABELS: Record<string, string> = { google: "Google", github: "GitHub", discord: "Discord" };

function sanitizeTarget(raw: string | null): string {
  const fallback = process.env.NEXT_PUBLIC_DASHBOARD_URL || (typeof window !== "undefined" ? window.location.origin : "");
  if (!raw) return "/overview";
  try {
    const u = new URL(raw);
    const isLocal = u.hostname === "localhost" || u.hostname === "127.0.0.1";
    const isTirbeo = u.hostname.endsWith("tirbeo.app");
    if (!isLocal && !isTirbeo) return fallback;
    if (!isLocal && u.protocol !== "https:") return fallback;
    return u.toString();
  } catch {
    return fallback;
  }
}

export default function OAuthCompletePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center p-6 bg-[var(--tb-bg,#0b0b0d)] text-[var(--tb-text-primary,#f2f2f2)]">
        <div className="flex flex-col items-center gap-3.5">
          <Loader2 size={24} className="animate-spin" />
          <span className="text-sm text-[var(--tb-text-muted,#858589)]">Loading...</span>
        </div>
      </div>
    }>
      <OAuthCompleteInner />
    </Suspense>
  );
}

function OAuthCompleteInner() {
  const { t } = useI18n();
  const searchParams = useSearchParams();
  const signupToken = searchParams.get("signup") || "";
  const finishMode = searchParams.get("finish") === "1";
  const redirectTo = sanitizeTarget(searchParams.get("redirect_to"));

  const [checking, setChecking] = useState(true);
  const [info, setInfo] = useState<{ provider: string; email: string; name?: string; photoUrl?: string | null } | null>(null);
  const [consent, setConsent] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [unameStatus, setUnameStatus] = useState<"idle"|"checking"|"available"|"taken"|"reserved"|"invalid">("idle");

  const [showPw, setShowPw] = useState(false);
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [pwError, setPwError] = useState("");

  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (signupToken) {
        try {
          const r = await api.get<{ provider: string; email: string; name?: string; photoUrl?: string | null }>(
            `/api/auth/oauth/pending?token=${encodeURIComponent(signupToken)}`
          );
          if (!cancelled) {
            setInfo(r);
            if (r.name) setName(r.name);
          }
        } catch (e) {
          if (!cancelled) setError(e instanceof ApiError ? e.message : t("oauth.errExpired"));
        }
      } else if (finishMode) {
        try {
          const u = await getCurrentUser();
          if (!cancelled) {
            setInfo({ provider: "", email: u.email || "", name: u.name || undefined });
            if (u.name) setName(u.name);
          }
        } catch {
          if (!cancelled) setError(t("oauth.errSession"));
        }
      } else if (!cancelled) {
        setError(t("oauth.errNothing"));
      }
      if (!cancelled) setChecking(false);
    })();
    return () => { cancelled = true; };
  }, [signupToken, finishMode, t]);

  const pickPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) { setError(t("oauth.errGeneric")); return; }
    setPhoto(f);
    const reader = new FileReader();
    reader.onload = () => setPhotoPreview(reader.result as string);
    reader.readAsDataURL(f);
  };

  // Username availability check
  useEffect(() => {
    if (!signupToken) return;
    if (!username.trim()) { setUnameStatus('idle'); return; }
    const val = username.trim().toLowerCase();
    if (val.length < 3 || val.length > 30 || !/^[a-z0-9]([a-z0-9_-]*[a-z0-9])?$/.test(val)) {
      setUnameStatus('invalid'); return;
    }
    setUnameStatus('checking');
    const timer = setTimeout(async () => {
      try {
        const r = await api.get<{ available?: boolean; taken?: boolean; reserved?: boolean; exists?: boolean }>(
          `/api/profile/check-username?username=${encodeURIComponent(val)}`
        );
        if (r.reserved) setUnameStatus('reserved');
        else if (r.taken || r.exists) setUnameStatus('taken');
        else if (r.available) setUnameStatus('available');
        else setUnameStatus('invalid');
      } catch { setUnameStatus('idle'); }
    }, 400);
    return () => clearTimeout(timer);
  }, [signupToken, username]);

  const submit = async () => {
    if (!consent) return;
    if (signupToken && !name.trim()) { setError(t("oauth.errNameRequired")); return; }
    if (signupToken && !username.trim()) { setError(t("oauth.errUsernameRequired")); return; }
    if (signupToken && unameStatus === 'invalid') { setError(t("oauth.errUsernameInvalid")); return; }
    if (signupToken && unameStatus === 'taken') { setError(t("oauth.errUsernameTaken")); return; }
    if (signupToken && unameStatus === 'reserved') { setError(t("oauth.errUsernameReserved")); return; }
    if (signupToken && unameStatus !== 'available') { setError(t("oauth.errUsernamePending")); return; }
    setSaving(true); setError("");
    try {
      if (signupToken) {
        const payload: Record<string, string> = {
          token: signupToken as string,
          name: name.trim(),
          username: username.trim().toLowerCase(),
          policyAccepted: "true",
        };
        if (pw) payload.password = pw;
        await api.post("/api/auth/oauth/complete", payload);
      } else {
        await api.post("/api/auth/oauth-consent", { policyAccepted: true });
      }
      window.location.href = redirectTo;
    } catch (e: any) {
      setError(e?.message || t("oauth.errGeneric"));
      setSaving(false);
    }
  };

  const providerLabel = PROVIDER_LABELS[info?.provider || ""] || "";
  const avatarSrc = photoPreview || info?.photoUrl || null;
  const initial = (info?.name || info?.email || "?").trim().charAt(0).toUpperCase();

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[var(--tb-bg,#0b0b0d)] text-[var(--tb-text-primary,#f2f2f2)]">
      <div className="w-full max-w-[460px]">
        <div className="dashboard-card p-7">
          {checking ? (
            <div className="flex flex-col items-center gap-3.5 py-8">
              <Loader2 size={24} className="animate-spin" />
              <span className="text-sm text-[var(--tb-text-muted,#858589)]">{t("oauth.finishingSignIn")}</span>
            </div>
          ) : error && !info ? (
            <div className="text-center py-4">
              <AlertCircle size={26} className="text-[var(--tb-red,#ef4444)] mx-auto" />
              <h1 className="text-lg font-bold mt-3 mb-1.5">{t("oauth.signInIncomplete")}</h1>
              <p className="text-[13.5px] text-[var(--tb-text-muted,#999)] leading-[1.55]">{error}</p>
              <a href="/login" className="btn btn-primary btn-sm inline-flex mt-4">{t("oauth.backToSignIn")}</a>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="flex flex-col items-center text-center mb-5">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3.5 bg-tb-surface-2 border border-tb-border">
                  {info?.provider === "google" ? <GoogleIcon size={26} /> : info?.provider === "github" ? <GitHubIcon size={26} /> : info?.provider === "discord" ? <DiscordIcon size={26} /> : <CheckCircle2 size={26} />}
                </div>
                <h1 className="text-[21px] font-bold m-0">
                  {signupToken ? t("oauth.createAccount") : t("oauth.signedIn")}
                </h1>
                <p className="text-[13.5px] text-[var(--tb-text-muted,#999)] leading-[1.55] mt-2">
                  {signupToken ? (
                    <>{t("oauth.noAccountExists").replace("{provider}", providerLabel || "your provider")}<br />
                      <strong className="text-tb-text-primary">{info?.email}</strong></>
                  ) : (
                    t("oauth.lastStep")
                  )}
                </p>
              </div>

              {/* Profile photo */}
              {signupToken && (
                <div className="flex items-center gap-3.5 mb-4">
                  <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/gif,image/webp" onChange={pickPhoto} className="hidden" />
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="w-[62px] h-[62px] rounded-full overflow-hidden cursor-pointer relative border-2 border-dashed border-[var(--tb-border-strong,#444)] bg-tb-surface-2 flex items-center justify-center shrink-0"
                    aria-label={t("oauth.choosePhoto")}
                  >
                    {avatarSrc ? (
                      <img src={avatarSrc} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                    ) : (
                      <span className="text-xl font-semibold text-tb-text-muted">{initial}</span>
                    )}
                    <span className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-[var(--tb-surface-1,#fff)] border border-tb-border flex items-center justify-center text-tb-text-secondary"><Camera size={11} /></span>
                  </button>
                  <div>
                    <div className="text-[13.5px] font-medium">{t("oauth.profilePhoto")}</div>
                    <div className="text-xs text-[var(--tb-text-muted,#888)] mt-0.5">{t("oauth.photoOptional")}</div>
                    {(photoPreview) && (
                      <button type="button" onClick={() => { setPhoto(null); setPhotoPreview(null); }} className="text-xs text-[var(--tb-red,#ef4444)] bg-transparent border-none cursor-pointer p-0 mt-0.5">
                        {t("oauth.removePhoto")}
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Name + Username + Password */}
              {signupToken && (
                <div className="mb-4">
                  <div className="mb-2">
                    <label className="block text-[13px] font-medium text-tb-text-secondary mb-1.5">{t("oauth.name")} <span className="text-[var(--tb-red,#ef4444)]">*</span></label>
                    <input
                      className="form-input"
                      type="text"
                      placeholder={t("oauth.namePh")}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      autoFocus
                    />
                  </div>
                  <div className="mb-2">
                    <label className="block text-[13px] font-medium text-tb-text-secondary mb-1.5">{t("oauth.usernameLabel")} <span className="text-[var(--tb-red,#ef4444)]">*</span></label>
                    <div className="relative">
                      <input
                        className={`form-input pr-8 ${unameStatus === 'available' ? '!border-[var(--tb-green)]' : unameStatus === 'taken' || unameStatus === 'reserved' || unameStatus === 'invalid' ? '!border-[var(--tb-red)]' : ''}`}
                        type="text"
                        placeholder={t("oauth.usernamePh")}
                        value={username}
                        onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
                        maxLength={30}
                      />
                      <span className="absolute right-2.5 top-1/2 -translate-y-1/2">
                        {unameStatus === 'checking' && <Loader2 size={14} className="animate-spin text-tb-text-muted" />}
                        {unameStatus === 'available' && <Check size={14} className="text-[var(--tb-green)]" />}
                        {(unameStatus === 'taken' || unameStatus === 'reserved' || unameStatus === 'invalid') && username.trim().length > 0 && <X size={14} className="text-[var(--tb-red)]" />}
                      </span>
                    </div>
                    {unameStatus === 'available' && <p className="text-xs text-[var(--tb-green)] mt-1.5">{t("oauth.usernameAvailable")}</p>}
                    {unameStatus === 'taken' && <p className="text-xs text-[var(--tb-red)] mt-1.5">{t("oauth.usernameTaken")}</p>}
                    {unameStatus === 'reserved' && <p className="text-xs text-[var(--tb-red)] mt-1.5">{t("oauth.usernameReserved")}</p>}
                    {unameStatus === 'invalid' && username.trim().length > 0 && username.trim().length < 3 && <p className="text-xs text-[var(--tb-red)] mt-1.5">{t("oauth.usernameTooShort")}</p>}
                    {unameStatus === 'invalid' && username.trim().length >= 3 && <p className="text-xs text-[var(--tb-red)] mt-1.5">{t("oauth.usernameInvalidChars")}</p>}
                    {username.trim().length === 0 && <p className="text-xs text-tb-text-muted mt-1.5">{t("oauth.usernameHint")}</p>}
                  </div>
                  <button type="button" className="btn btn-secondary btn-sm w-full flex items-center justify-center gap-1.5" onClick={() => { setShowPw(true); setPwError(""); }}>
                    <Lock size={13} /> {pw ? t("oauth.passwordAdded") : t("oauth.addPasswordOptional")}
                  </button>
                </div>
              )}

              {/* Consent */}
              <button
                type="button"
                role="checkbox"
                aria-checked={consent}
                onClick={() => setConsent(!consent)}
                className={`w-full flex items-start gap-2.5 text-left cursor-pointer p-3 rounded-xl transition-all duration-150 ${consent ? 'bg-tb-surface-2 border border-tb-border-strong' : 'bg-transparent border border-tb-border'} text-inherit`}
              >
                <span
                  className={`mt-0.5 w-[18px] h-[18px] shrink-0 rounded-[5px] flex items-center justify-center text-white transition-all duration-150 ${consent ? 'bg-[var(--tb-green,#28a745)] border-[1.5px] border-[var(--tb-green,#28a745)]' : 'bg-transparent border-[1.5px] border-[var(--tb-border-strong,#555)]'}`}
                >{consent && <CheckCircle2 size={12} />}</span>
                <span className="text-[13px] leading-[1.5] text-tb-text-secondary">
                  {t("oauth.consentLabel")} <span className="text-[var(--tb-red,#ef4444)]">*</span>
                </span>
              </button>

              {error && <p className="text-[12.5px] text-[var(--tb-red,#ef4444)] mt-2.5">{error}</p>}

              <button
                type="button"
                className="btn btn-primary btn-sm w-full flex items-center justify-center gap-1.5 mt-4 h-10"
                onClick={submit}
                disabled={!consent || saving || (!!signupToken && unameStatus !== 'available')}
              >
                {saving ? <Loader2 size={15} className="animate-spin" /> : (<>{signupToken ? t("oauth.createAndContinue") : t("oauth.continueBtn")} <ArrowRight size={14} /></>)}
              </button>

              <p className="text-xs text-[var(--tb-text-muted,#666)] text-center leading-[1.5] mt-3.5">
                {t("oauth.dashboardNote")}
              </p>
            </>
          )}
        </div>
      </div>

      {/* Add-password popup */}
      {showPw && (
        <div
          className="fixed inset-0 z-[1000] flex items-center justify-center p-5 bg-black/60 backdrop-blur-[2px]"
          onClick={() => { setShowPw(false); setPwError(""); }}
        >
          <div className="dashboard-card w-full max-w-[380px] p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-2.5 mb-1.5">
              <div className="w-[34px] h-[34px] rounded-[10px] bg-tb-surface-2 flex items-center justify-center"><Lock size={16} /></div>
              <h2 className="text-base font-bold m-0">{t("oauth.addPwTitle")}</h2>
            </div>
            <p className="text-[12.5px] text-[var(--tb-text-muted,#999)] leading-[1.5] mb-3.5">
              {t("oauth.addPwDesc").replace("{provider}", providerLabel || "your provider")}
            </p>
            <input className="form-input mb-2" type="password" placeholder={t("oauth.newPwPh")} value={pw} onChange={e => setPw(e.target.value)} autoComplete="new-password" autoFocus />
            <input className="form-input" type="password" placeholder={t("oauth.confirmPh")} value={pw2} onChange={e => setPw2(e.target.value)} autoComplete="new-password" />
            {pwError && <p className="text-xs text-[var(--tb-red,#ef4444)] mt-2">{pwError}</p>}
            <div className="flex justify-end gap-2 mt-4">
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => { setShowPw(false); setPw(""); setPw2(""); setPwError(""); }}>{t("oauth.skip")}</button>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                disabled={!pw || !pw2}
                onClick={() => {
                  if (pw.length < 8) { setPwError(t("oauth.errPasswordMin")); return; }
                  if (pw !== pw2) { setPwError(t("oauth.errPasswordMismatch")); return; }
                  setPwError(""); setShowPw(false);
                }}
              >
                {t("oauth.savePassword")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
