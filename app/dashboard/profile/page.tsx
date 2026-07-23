"use client";

import { useState, useEffect, useRef } from "react";
import { Camera, User, Mail, Briefcase, Shield, Clock, Monitor, Pencil, X, Check } from "lucide-react";
import {
  PageContainer,
  PageHeader,
  Card,
  SettingRow,
  Input,
  Select,
  Textarea,
  Button,
  Badge,
  Avatar,
  Skeleton,
  Toast,
  useToast,
} from "../components";

const API = process.env.NEXT_PUBLIC_API_URL || "https://api.tirbeo.app";

type Profile = {
  id: string;
  email: string;
  name: string | null;
  photoUrl: string | null;
  phoneNumber: string | null;
  occupation: string | null;
  bio: string | null;
  website: string | null;
  linkedin: string | null;
  github: string | null;
  twitter: string | null;
  country: string | null;
  timezone: string | null;
  language: string | null;
  companyName: string | null;
  companyRole: string | null;
  industry: string | null;
  companySize: string | null;
  secondaryEmail: string | null;
  gender: string | null;
  birthday: string | null;
  hasPassword: boolean;
  hasGoogle: boolean;
  hasGithub: boolean;
  emailVerified: boolean;
  phoneVerified: boolean;
  createdAt: string;
  updatedAt: string;
};

type SigninEntry = { device: string; ip: string; location: string; time: string };

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

function truncUuid(id: string) {
  return id.slice(0, 8) + "..." + id.slice(-4);
}

function EditRow({ label, editing, onStart, onCancel, children }: {
  label: string; editing: boolean; onStart: () => void; onCancel: () => void; children: React.ReactNode;
}) {
  return (
    <div className="table-row" style={{ alignItems: "flex-start" }}>
      <span className="edit-label">{label}</span>
      <div className="edit-content">
        {editing ? children : (
          <div className="edit-display" onClick={onStart}>
            <span className="edit-display-text">{children as React.ReactNode}</span>
            <Pencil size={13} className="muted" />
          </div>
        )}
      </div>
      {editing && (
        <Button variant="ghost" size="sm" onClick={onCancel} className="edit-cancel-btn">
          <X size={12} /> Cancel
        </Button>
      )}
    </div>
  );
}

function EditDone({ onClick }: { onClick: () => void }) {
  return (
    <Button variant="primary" size="sm" onClick={onClick} className="edit-done-btn">
      <Check size={13} /> Done
    </Button>
  );
}

function FieldEdit({ value, onChange, placeholder, type = "text" }: {
  value: string; onChange: (v: string) => void; placeholder?: string; type?: string;
}) {
  return (
    <Input value={value} onChange={onChange} placeholder={placeholder} type={type} />
  );
}

function SelectField({ value, onChange, options }: {
  value: string; onChange: (v: string) => void; options: { value: string; label: string }[];
}) {
  return (
    <div>
      <Select value={value} onChange={onChange} options={[{ value: "", label: "Not set" }, ...options]} />
    </div>
  );
}

function StaticRow({ label, children, border = true }: {
  label: string; children: React.ReactNode; border?: boolean;
}) {
  return (
    <SettingRow label={label} border={border}>
      {children}
    </SettingRow>
  );
}

export default function ProfilePage() {
  const [p, setP] = useState<Profile | null>(null);
  const [saving, setSaving] = useState(false);
  const fetched = useRef(false);
  const [editField, setEditField] = useState<string | null>(null);
  const [signins, setSignins] = useState<SigninEntry[]>([]);
  const { toast, show: showToast, hide: hideToast } = useToast();

  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;
    fetch(API + "/api/profile", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (d) setP(d); })
      .catch(() => {});
    fetch(API + "/api/activity", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (d?.signins) setSignins(d.signins); })
      .catch(() => {});
  }, []);

  const update = (key: keyof Profile, val: string | null) => {
    setP((prev) => (prev ? { ...prev, [key]: val } : prev));
  };

  const save = async () => {
    if (!p) return;
    setSaving(true);
    try {
      const res = await fetch(API + "/api/profile", {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: p.name, gender: p.gender, birthday: p.birthday, language: p.language,
          country: p.country, timezone: p.timezone, phoneNumber: p.phoneNumber,
          secondaryEmail: p.secondaryEmail, website: p.website, linkedin: p.linkedin,
          github: p.github, twitter: p.twitter, occupation: p.occupation,
          companyName: p.companyName, companyRole: p.companyRole, industry: p.industry,
          companySize: p.companySize, bio: p.bio,
        }),
      });
      if (res.ok) {
        const updated = await res.json();
        if (updated?.updatedAt) setP((prev) => prev ? { ...prev, updatedAt: updated.updatedAt } : prev);
        showToast("Profile saved");
      } else {
        showToast("Failed to save", "error");
      }
    } catch {
      showToast("Connection error", "error");
    }
    setSaving(false);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append("avatar", file);
    try {
      const res = await fetch(API + "/api/profile/avatar", { method: "POST", credentials: "include", body: fd });
      if (res.ok) {
        const d = await res.json();
        setP((prev) => prev ? { ...prev, photoUrl: d.photoUrl } : prev);
        showToast("Photo updated");
      } else {
        showToast("Upload failed", "error");
      }
    } catch {
      showToast("Upload failed", "error");
    }
  };

  const reloadProfile = () => {
    fetched.current = false;
    setEditField(null);
    fetch(API + "/api/profile", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then(setP)
      .catch(() => {});
  };

  if (!p) {
    return (
      <PageContainer>
        <PageHeader title="Personal Info" description="Loading your profile..." />
        <Skeleton count={5} height={40} />
      </PageContainer>
    );
  }

  const GENDER_OPTS = [
    { value: "male", label: "Male" }, { value: "female", label: "Female" },
    { value: "other", label: "Other" }, { value: "prefer_not_to_say", label: "Prefer not to say" },
  ];

  const LANG_OPTS = [
    { value: "en", label: "English" }, { value: "ne", label: "Nepali" },
    { value: "hi", label: "Hindi" }, { value: "zh", label: "Chinese" },
    { value: "ja", label: "Japanese" }, { value: "ko", label: "Korean" },
    { value: "es", label: "Spanish" }, { value: "fr", label: "French" },
    { value: "de", label: "German" }, { value: "ar", label: "Arabic" },
    { value: "pt", label: "Portuguese" }, { value: "ru", label: "Russian" },
  ];

  const COUNTRY_OPTS = [
    { value: "NP", label: "Nepal" }, { value: "IN", label: "India" },
    { value: "US", label: "United States" }, { value: "GB", label: "United Kingdom" },
    { value: "AU", label: "Australia" }, { value: "JP", label: "Japan" },
    { value: "CN", label: "China" }, { value: "KR", label: "South Korea" },
    { value: "DE", label: "Germany" }, { value: "FR", label: "France" },
    { value: "CA", label: "Canada" }, { value: "BR", label: "Brazil" },
    { value: "AE", label: "UAE" }, { value: "SG", label: "Singapore" },
  ];

  const TZ_OPTS = [
    { value: "Asia/Kathmandu", label: "UTC+5:45 Nepal" },
    { value: "Asia/Kolkata", label: "UTC+5:30 India (IST)" },
    { value: "Asia/Shanghai", label: "UTC+8 China" },
    { value: "Asia/Tokyo", label: "UTC+9 Japan" },
    { value: "Asia/Seoul", label: "UTC+9 Korea" },
    { value: "Asia/Singapore", label: "UTC+8 Singapore" },
    { value: "Europe/London", label: "UTC+0 London" },
    { value: "Europe/Berlin", label: "UTC+1 Berlin" },
    { value: "Europe/Paris", label: "UTC+1 Paris" },
    { value: "America/New_York", label: "UTC-5 New York" },
    { value: "America/Chicago", label: "UTC-6 Chicago" },
    { value: "America/Denver", label: "UTC-7 Denver" },
    { value: "America/Los_Angeles", label: "UTC-8 Los Angeles" },
    { value: "Australia/Sydney", label: "UTC+10 Sydney" },
    { value: "UTC", label: "UTC+0" },
  ];

  const INDUSTRY_OPTS = [
    { value: "technology", label: "Technology" }, { value: "finance", label: "Finance" },
    { value: "healthcare", label: "Healthcare" }, { value: "education", label: "Education" },
    { value: "marketing", label: "Marketing" }, { value: "design", label: "Design" },
    { value: "legal", label: "Legal" }, { value: "manufacturing", label: "Manufacturing" },
    { value: "retail", label: "Retail" }, { value: "media", label: "Media & Entertainment" },
    { value: "real_estate", label: "Real Estate" }, { value: "hospitality", label: "Hospitality" },
    { value: "government", label: "Government" }, { value: "nonprofit", label: "Non-Profit" },
    { value: "agriculture", label: "Agriculture" }, { value: "other", label: "Other" },
  ];

  const SIZE_OPTS = [
    { value: "1-10", label: "1\u201310 employees" }, { value: "11-50", label: "11\u201350 employees" },
    { value: "51-200", label: "51\u2013200 employees" }, { value: "201-1000", label: "201\u20131,000 employees" },
    { value: "1001+", label: "1,001+ employees" },
  ];

  const SIZE_LABELS: Record<string, string> = {
    "1-10": "1\u201310 employees", "11-50": "11\u201350 employees",
    "51-200": "51\u2013200 employees", "201-1000": "201\u20131,000 employees",
    "1001+": "1,001+ employees",
  };

  const done = () => setEditField(null);

  return (
    <PageContainer>
      <PageHeader title="Personal Info" description="Your name, gender, birthday, and other details" />

      <style>{".avatar-overlay:hover{opacity:1!important}.edit-label{font-size:13px;font-weight:500;color:var(--text-muted);width:160px;flex-shrink:0;padding-top:8px}.edit-content{flex:1;min-width:0}.edit-display{display:flex;align-items:center;justify-content:space-between;padding:8px 12px;background:var(--bg-elevated);border:1px solid var(--border);border-radius:8px;cursor:pointer;min-height:40px;transition:border-color .15s}.edit-display:hover{border-color:var(--border-hover)}.edit-display-text{font-size:13px;color:var(--text)}.edit-display-text:empty::after{content:attr(data-placeholder);color:var(--text-ash)}.edit-cancel-btn{height:34px;flex-shrink:0;margin-top:8px}.edit-done-btn{height:40px;flex-shrink:0}.muted{color:var(--text-ash)}.profile-avatar-wrap{position:relative}.profile-avatar-wrap .avatar{width:80px;height:80px;font-size:28px;cursor:pointer}.avatar-overlay{position:absolute;inset:0;border-radius:50%;background:rgba(0,0,0,.5);display:flex;align-items:center;justify-content:center;opacity:0;cursor:pointer;transition:opacity .2s}.profile-name{font-size:18px;font-weight:600;color:var(--text);letter-spacing:-.02em}.profile-email{font-size:13px;color:var(--text-muted);margin-top:2px}.profile-meta{font-size:13px;color:var(--text-secondary)}.signin-text{font-size:13px;color:var(--text-secondary)}.signin-meta{font-size:12px;color:var(--text-muted);margin-top:2px}.signin-time{font-size:11px;color:var(--text-ash);flex-shrink:0;padding-top:2px}.icon-muted{color:var(--text-muted)}.footer-actions{display:flex;align-items:center;justify-content:flex-end;gap:10px;padding-bottom:40px}"}</style>

      {/* ── Avatar ── */}
      <Card>
        <div className="flex items-center gap-5">
          <div className="profile-avatar-wrap">
            <Avatar src={p.photoUrl || undefined} name={p.name || p.email} size={80} />
            <div className="avatar-overlay" onClick={() => document.getElementById("avatar-input")?.click()}>
              <Camera size={20} style={{ color: "#fff" }} />
            </div>
            <input id="avatar-input" type="file" accept="image/*" style={{ display: "none" }} onChange={handleAvatarUpload} />
          </div>
          <div style={{ flex: 1 }}>
            <p className="profile-name">{p.name || "No name set"}</p>
            <p className="profile-email">{p.email}</p>
          </div>
          <Button variant="ghost" onClick={() => document.getElementById("avatar-input")?.click()}>
            <Camera size={13} /> Change photo
          </Button>
        </div>
      </Card>

      {/* ── Personal Info ── */}
      <Card title="Personal Information" subtitle="Name, gender, birthday, and preferences">
        <EditRow label="Name" editing={editField === "name"} onStart={() => setEditField("name")} onCancel={done}>
          {editField === "name" ? (
            <div className="flex gap-2">
              <Input value={p.name || ""} onChange={(v) => update("name", v)} placeholder="Full name" />
              <EditDone onClick={done} />
            </div>
          ) : (p.name || "Not set")}
        </EditRow>

        <EditRow label="Gender" editing={editField === "gender"} onStart={() => setEditField("gender")} onCancel={done}>
          {editField === "gender" ? (
            <div className="flex gap-2 items-center">
              <div style={{ flex: 1 }}><SelectField value={p.gender || ""} onChange={(v) => update("gender", v)} options={GENDER_OPTS} /></div>
              <EditDone onClick={done} />
            </div>
          ) : (p.gender || "Not specified")}
        </EditRow>

        <EditRow label="Birthday" editing={editField === "birthday"} onStart={() => setEditField("birthday")} onCancel={done}>
          {editField === "birthday" ? (
            <div className="flex gap-2 items-center">
              <div style={{ flex: 1 }}>
                <Input type="date" value={p.birthday ? p.birthday.split("T")[0] : ""} onChange={(v) => update("birthday", v || null)} />
              </div>
              <EditDone onClick={done} />
            </div>
          ) : (p.birthday ? formatDate(p.birthday) : "Not set")}
        </EditRow>

        <EditRow label="Language" editing={editField === "language"} onStart={() => setEditField("language")} onCancel={done}>
          {editField === "language" ? (
            <div className="flex gap-2 items-center">
              <div style={{ flex: 1 }}><SelectField value={p.language || ""} onChange={(v) => update("language", v)} options={LANG_OPTS} /></div>
              <EditDone onClick={done} />
            </div>
          ) : (p.language || "Not set")}
        </EditRow>

        <EditRow label="Country" editing={editField === "country"} onStart={() => setEditField("country")} onCancel={done}>
          {editField === "country" ? (
            <div className="flex gap-2 items-center">
              <div style={{ flex: 1 }}><SelectField value={p.country || ""} onChange={(v) => update("country", v)} options={COUNTRY_OPTS} /></div>
              <EditDone onClick={done} />
            </div>
          ) : (p.country || "Not set")}
        </EditRow>

        <EditRow label="Timezone" editing={editField === "timezone"} onStart={() => setEditField("timezone")} onCancel={done}>
          {editField === "timezone" ? (
            <div className="flex gap-2 items-center">
              <div style={{ flex: 1 }}><SelectField value={p.timezone || ""} onChange={(v) => update("timezone", v)} options={TZ_OPTS} /></div>
              <EditDone onClick={done} />
            </div>
          ) : (p.timezone || "Not set")}
        </EditRow>
      </Card>

      {/* ── Contact Info ── */}
      <Card title="Contact Information" subtitle="Email, phone, and social links">
        <StaticRow label="Email">
          <div className="flex items-center gap-2">
            <span className="profile-meta">{p.email}</span>
            {p.emailVerified ? <Badge variant="success">Verified</Badge> : <Badge variant="danger">Unverified</Badge>}
          </div>
        </StaticRow>

        <EditRow label="Secondary Email" editing={editField === "secondaryEmail"} onStart={() => setEditField("secondaryEmail")} onCancel={done}>
          {editField === "secondaryEmail" ? (
            <div className="flex gap-2">
              <Input type="email" value={p.secondaryEmail || ""} onChange={(v) => update("secondaryEmail", v || null)} placeholder="secondary@example.com" />
              <EditDone onClick={done} />
            </div>
          ) : (p.secondaryEmail || "Not set")}
        </EditRow>

        <EditRow label="Phone Number" editing={editField === "phoneNumber"} onStart={() => setEditField("phoneNumber")} onCancel={done}>
          {editField === "phoneNumber" ? (
            <div className="flex gap-2">
              <Input type="tel" value={p.phoneNumber || ""} onChange={(v) => update("phoneNumber", v)} placeholder="+977 98XXXXXXXX" />
              <EditDone onClick={done} />
            </div>
          ) : (p.phoneNumber || "Not set")}
        </EditRow>

        <EditRow label="Website" editing={editField === "website"} onStart={() => setEditField("website")} onCancel={done}>
          {editField === "website" ? (
            <div className="flex gap-2">
              <Input type="url" value={p.website || ""} onChange={(v) => update("website", v)} placeholder="https://yoursite.com" />
              <EditDone onClick={done} />
            </div>
          ) : (p.website || "Not set")}
        </EditRow>

        <EditRow label="LinkedIn" editing={editField === "linkedin"} onStart={() => setEditField("linkedin")} onCancel={done}>
          {editField === "linkedin" ? (
            <div className="flex gap-2">
              <Input value={p.linkedin || ""} onChange={(v) => update("linkedin", v)} placeholder="linkedin.com/in/you" />
              <EditDone onClick={done} />
            </div>
          ) : (p.linkedin || "Not set")}
        </EditRow>

        <EditRow label="GitHub" editing={editField === "github"} onStart={() => setEditField("github")} onCancel={done}>
          {editField === "github" ? (
            <div className="flex gap-2">
              <Input value={p.github || ""} onChange={(v) => update("github", v)} placeholder="github.com/username" />
              <EditDone onClick={done} />
            </div>
          ) : (p.github || "Not set")}
        </EditRow>

        <EditRow label="Twitter / X" editing={editField === "twitter"} onStart={() => setEditField("twitter")} onCancel={done}>
          {editField === "twitter" ? (
            <div className="flex gap-2">
              <Input value={p.twitter || ""} onChange={(v) => update("twitter", v)} placeholder="@username" />
              <EditDone onClick={done} />
            </div>
          ) : (p.twitter || "Not set")}
        </EditRow>
      </Card>

      {/* ── Work & Identity ── */}
      <Card title="Work & Identity" subtitle="Occupation, company, and bio">
        <EditRow label="Occupation" editing={editField === "occupation"} onStart={() => setEditField("occupation")} onCancel={done}>
          {editField === "occupation" ? (
            <div className="flex gap-2">
              <Input value={p.occupation || ""} onChange={(v) => update("occupation", v)} placeholder="Software Engineer" />
              <EditDone onClick={done} />
            </div>
          ) : (p.occupation || "Not set")}
        </EditRow>

        <EditRow label="Company Name" editing={editField === "companyName"} onStart={() => setEditField("companyName")} onCancel={done}>
          {editField === "companyName" ? (
            <div className="flex gap-2">
              <Input value={p.companyName || ""} onChange={(v) => update("companyName", v)} placeholder="Acme Inc." />
              <EditDone onClick={done} />
            </div>
          ) : (p.companyName || "Not set")}
        </EditRow>

        <EditRow label="Company Role" editing={editField === "companyRole"} onStart={() => setEditField("companyRole")} onCancel={done}>
          {editField === "companyRole" ? (
            <div className="flex gap-2">
              <Input value={p.companyRole || ""} onChange={(v) => update("companyRole", v)} placeholder="Engineering Lead" />
              <EditDone onClick={done} />
            </div>
          ) : (p.companyRole || "Not set")}
        </EditRow>

        <EditRow label="Industry" editing={editField === "industry"} onStart={() => setEditField("industry")} onCancel={done}>
          {editField === "industry" ? (
            <div className="flex gap-2 items-center">
              <div style={{ flex: 1 }}><SelectField value={p.industry || ""} onChange={(v) => update("industry", v)} options={INDUSTRY_OPTS} /></div>
              <EditDone onClick={done} />
            </div>
          ) : (p.industry || "Not set")}
        </EditRow>

        <EditRow label="Company Size" editing={editField === "companySize"} onStart={() => setEditField("companySize")} onCancel={done}>
          {editField === "companySize" ? (
            <div className="flex gap-2 items-center">
              <div style={{ flex: 1 }}><SelectField value={p.companySize || ""} onChange={(v) => update("companySize", v)} options={SIZE_OPTS} /></div>
              <EditDone onClick={done} />
            </div>
          ) : (p.companySize ? SIZE_LABELS[p.companySize] || p.companySize : "Not set")}
        </EditRow>

        <EditRow label="Bio" editing={editField === "bio"} onStart={() => setEditField("bio")} onCancel={done}>
          {editField === "bio" ? (
            <div>
              <Textarea value={p.bio || ""} onChange={(v) => update("bio", v)} placeholder="Tell us about yourself..." rows={3} />
              <div style={{ marginTop: 8 }}><EditDone onClick={done} /></div>
            </div>
          ) : (p.bio || "Not set")}
        </EditRow>
      </Card>

      {/* ── Account Info ── */}
      <Card title="Account Information" subtitle="Verification and membership details">
        <StaticRow label="Member since">{formatDate(p.createdAt)}</StaticRow>
        <StaticRow label="Account ID">
          <span style={{ fontFamily: "monospace" }}>{truncUuid(p.id)}</span>
        </StaticRow>
        <StaticRow label="Email verified">
          <Badge variant={p.emailVerified ? "success" : "danger"}>
            {p.emailVerified ? "Verified" : "Unverified"}
          </Badge>
        </StaticRow>
        <StaticRow label="Phone verified">
          <Badge variant={p.phoneVerified ? "success" : "danger"}>
            {p.phoneVerified ? "Verified" : "Unverified"}
          </Badge>
        </StaticRow>
        <StaticRow label="Last updated" border={false}>{formatDateTime(p.updatedAt)}</StaticRow>
      </Card>

      {/* ── Recent Sign-ins ── */}
      {signins.length > 0 && (
        <Card title="Recent Sign-ins">
          {signins.slice(0, 5).map((s, i) => (
            <div key={i} className="table-row" style={{ alignItems: "flex-start" }}>
              <Monitor size={16} className="icon-muted" style={{ marginTop: 2, flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p className="signin-text">New sign-in on {s.device}</p>
                <p className="signin-meta">{s.ip} &middot; {s.location}</p>
              </div>
              <span className="signin-time">{formatDateTime(s.time)}</span>
            </div>
          ))}
        </Card>
      )}

      {/* ── Footer ── */}
      <div className="footer-actions">
        <Button variant="ghost" onClick={reloadProfile}>Cancel</Button>
        <Button variant="primary" onClick={save} disabled={saving}>
          {saving ? "Saving..." : "Save changes"}
        </Button>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
    </PageContainer>
  );
}
