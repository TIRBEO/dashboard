"use client";
import { useEffect, useState, useCallback, type ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import { subscribeToPush } from "@/lib/push-client";
import { setDirtyGlobal } from "@/lib/unsaved";
import {
  AlertCircle, Mail, BellRing, FileText,
  Rocket, LifeBuoy, Check,
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
  { key: "forms", icon: <FileText size={14} /> },
  { key: "product", icon: <Rocket size={14} /> },
  { key: "support", icon: <LifeBuoy size={14} /> },
] as const;

const CHANNELS = ["email", "push"] as const;

const PREF_KEYS = [
  "email", "push",
  "forms", "product", "support",
  "formsEmail", "formsPush",
  "productEmail", "productPush",
  "supportEmail", "supportPush",
  "digestEnabled", "digestFrequency",
];

function NotifSkeleton() {
  return (
    <div className="page-stack">
      <div><Skeleton width={220} height={24} style={{ marginBottom: 6 }} /><Skeleton width={320} height={14} /></div>
      {[2, 3, 2].map((n, c) => (
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
  const searchParams = useSearchParams();
  const unsubCategory = searchParams.get("unsubscribed");
  const [showBanner, setShowBanner] = useState(!!unsubCategory);
  const [prefs, setPrefs] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!showBanner) return;
    const timer = setTimeout(() => setShowBanner(false), 6000);
    return () => clearTimeout(timer);
  }, [showBanner]);

  const on = (v: unknown) => v !== false && v !== null && v !== undefined;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const p: any = await api.get("/api/notifications/prefs");
        if (cancelled) return;
        setPrefs({
          email: on(p?.email), push: on(p?.push),
          forms: on(p?.forms), product: on(p?.product), support: on(p?.support),
          formsEmail: on(p?.formsEmail), formsPush: on(p?.formsPush),
          productEmail: on(p?.productEmail), productPush: on(p?.productPush),
          supportEmail: on(p?.supportEmail), supportPush: on(p?.supportPush),
          digestEnabled: !!p?.digestEnabled, digestFrequency: p?.digestFrequency || "daily",
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
    } catch { /* optimistic UI */ }
    setSaving(false);
  };

  if (loading || !prefs) return <NotifSkeleton />;

  const catMeta: Record<string, { label: string; desc: string; icon: ReactNode }> = {
    forms: { label: t("notif.catForms"), desc: t("notif.catFormsDesc"), icon: <FileText size={14} /> },
    product: { label: t("notif.catProduct"), desc: t("notif.catProductDesc"), icon: <Rocket size={14} /> },
    support: { label: t("notif.catSupport"), desc: t("notif.catSupportDesc"), icon: <LifeBuoy size={14} /> },
  };
  const chMeta: Record<string, { label: string; desc: string; icon: ReactNode }> = {
    email: { label: t("notif.colEmail"), desc: t("notif.emailDesc"), icon: <Mail size={13} /> },
    push: { label: t("notif.colPush"), desc: t("notif.pushDesc"), icon: <BellRing size={13} /> },
  };

  const pushAllowed = async () => {
    if (typeof Notification === 'undefined') return false;
    if (Notification.permission === 'granted') return true;
    if (Notification.permission === 'default') return (await Notification.requestPermission()) === 'granted';
    return false;
  };

  const flip = async (key: string, enable: boolean, isPush: boolean) => {
    if (enable && isPush) {
      if (!(await pushAllowed())) return;
      const ok = await subscribeToPush();
      if (!ok) { setPref(key, false); return; }
    }
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

      {showBanner && (
        <div style={{
          background: "var(--tb-surface-2)", border: "1px solid var(--tb-border)", borderRadius: 10,
          padding: "14px 18px", display: "flex", alignItems: "center", gap: 10,
        }}>
          <Mail size={16} style={{ color: "var(--tb-accent, #2563eb)", flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, fontSize: 14, color: "var(--tb-text-primary)" }}>
              {unsubCategory === "all"
                ? "You have been unsubscribed from all emails"
                : `You have been unsubscribed from ${unsubCategory} emails`}
            </div>
            <div style={{ fontSize: 13, color: "var(--tb-text-muted)", marginTop: 2 }}>
              Essential security emails (password resets, OTPs) will still be sent.
            </div>
          </div>
          <button type="button" onClick={() => flip('email', true, false)}
            style={{ background: "var(--tb-accent, #2563eb)", color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0 }}>
            Re-enable email
          </button>
          <button type="button" onClick={() => setShowBanner(false)}
            style={{ background: "none", border: "none", cursor: "pointer", color: "var(--tb-text-muted)", padding: 4 }}
            aria-label="Dismiss">
            <AlertCircle size={16} />
          </button>
        </div>
      )}

      {!showBanner && !prefs.email && (
        <div style={{
          background: '#fef3c7', border: '1px solid #fcd34d', borderRadius: 10,
          padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <AlertCircle size={16} style={{ color: '#d97706', flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, fontSize: 14, color: '#92400e' }}>
              Email notifications are disabled
            </div>
            <div style={{ fontSize: 13, color: '#a16207', marginTop: 2 }}>
              You won't receive any emails except security alerts (OTPs, password resets, login alerts).
            </div>
          </div>
          <button type="button" onClick={() => flip('email', true, false)}
            style={{ background: '#d97706', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0 }}>
            Re-enable email
          </button>
        </div>
      )}

      {/* ═══ CHANNELS ═══ */}
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

      {/* ═══ CATEGORIES ═══ */}
      <div className="dashboard-card">
        <h3 className="section-title">{t("notif.categoriesTitle")}</h3>
        <p className="section-desc">{t("notif.categoriesDesc")}</p>
        <div className="card-flush">
          {CATEGORIES.map(cat => (
            <div key={cat.key} className="consent-row">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div className="pref-tile" style={!prefs[cat.key] ? { opacity: 0.5 } : undefined}>{catMeta[cat.key].icon}</div>
                <div>
                  <div className={`row-title ${!prefs[cat.key] ? "row-off" : ""}`}>{catMeta[cat.key].label}</div>
                  <div className="row-desc">{catMeta[cat.key].desc}</div>
                </div>
              </div>
              <Toggle checked={prefs[cat.key]} onChange={v => setPref(cat.key, v)} />
            </div>
          ))}
        </div>
      </div>

      {/* ═══ EMAIL SUMMARIES ═══ */}
      <div className="dashboard-card">
        <h3 className="section-title">{t("notif.scheduleTitle")}</h3>
        <div className="card-flush">
          <div className="consent-row">
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
        </div>
      </div>
    </div>
  );
}
