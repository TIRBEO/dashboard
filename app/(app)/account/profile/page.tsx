"use client";
import { useEffect, useState, useRef } from "react";
import { api, getCurrentUser } from "@/lib/api";
import { setDirtyGlobal } from "@/lib/unsaved";
import { Camera, User, Briefcase, Link2, Info, Check, AlertCircle, Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/Skeleton";
import { useI18n } from "@/lib/i18n";

function ProfileSkeleton() {
  return (
    <div className="page-stack">
      <div><Skeleton width={120} height={24} style={{ marginBottom: 6 }} /><Skeleton width={240} height={14} /></div>
      {/* Avatar + header */}
      <div className="dashboard-card" style={{ padding: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <Skeleton width={80} height={80} borderRadius="50%" />
          <div><Skeleton width={180} height={20} style={{ marginBottom: 6 }} /><Skeleton width={220} height={14} /><Skeleton width={140} height={12} style={{ marginTop: 6 }} /></div>
        </div>
      </div>
      {/* Form sections */}
      {[1, 2, 3].map(i => (
        <div key={i} className="dashboard-card">
          <Skeleton width={120} height={18} style={{ marginBottom: 16 }} />
          {Array.from({ length: 4 }).map((_, j) => (
            <div key={j} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: j < 3 ? '1px solid var(--tb-border)' : 'none' }}>
              <Skeleton width={90} height={14} />
              <Skeleton width={220} height={36} />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

export default function ProfilePage() {
  const { t } = useI18n();
  const [user, setUser] = useState<any>(null);
  const [form, setForm] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [avatarError, setAvatarError] = useState("");
  const [saveError, setSaveError] = useState("");
  const [imgFailed, setImgFailed] = useState(false);
  const [unameStatus, setUnameStatus] = useState<"idle" | "checking" | "available" | "taken" | "reserved" | "invalid">("idle");
  const originalUsername = useRef("");
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getCurrentUser().then(u => {
      setUser(u);
      setImgFailed(false);
      originalUsername.current = (u.username || "").toLowerCase();
      setForm({
        name: u.name || "", username: u.username || "", bio: u.bio || "",
        gender: u.gender || "", birthday: u.birthday ? u.birthday.split("T")[0] : "",
        country: u.country || "", occupation: u.occupation || "",
        companyName: u.companyName || "", companyRole: u.companyRole || "",
        industry: u.industry || "", companySize: u.companySize || "",
        website: u.website || "", linkedin: u.linkedin || "",
        githubUsername: u.githubUsername || "", twitter: u.twitter || "",
      });
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  useEffect(() => { setImgFailed(false); }, [user?.photoUrl]);

  // Debounced username availability check (skipped when unchanged from loaded value)
  useEffect(() => {
    const uname = (form.username || "").trim();
    if (!uname || uname.toLowerCase() === originalUsername.current) {
      setUnameStatus("idle");
      return;
    }
    setUnameStatus("checking");
    const timer = setTimeout(async () => {
      try {
        const r = await api.post<{ exists: boolean; valid: boolean; reserved?: boolean }>("/api/auth/username-exists", { username: uname.toLowerCase() });
        if (!r?.valid) setUnameStatus("invalid");
        else if (r.exists) setUnameStatus(r.reserved ? "reserved" : "taken");
        else setUnameStatus("available");
      } catch {
        setUnameStatus("idle");
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [form.username]);

  const unameBlocked = unameStatus === "checking" || unameStatus === "taken" || unameStatus === "reserved" || unameStatus === "invalid";

  const save = async () => {
    if (unameBlocked) return;
    setSaving(true); setSaved(false); setSaveError("");
    try {
      const payload: Record<string, any> = {};
      for (const [k, v] of Object.entries(form)) {
        payload[k] = v === '' ? null : v;
      }
      await api.patch("/api/users/me", payload);
      originalUsername.current = (form.username || "").trim().toLowerCase();
      setUnameStatus("idle");
      setSaved(true); setDirtyGlobal(false); setTimeout(() => setSaved(false), 2500);
      const detail: Record<string, any> = {};
      if (form.name) detail.name = form.name;
      if (form.username !== undefined) detail.username = form.username;
      if (Object.keys(detail).length) window.dispatchEvent(new CustomEvent("tb:user-updated", { detail }));
    } catch (e: any) {
      setSaveError(e?.message || "Could not save your changes. Please try again.");
    }
    setSaving(false);
  };

  const uploadAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setAvatarError("");
    try {
      const formData = new FormData();
      formData.append("avatar", file);
      // api.request adds the X-CSRF-Token header — a raw fetch here 403s.
      const data = await api.request<{ photoUrl?: string; url?: string; message?: string }>("/api/profile/avatar", {
        method: "POST",
        body: formData,
      });
      const newUrl = data?.photoUrl || data?.url;
      if (newUrl) {
        setImgFailed(false);
        setUser((prev: any) => ({ ...prev, photoUrl: newUrl }));
        // Propagate to AppShell (header, sidebar, mobile menu) instantly.
        window.dispatchEvent(new CustomEvent("tb:user-updated", { detail: { photoUrl: newUrl } }));
      } else {
        setAvatarError("Upload succeeded but no image URL was returned.");
      }
    } catch (err: any) {
      setAvatarError(err?.message || "Could not upload your photo. Try a JPEG/PNG/WebP under 5MB.");
    }
    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
  };

  if (loading) return <ProfileSkeleton />;

  const initialsOf = (name: string | null | undefined) => {
    if (!name) return "?";
    const p = name.trim().split(/\s+/);
    return p.length === 1 ? p[0].slice(0, 2).toUpperCase() : (p[0][0] + p[p.length - 1][0]).toUpperCase();
  };

  const sections = [
    {
      title: t("profile.personal"), icon: <User size={15} />,
      fields: [
        { key: "name", label: t("profile.fullName"), placeholder: t("profile.fullNamePh") },
        { key: "username", label: t("profile.username"), placeholder: t("profile.usernamePh") },
        { key: "bio", label: t("profile.bio"), placeholder: t("profile.bioPh"), type: "textarea" },
        { key: "gender", label: t("profile.gender"), type: "select", options: [
          { value: "", label: t("profile.selectOption") },
          { value: "male", label: t("profile.male") },
          { value: "female", label: t("profile.female") },
          { value: "other", label: t("profile.other") },
          { value: "prefer-not-to-say", label: t("profile.preferNot") },
        ]},
        { key: "birthday", label: t("profile.birthday"), type: "date" },
        { key: "country", label: t("profile.country"), placeholder: t("profile.countryPh") },
      ],
    },
    {
      title: t("profile.work"), icon: <Briefcase size={15} />,
      fields: [
        { key: "occupation", label: t("profile.occupation"), placeholder: t("profile.occupationPh") },
        { key: "companyName", label: t("profile.company"), placeholder: t("profile.companyPh") },
        { key: "companyRole", label: t("profile.role"), placeholder: t("profile.roleAtCompanyPh") },
        { key: "industry", label: t("profile.industry"), placeholder: t("profile.industryPh") },
        { key: "companySize", label: t("profile.companySize"), type: "select", options: [
          { value: "", label: t("profile.selectOption") },
          { value: "1", label: t("profile.justMe") },
          { value: "2-10", label: "2-10" },
          { value: "11-50", label: "11-50" },
          { value: "51-200", label: "51-200" },
          { value: "201-1000", label: "201-1,000" },
          { value: "1001+", label: "1,001+" },
        ]},
      ],
    },
    {
      title: t("profile.links"), icon: <Link2 size={15} />,
      fields: [
        { key: "website", label: t("profile.website"), placeholder: t("profile.websitePh") },
        { key: "linkedin", label: t("profile.linkedin"), placeholder: t("profile.linkedinPh") },
        { key: "githubUsername", label: t("profile.github"), placeholder: t("profile.githubPh") },
        { key: "twitter", label: t("profile.twitter"), placeholder: t("profile.twitterPh") },
      ],
    },
  ];

  return (
    <div className="page-stack">
      {/* Header */}
      <div className="page-header">
        <div className="page-header-row">
          <div className="page-header-left">
            <h1 className="page-header-title">{t("profile.title")}</h1>
            <p className="page-header-description">{t("profile.subtitle")}</p>
          </div>
          <div className="page-header-actions">
            {saved && <span style={{ fontSize: 12, color: 'var(--tb-green)', display: 'flex', alignItems: 'center', gap: 4 }}><Check size={14} /> {t("common.saved")}</span>}
            {saving && <span style={{ fontSize: 12, color: 'var(--tb-text-muted)' }}>{t("common.saving")}</span>}
            <button className="btn btn-primary btn-sm" onClick={save} disabled={saving || unameBlocked} title={unameBlocked && unameStatus !== "checking" ? t("profile.usernameTaken") : undefined}>{t("profile.saveChanges")}</button>
          </div>
        </div>
      </div>

      {saveError && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", borderRadius: 10, background: "var(--tb-red-soft, #fdecea)", border: "1px solid var(--tb-red, #ef4444)33", fontSize: 13.5, color: "var(--tb-red, #ef4444)" }}>
          <AlertCircle size={15} /> {saveError}
        </div>
      )}

      {/* Avatar + Info Card */}
      <div className="dashboard-card" style={{ padding: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          {/* Avatar */}
          <div style={{ position: 'relative' }}>
            <div
              style={{
                width: 80, height: 80, borderRadius: '50%', overflow: 'hidden',
                background: 'var(--tb-surface-3)', border: '2px solid var(--tb-border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 24, fontWeight: 600, color: 'var(--tb-text-muted)', cursor: 'pointer',
                flexShrink: 0,
              }}
              onClick={() => fileRef.current?.click()}
            >
              {user?.photoUrl && !imgFailed ? (
                <img src={user.photoUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={() => setImgFailed(true)} referrerPolicy="no-referrer" crossOrigin="anonymous" />
              ) : (
                initialsOf(user?.name ?? user?.email)
              )}
            </div>
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              style={{
                position: 'absolute', bottom: 0, right: 0, width: 26, height: 26,
                borderRadius: '50%', background: 'var(--tb-surface-1)', border: '1.5px solid var(--tb-border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: 'var(--tb-text-muted)', transition: 'all 120ms',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--tb-border-strong)'; e.currentTarget.style.color = 'var(--tb-text-primary)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--tb-border)'; e.currentTarget.style.color = 'var(--tb-text-muted)'; }}
            >
              {uploading ? <span className="btn-spinner" style={{ width: 12, height: 12 }} /> : <Camera size={13} />}
            </button>
            <input ref={fileRef} type="file" accept="image/*" onChange={uploadAvatar} style={{ display: 'none' }} />
          </div>

          {/* Info */}
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 20, fontWeight: 600, color: 'var(--tb-text-primary)' }}>{user?.name || t("profile.noNameSet")}</div>
            <div style={{ fontSize: 14, color: 'var(--tb-text-muted)', marginTop: 2 }}>{user?.email}</div>
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              {user?.username && <span className="badge badge-neutral">@{user.username}</span>}
              {user?.isVerified && <span className="badge badge-success">{t("profile.verified")}</span>}
            </div>
          </div>
        </div>
        {avatarError && (
          <div style={{ marginTop: 12, fontSize: 12.5, color: 'var(--tb-red, #ef4444)' }}>{avatarError}</div>
        )}
      </div>

      {/* Form Sections */}
      {sections.map(section => (
        <div key={section.title} className="dashboard-card">
          <h3 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ color: 'var(--tb-text-muted)' }}>{section.icon}</span>
            {section.title}
          </h3>
          {section.fields.map(f => (
            <div key={f.key} className="field-row">
              <label className="field-label">{f.label}</label>
              <div className="field-control">
                {f.type === "textarea" ? (
                  <textarea
                    className="form-input"
                    value={form[f.key] || ""}
                    onChange={e => { setForm(prev => ({ ...prev, [f.key]: e.target.value })); setDirtyGlobal(true); }}
                    placeholder={(f as any).placeholder}
                    rows={3}
                    style={{ lineHeight: 1.5 }}
                  />
                ) : f.type === "select" ? (
                  <select
                    className="form-input"
                    value={form[f.key] || ""}
                    onChange={e => { setForm(prev => ({ ...prev, [f.key]: e.target.value })); setDirtyGlobal(true); }}
                    style={{ maxWidth: 280 }}
                  >
                    {(f as any).options.map((o: any) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                ) : f.type === "date" ? (
                  <input
                    type="date"
                    className="form-input"
                    value={form[f.key] || ""}
                    onChange={e => { setForm(prev => ({ ...prev, [f.key]: e.target.value })); setDirtyGlobal(true); }}
                    style={{ maxWidth: 280 }}
                  />
                ) : (
                  <div style={{ maxWidth: 400, width: "100%" }}>
                    <input
                      className="form-input"
                      value={form[f.key] || ""}
                      onChange={e => { setForm(prev => ({ ...prev, [f.key]: e.target.value })); setDirtyGlobal(true); }}
                      placeholder={(f as any).placeholder}
                      style={{
                        maxWidth: 400,
                        ...(f.key === "username" && (unameStatus === "taken" || unameStatus === "reserved" || unameStatus === "invalid")
                          ? { borderColor: "var(--tb-red, #ef4444)" }
                          : f.key === "username" && unameStatus === "available"
                            ? { borderColor: "var(--tb-green, #28a745)" }
                            : {}),
                      }}
                    />
                    {f.key === "username" && unameStatus !== "idle" && (
                      <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 5, fontSize: 12.5 }}>
                        {unameStatus === "checking" && <Loader2 size={12} className="animate-spin" style={{ color: "var(--tb-text-muted)" }} />}
                        {unameStatus === "checking" && <span style={{ color: "var(--tb-text-muted, #999)" }}>{t("profile.usernameChecking")}</span>}
                        {unameStatus === "available" && <Check size={12} style={{ color: "var(--tb-green, #28a745)" }} />}
                        {unameStatus === "available" && <span style={{ color: "var(--tb-green, #28a745)" }}>{t("profile.usernameAvailable")}</span>}
                        {(unameStatus === "taken" || unameStatus === "reserved") && <AlertCircle size={12} style={{ color: "var(--tb-red, #ef4444)" }} />}
                        {(unameStatus === "taken" || unameStatus === "reserved") && <span style={{ color: "var(--tb-red, #ef4444)" }}>{t(unameStatus === "taken" ? "profile.usernameTaken" : "profile.usernameReserved")}</span>}
                        {unameStatus === "invalid" && <AlertCircle size={12} style={{ color: "var(--tb-red, #ef4444)" }} />}
                        {unameStatus === "invalid" && <span style={{ color: "var(--tb-red, #ef4444)" }}>{t("profile.usernameInvalid")}</span>}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ))}

      {/* Account Info (read-only) */}
      <div className="dashboard-card">
        <h3 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ color: 'var(--tb-text-muted)' }}><Info size={15} /></span>
          {t("profile.accountInfo")}
        </h3>
        <div className="field-row">
          <label className="field-label">{t("profile.email")}</label>
          <div className="field-control">
            <div className="email-box">{user?.email}</div>
            {user?.emailVerified ? <span className="badge badge-success" style={{ marginTop: 4, fontSize: 11 }}>{t("profile.verified")}</span> : <span className="badge badge-warning" style={{ marginTop: 4, fontSize: 11 }}>{t("profile.unverified")}</span>}
          </div>
        </div>
        {user?.secondaryEmail && (
          <div className="field-row">
            <label className="field-label">{t("profile.recoveryEmail")}</label>
            <div className="field-control">
              <div className="email-box">{user.secondaryEmail}</div>
              {user.secondaryEmailVerified ? <span className="badge badge-success" style={{ marginTop: 4, fontSize: 11 }}>{t("profile.verified")}</span> : <span className="badge badge-warning" style={{ marginTop: 4, fontSize: 11 }}>{t("profile.unverified")}</span>}
            </div>
          </div>
        )}
        <div className="field-row">
          <label className="field-label">{t("profile.memberSince")}</label>
          <div className="field-control">
            <span style={{ fontSize: 14, color: 'var(--tb-text-secondary)' }}>{user?.createdAt ? new Date(user.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : "—"}</span>
          </div>
        </div>
        <div className="field-row">
          <label className="field-label">{t("profile.lastActive")}</label>
          <div className="field-control">
            <span style={{ fontSize: 14, color: 'var(--tb-text-secondary)' }}>{user?.lastActiveAt ? new Date(user.lastActiveAt).toLocaleString() : "—"}</span>
          </div>
        </div>
        <div className="field-row">
          <label className="field-label">{t("profile.connectedAccounts")}</label>
          <div className="field-control" style={{ display: 'flex', gap: 8 }}>
            {user?.hasGoogle && <span className="badge badge-neutral">Google</span>}
            {user?.hasGithub && <span className="badge badge-neutral">GitHub</span>}
            {user?.hasDiscord && <span className="badge badge-neutral">Discord</span>}
            {!user?.hasGoogle && !user?.hasGithub && !user?.hasDiscord && <span style={{ fontSize: 13, color: 'var(--tb-text-muted)' }}>{t("profile.noneConnected")}</span>}
          </div>
        </div>
      </div>
    </div>
  );
}
