"use client";
import { useEffect, useState } from "react";
import { api, getCurrentUser } from "@/lib/api";
import { setDirtyGlobal } from "@/lib/unsaved";
import { AlertCircle, Bell, Mail, BellRing, MessageSquare, Shield, FileText, Rocket, LifeBuoy, Moon } from "lucide-react";
import { Skeleton } from "@/components/ui/Skeleton";
import { useI18n, type I18nT } from "@/lib/i18n";

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return <button type="button" className={`tb-toggle ${checked ? "checked" : ""}`} onClick={() => onChange(!checked)}><div className="tb-toggle-knob" /></button>;
}

function getCategories(t: I18nT) {
  return [
    { key: "security", label: t("notif.catSecurity"), desc: t("notif.catSecurityDesc"), icon: <Shield size={15} /> },
    { key: "forms", label: t("notif.catForms"), desc: t("notif.catFormsDesc"), icon: <FileText size={15} /> },
    { key: "product", label: t("notif.catProduct"), desc: t("notif.catProductDesc"), icon: <Rocket size={15} /> },
    { key: "support", label: t("notif.catSupport"), desc: t("notif.catSupportDesc"), icon: <LifeBuoy size={15} /> },
  ];
}

function getChannels(t: I18nT) {
  return [
    { key: "email", label: t("notif.email"), desc: t("notif.emailDesc"), icon: <Mail size={15} /> },
    { key: "push", label: t("notif.push"), desc: t("notif.pushDesc"), icon: <BellRing size={15} /> },
    { key: "inApp", label: t("notif.inApp"), desc: t("notif.inAppDesc"), icon: <MessageSquare size={15} /> },
  ];
}

function NotifSkeleton() {
  return (
    <div className="page-stack">
      <div><Skeleton width={220} height={24} style={{ marginBottom: 6 }} /><Skeleton width={320} height={14} /></div>
      <div className="dashboard-card">
        <Skeleton width={200} height={18} style={{ marginBottom: 16 }} />
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: i < 2 ? '1px solid var(--tb-border)' : 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><Skeleton width={15} height={15} borderRadius={4} /><div><Skeleton width={100} height={14} style={{ marginBottom: 4 }} /><Skeleton width={200} height={10} /></div></div>
            <Skeleton width={36} height={20} borderRadius={10} />
          </div>
        ))}
      </div>
      <div className="dashboard-card">
        <Skeleton width={120} height={18} style={{ marginBottom: 16 }} />
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: i < 3 ? '1px solid var(--tb-border)' : 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><Skeleton width={15} height={15} borderRadius={4} /><div><Skeleton width={80} height={14} style={{ marginBottom: 4 }} /><Skeleton width={180} height={10} /></div></div>
            <Skeleton width={36} height={20} borderRadius={10} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function NotificationsSettingsPage() {
  const { t } = useI18n();
  const [prefs, setPrefs] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCurrentUser()
      .then(u => {
        const n = u.preferences?.notifications || {};
        setPrefs({
          emailEnabled: n.emailEnabled !== false, pushEnabled: n.pushEnabled !== false, inAppEnabled: n.inAppEnabled !== false,
          securityEmail: n.securityEmail !== false, securityPush: n.securityPush !== false, securityInApp: n.securityInApp !== false,
          formsEmail: n.formsEmail !== false, formsPush: n.formsPush !== false, formsInApp: n.formsInApp !== false,
          productEmail: n.productEmail !== false, productPush: n.productPush !== false, productInApp: n.productInApp !== false,
          supportEmail: n.supportEmail !== false, supportPush: n.supportPush !== false, supportInApp: n.supportInApp !== false,
          quietHoursEnabled: n.quietHoursEnabled || false, quietHoursStart: n.quietHoursStart || "22:00", quietHoursEnd: n.quietHoursEnd || "07:00",
          digestEnabled: n.digestEnabled || false, digestFrequency: n.digestFrequency || "daily",
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const setPref = async (key: string, value: any) => {
    const next = { ...prefs, [key]: value };
    setPrefs(next);
    setDirtyGlobal(true);
    setSaving(true); setSaved(false);
    try { await api.patch("/api/users/me", { preferences: { notifications: next } }); setSaved(true); setDirtyGlobal(false); setTimeout(() => setSaved(false), 2000); } catch {}
    setSaving(false);
  };

  if (loading) return <NotifSkeleton />;

  const CATEGORIES = getCategories(t);
  const CHANNELS = getChannels(t);

  return (
    <div className="page-stack">
      <div className="page-header">
        <div className="page-header-row">
          <div className="page-header-left">
            <h1 className="page-header-title">{t("notif.title")}</h1>
            <p className="page-header-description">{t("notif.subtitle")}</p>
          </div>
          <div className="page-header-actions">
            <span style={{ fontSize: 12, color: 'var(--tb-text-muted)' }}>{saving ? t("common.saving") : saved ? t("common.saved") : t("common.autoSaved")}</span>
          </div>
        </div>
      </div>

      <div className="dashboard-card">
        <h3 className="section-title"><Bell size={16} style={{ display: 'inline', marginRight: 8 }} />{t("notif.channelsTitle")}</h3>
        <p className="section-desc">{t("notif.channelsDesc")}</p>
        {CHANNELS.map(ch => (
          <div key={ch.key} className="consent-row">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><div style={{ color: 'var(--tb-text-muted)' }}>{ch.icon}</div><div><div className="row-title">{ch.label}</div><div className="row-desc">{ch.desc}</div></div></div>
            <Toggle
              checked={prefs[ch.key + 'Enabled'] ?? true}
              onChange={async (v) => {
                // For push: request browser notification permission when enabling
                if (ch.key === 'push' && v && typeof Notification !== 'undefined') {
                  if (Notification.permission === 'default') {
                    const perm = await Notification.requestPermission();
                    if (perm !== 'granted') return; // Don't enable if user denied
                  } else if (Notification.permission === 'denied') {
                    return; // Can't enable if browser blocked notifications
                  }
                }
                setPref(ch.key + 'Enabled', v);
              }}
            />
          </div>
        ))}
        {typeof Notification !== 'undefined' && Notification.permission === 'denied' && (
          <div style={{ padding: '8px 16px', fontSize: 12, color: 'var(--tb-red, #ef4444)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <AlertCircle size={13} /> {t("notif.browserBlocked")}
          </div>
        )}
      </div>

      <div className="dashboard-card">
        <h3 className="section-title">{t("notif.categoriesTitle")}</h3>
        <p className="section-desc">{t("notif.categoriesDesc")}</p>
        {CATEGORIES.map(cat => (
          <div key={cat.key} className="consent-row">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><div style={{ color: 'var(--tb-text-muted)' }}>{cat.icon}</div><div><div className="row-title">{cat.label}</div><div className="row-desc">{cat.desc}</div></div></div>
            <Toggle checked={prefs[cat.key + 'Email'] !== false || prefs[cat.key + 'Push'] !== false || prefs[cat.key + 'InApp'] !== false} onChange={v => { setPref(cat.key + 'Email', v); setPref(cat.key + 'Push', v); setPref(cat.key + 'InApp', v); }} />
          </div>
        ))}
      </div>

      <div className="dashboard-card">
        <h3 className="section-title">{t("notif.perCategory")}</h3>
        <p className="section-desc">{t("notif.perCategoryDesc")}</p>
        {/* Header row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 90px 90px 90px', gap: 0, padding: '10px 0', borderBottom: '1px solid var(--tb-border)', marginBottom: 4 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--tb-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t("notif.colCategory")}</div>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--tb-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'center' }}>{t("notif.colEmail")}</div>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--tb-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'center' }}>{t("notif.colPush")}</div>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--tb-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'center' }}>{t("notif.colInApp")}</div>
        </div>
        {CATEGORIES.map((cat, idx) => (
          <div key={cat.key} style={{ display: 'grid', gridTemplateColumns: '1fr 90px 90px 90px', gap: 0, padding: '14px 0', borderBottom: idx < CATEGORIES.length - 1 ? '1px solid var(--tb-border)' : 'none', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ color: 'var(--tb-text-muted)' }}>{cat.icon}</span>
              <div>
                <div style={{ fontWeight: 500, color: 'var(--tb-text-primary)', fontSize: 14 }}>{cat.label}</div>
                <div style={{ fontSize: 12, color: 'var(--tb-text-muted)', marginTop: 1 }}>{cat.desc}</div>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center' }}><Toggle checked={prefs[cat.key + 'Email'] !== false} onChange={v => setPref(cat.key + 'Email', v)} /></div>
            <div style={{ display: 'flex', justifyContent: 'center' }}><Toggle checked={prefs[cat.key + 'Push'] !== false} onChange={v => setPref(cat.key + 'Push', v)} /></div>
            <div style={{ display: 'flex', justifyContent: 'center' }}><Toggle checked={prefs[cat.key + 'InApp'] !== false} onChange={v => setPref(cat.key + 'InApp', v)} /></div>
          </div>
        ))}
      </div>

      <div className="dashboard-card">
        <h3 className="section-title"><Moon size={16} style={{ display: 'inline', marginRight: 8 }} />{t("notif.quietTitle")}</h3>
        <p className="section-desc">{t("notif.quietDesc")}</p>
        <div className="consent-row">
          <div><div className="row-title">{t("notif.enableQuiet")}</div><div className="row-desc">{t("notif.enableQuietDesc")}</div></div>
          <Toggle checked={!!prefs.quietHoursEnabled} onChange={v => setPref('quietHoursEnabled', v)} />
        </div>
        {prefs.quietHoursEnabled && (
          <>
            <div className="consent-row">
              <div><div className="row-title">{t("notif.timeWindow")}</div><div className="row-desc">{t("notif.timeWindowDesc")}</div></div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input type="time" className="form-input" value={prefs.quietHoursStart || "22:00"} onChange={e => setPref('quietHoursStart', e.target.value)} style={{ width: 130 }} />
                <span style={{ fontSize: 13, color: 'var(--tb-text-muted)' }}>{t("notif.to")}</span>
                <input type="time" className="form-input" value={prefs.quietHoursEnd || "07:00"} onChange={e => setPref('quietHoursEnd', e.target.value)} style={{ width: 130 }} />
              </div>
            </div>
            {(() => {
              const now = new Date();
              const mins = now.getHours() * 60 + now.getMinutes();
              const [sH, sM] = (prefs.quietHoursStart || '22:00').split(':').map(Number);
              const [eH, eM] = (prefs.quietHoursEnd || '07:00').split(':').map(Number);
              const start = sH * 60 + sM;
              const end = eH * 60 + eM;
              const active = start > end ? mins >= start || mins < end : mins >= start && mins < end;
              return active ? (
                <div style={{ padding: '6px 16px', fontSize: 12, color: 'var(--tb-text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Moon size={13} /> {t("notif.quietActive")}
                </div>
              ) : null;
            })()}
          </>
        )}
      </div>

      <div className="dashboard-card">
        <h3 className="section-title"><Mail size={16} style={{ display: 'inline', marginRight: 8 }} />{t("notif.digestTitle")}</h3>
        <p className="section-desc">{t("notif.digestDesc")}</p>
        <div className="consent-row">
          <div><div className="row-title">{t("notif.enableDigest")}</div><div className="row-desc">{t("notif.enableDigestDesc")}</div></div>
          <Toggle checked={!!prefs.digestEnabled} onChange={v => setPref('digestEnabled', v)} />
        </div>
        {prefs.digestEnabled && (
          <div className="consent-row">
            <div><div className="row-title">{t("notif.frequency")}</div><div className="row-desc">{t("notif.frequencyDesc")}</div></div>
            <select className="form-input" value={prefs.digestFrequency || "daily"} onChange={e => setPref('digestFrequency', e.target.value)} style={{ width: 160 }}>
              <option value="daily">{t("notif.daily")}</option><option value="weekly">{t("notif.weekly")}</option><option value="monthly">{t("notif.monthly")}</option>
            </select>
          </div>
        )}
      </div>

      {/* Email preferences */}
      <div className="dashboard-card">
        <h3 className="section-title"><Mail size={16} style={{ display: 'inline', marginRight: 8 }} />{t("prefs.emailTitle")}</h3>
        <p className="section-desc">{t("prefs.emailDesc")}</p>
        <div className="card-flush">
          <div className="consent-row">
            <div><div className="row-title">{t("prefs.productEmails")}</div><div className="row-desc">{t("prefs.productEmailsDesc")}</div></div>
            <Toggle checked={!!prefs.productEmail} onChange={v => setPref('productEmail', v)} />
          </div>
          <div className="consent-row">
            <div><div className="row-title">{t("prefs.tipsUpdates")}</div><div className="row-desc">{t("prefs.tipsUpdatesDesc")}</div></div>
            <Toggle checked={!!prefs.tipsEmail} onChange={v => setPref('tipsEmail', v)} />
          </div>
        </div>
      </div>
    </div>
  );
}
