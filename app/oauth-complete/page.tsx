"use client";
import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { api, getCurrentUser, ApiError } from "@/lib/api";
import { Loader2, CheckCircle2, Camera, ArrowRight, AlertCircle, Lock } from "lucide-react";
import { GoogleIcon, GitHubIcon, DiscordIcon } from "@/components/SocialIcons";

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

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: "var(--tb-bg, #0b0b0d)", color: "var(--tb-text-primary, #f2f2f2)" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
        <Loader2 size={24} className="animate-spin" />
        <span style={{ fontSize: 14, color: "var(--tb-text-muted, #858589)" }}>Loading…</span>
      </div>
    </div>
  );
}

export default function OAuthCompletePage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <OAuthCompleteInner />
    </Suspense>
  );
}

function OAuthCompleteInner() {
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

  // Optional password for brand-new accounts (set via popup)
  const [showPw, setShowPw] = useState(false);
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [pwError, setPwError] = useState("");

  // Optional profile photo
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
          if (!cancelled) setError(e instanceof ApiError ? e.message : "This sign-in link has expired. Please sign in again.");
        }
      } else if (finishMode) {
        try {
          const u = await getCurrentUser();
          if (!cancelled) {
            setInfo({ provider: "", email: u.email || "", name: u.name || undefined });
            if (u.name) setName(u.name);
          }
        } catch {
          if (!cancelled) setError("Your session could not be verified. Please sign in again.");
        }
      } else if (!cancelled) {
        setError("Nothing to do here. Head back to the sign-in page.");
      }
      if (!cancelled) setChecking(false);
    })();
    return () => { cancelled = true; };
  }, [signupToken, finishMode]);

  const pickPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const allowed = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!allowed.includes(f.type)) { setError("Please select a JPEG, PNG, GIF, or WebP image."); return; }
    if (f.size > 5 * 1024 * 1024) { setError("Image must be less than 5MB."); return; }
    setError("");
    setPhoto(f);
    setPhotoPreview(URL.createObjectURL(f));
    if (fileRef.current) fileRef.current.value = "";
  };

  const uploadAvatarBestEffort = async () => {
    if (!photo) return;
    try {
      const fd = new FormData();
      fd.append("avatar", photo);
      await api.request("/api/profile/avatar", { method: "POST", body: fd });
    } catch { /* non-blocking */ }
  };

  const submit = async () => {
    setError("");
    if (!consent) return;
    if (signupToken && pw.length > 0) {
      if (pw.length < 8) { setError("Password must be at least 8 characters."); return; }
      if (pw !== pw2) { setError("Passwords do not match."); return; }
    }
    setSaving(true);
    try {
      if (signupToken) {
        const r = await api.post<{ ok: boolean; redirect_to: string }>("/api/auth/oauth/complete", {
          token: signupToken,
          policyAccepted: true,
          name: name.trim() || undefined,
          ...(pw ? { password: pw } : {}),
        });
        await uploadAvatarBestEffort();
        window.location.href = r?.redirect_to || redirectTo;
      } else {
        await api.post("/api/auth/oauth-consent", { policyAccepted: true });
        window.location.href = redirectTo;
      }
    } catch (e: any) {
      setError(e?.message || "Something went wrong. Please try again.");
      setSaving(false);
    }
  };

  const providerLabel = PROVIDER_LABELS[info?.provider || ""] || "";
  const avatarSrc = photoPreview || info?.photoUrl || null;
  const initial = (info?.name || info?.email || "?").trim().charAt(0).toUpperCase();

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: "var(--tb-bg, #0b0b0d)", color: "var(--tb-text-primary, #f2f2f2)" }}>
      <div className="w-full" style={{ maxWidth: 460 }}>
        <div className="dashboard-card" style={{ padding: 28 }}>
          {checking ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14, padding: "32px 0" }}>
              <Loader2 size={24} className="animate-spin" />
              <span style={{ fontSize: 14, color: "var(--tb-text-muted, #858589)" }}>Finishing sign-in…</span>
            </div>
          ) : error && !info ? (
            <div style={{ textAlign: "center", padding: "16px 0" }}>
              <AlertCircle size={26} style={{ color: "var(--tb-red, #ef4444)" }} />
              <h1 style={{ fontSize: 18, fontWeight: 700, margin: "12px 0 6px" }}>Sign-in could not be completed</h1>
              <p style={{ fontSize: 13.5, color: "var(--tb-text-muted, #999)", lineHeight: 1.55 }}>{error}</p>
              <a href="/login" className="btn btn-primary btn-sm" style={{ display: "inline-flex", marginTop: 18 }}>Back to sign in</a>
            </div>
          ) : (
            <>
              {/* Header */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", marginBottom: 22 }}>
                <div style={{
                  width: 56, height: 56, borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14,
                  background: "var(--tb-surface-2)", border: "1px solid var(--tb-border)",
                }}>
                  {info?.provider === "google" ? <GoogleIcon size={26} /> : info?.provider === "github" ? <GitHubIcon size={26} /> : info?.provider === "discord" ? <DiscordIcon size={26} /> : <CheckCircle2 size={26} />}
                </div>
                <h1 style={{ fontSize: 21, fontWeight: 700, margin: 0 }}>
                  {signupToken ? "Create your Tirbeo account" : "You're signed in"}
                </h1>
                <p style={{ fontSize: 13.5, color: "var(--tb-text-muted, #999)", lineHeight: 1.55, margin: "8px 0 0" }}>
                  {signupToken ? (
                    <>No Tirbeo account exists yet — clicking below will create one linked to your {providerLabel} sign-in.<br />
                      <strong style={{ color: "var(--tb-text-primary)" }}>{info?.email}</strong></>
                  ) : (
                    "One last step before we take you to your workspace."
                  )}
                </p>
              </div>

              {/* Profile photo */}
              {signupToken && (
                <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
                  <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/gif,image/webp" onChange={pickPhoto} style={{ display: "none" }} />
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    style={{
                      width: 62, height: 62, borderRadius: "50%", overflow: "hidden", cursor: "pointer", position: "relative",
                      border: "2px dashed var(--tb-border-strong, #444)", background: "var(--tb-surface-2)",
                      display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                    }}
                    aria-label="Choose profile photo"
                  >
                    {avatarSrc ? (
                      <img src={avatarSrc} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      <span style={{ fontSize: 20, fontWeight: 600, color: "var(--tb-text-muted)" }}>{initial}</span>
                    )}
                    <span style={{
                      position: "absolute", bottom: -2, right: -2, width: 20, height: 20, borderRadius: "50%",
                      background: "var(--tb-surface-1, #fff)", border: "1px solid var(--tb-border)",
                      display: "flex", alignItems: "center", justifyContent: "center", color: "var(--tb-text-secondary)",
                    }}><Camera size={11} /></span>
                  </button>
                  <div>
                    <div style={{ fontSize: 13.5, fontWeight: 500 }}>Profile photo</div>
                    <div style={{ fontSize: 12, color: "var(--tb-text-muted, #888)", marginTop: 2 }}>Optional — JPEG, PNG, GIF, WebP • Max 5MB</div>
                    {(photoPreview) && (
                      <button type="button" onClick={() => { setPhoto(null); setPhotoPreview(null); }} style={{ fontSize: 12, color: "var(--tb-red, #ef4444)", background: "none", border: "none", cursor: "pointer", padding: 0, marginTop: 3 }}>
                        Remove photo
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Optional password (new accounts only) — opens as a popup */}
              {signupToken && (
                <div style={{ marginBottom: 16 }}>
                  <input
                    className="form-input"
                    type="text"
                    placeholder="Your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    autoFocus
                    style={{ marginBottom: 8 }}
                  />
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => { setShowPw(true); setPwError(""); }} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                    <Lock size={13} /> {pw ? "Password added — change or remove" : "Add a password (optional)"}
                  </button>
                </div>
              )}

              {/* Consent */}
              <button
                type="button"
                role="checkbox"
                aria-checked={consent}
                onClick={() => setConsent(!consent)}
                style={{
                  width: "100%", display: "flex", alignItems: "flex-start", gap: 10, textAlign: "left", cursor: "pointer",
                  padding: 12, borderRadius: 12,
                  background: consent ? "var(--tb-surface-2)" : "transparent",
                  border: `1px solid ${consent ? "var(--tb-border-strong)" : "var(--tb-border)"}`,
                  color: "inherit",
                }}
              >
                <span style={{
                  marginTop: 2, width: 18, height: 18, flexShrink: 0, borderRadius: 5,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: consent ? "var(--tb-green, #28a745)" : "transparent",
                  border: `1.5px solid ${consent ? "var(--tb-green, #28a745)" : "var(--tb-border-strong, #555)"}`,
                  color: "#fff",
                }}>{consent && <CheckCircle2 size={12} />}</span>
                <span style={{ fontSize: 13, lineHeight: 1.5, color: "var(--tb-text-secondary, #aaa)" }}>
                  I agree to the Tirbeo Terms of Service and acknowledge the Privacy Policy, including data processing for my account. <span style={{ color: "var(--tb-red, #ef4444)" }}>*</span>
                </span>
              </button>

              {error && <p style={{ fontSize: 12.5, color: "var(--tb-red, #ef4444)", margin: "10px 0 0" }}>{error}</p>}

              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={submit}
                disabled={!consent || saving}
                style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 16, height: 40 }}
              >
                {saving ? <Loader2 size={15} className="animate-spin" /> : (<>{signupToken ? "Create account & continue" : "Continue"} <ArrowRight size={14} /></>)}
              </button>

              <p style={{ fontSize: 12, color: "var(--tb-text-muted, #666)", textAlign: "center", lineHeight: 1.5, margin: "14px 0 0" }}>
                You can manage passwords and connected services anytime from your dashboard settings.
              </p>
            </>
          )}
        </div>
      </div>

      {/* ═══ Add-password popup ═══ */}
      {showPw && (
        <div
          className="tb-dialog-overlay"
          onClick={() => { setShowPw(false); setPwError(""); }}
          style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(2px)" }}
        >
          <div className="dashboard-card" onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 380, padding: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
              <div style={{ width: 34, height: 34, borderRadius: 10, background: "var(--tb-surface-2)", display: "flex", alignItems: "center", justifyContent: "center" }}><Lock size={16} /></div>
              <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Add a password</h2>
            </div>
            <p style={{ fontSize: 12.5, color: "var(--tb-text-muted, #999)", lineHeight: 1.5, margin: "0 0 14px" }}>
              Your email is already verified by {providerLabel || "your provider"} — no code needed. Adding a password lets you sign in with email too.
            </p>
            <input className="form-input" type="password" placeholder="New password (min 8 characters)" value={pw} onChange={e => setPw(e.target.value)} autoComplete="new-password" autoFocus style={{ marginBottom: 8 }} />
            <input className="form-input" type="password" placeholder="Confirm password" value={pw2} onChange={e => setPw2(e.target.value)} autoComplete="new-password" />
            {pwError && <p style={{ fontSize: 12, color: "var(--tb-red, #ef4444)", marginTop: 8 }}>{pwError}</p>}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 16 }}>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => { setShowPw(false); setPw(""); setPw2(""); setPwError(""); }}>Skip</button>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                disabled={!pw || !pw2}
                onClick={() => {
                  if (pw.length < 8) { setPwError("Password must be at least 8 characters."); return; }
                  if (pw !== pw2) { setPwError("Passwords do not match."); return; }
                  setPwError(""); setShowPw(false);
                }}
              >
                Save password
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
