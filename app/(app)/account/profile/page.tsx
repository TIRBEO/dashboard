"use client";
import { useEffect, useState, useRef } from "react";
import { api, getCurrentUser } from "@/lib/api";
import { setDirtyGlobal } from "@/lib/unsaved";
import {
  Camera,
  User,
  Briefcase,
  Link2,
  Info,
  Check,
  AlertCircle,
  Loader2,
  Pencil,
  Shield,
  Calendar,
  Globe,
  Mail,
} from "lucide-react";
import { Skeleton } from "@/components/ui/Skeleton";
import { useI18n } from "@/lib/i18n";

function ProfileSkeleton() {
  return (
    <div className="flex flex-col gap-6 max-w-[1200px] mx-auto">
      <div className="flex items-center gap-4"><Skeleton width={120} height={24} className="rounded-b" /><Skeleton width={240} height={14} className="rounded-b" /></div>
      <div className="rounded-2xl border border-tb-border bg-tb-surface-1 p-6">
        <div className="flex items-center gap-5">
          <Skeleton width={80} height={80} borderRadius="50%" />
          <div><Skeleton width={180} height={20} className="mb-1.5" /><Skeleton width={220} height={14} /><Skeleton width={140} height={12} className="mt-2" /></div>
        </div>
      </div>
      {[1, 2, 3].map((i) => (
        <div key={i} className="rounded-2xl border border-tb-border bg-tb-surface-1 p-6">
          <Skeleton width={120} height={18} className="mb-4" />
          {[0, 1, 2].map((j) => (
            <div key={j} className="flex items-center justify-between border-b border-tb-border py-3">
              <Skeleton width={90} height={14} /><Skeleton width={220} height={36} borderRadius={8} />
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
  const unameCheckTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    getCurrentUser()
      .then((u) => {
        setUser(u);
        setImgFailed(false);
        originalUsername.current = (u.username || "").toLowerCase();
        setForm({
          name: u.name || "",
          username: u.username || "",
          bio: u.bio || "",
          gender: u.gender || "",
          birthday: u.birthday ? u.birthday.split("T")[0] : "",
          country: u.country || "",
          occupation: u.occupation || "",
          companyName: u.companyName || "",
          companyRole: u.companyRole || "",
          industry: u.industry || "",
          companySize: u.companySize || "",
          website: u.website || "",
          linkedin: u.linkedin || "",
          githubUsername: u.githubUsername || "",
          twitter: u.twitter || "",
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (unameCheckTimer.current) clearTimeout(unameCheckTimer.current);
    const uname = (form.username || "").toLowerCase().trim();
    if (!uname || uname === originalUsername.current) { setUnameStatus("idle"); return; }
    if (!/^[a-zA-Z0-9_-]{3,20}$/.test(uname)) { setUnameStatus("invalid"); return; }
    setUnameStatus("checking");
    unameCheckTimer.current = setTimeout(() => {
      api.get<{ available?: boolean; taken?: boolean; reserved?: boolean }>(`/api/profile/check-username?username=${encodeURIComponent(uname)}`)
        .then((r) => { setUnameStatus(r.available ? "available" : r.taken ? "taken" : r.reserved ? "reserved" : "available"); })
        .catch(() => setUnameStatus("idle"));
    }, 500);
    return () => { if (unameCheckTimer.current) clearTimeout(unameCheckTimer.current); };
  }, [form.username]);

  const unameBlocked = unameStatus === "taken" || unameStatus === "reserved" || unameStatus === "invalid";

  const save = async () => {
    if (!form.name?.trim()) { setSaveError(t("profile.errorNameRequired")); return; }
    setSaving(true); setSaveError(""); setSaved(false);
    try {
      const clean: Record<string, any> = {};
      for (const [k, v] of Object.entries(form)) {
        if (k === 'secondaryEmail' && (!v || !v.trim())) continue;
        if (k === 'website' && v && !v.trim()) continue;
        if (k === 'name') { clean[k] = v; continue; }
        if (v !== undefined && v !== null) clean[k] = v;
      }
      await api.patch("/api/profile", clean);
      setUser((prev: any) => ({ ...prev, ...form }));
      window.dispatchEvent(new CustomEvent("tb:user-updated", { detail: form }));
      setSaved(true); setTimeout(() => setSaved(false), 3000);
      setDirtyGlobal(false);
    } catch (err: any) { setSaveError(err?.message || t("profile.errorSaveFailed")); }
    setSaving(false);
  };

  const uploadAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setAvatarError(t("profile.errorInvalidImageType"));
      if (fileRef.current) fileRef.current.value = "";
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setAvatarError(t("profile.errorImageTooLarge"));
      if (fileRef.current) fileRef.current.value = "";
      return;
    }
    setUploading(true); setAvatarError("");
    try {
      const formData = new FormData();
      formData.append("avatar", file);
      const data = await api.request<{ photoUrl?: string; url?: string; message?: string }>("/api/profile/avatar", { method: "POST", body: formData });
      const newUrl = data?.photoUrl || data?.url;
      if (newUrl) {
        setImgFailed(false);
        setUser((prev: any) => ({ ...prev, photoUrl: newUrl }));
        window.dispatchEvent(new CustomEvent("tb:user-updated", { detail: { photoUrl: newUrl } }));
      } else {
        setAvatarError(t("profile.errorUploadUrl"));
      }
    } catch (err: any) {
      const msg = err?.message || "";
      if (msg.includes("CORS") || msg.includes("NetworkError") || msg.includes("Failed to fetch")) {
        setAvatarError(t("profile.errorNetwork"));
      } else if (msg.includes("413") || msg.includes("too large") || msg.includes("5MB")) {
        setAvatarError(t("profile.errorImageTooLarge"));
      } else if (msg.includes("415") || msg.includes("Unsupported") || msg.includes("type")) {
        setAvatarError(t("profile.errorInvalidImageType"));
      } else {
        setAvatarError(msg || t("profile.errorUploadGeneric"));
      }
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
      title: t("profile.personal"), icon: <User size={14} />,
      fields: [
        { key: "name", label: t("profile.fullName"), placeholder: t("profile.fullNamePh") },
        { key: "username", label: t("profile.username"), placeholder: t("profile.usernamePh") },
        { key: "bio", label: t("profile.bio"), placeholder: t("profile.bioPh"), type: "textarea" },
        { key: "gender", label: t("profile.gender"), type: "select", options: [
          { value: "", label: t("profile.selectOption") }, { value: "male", label: t("profile.male") },
          { value: "female", label: t("profile.female") }, { value: "other", label: t("profile.other") },
          { value: "prefer-not-to-say", label: t("profile.preferNot") },
        ]},
        { key: "birthday", label: t("profile.birthday"), type: "date" },
        { key: "country", label: t("profile.country"), placeholder: t("profile.countryPh") },
      ],
    },
    {
      title: t("profile.work"), icon: <Briefcase size={14} />,
      fields: [
        { key: "occupation", label: t("profile.occupation"), placeholder: t("profile.occupationPh") },
        { key: "companyName", label: t("profile.company"), placeholder: t("profile.companyPh") },
        { key: "companyRole", label: t("profile.role"), placeholder: t("profile.roleAtCompanyPh") },
        { key: "industry", label: t("profile.industry"), placeholder: t("profile.industryPh") },
        { key: "companySize", label: t("profile.companySize"), type: "select", options: [
          { value: "", label: t("profile.selectOption") }, { value: "1", label: t("profile.justMe") },
          { value: "2-10", label: "2-10" }, { value: "11-50", label: "11-50" },
          { value: "51-200", label: "51-200" }, { value: "201-1000", label: "201-1,000" }, { value: "1001+", label: "1,001+" },
        ]},
      ],
    },
    {
      title: t("profile.links"), icon: <Link2 size={14} />,
      fields: [
        { key: "website", label: t("profile.website"), placeholder: t("profile.websitePh") },
        { key: "linkedin", label: t("profile.linkedin"), placeholder: t("profile.linkedinPh") },
        { key: "githubUsername", label: t("profile.github"), placeholder: t("profile.githubPh") },
        { key: "twitter", label: t("profile.twitter"), placeholder: t("profile.twitterPh") },
      ],
    },
  ];

  const fieldCls = "w-full h-[42px] px-3.5 rounded-[10px] text-sm border border-tb-border bg-tb-input text-tb-text-primary outline-none font-[inherit] transition-colors duration-150";

  return (
    <div className="flex flex-col gap-6 max-w-[1200px] mx-auto">
      {/* ═══ Page Header ═══ */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="flex items-center gap-2.5 text-[28px] font-bold tracking-[-0.03em] text-tb-text-primary">
            <User size={24} className="text-tb-text-muted" />
            {t("profile.title")}
          </h1>
          <p className="mt-1 text-sm text-tb-text-muted">{t("profile.subtitle")}</p>
        </div>
        <div className="flex items-center gap-2.5">
          <span className={`flex items-center gap-1 text-xs font-medium transition-colors duration-200 ${saved ? 'text-tb-green' : 'text-transparent'}`}>
            {saved && <><Check size={13} /> {t("common.saved")}</>}
          </span>
          <button
            onClick={save}
            disabled={saving || unameBlocked}
            className={`btn btn-primary btn-sm gap-1.5 ${saving || unameBlocked ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            {saving ? <Loader2 size={13} className="animate-spin" /> : <Pencil size={13} />} {saving ? t("profile.saving") : t("profile.saveChanges")}
          </button>
        </div>
      </div>

      {/* ═══ Save Error ═══ */}
      {saveError && (
        <div className="flex items-center gap-2 rounded-xl bg-tb-red-soft p-2.5 text-sm border border-[rgba(232,93,106,0.2)]">
          <AlertCircle size={14} className="shrink-0" /> {saveError}
        </div>
      )}

      {/* ═══ Avatar Card ═══ */}
      <div className="rounded-2xl border border-tb-border bg-tb-surface-1 p-6">
        <div className="flex items-center gap-5">
          {/* Avatar */}
          <div className="relative shrink-0">
            <div
              onClick={() => fileRef.current?.click()}
              className="flex cursor-pointer items-center justify-center w-20 h-20 rounded-full bg-tb-surface-3 text-tb-text-muted border-2 border-tb-border transition-colors duration-150 hover:border-tb-border-hover"
            >
              {user?.photoUrl && !imgFailed ? (
                <img src={user.photoUrl} alt="" className="h-full w-full object-cover" onError={() => setImgFailed(true)} referrerPolicy="no-referrer" />
              ) : (
                initialsOf(user?.name ?? user?.email)
              )}
            </div>
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="absolute -bottom-0.5 -right-0.5 w-7 h-7 rounded-full flex items-center justify-center cursor-pointer bg-tb-surface-1 border-[1.5px] border-tb-border text-tb-text-muted transition-transform duration-150 hover:scale-110"
            >
              {uploading ? <span className="inline-block w-3 h-3 animate-spin rounded-full border-2 border-current border-t-transparent" /> : <Camera size={13} />}
            </button>
            <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/gif,image/webp" onChange={uploadAvatar} className="hidden" />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="text-lg font-semibold text-tb-text-primary">{user?.name || t("profile.noNameSet")}</div>
            <div className="mt-0.5 text-xs text-tb-text-muted">{user?.email}</div>
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              {user?.username && (
                <span className="rounded-lg border border-tb-border bg-tb-surface-3 px-2 py-0.5 text-xs font-semibold text-tb-text-secondary">
                  @{user.username}
                </span>
              )}
              {user?.isVerified && (
                <span className="rounded-lg border border-[rgba(115,184,92,0.2)] bg-tb-green-soft px-2 py-0.5 text-xs font-semibold text-tb-green">
                  {t("profile.verified")}
                </span>
              )}
            </div>
          </div>
        </div>
        {avatarError && <div className="mt-2.5 text-xs text-tb-red">{avatarError}</div>}
      </div>

      {/* ═══ Form Sections ═══ */}
      {sections.map((section) => (
        <div key={section.title} className="overflow-hidden rounded-2xl border border-tb-border bg-tb-surface-1">
          <div className="border-b border-tb-border px-5 py-4">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-tb-text-primary">
              <span className="text-tb-text-muted">{section.icon}</span>
              {section.title}
            </h3>
          </div>
          <div>
            {section.fields.map((f, i) => (
              <div key={f.key} className="flex items-start gap-4 border-b border-tb-border px-5 py-3 transition-colors duration-150 hover:bg-tb-surface-2">
                <label className="min-w-[140px] text-sm font-medium text-tb-text-primary pt-2.5">{f.label}</label>
                <div className="flex-1 min-w-0">
                  {f.type === "textarea" ? (
                    <textarea
                      className={`${fieldCls} min-h-[100px] resize-y p-2.5 text-sm leading-relaxed`}
                      value={form[f.key] || ""}
                      onChange={(e) => { setForm((prev) => ({ ...prev, [f.key]: e.target.value })); setDirtyGlobal(true); }}
                      placeholder={(f as any).placeholder}
                      rows={3}
                    />
                  ) : f.type === "select" ? (
                    <select
                      className={`${fieldCls} cursor-pointer`}
                      value={form[f.key] || ""}
                      onChange={(e) => { setForm((prev) => ({ ...prev, [f.key]: e.target.value })); setDirtyGlobal(true); }}
                    >
                      {(f as any).options.map((o: any) => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  ) : f.type === "date" ? (
                    <input
                      type="date"
                      className={`${fieldCls} cursor-pointer`}
                      value={form[f.key] || ""}
                      onChange={(e) => { setForm((prev) => ({ ...prev, [f.key]: e.target.value })); setDirtyGlobal(true); }}
                    />
                  ) : (
                    <div>
                      <input
                        className={`${fieldCls} ${f.key === "username" && (unameStatus === "taken" || unameStatus === "reserved" || unameStatus === "invalid") ? '!border-tb-red' : f.key === "username" && unameStatus === "available" ? '!border-tb-green' : ''}`}
                        value={form[f.key] || ""}
                        onChange={(e) => { setForm((prev) => ({ ...prev, [f.key]: e.target.value })); setDirtyGlobal(true); }}
                        placeholder={(f as any).placeholder}
                      />
                      {f.key === "username" && unameStatus !== "idle" && (
                        <div className="mt-1 flex items-center gap-1 text-xs">
                          {unameStatus === "checking" && <><Loader2 size={11} className="animate-spin text-tb-text-muted" /><span className="text-tb-text-muted">{t("profile.usernameChecking")}</span></>}
                          {unameStatus === "available" && <><Check size={11} className="text-tb-green" /><span className="text-tb-green">{t("profile.usernameAvailable")}</span></>}
                          {(unameStatus === "taken" || unameStatus === "reserved") && <><AlertCircle size={11} className="text-tb-red" /><span className="text-tb-red">{t(unameStatus === "taken" ? "profile.usernameTaken" : "profile.usernameReserved")}</span></>}
                          {unameStatus === "invalid" && <><AlertCircle size={11} className="text-tb-red" /><span className="text-tb-red">{t("profile.usernameInvalid")}</span></>}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* ═══ Account Info ═══ */}
      <div className="overflow-hidden rounded-2xl border border-tb-border bg-tb-surface-1">
        <div className="border-b border-tb-border px-5 py-4">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-tb-text-primary">
            <Info size={14} className="text-tb-text-muted" />
            {t("profile.accountInfo")}
          </h3>
        </div>
        <div>
          {[
            { label: t("profile.email"), icon: <Mail size={12} />, value: user?.email, verified: user?.emailVerified },
            user?.secondaryEmail ? { label: t("profile.recoveryEmail"), icon: <Mail size={12} />, value: user.secondaryEmail, verified: user.secondaryEmailVerified } : null,
            { label: t("profile.memberSince"), icon: <Calendar size={12} />, value: user?.createdAt ? new Date(user.createdAt).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" }) : "—" },
            { label: t("profile.lastActive"), icon: <Globe size={12} />, value: user?.lastActiveAt ? new Date(user.lastActiveAt).toLocaleString() : "—" },
          ].filter(Boolean).map((row: any, i, arr) => (
            <div key={i} className="flex items-start gap-4 border-b border-tb-border px-5 py-3">
              <label className="flex min-w-[140px] items-center gap-1.5 text-sm font-medium text-tb-text-primary py-1">
                <span className="text-tb-text-muted">{row.icon}</span> {row.label}
              </label>
              <div className="flex-1">
                <div className="font-mono text-sm text-tb-text-primary">{row.value}</div>
                {row.verified !== undefined && (
                  <span className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-semibold ${row.verified ? 'bg-tb-green-soft text-tb-green' : 'bg-tb-yellow-soft text-tb-yellow'}`}>
                    {row.verified ? t("profile.verified") : t("profile.unverified")}
                  </span>
                )}
              </div>
            </div>
          ))}
          {/* Connected Accounts */}
          <div className="flex items-start gap-4 px-5 py-3">
            <label className="flex min-w-[140px] items-center gap-1.5 text-sm font-medium text-tb-text-primary py-1">
              <Shield size={12} className="text-tb-text-muted" /> {t("profile.connectedAccounts")}
            </label>
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              {user?.hasGoogle && <span className="rounded-lg border border-tb-border bg-tb-surface-3 px-2 py-0.5 text-xs font-semibold text-tb-text-secondary">Google</span>}
              {user?.hasGithub && <span className="rounded-lg border border-tb-border bg-tb-surface-3 px-2 py-0.5 text-xs font-semibold text-tb-text-secondary">GitHub</span>}
              {user?.hasDiscord && <span className="rounded-lg border border-tb-border bg-tb-surface-3 px-2 py-0.5 text-xs font-semibold text-tb-text-secondary">Discord</span>}
              {!user?.hasGoogle && !user?.hasGithub && !user?.hasDiscord && <span className="text-xs text-tb-text-muted">{t("profile.noneConnected")}</span>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
