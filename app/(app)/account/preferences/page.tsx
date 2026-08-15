"use client";
import { useEffect, useState } from "react";
import { api, getCurrentUser } from "@/lib/api";
import { useUnsavedGuard, setDirtyGlobal } from "@/lib/unsaved";
import { Skeleton } from "@/components/ui/Skeleton";
import { useI18n } from "@/lib/i18n";
import { SUPPORTED_LANGS } from "@/lib/locales";

function PrefsSkeleton() {
  return (
    <div className="page-stack">
      <div><Skeleton width={180} height={24} style={{ marginBottom: 6 }} /><Skeleton width={280} height={14} /></div>
      <div className="dashboard-card">
        <Skeleton width={100} height={18} style={{ marginBottom: 16 }} />
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: i < 3 ? '1px solid var(--tb-border)' : 'none' }}>
            <div><Skeleton width={100} height={14} style={{ marginBottom: 4 }} /></div>
            <Skeleton width={200} height={36} />
          </div>
        ))}
      </div>
      <div className="dashboard-card">
        <Skeleton width={140} height={18} style={{ marginBottom: 16 }} />
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: i < 2 ? '1px solid var(--tb-border)' : 'none' }}>
            <div><Skeleton width={120} height={14} style={{ marginBottom: 4 }} /><Skeleton width={200} height={10} /></div>
            <Skeleton width={36} height={20} borderRadius={10} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function PreferencesPage() {
  const { t, setLang } = useI18n();
  const [user, setUser] = useState<any>(null);
  const [form, setForm] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useUnsavedGuard();

  useEffect(() => {
    getCurrentUser().then(u => {
      setUser(u);
      setForm({
        language: u.language || "en",
        timezone: u.timezone || "UTC",
        dateFormat: u.dateFormat || "MM/DD/YYYY",
        timeFormat: u.timeFormat || "12h",
      });
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const save = async (key?: string, value?: string) => {
    if (key && value) { setForm(prev => ({ ...prev, [key]: value })); setDirtyGlobal(true); }
    setSaving(true); setSaved(false);
    const data = key ? { [key]: value } : form;
    try { await api.patch("/api/users/me", data); setSaved(true); setDirtyGlobal(false); setTimeout(() => setSaved(false), 2000); } catch {}
    setSaving(false);
  };

  if (loading) return <PrefsSkeleton />;

  return (
    <div className="page-stack">
      <div className="page-header">
        <div className="page-header-row">
          <div className="page-header-left">
            <h1 className="page-header-title">{t("prefs.title")}</h1>
            <p className="page-header-description">{t("prefs.subtitle")}</p>
          </div>
          <div className="page-header-actions">
            <span style={{ fontSize: 12, color: 'var(--tb-text-muted)' }}>{saving ? t("common.saving") : saved ? t("common.saved") : t("common.autoSaved")}</span>
          </div>
        </div>
      </div>

      {/* General */}
      <div className="dashboard-card">
        <h3 className="section-title">{t("prefs.general")}</h3>
        <div className="field-row">
          <label className="field-label">{t("prefs.language")}</label>
          <div className="field-control">
            <select className="form-input" value={form.language || "en"} onChange={e => { setLang(e.target.value); save("language", e.target.value); }} style={{ maxWidth: 280 }}>
              {SUPPORTED_LANGS.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
            </select>
          </div>
        </div>
        <div className="field-row">
          <label className="field-label">{t("prefs.timezone")}</label>
          <div className="field-control">
            <select className="form-input" value={form.timezone || "UTC"} onChange={e => save("timezone", e.target.value)} style={{ maxWidth: 280 }}>
              <option value="UTC">{t("prefs.timezoneUTC")}</option>
              <option value="Asia/Kathmandu">{t("prefs.kathmandu")}</option>
              <option value="America/New_York">{t("prefs.eastern")}</option>
              <option value="America/Chicago">{t("prefs.central")}</option>
              <option value="America/Denver">{t("prefs.mountain")}</option>
              <option value="America/Los_Angeles">{t("prefs.pacific")}</option>
              <option value="Europe/London">{t("prefs.london")}</option>
              <option value="Europe/Berlin">{t("prefs.berlin")}</option>
              <option value="Asia/Tokyo">{t("prefs.tokyo")}</option>
              <option value="Asia/Shanghai">{t("prefs.shanghai")}</option>
              <option value="Asia/Kolkata">{t("prefs.kolkata")}</option>
            </select>
          </div>
        </div>
        <div className="field-row">
          <label className="field-label">{t("prefs.dateFormat")}</label>
          <div className="field-control">
            <select className="form-input" value={form.dateFormat || "MM/DD/YYYY"} onChange={e => save("dateFormat", e.target.value)} style={{ maxWidth: 280 }}>
              <option value="MM/DD/YYYY">MM/DD/YYYY</option><option value="DD/MM/YYYY">DD/MM/YYYY</option><option value="YYYY-MM-DD">YYYY-MM-DD</option>
            </select>
          </div>
        </div>
        <div className="field-row">
          <label className="field-label">{t("prefs.timeFormat")}</label>
          <div className="field-control">
            <select className="form-input" value={form.timeFormat || "12h"} onChange={e => save("timeFormat", e.target.value)} style={{ maxWidth: 280 }}>
              <option value="12h">{t("prefs.h12")}</option><option value="24h">{t("prefs.h24")}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Email preferences */}
      <div className="dashboard-card">
        <h3 className="section-title">{t("prefs.emailTitle")}</h3>
        <p className="section-desc">{t("prefs.emailDesc")}</p>
        {[
          { key: "productEmails", label: t("prefs.productEmails"), desc: t("prefs.productEmailsDesc") },
          { key: "weeklySummary", label: t("prefs.weeklySummary"), desc: t("prefs.weeklySummaryDesc") },
          { key: "tipsAndUpdates", label: t("prefs.tipsUpdates"), desc: t("prefs.tipsUpdatesDesc") },
        ].map(item => (
          <div key={item.key} className="consent-row">
            <div><div className="row-title">{item.label}</div><div className="row-desc">{item.desc}</div></div>
            <button className={`tb-toggle ${(user.preferences as any)?.[item.key] !== false ? "checked" : ""}`} onClick={async () => {
              const current = (user.preferences as any)?.[item.key] !== false;
              const next = { ...((user.preferences as any) || {}), [item.key]: !current };
              setUser((prev: any) => ({ ...prev, preferences: next }));
              try { await api.patch("/api/users/me", { preferences: next }); } catch {}
            }}><div className="tb-toggle-knob" /></button>
          </div>
        ))}
      </div>
    </div>
  );
}
