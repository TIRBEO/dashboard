import { useEffect, useState, useRef } from "react";
import { useOutletContext, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  User, Shield, Bell, Palette, Key, Save, Eye, EyeOff,
  Upload, Loader2, Smartphone, Globe, Monitor,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { getProfile, upsertProfile, uploadAvatar, type UserProfile } from "@/lib/profile";
import type { Session } from "@/lib/session";

const tabs = [
  { id: "profile", label: "Profile", icon: User },
  { id: "security", label: "Security", icon: Shield },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "api-keys", label: "API Keys", icon: Key },
];

export default function SettingsPage() {
  const session = useOutletContext<Session>();
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = searchParams.get("tab") || "profile";
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    displayName: "", bio: "", location: "", website: "", company: "", jobTitle: "", phone: "", timezone: "UTC",
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [emailNotifs, setEmailNotifs] = useState({
    security: true, updates: true, community: true, marketing: false,
  });
  const [theme, setTheme] = useState<"dark" | "light" | "system">("dark");

  const [apiKeys, setApiKeys] = useState<{ id: string; name: string; created_at: string; last_used_at: string | null }[]>([]);
  const [showCreateKey, setShowCreateKey] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [createdKey, setCreatedKey] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      getProfile(session.user.id),
      supabase.from("user_preferences").select("*").maybeSingle(),
      supabase.from("api_keys").select("*").eq("user_id", session.user.id).order("created_at", { ascending: false }),
    ]).then(([prof, prefs, keys]) => {
      if (prof) {
        setProfile(prof);
        setForm({
          displayName: prof.display_name || session.user.displayName,
          bio: prof.bio || "",
          location: prof.location || "",
          website: prof.website || "",
          company: prof.company || "",
          jobTitle: prof.job_title || "",
          phone: prof.phone || "",
          timezone: prof.timezone || "UTC",
        });
      } else {
        setForm({ ...form, displayName: session.user.displayName });
      }
      if (prefs?.data) {
        const p = prefs.data as any;
        setEmailNotifs({
          security: p.email_security ?? true,
          updates: p.email_updates ?? true,
          community: p.email_community ?? true,
          marketing: p.email_marketing ?? false,
        });
        setTheme(p.theme || "dark");
      }
      if (keys?.data) setApiKeys(keys.data as any[]);
      setLoading(false);
    });
  }, [session.user.id]);

  const validateForm = () => {
    const errs: Record<string, string> = {};
    if (!form.displayName.trim()) errs.displayName = "Display name is required";
    if (form.website && !/^https?:\/\/.+/.test(form.website)) errs.website = "Invalid URL";
    if (form.bio && form.bio.length > 500) errs.bio = "Bio must be 500 characters or less";
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSaveProfile = async () => {
    if (!validateForm()) return;
    setSaving(true);
    try {
      await upsertProfile({
        user_id: session.user.id,
        display_name: form.displayName,
        bio: form.bio || "",
        location: form.location || "",
        website: form.website || "",
        company: form.company || "",
        job_title: form.jobTitle || "",
        phone: form.phone || "",
        timezone: form.timezone || "UTC",
      });
      setMsg({ type: "success", text: "Profile saved successfully" });
    } catch (e: unknown) {
      setMsg({ type: "error", text: (e as Error).message });
    }
    setSaving(false);
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarUploading(true);
    try {
      await uploadAvatar(session.user.id, file);
      setMsg({ type: "success", text: "Avatar updated" });
    } catch (e: unknown) {
      setMsg({ type: "error", text: (e as Error).message });
    }
    setAvatarUploading(false);
    e.target.value = "";
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      setMsg({ type: "error", text: "All password fields are required" });
      return;
    }
    if (newPassword.length < 8) {
      setMsg({ type: "error", text: "Password must be at least 8 characters" });
      return;
    }
    if (newPassword !== confirmPassword) {
      setMsg({ type: "error", text: "Passwords do not match" });
      return;
    }
    setSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      setMsg({ type: "success", text: "Password updated" });
      setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
    } catch (e: unknown) {
      setMsg({ type: "error", text: (e as Error).message });
    }
    setSaving(false);
  };

  const handleCreateApiKey = async () => {
    if (!newKeyName.trim()) return;
    try {
      const { data, error } = await supabase
        .from("api_keys")
        .insert({ user_id: session.user.id, name: newKeyName.trim() })
        .select()
        .single();
      if (error) throw error;
      setCreatedKey((data as any).api_key || `tirbeo_${crypto.randomUUID().slice(0, 16)}`);
      setNewKeyName("");
      setShowCreateKey(false);
      const { data: keys } = await supabase.from("api_keys").select("*").eq("user_id", session.user.id).order("created_at", { ascending: false });
      if (keys) setApiKeys(keys as any[]);
    } catch (e: unknown) {
      setMsg({ type: "error", text: (e as Error).message });
    }
  };

  const handleRevokeKey = async (id: string) => {
    await supabase.from("api_keys").delete().eq("id", id);
    setApiKeys((prev) => prev.filter((k) => k.id !== id));
  };

  const setTab = (id: string) => setSearchParams({ tab: id });

  const avatarInitial = session.user.displayName?.charAt(0)?.toUpperCase() || "U";

  if (loading) {
    return (
      <div className="flex h-80 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-ink-soft" />
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mx-auto w-full max-w-4xl">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-semibold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-ink-soft">Manage your account and preferences</p>
      </div>

      {msg && (
        <div className={`mb-6 flex items-center justify-between rounded-lg border px-4 py-3 text-sm ${
          msg.type === "success"
            ? "border-green-500/30 bg-green-500/10 text-green-500"
            : "border-red-500/30 bg-red-500/10 text-red-500"
        }`}>
          <span>{msg.text}</span>
          <button onClick={() => setMsg(null)} className="ml-4 text-lg leading-none">&times;</button>
        </div>
      )}

      <div className="flex flex-col gap-8 lg:flex-row">
        <nav className="flex shrink-0 flex-col gap-1 lg:w-52">
          {tabs.map((t) => {
            const Icon = t.icon;
            const isActive = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors text-left ${
                  isActive
                    ? "bg-foreground/10 text-foreground"
                    : "text-ink-soft hover:bg-secondary hover:text-foreground"
                }`}
              >
                <Icon className="h-4 w-4" />
                {t.label}
              </button>
            );
          })}
        </nav>

        <div className="flex-1 min-w-0">
          {tab === "profile" && (
            <div className="space-y-8">
              <section>
                <h2 className="text-lg font-semibold">Profile Information</h2>
                <p className="text-sm text-ink-soft">Update your public profile details</p>
                <div className="mt-6 space-y-5">
                  <div className="flex items-center gap-4">
                    <div className="relative flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-secondary text-xl font-semibold text-foreground">
                      {profile?.avatar_url ? (
                        <img src={profile.avatar_url} alt="" className="h-full w-full object-cover" />
                      ) : (
                        avatarInitial
                      )}
                      {avatarUploading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
                          <Loader2 className="h-5 w-5 animate-spin text-white" />
                        </div>
                      )}
                    </div>
                    <div>
                      <input ref={fileRef} type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                      <button
                        onClick={() => fileRef.current?.click()}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-ink-soft hover:text-foreground transition-colors"
                      >
                        <Upload className="h-3.5 w-3.5" />
                        Change Avatar
                      </button>
                      <p className="mt-1 text-xs text-ink-soft">PNG, JPG. Max 2MB.</p>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-ink">Display Name</label>
                      <input
                        value={form.displayName}
                        onChange={(e) => setForm({ ...form, displayName: e.target.value })}
                        className="w-full rounded-lg border border-border bg-secondary/50 px-3 py-2.5 text-sm text-foreground outline-none focus:border-foreground/30"
                      />
                      {formErrors.displayName && <p className="mt-1 text-xs text-red-500">{formErrors.displayName}</p>}
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-ink">Email</label>
                      <input
                        value={session.user.email}
                        disabled
                        className="w-full rounded-lg border border-border bg-secondary/20 px-3 py-2.5 text-sm text-ink-soft/50 outline-none cursor-not-allowed"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-ink">Job Title</label>
                      <input
                        value={form.jobTitle}
                        onChange={(e) => setForm({ ...form, jobTitle: e.target.value })}
                        placeholder="Software Engineer"
                        className="w-full rounded-lg border border-border bg-secondary/50 px-3 py-2.5 text-sm text-foreground outline-none focus:border-foreground/30 placeholder:text-ink-soft/30"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-ink">Company</label>
                      <input
                        value={form.company}
                        onChange={(e) => setForm({ ...form, company: e.target.value })}
                        placeholder="Acme Inc."
                        className="w-full rounded-lg border border-border bg-secondary/50 px-3 py-2.5 text-sm text-foreground outline-none focus:border-foreground/30 placeholder:text-ink-soft/30"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-ink">Location</label>
                      <input
                        value={form.location}
                        onChange={(e) => setForm({ ...form, location: e.target.value })}
                        placeholder="City, Country"
                        className="w-full rounded-lg border border-border bg-secondary/50 px-3 py-2.5 text-sm text-foreground outline-none focus:border-foreground/30 placeholder:text-ink-soft/30"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-ink">Phone</label>
                      <input
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        placeholder="+1 555-0000"
                        className="w-full rounded-lg border border-border bg-secondary/50 px-3 py-2.5 text-sm text-foreground outline-none focus:border-foreground/30 placeholder:text-ink-soft/30"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="mb-1.5 block text-sm font-medium text-ink">Website</label>
                      <input
                        value={form.website}
                        onChange={(e) => setForm({ ...form, website: e.target.value })}
                        placeholder="https://yoursite.com"
                        className="w-full rounded-lg border border-border bg-secondary/50 px-3 py-2.5 text-sm text-foreground outline-none focus:border-foreground/30 placeholder:text-ink-soft/30"
                      />
                      {formErrors.website && <p className="mt-1 text-xs text-red-500">{formErrors.website}</p>}
                    </div>
                    <div className="sm:col-span-2">
                      <label className="mb-1.5 block text-sm font-medium text-ink">Bio</label>
                      <textarea
                        value={form.bio}
                        onChange={(e) => setForm({ ...form, bio: e.target.value })}
                        rows={3}
                        placeholder="Tell us about yourself"
                        className="w-full rounded-lg border border-border bg-secondary/50 px-3 py-2.5 text-sm text-foreground outline-none focus:border-foreground/30 placeholder:text-ink-soft/30 resize-none"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-ink">Timezone</label>
                      <select
                        value={form.timezone}
                        onChange={(e) => setForm({ ...form, timezone: e.target.value })}
                        className="w-full rounded-lg border border-border bg-secondary/50 px-3 py-2.5 text-sm text-foreground outline-none focus:border-foreground/30"
                      >
                        {Intl.supportedValuesOf?.("timeZone")?.map((tz) => (
                          <option key={tz} value={tz}>{tz}</option>
                        )) || <option value="UTC">UTC</option>}
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <button
                      onClick={handleSaveProfile}
                      disabled={saving}
                      className="inline-flex items-center gap-2 rounded-lg bg-foreground px-4 py-2.5 text-sm font-medium text-background hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                      <Save className="h-4 w-4" />
                      {saving ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                </div>
              </section>
            </div>
          )}

          {tab === "security" && (
            <div className="space-y-8">
              <section>
                <h2 className="text-lg font-semibold">Change Password</h2>
                <p className="mt-1 text-sm text-ink-soft">Update your account password</p>
                <div className="mt-4 max-w-sm space-y-4">
                  <div className="relative">
                    <label className="mb-1.5 block text-sm font-medium text-ink">Current Password</label>
                    <input
                      type={showCurrent ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full rounded-lg border border-border bg-secondary/50 px-3 py-2.5 pr-10 text-sm text-foreground outline-none focus:border-foreground/30"
                    />
                    <button onClick={() => setShowCurrent(!showCurrent)} className="absolute right-3 top-[38px] text-ink-soft hover:text-foreground">
                      {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <div className="relative">
                    <label className="mb-1.5 block text-sm font-medium text-ink">New Password</label>
                    <input
                      type={showNew ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full rounded-lg border border-border bg-secondary/50 px-3 py-2.5 pr-10 text-sm text-foreground outline-none focus:border-foreground/30"
                    />
                    <button onClick={() => setShowNew(!showNew)} className="absolute right-3 top-[38px] text-ink-soft hover:text-foreground">
                      {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <div className="relative">
                    <label className="mb-1.5 block text-sm font-medium text-ink">Confirm New Password</label>
                    <input
                      type={showConfirm ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full rounded-lg border border-border bg-secondary/50 px-3 py-2.5 pr-10 text-sm text-foreground outline-none focus:border-foreground/30"
                    />
                    <button onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-[38px] text-ink-soft hover:text-foreground">
                      {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <button
                    onClick={handleChangePassword}
                    disabled={saving}
                    className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-ink-soft hover:text-foreground transition-colors disabled:opacity-50"
                  >
                    <Shield className="h-4 w-4" />
                    {saving ? "Updating..." : "Update Password"}
                  </button>
                </div>
              </section>

              <hr className="border-border" />
              <section>
                <h2 className="text-lg font-semibold">Two-Factor Authentication</h2>
                <p className="mt-1 text-sm text-ink-soft">Add an extra layer of security</p>
                <div className="mt-4 rounded-xl border border-border bg-secondary/20 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Authenticator App</h3>
                      <p className="text-sm text-ink-soft">Use Google Authenticator, Authy, or similar</p>
                    </div>
                    <span className="rounded-full bg-ink-soft/10 px-3 py-1 text-xs text-ink-soft">Coming soon</span>
                  </div>
                </div>
              </section>
            </div>
          )}

          {tab === "notifications" && (
            <section>
              <h2 className="text-lg font-semibold">Notification Preferences</h2>
              <p className="mt-1 text-sm text-ink-soft">Choose what updates you receive</p>
              <div className="mt-4 space-y-3">
                {[
                  { key: "security" as const, label: "Security alerts", desc: "New sign-ins and security events" },
                  { key: "updates" as const, label: "Product updates", desc: "New features and improvements" },
                  { key: "community" as const, label: "Community activity", desc: "Messages, mentions, and replies" },
                  { key: "marketing" as const, label: "Marketing emails", desc: "Tips, guides, and offers" },
                ].map((n) => (
                  <label key={n.key} className="flex items-center justify-between rounded-lg border border-border bg-secondary/10 px-4 py-3 cursor-pointer">
                    <div>
                      <p className="text-sm font-medium">{n.label}</p>
                      <p className="text-xs text-ink-soft">{n.desc}</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={emailNotifs[n.key]}
                      onChange={() => setEmailNotifs({ ...emailNotifs, [n.key]: !emailNotifs[n.key] })}
                      className="rounded border-border bg-secondary text-foreground accent-foreground"
                    />
                  </label>
                ))}
                <button
                  onClick={async () => {
                    await supabase.from("user_preferences").upsert(
                      { user_id: session.user.id, email_security: emailNotifs.security, email_updates: emailNotifs.updates, email_community: emailNotifs.community, email_marketing: emailNotifs.marketing, updated_at: new Date().toISOString() },
                      { onConflict: "user_id" },
                    );
                    setMsg({ type: "success", text: "Preferences saved" });
                  }}
                  className="mt-3 inline-flex items-center gap-2 rounded-lg bg-foreground px-4 py-2.5 text-sm font-medium text-background hover:opacity-90 transition-opacity"
                >
                  <Save className="h-4 w-4" /> Save Preferences
                </button>
              </div>
            </section>
          )}

          {tab === "appearance" && (
            <section>
              <h2 className="text-lg font-semibold">Appearance</h2>
              <p className="mt-1 text-sm text-ink-soft">Customize your theme preferences</p>
              <div className="mt-4 space-y-4">
                <div className="rounded-xl border border-border bg-secondary/10 p-5">
                  <p className="text-sm font-medium mb-3">Theme</p>
                  <div className="flex gap-3">
                    {([
                      { id: "dark" as const, label: "Dark", icon: Monitor },
                      { id: "light" as const, label: "Light", icon: Globe },
                      { id: "system" as const, label: "System", icon: Smartphone },
                    ]).map((t) => {
                      const Icon = t.icon;
                      return (
                        <button
                          key={t.id}
                          onClick={() => setTheme(t.id)}
                          className={`flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors ${
                            theme === t.id
                              ? "border-foreground bg-foreground/10 text-foreground"
                              : "border-border text-ink-soft hover:bg-secondary hover:text-foreground"
                          }`}
                        >
                          <Icon className="h-4 w-4" />
                          {t.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <button
                  onClick={async () => {
                    await supabase.from("user_preferences").upsert(
                      { user_id: session.user.id, theme, updated_at: new Date().toISOString() },
                      { onConflict: "user_id" },
                    );
                    setMsg({ type: "success", text: "Theme preference saved" });
                  }}
                  className="inline-flex items-center gap-2 rounded-lg bg-foreground px-4 py-2.5 text-sm font-medium text-background hover:opacity-90 transition-opacity"
                >
                  <Save className="h-4 w-4" /> Save Theme
                </button>
              </div>
            </section>
          )}

          {tab === "api-keys" && (
            <section>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold">API Keys</h2>
                  <p className="text-sm text-ink-soft">Manage keys for programmatic access</p>
                </div>
                <button
                  onClick={() => setShowCreateKey(true)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-foreground px-3 py-2 text-sm font-medium text-background hover:opacity-90 transition-opacity"
                >
                  <Key className="h-3.5 w-3.5" /> Create Key
                </button>
              </div>

              {showCreateKey && (
                <div className="mb-4 rounded-xl border border-border bg-secondary/20 p-4">
                  <label className="mb-1.5 block text-sm font-medium text-ink">Key Name</label>
                  <div className="flex gap-2">
                    <input
                      value={newKeyName}
                      onChange={(e) => setNewKeyName(e.target.value)}
                      placeholder="e.g. Production API"
                      className="flex-1 rounded-lg border border-border bg-secondary/50 px-3 py-2 text-sm text-foreground outline-none focus:border-foreground/30 placeholder:text-ink-soft/30"
                      onKeyDown={(e) => e.key === "Enter" && handleCreateApiKey()}
                    />
                    <button onClick={handleCreateApiKey} className="rounded-lg bg-foreground px-3 py-2 text-sm font-medium text-background">Create</button>
                    <button onClick={() => setShowCreateKey(false)} className="rounded-lg border border-border px-3 py-2 text-sm text-ink-soft">Cancel</button>
                  </div>
                </div>
              )}

              {createdKey && (
                <div className="mb-4 rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-4">
                  <p className="text-sm font-medium text-yellow-500">Key created! Copy it now — you won't see it again.</p>
                  <div className="mt-2 flex gap-2">
                    <code className="flex-1 rounded border border-yellow-500/20 bg-background px-3 py-2 text-xs font-mono text-yellow-400 break-all">{createdKey}</code>
                    <button onClick={() => { navigator.clipboard.writeText(createdKey); setCreatedKey(null); }} className="rounded-lg bg-yellow-600 px-3 py-2 text-xs font-medium text-white">Copy</button>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                {apiKeys.length === 0 && (
                  <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-secondary/10 py-12 text-center">
                    <Key className="h-8 w-8 text-ink-soft mb-2" />
                    <p className="text-sm text-ink-soft">No API keys created yet</p>
                  </div>
                )}
                {apiKeys.map((key) => (
                  <div key={key.id} className="flex items-center justify-between rounded-lg border border-border bg-secondary/10 px-4 py-3">
                    <div>
                      <p className="text-sm font-medium">{key.name || "Untitled Key"}</p>
                      <p className="text-xs text-ink-soft">
                        Created {new Date(key.created_at).toLocaleDateString()}
                        {key.last_used_at && ` · Last used ${new Date(key.last_used_at).toLocaleDateString()}`}
                      </p>
                    </div>
                    <button onClick={() => handleRevokeKey(key.id)} className="text-xs text-ink-soft hover:text-red-500 underline-offset-2 hover:underline transition-colors">
                      Revoke
                    </button>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </motion.div>
  );
}
