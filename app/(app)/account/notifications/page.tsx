"use client";
import { useEffect, useState, ReactNode, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import { setDirtyGlobal } from "@/lib/unsaved";
import { toast } from "sonner";
import {
  AlertCircle,
  Mail,
  BellRing,
  FileText,
  X,
  Rocket,
  LifeBuoy,
  Check,
  Settings,
  Clock,
  Inbox,
  Lightbulb,
} from "lucide-react";
import { Skeleton } from "@/components/ui/Skeleton";
import { useI18n } from "@/lib/i18n";

export default function NotificationsSettingsPage() {
  return (
    <Suspense fallback={<NotifSkeleton />}>
      <NotificationsSettingsInner />
    </Suspense>
  );
}

function Toggle({ checked, onChange, disabled }: { checked: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      disabled={disabled}
      aria-pressed={checked}
      onClick={() => !disabled && onChange(!checked)}
      className={`relative w-9 h-[22px] rounded-full flex-shrink-0 transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed border border-tb-border ${checked ? "bg-tb-brand" : "bg-tb-surface-3"}`}
    >
      <span
        className={`absolute top-[2px] w-[16px] h-[16px] rounded-full transition-all duration-150 shadow-[0_1px_2px_rgba(0,0,0,0.2)] ${checked ? "left-[17px]" : "left-[2px]"} ${checked ? "bg-tb-brand-text" : "bg-tb-text-muted"}`}
      />
    </button>
  );
}

type CatKey = "forms" | "product" | "support";
const CATS: Array<{ key: CatKey; label: string; desc: string; icon: ReactNode }> = [
  { key: "forms", label: "Forms", desc: "Form submissions and responses.", icon: <FileText size={15} /> },
  { key: "product", label: "Product", desc: "Product updates and announcements.", icon: <Rocket size={15} /> },
  { key: "support", label: "Support", desc: "Replies to your tickets and support updates.", icon: <LifeBuoy size={15} /> },
];

function NotifSkeleton() {
  return (
    <div className="flex flex-col gap-6 max-w-[1200px] mx-auto">
      <div>
        <Skeleton width={220} height={26} className="mb-2" />
        <Skeleton width={320} height={14} />
      </div>
      {/* Channels */}
      <div className="rounded-2xl border border-tb-border bg-tb-surface-1 overflow-hidden">
        <div className="px-5 py-4 border-b border-tb-border flex items-center justify-between">
          <Skeleton width={100} height={18} />
          <Skeleton width={60} height={20} borderRadius={999} />
        </div>
        <div className="flex items-center gap-3 px-5 py-4">
          <Skeleton width={34} height={34} borderRadius={10} />
          <div className="flex-1"><Skeleton width={80} height={14} className="mb-1.5" /><Skeleton width={200} height={11} /></div>
          <Skeleton width={36} height={20} borderRadius={999} />
        </div>
      </div>
      {/* Categories */}
      <div className="rounded-2xl border border-tb-border bg-tb-surface-1 overflow-hidden">
        <div className="px-5 py-4 border-b border-tb-border">
          <Skeleton width={120} height={18} className="mb-1.5" />
          <Skeleton width={260} height={11} />
        </div>
        {[1, 2, 3].map((i) => (
          <div key={i} className={`flex items-center gap-3 px-5 py-4 ${i < 3 ? "border-t border-tb-border" : ""}`}>
            <Skeleton width={34} height={34} borderRadius={10} />
            <div className="flex-1"><Skeleton width={80} height={14} className="mb-1.5" /><Skeleton width={200} height={11} /></div>
            <Skeleton width={36} height={20} borderRadius={999} />
          </div>
        ))}
      </div>
      {/* Tips */}
      <div className="rounded-2xl border border-tb-border bg-tb-surface-1 overflow-hidden">
        <div className="px-5 py-4 border-b border-tb-border"><Skeleton width={130} height={18} /></div>
        <div className="px-5 py-4 flex items-center gap-3">
          <div className="flex-1"><Skeleton width={100} height={14} className="mb-1.5" /><Skeleton width={280} height={11} /></div>
          <Skeleton width={36} height={20} borderRadius={999} />
        </div>
      </div>
      {/* Digest */}
      <div className="rounded-2xl border border-tb-border bg-tb-surface-1 overflow-hidden">
        <div className="px-5 py-4 border-b border-tb-border"><Skeleton width={200} height={18} /></div>
        <div className="px-5 py-4 flex items-center gap-3">
          <div className="flex-1"><Skeleton width={110} height={14} className="mb-1.5" /><Skeleton width={320} height={11} /></div>
          <Skeleton width={36} height={20} borderRadius={999} />
        </div>
      </div>
    </div>
  );
}

function savingBadgeCls(saving: boolean, saved: boolean) {
  return `inline-flex items-center gap-1.5 text-[13px] font-medium px-2.5 py-1 rounded-full border border-tb-border ${saved ? "bg-tb-green-soft text-tb-green" : "bg-tb-surface-2 text-tb-text-muted"}`;
}

function NotificationsSettingsInner() {
  const { t } = useI18n();
  const searchParams = useSearchParams();
  const unsub = searchParams.get("unsubscribed");
  const [showBanner, setShowBanner] = useState(!!unsub);
  const [prefs, setPrefs] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [chSaving, setChSaving] = useState(false);
  const [chSaved, setChSaved] = useState(false);
  const [catSaving, setCatSaving] = useState(false);
  const [catSaved, setCatSaved] = useState(false);
  const [dgSaving, setDgSaving] = useState(false);
  const [dgSaved, setDgSaved] = useState(false);
  const [tipsSaving, setTipsSaving] = useState(false);
  const [tipsSaved, setTipsSaved] = useState(false);

  const on = (v: unknown) => v !== false && v !== null && v !== undefined;

  useEffect(() => { if (!showBanner) return; const id=setTimeout(()=>setShowBanner(false),6000); return()=>clearTimeout(id); }, [showBanner]);

  useEffect(() => {
    let cancelled=false;
    (async()=>{
      try{
        const p:any = await api.get("/api/notifications/prefs");
        if(cancelled) return;
        setPrefs({
          email:on(p?.email),
          forms:on(p?.forms), product:on(p?.product), support:on(p?.support),
          tips: p?.tips === undefined ? true : on(p?.tips),
          tipsEmail: p?.tipsEmail === undefined ? true : on(p?.tipsEmail),
          digestEnabled:!!p?.digestEnabled, digestFrequency:p?.digestFrequency||"daily",
        });
      } catch { if(!cancelled) setPrefs(null); }
      finally{ if(!cancelled) setLoading(false); }
    })();
    return()=>{ cancelled=true; };
  }, []);

  const flash = (setSaved: (v:boolean)=>void) => { setSaved(true); setTimeout(()=>setSaved(false),1800); };

  const saveChannels = async (patch: Record<string,any>) => {
    const next={...prefs, ...patch};
    setPrefs(next); setDirtyGlobal(true); setChSaving(true);
    try{
      await api.put("/api/notifications/prefs", patch);
      setDirtyGlobal(false); flash(setChSaved); toast.success("Channels saved");
    } catch(e:any){ setPrefs(prefs); toast.error(e?.message||"Failed to save"); }
    setChSaving(false);
  };
  const saveCategories = async (patch: Record<string,any>) => {
    const next={...prefs, ...patch};
    setPrefs(next); setDirtyGlobal(true); setCatSaving(true);
    try{
      await api.put("/api/notifications/prefs", patch);
      setDirtyGlobal(false); flash(setCatSaved);
    } catch(e:any){ setPrefs(prefs); toast.error(e?.message||"Failed to save"); }
    setCatSaving(false);
  };
  const saveDigest = async (patch: Record<string,any>) => {
    const next={...prefs, ...patch};
    setPrefs(next); setDirtyGlobal(true); setDgSaving(true);
    try{
      await api.put("/api/notifications/prefs", patch);
      setDirtyGlobal(false); flash(setDgSaved); toast.success("Digest saved");
    } catch(e:any){ setPrefs(prefs); toast.error(e?.message||"Failed"); }
    setDgSaving(false);
  };
  const saveTips = async (patch: Record<string,any>) => {
    const next={...prefs, ...patch};
    setPrefs(next); setDirtyGlobal(true); setTipsSaving(true);
    try{
      await api.put("/api/notifications/prefs", patch);
      await api.put("/api/notifications/prefs/tips", patch).catch(()=>{});
      setDirtyGlobal(false); flash(setTipsSaved); toast.success(patch.tips===false ? "Tips disabled" : "Tips updated");
    } catch(e:any){ setPrefs(prefs); toast.error(e?.message||"Failed"); }
    setTipsSaving(false);
  };

  if (loading || !prefs) return <NotifSkeleton />;

  return (
    <div className="flex flex-col gap-6 max-w-[1200px] mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="min-w-0">
          <h1 className="page-header-title flex items-center gap-2.5">
            <BellRing size={22} className="text-tb-text-muted" /> {t("notif.subtitle")}
          </h1>
          <p className="page-header-description">{t("notif.autoSaved")}</p>
        </div>
        <span className={savingBadgeCls(chSaving||catSaving||dgSaving||tipsSaving, chSaved||catSaved||dgSaved||tipsSaved)}>
          {(chSaving||catSaving||dgSaving||tipsSaving) ? t("notif.saving") : t("notif.autoSaved")}
          {(chSaved||catSaved||dgSaved||tipsSaved) && <Check size={11} className="text-tb-green" />}
        </span>
      </div>

      {showBanner && (
        <div className="flex items-center gap-3 rounded-xl px-4 py-3 bg-tb-surface-2 border border-tb-border">
          <Mail size={15} className="text-tb-blue" />
          <div className="flex-1 min-w-0">
            <div className="text-[15px] font-semibold text-tb-text-primary">{unsub==="all"?t("notif.unsubscribedAll"):`Unsubscribed from ${unsub} emails`}</div>
            <div className="text-[14px] mt-0.5 text-tb-text-secondary">Security emails are always sent.</div>
          </div>
          <button onClick={()=>saveChannels({email:true})} className="px-3 h-8 rounded-lg text-[15px] font-semibold btn-secondary">{t("notif.reEnable")}</button>
          <button onClick={()=>setShowBanner(false)} className="p-1 text-tb-text-muted"><X size={14} /></button>
        </div>
      )}
      {!showBanner && !prefs.email && (
        <div className="flex items-center gap-3 rounded-xl px-4 py-3 bg-tb-yellow-soft border border-[rgba(214,169,74,0.18)]">
          <AlertCircle size={15} className="text-tb-yellow" />
          <div className="flex-1"><div className="text-[15px] font-semibold text-tb-yellow">{t("notif.emailDisabledTitle")}</div><div className="text-[14px] mt-0.5 text-tb-text-secondary">{t("notif.emailDisabledDesc")}</div></div>
          <button onClick={()=>saveChannels({email:true})} className="px-3 h-8 rounded-lg text-[15px] font-semibold bg-tb-yellow text-tb-bg">{t("notif.reEnableEmail")}</button>
        </div>
      )}

      {/* Channels */}
      <div className="rounded-xl overflow-hidden bg-tb-surface-1 border border-tb-border">
        <div className="px-5 py-4 flex items-center justify-between border-b border-tb-border">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-tb-surface-2 text-tb-text-secondary border border-tb-border"><Settings size={13} /></div>
            <h3 className="text-[16px] font-semibold text-tb-text-primary">{t("notif.channelsTitle")}</h3>
          </div>
          <span className={`text-[13px] px-2 py-0.5 rounded-full ${savingBadgeCls(chSaving, chSaved)}`}>{chSaving?t("notif.saving"):chSaved?t("notif.saved"):t("notif.autoSaved")}</span>
        </div>
        <div className="flex items-center justify-between gap-4 px-5 py-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-tb-surface-2 text-tb-text-secondary border border-tb-border"><Mail size={14} /></div>
            <div><div className="text-[15px] font-medium text-tb-text-primary">Email</div><div className="text-[14px] mt-0.5 text-tb-text-muted">Get notifications in your inbox.</div></div>
          </div>
          <Toggle checked={!!prefs.email} onChange={(v)=>saveChannels({email:v})} />
        </div>
      </div>

      {/* Categories */}
      <div className="rounded-xl overflow-hidden bg-tb-surface-1 border border-tb-border">
        <div className="px-5 py-4 flex items-center justify-between border-b border-tb-border">
          <div>
            <h3 className="text-[16px] font-semibold flex items-center gap-2 text-tb-text-primary"><Inbox size={14} className="text-tb-text-muted" /> {t("notif.categoriesTitle")}</h3>
            <p className="text-[15px] mt-1 text-tb-text-muted">{t("notif.categoriesDesc")}</p>
          </div>
          <span className={`text-[13px] px-2 py-0.5 rounded-full flex-shrink-0 ${savingBadgeCls(catSaving, catSaved)}`}>{catSaving?t("notif.saving"):catSaved?t("notif.saved"):t("notif.autoSaved")}</span>
        </div>
        <div>
          {CATS.map((cat,i)=>(
            <div key={cat.key} className={`flex items-center justify-between gap-4 px-5 py-4 ${i?"border-t border-tb-border":""}`}>
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-tb-surface-2 text-tb-text-secondary border border-tb-border">{cat.icon}</div>
                <div><div className="text-[15px] font-medium text-tb-text-primary">{cat.label}</div><div className="text-[14px] mt-0.5 text-tb-text-muted">{cat.desc}</div></div>
              </div>
              <Toggle checked={!!prefs[cat.key]} onChange={(v)=>saveCategories({[cat.key]:v})} />
            </div>
          ))}
        </div>
      </div>

      {/* Tips */}
      <div className="rounded-xl overflow-hidden bg-tb-surface-1 border border-tb-border">
        <div className="px-5 py-4 flex items-center justify-between border-b border-tb-border">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-tb-surface-2 text-tb-text-secondary border border-tb-border"><Lightbulb size={13} /></div>
            <h3 className="text-[16px] font-semibold text-tb-text-primary">{t("notif.tipsTitle")}</h3>
          </div>
          <span className={`text-[13px] px-2 py-0.5 rounded-full ${savingBadgeCls(tipsSaving, tipsSaved)}`}>{tipsSaving?t("notif.saving"):tipsSaved?t("notif.saved"):t("notif.autoSaved")}</span>
        </div>
        <div className="px-5 py-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-[15px] font-medium text-tb-text-primary">{t("notif.enableTips")}</div>
              <div className="text-[14px] mt-0.5 text-tb-text-muted">{t("notif.tipsDesc")}</div>
            </div>
            <Toggle checked={!!prefs.tips} onChange={(v)=>saveTips({tips:v, tipsEmail:v})} />
          </div>
          <div className="text-[15px] mt-2.5 text-tb-green">
            {prefs.tips ? t("notif.tipsEnabled") : t("notif.tipsMuted")}
          </div>
        </div>
      </div>

      {/* Schedule & email summaries */}
      <div className="rounded-xl overflow-hidden bg-tb-surface-1 border border-tb-border">
        <div className="px-5 py-4 flex items-center justify-between border-b border-tb-border">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-tb-surface-2 text-tb-text-secondary border border-tb-border"><Clock size={13} /></div>
            <h3 className="text-[16px] font-semibold text-tb-text-primary">{t("notif.scheduleTitle")}</h3>
          </div>
          <span className={`text-[13px] px-2 py-0.5 rounded-full ${savingBadgeCls(dgSaving, dgSaved)}`}>{dgSaving?t("notif.saving"):dgSaved?t("notif.saved"):t("notif.autoSaved")}</span>
        </div>
        <div className="px-5 py-4">
          <div className="flex items-center justify-between gap-4">
            <div><div className="text-[15px] font-medium text-tb-text-primary">{t("notif.enableDigest")}</div><div className="text-[14px] mt-0.5 leading-relaxed text-tb-text-muted">{t("notif.enableDigestDesc")}</div></div>
            <Toggle checked={!!prefs.digestEnabled} onChange={(v)=>saveDigest({digestEnabled:v})} />
          </div>
          {prefs.digestEnabled && (
            <div className="mt-3 p-1 rounded-lg flex gap-1 bg-tb-surface-2 border border-tb-border">
              {(["daily","weekly","monthly"] as const).map(f=>(
                <button key={f} onClick={()=>saveDigest({digestFrequency:f})} className={`flex-1 h-8 rounded-lg text-[15px] font-medium capitalize transition ${prefs.digestFrequency===f ? "bg-tb-brand text-tb-brand-text" : "text-tb-text-muted"}`}>{f}</button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}