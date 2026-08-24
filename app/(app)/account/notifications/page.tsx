"use client";
import { useEffect, useState, type ReactNode } from "react";
import { api } from "@/lib/api";
import { setDirtyGlobal } from "@/lib/unsaved";
import {
  AlertCircle, Mail, BellRing, MessageSquare, Shield, FileText,
  Rocket, LifeBuoy, Moon, Check,
} from "lucide-react";
import { Skeleton } from "@/components/ui/Skeleton";
import { useI18n } from "@/lib/i18n";

function Toggle({ checked, onChange, disabled }: { checked: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      className={`tb-toggle ${checked ? "checked" : ""}`}
      onClick={() => !disabled && onChange(!checked)}
      aria-pressed={checked}
    >
      <div className="tb-toggle-knob" />
    </button>
  );
}

const CATEGORIES = [
  { key: "security", icon: <Shield size={14} /> },
  { key: "forms", icon: <FileText size={14} /> },
  { key: "product", icon: <Rocket size={14} /> },
  { key: "support", icon: <LifeBuoy size={14} /> },
] as const;

const CHANNELS = ["email", "push", "inApp"] as const;

/** Canonical pref keys — exactly the API/DB column names. */
const PREF_KEYS = [
  "email", "push", "inApp",
  "security", "forms", "product", "support",
  ...CATEGORIES.flatMap((c) => CHANNELS.map((ch) => `${c.key}${ch[0].toUpperCase()}${ch.slice(1)}` as string)),
  "quietHoursEnabled", "quietHoursStart", "quietHoursEnd",
  "digestEnabled", "digestFrequency",
  "tipsEmail", "weeklySummary", "productEmail",
];

function NotifSkeleton() {
  return (
    <div className="page-stack">
      <div><Skeleton width={220} height={24} style={{ marginBottom: 6 }} /><Skeleton width={320} height={14} /></div>
      {[4, 4, 6].map((n, c) => (
        <div key={c} className="dashboard-card">
          <Skeleton width={150} height={18} style={{ marginBottom: 16 }} />
          {Array.from({ length: n }).map((_, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Skeleton width={34} height={34} borderRadius={9} />
                <div><Skeleton width={110} height={13} style={{ marginBottom: 5 }} /><Skeleton width={200} height={10} /></div>
              </div>
              <Skeleton width={36} height={20} borderRadius={10} />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

export default function NotificationsSettingsPage() {
  const { t } = useI18n();
  const [prefs, setPrefs] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  const on = (v: unknown) => v !== false && v !== null && v !== undefined;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        // Single source of truth: notification_preferences table via /api/notifications/prefs.
        const p: any = await api.get("/api/notifications/prefs");
        if (cancelled) return;
        setPrefs({
          email: on(p?.email), push: on(p?.push), inApp: on(p?.inApp),
          security: on(p?.security), forms: on(p?.forms), product: on(p?.product), support: on(p?.support),
          securityEmail: on(p?.securityEmail), securityPush: on(p?.securityPush), securityInApp: on(p?.securityInApp),
          formsEmail: on(p?.formsEmail), formsPush: on(p?.formsPush), formsInApp: on(p?.formsInApp),
          productEmail: on(p?.productEmail), productPush: on(p?.productPush), productInApp: on(p?.productInApp),
          supportEmail: on(p?.supportEmail), supportPush: on(p?.supportPush), supportInApp: on(p?.supportInApp),
          quietHoursEnabled: !!p?.quietHoursEnabled, quietHoursStart: p?.quietHoursStart || "22:00", quietHoursEnd: p?.quietHoursEnd || "07:00",
          digestEnabled: !!p?.digestEnabled, digestFrequency: p?.digestFrequency || "daily",
          tipsEmail: p?.tipsEmail !== false, weeklySummary: !!p?.weeklySummary,
        });
      } catch {
        if (!cancelled) setPrefs(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const setPref = async (key: string, value: any) => {
    const next = { ...prefs, [key]: value };
    setPrefs(next);
    setDirtyGlobal(true);
    setSaving(true); setSaved(false);
    const body: Record<string, any> = {};
    for (const k of PREF_KEYS) body[k] = next[k];
    try {
      await api.put("/api/notifications/prefs", body);
      setSaved(true); setDirtyGlobal(false);
      setTimeout(() => setSaved(false), 2000);
    } catch { /* optimistic UI; row reloads on next visit */ }
    setSaving(false);
  };

  if (loading || !prefs) return <NotifSkeleton />;

  const cap = (s: string) => s[0].toUpperCase() + s.slice(1);
  const matrixKey = (cat: string, ch: string) => cat + cap(ch);

  const catMeta: Record<string, { label: string; desc: string; icon: ReactNode }> = {
    security: { label: t("notif.catSecurity"), desc: t("notif.catSecurityDesc"), icon: <Shield size={14} /> },
    forms: { label: t("notif.catForms"), desc: t("notif.catFormsDesc"), icon: <FileText size={14} /> },
    product: { label: t("notif.catProduct"), desc: t("notif.catProductDesc"), icon: <Rocket size={14} /> },
    support: { label: t("notif.catSupport"), desc: t("notif.catSupportDesc"), icon: <LifeBuoy size={14} /> },
  };
  const chMeta: Record<string, { label: string; desc: string; icon: ReactNode }> = {
    email: { label: t("notif.colEmail"), desc: t("notif.emailDesc"), icon: <Mail size={13} /> },
    push: { label: t("notif.colPush"), desc: t("notif.pushDesc"), icon: <BellRing size={13} /> },
    inApp: { label: t("notif.colInApp"), desc: t("notif.inAppDesc"), icon: <MessageSquare size={13} /> },
  };

  /** Ask browser permission before enabling push anywhere. */
  const pushAllowed = async () => {
    if (typeof Notification === 'undefined') return false;
    if (Notification.permission === 'granted') return true;
    if (Notification.permission === 'default') return (await Notification.requestPermission()) === 'granted';
    return false;
  };

  const flip = async (key: string, enable: boolean, isPush: boolean) => {
    if (enable && isPush && !(await pushAllowed())) return;
    setPref(key, enable);
  };

  return (
    <div className="page-stack">
      <div className="page-header">
        <div className="page-header-row">
          <div className="page-header-left">
            <h1 className="page-header-title">{t("notif.title")}</h1>
            <p className="page-header-description">{t("notif.subtitle")}</p>
          </div>
          <div className="page-header-actions">
            <span className={`pref-save-chip ${saved ? "saved" : ""}`}>
              {saved ? <Check size={12} /> : null}
              {saving ? t("common.saving") : saved ? t("common.saved") : t("common.autoSaved")}
            </span>
          </div>
        </div>
      </div>

      {/* ═══ HOW YOU GET NOTIFIED ═══ */}
      <div className="dashboard-card">
        <h3 className="section-title">{t("notif.channelsTitle")}</h3>
        <div className="card-flush">
          {CHANNELS.map(ch => (
            <div key={ch} className="consent-row">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div className="pref-tile">{chMeta[ch].icon}</div>
                <div><div className="row-title">{chMeta[ch].label}</div><div className="row-desc">{chMeta[ch].desc}</div></div>
              </div>
              <Toggle checked={prefs[ch]} onChange={v => flip(ch, v, ch === 'push')} />
            </div>
          ))}
        </div>
        {typeof Notification !== 'undefined' && Notification.permission === 'denied' && (
          <div style={{ padding: '8px 4px 0', fontSize: 12, color: 'var(--tb-red)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <AlertCircle size={13} /> {t("notif.browserBlocked")}
          </div>
        )}
      </div>

      {/* ═══ WHAT YOU GET NOTIFIED ABOUT ═══ */}
      <div className="dashboard-card">
        <h3 className="section-title">{t("notif.categoriesTitle")}</h3>
        <p className="section-desc">{t("notif.categoriesDesc")}</p>
        <div className="card-flush">
          {CATEGORIES.map(cat => {
            const dim = !prefs[cat.key];
            return (
              <div key={cat.key} className="consent-row cat-row">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div className="pref-tile" style={dim ? { opacity: 0.5 } : undefined}>{catMeta[cat.key].icon}</div>
                  <div>
                    <div className={`row-title ${dim ? "row-off" : ""}`}>{catMeta[cat.key].label}</div>
                    <div className="row-desc" style={{ marginBottom: dim ? 0 : 8 }}>{catMeta[cat.key].desc}</div>
                    {!dim && (
                      <div className="mini-channels">
                        {CHANNELS.map(ch => (
                          <label key={ch} className="mini-channel">
                            <Toggle
                              checked={prefs[matrixKey(cat.key, ch)]}
                              onChange={v => flip(matrixKey(cat.key, ch), v, ch === 'push')}
                            />
                            {chMeta[ch].label}
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <Toggle checked={prefs[cat.key]} onChange={v => setPref(cat.key, v)} />
              </div>
            );
          })}
        </div>
      </div>

      {/* ═══ SCHEDULE & EMAIL SUMMARIES ═══ */}
      <div className="dashboard-card">
        <h3 className="section-title">{t("notif.scheduleTitle")}</h3>
        <div className="card-flush">
          <div className="consent-row">
            <div><div className="row-title">{t("notif.enableQuiet")}</div><div className="row-desc">{t("notif.enableQuietDesc")}</div></div>
            <Toggle checked={prefs.quietHoursEnabled} onChange={v => setPref('quietHoursEnabled', v)} />
          </div>
          {prefs.quietHoursEnabled && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '2px 0 10px' }}>
                <input type="time" className="form-input" value={prefs.quietHoursStart} onChange={e => setPref('quietHoursStart', e.target.value)} style={{ width: 120 }} aria-label={t("notif.timeWindow")} />
                <span style={{ fontSize: 13, color: 'var(--tb-text-muted)' }}>{t("notif.to")}</span>
                <input type="time" className="form-input" value={prefs.quietHoursEnd} onChange={e => setPref('quietHoursEnd', e.target.value)} style={{ width: 120 }} />
              </div>
              {(() => {
                const now = new Date();
                const mins = now.getHours() * 60 + now.getMinutes();
                const [sH, sM] = prefs.quietHoursStart.split(':').map(Number);
                const [eH, eM] = prefs.quietHoursEnd.split(':').map(Number);
                const start = sH * 60 + sM, end = eH * 60 + eM;
                const active = start > end ? mins >= start || mins < end : mins >= start && mins < end;
                return active ? (
                  <div style={{ fontSize: 12, color: 'var(--tb-text-muted)', paddingBottom: 8 }}>
                    <Moon size={12} style={{ verticalAlign: -2, marginRight: 6 }} />{t("notif.quietActive")}
                  </div>
                ) : null;
              })()}
            </>
          )}

          <div className="consent-row" style={{ borderTop: '1px solid var(--tb-border)' }}>
            <div><div className="row-title">{t("notif.enableDigest")}</div><div className="row-desc">{t("notif.enableDigestDesc")}</div></div>
            <Toggle checked={prefs.digestEnabled} onChange={v => setPref('digestEnabled', v)} />
          </div>
          {prefs.digestEnabled && (
            <div className="seg" style={{ margin: '2px 0 12px' }}>
              {(["daily", "weekly", "monthly"] as const).map(f => (
                <button key={f} type="button" className={`seg-btn ${prefs.digestFrequency === f ? "active" : ""}`} onClick={() => setPref('digestFrequency', f)}>
                  {t(`notif.${f}` as any)}
                </button>
              ))}
            </div>
          )}

          <div className="consent-row" style={{ borderTop: '1px solid var(--tb-border)' }}>
            <div><div className="row-title">{t("prefs.productEmails")}</div><div className="row-desc">{t("prefs.productEmailsDesc")}</div></div>
            <Toggle checked={on(prefs.productEmail)} onChange={v => setPref('productEmail', v)} />
          </div>
          <div className="consent-row">
            <div><div className="row-title">{t("prefs.weeklySummary")}</div><div className="row-desc">{t("prefs.weeklySummaryDesc")}</div></div>
            <Toggle checked={on(prefs.weeklySummary)} onChange={v => setPref('weeklySummary', v)} />
          </div>
          <div className="consent-row">
            <div><div className="row-title">{t("prefs.tipsUpdates")}</div><div className="row-desc">{t("prefs.tipsUpdatesDesc")}</div></div>
            <Toggle checked={on(prefs.tipsEmail)} onChange={v => setPref('tipsEmail', v)} />
          </div>
        </div>
      </div>
    </div>
  );
}
