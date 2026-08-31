"use client";
import { useEffect, useState } from "react";
import {
  API,
  getPreferences,
  updatePreferences,
  cancelDeletion,
  requestDeleteOtp,
  verifyDeleteOtp,
} from "@/lib/api";
import {
  AlertTriangle,
  BarChart3,
  Check,
  Download,
  Trash,
  Shield,
  X,
  Mail,
  Clock,
} from "lucide-react";
import { Dialog, DialogHeader, DialogBody, WarningBlock, InfoCard, ConfirmInput, DialogFooter, BtnCancel, BtnDanger, BtnPrimary } from "@/components/ui/Dialog";
import { Skeleton } from "@/components/ui/Skeleton";
import { useI18n } from "@/lib/i18n";
import { toast } from "sonner";

function Toggle({ checked, onChange, disabled }: { checked: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      disabled={disabled}
      aria-pressed={checked}
      onClick={() => !disabled && onChange(!checked)}
      className={`relative w-9 h-[22px] rounded-full flex-shrink-0 transition-all duration-150 disabled:opacity-40 border border-tb-border ${checked ? "bg-tb-brand" : "bg-tb-surface-3"}`}
    >
      <span className={`absolute top-[2px] w-[16px] h-[16px] rounded-full transition-all duration-150 ${checked ? "left-[17px]" : "left-[2px]"} ${checked ? "bg-tb-brand-text" : "bg-tb-text-muted"}`} />
    </button>
  );
}

function PrivacySkeleton() {
  return (
    <div className="flex flex-col gap-6 max-w-[1200px] mx-auto">
      <div>
        <Skeleton width={200} height={26} className="mb-2" />
        <Skeleton width={320} height={14} />
      </div>
      {/* Analytics card */}
      <div className="rounded-2xl border border-tb-border bg-tb-surface-1 overflow-hidden">
        <div className="px-5 py-4 border-b border-tb-border"><Skeleton width={160} height={18} /></div>
        {[1, 2].map((i) => (
          <div key={i} className={`flex items-center gap-3 px-5 py-4 ${i === 2 ? "border-t border-tb-border" : ""}`}>
            <Skeleton width={34} height={34} borderRadius={10} />
            <div className="flex-1"><Skeleton width={100} height={14} className="mb-1.5" /><Skeleton width={220} height={11} /></div>
            <Skeleton width={36} height={20} borderRadius={999} />
          </div>
        ))}
      </div>
      {/* Export card */}
      <div className="rounded-2xl border border-tb-border bg-tb-surface-1 p-5">
        <Skeleton width={120} height={18} className="mb-3" />
        <Skeleton width={140} height={36} borderRadius={8} />
      </div>
      {/* Delete card */}
      <div className="rounded-2xl border border-tb-border bg-tb-surface-1 p-5">
        <Skeleton width={160} height={18} className="mb-3" />
        <Skeleton width={160} height={36} borderRadius={8} />
      </div>
    </div>
  );
}


export default function PrivacyPage() {
  const { t } = useI18n();
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [savedKey, setSavedKey] = useState<string | null>(null);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [deleteStep, setDeleteStep] = useState<"confirm" | "otp">("confirm");
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const [requestingOtp, setRequestingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [otpSentTo, setOtpSentTo] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [scheduledDeletion, setScheduledDeletion] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [showCancelPopup, setShowCancelPopup] = useState(false);
  const [nowTick, setNowTick] = useState(() => Date.now());
  const [privacy, setPrivacy] = useState({ allowAnalytics: false, allowCrashReports: true });

  useEffect(() => {
    Promise.all([
      getPreferences().catch(() => null),
      fetch(`${API}/api/users/me`, { credentials: "include" }).then((r) => r.json()).catch(() => null),
    ]).then(([prefs, user]: [any, any]) => {
      const p = prefs?.preferences?.privacy || prefs?.privacy || prefs?.consents || {};
      setPrivacy((prev) => ({
        allowAnalytics: p.allowAnalytics ?? user?.consents?.allowAnalytics ?? prev.allowAnalytics,
        allowCrashReports: p.allowCrashReports ?? user?.consents?.allowCrashReports ?? prev.allowCrashReports,
      }));
      if (user?.email) setUserEmail(user.email);
      if (user?.scheduledDeletionAt) setScheduledDeletion(user.scheduledDeletionAt);
    }).catch(()=>{}).finally(()=> setLoading(false));
  }, []);
  useEffect(() => { if (!scheduledDeletion) return; const id=setInterval(()=> setNowTick(Date.now()),60000); return()=> clearInterval(id); }, [scheduledDeletion]);

  const save = async (key: "allowAnalytics" | "allowCrashReports", value: boolean) => {
    const updated = { ...privacy, [key]: value };
    setPrivacy(updated);
    setSavingKey(key); setSavedKey(null);
    try {
      await updatePreferences({ privacy: updated });
      setSavedKey(key); toast.success(key==="allowAnalytics" ? "Analytics preference saved" : "Crash reports preference saved");
      setTimeout(()=> setSavedKey(null), 1800);
    } catch (e:any) {
      try { const p=await getPreferences(); const r=p?.preferences?.privacy || p?.privacy || {}; setPrivacy({ allowAnalytics: r.allowAnalytics ?? false, allowCrashReports: r.allowCrashReports ?? true }); } catch {}
      toast.error("Failed to save — try again");
    } finally { setSavingKey(null); }
  };

  const handleExport = async () => {
    setExporting(true); setExportError(null); setExportSuccess(false);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") || "" : "";
      const headers: Record<string, string> = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;
      try { const csrf = document.cookie.match(/(?:^|;\s*)__csrf=([^;]+)/)?.[1]; if (csrf) headers["X-CSRF-Token"] = csrf; } catch {}
      const res = await fetch(`${API}/api/user/export-data`, { credentials: "include", headers });
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a"); a.href = url;
      let filename = "tirbeo-data.json";
      try { const cd = res.headers.get("content-disposition"); const m = cd?.match(/filename="(.+)"/)?.[1] || cd?.match(/filename=([^;]+)/)?.[1]; if (m) filename = m.replace(/"/g,"").trim(); } catch {}
      a.download = filename; document.body.appendChild(a); a.click();
      setTimeout(()=>{ window.URL.revokeObjectURL(url); try{ a.remove(); }catch{} }, 1200);
      setExportSuccess(true); setTimeout(()=> setExportSuccess(false), 3000);
    } catch (e:any) { setExportError(e?.message || "Failed to export"); }
    setExporting(false);
  };

  const openDeleteDialog = () => { setDeleteConfirm(""); setDeleteError(""); setOtp(""); setOtpError(""); setDeleteStep("confirm"); setOtpSentTo(null); setShowDeletePopup(true); };
  const closeDeleteDialog = () => { setShowDeletePopup(false); setDeleteConfirm(""); setDeleteError(""); setOtp(""); setOtpError(""); setDeleteStep("confirm"); };
  const handleRequestOtp = async () => {
    if (deleteConfirm !== "DELETE") return;
    setRequestingOtp(true); setDeleteError(""); setOtpError("");
    try { await requestDeleteOtp(); setOtpSentTo(userEmail); setDeleteStep("otp"); }
    catch (e:any){ setDeleteError(e?.message || "Failed to send code"); }
    setRequestingOtp(false);
  };
  const handleVerifyOtp = async () => {
    if (otp.length < 4) { setOtpError("Enter the 6-digit code"); return; }
    setVerifyingOtp(true); setOtpError(""); setDeleteError("");
    try {
      const result:any = await verifyDeleteOtp(otp);
      if (result?.scheduledAt) { closeDeleteDialog(); setScheduledDeletion(result.scheduledAt); setTimeout(()=>{ try{ window.dispatchEvent(new CustomEvent("tirbeo:deletion-scheduled",{detail:{scheduledAt: result.scheduledAt}})); }catch{} },200); }
      else if (result?.ok) { closeDeleteDialog(); window.location.href="/"; }
    } catch(e:any){ setOtpError(e?.message || "Invalid code"); }
    setVerifyingOtp(false);
  };
  const handleResendOtp = async () => { setRequestingOtp(true); setOtpError(""); try{ await requestDeleteOtp(); }catch(e:any){ setOtpError(e?.message||"Failed"); } setRequestingOtp(false); };
  const handleCancelDeletion = async () => { setCancelling(true); try{ await cancelDeletion(); setScheduledDeletion(null); setShowCancelPopup(false); try{ window.dispatchEvent(new CustomEvent("tb:deletion-cancelled")); }catch{} toast.success("Deletion cancelled"); }catch(e:any){ toast.error("Failed to cancel"); } setCancelling(false); };
  const getDeletionInfo = () => {
    if (!scheduledDeletion) return null;
    const diff = Math.max(0, new Date(scheduledDeletion).getTime() - nowTick);
    const mins=Math.floor(diff/60000); const d=Math.floor(mins/1440), h=Math.floor((mins%1440)/60), m=mins%60;
    return { formatted: new Date(scheduledDeletion).toLocaleString(undefined,{day:"numeric",month:"short",year:"numeric",hour:"numeric",minute:"2-digit"}), timeRemaining:`${d}d ${h}h ${m}m` };
  };
  const deletionInfo = getDeletionInfo();

  if (loading) return <PrivacySkeleton />;

  return (
    <div className="flex flex-col gap-6 max-w-[1200px] mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="page-header-title flex items-center gap-2.5"><Shield size={22} className="text-tb-text-muted" /> Data & analytics</h1>
          <p className="page-header-description">Control how your data is used for analytics and diagnostics. Changes save automatically.</p>
        </div>
        <span className="inline-flex items-center gap-1.5 text-[12px] font-medium px-2.5 py-1 rounded-full border border-tb-border bg-tb-surface-2 text-tb-text-muted">
          {savingKey ? "Saving…" : savedKey ? <><Check size={11} className="text-tb-green" /> Saved</> : "Auto-saved"}
        </span>
      </div>

      {scheduledDeletion && deletionInfo && (
        <div className="rounded-xl p-4 flex items-center gap-3 bg-tb-red-soft border border-[rgba(232,93,106,0.18)] border-l-[3px] border-l-tb-red">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-tb-red-soft text-tb-red"><Clock size={14} /></div>
          <div className="flex-1 min-w-0">
            <div className="text-[15px] font-bold text-tb-red">Scheduled for deletion — {deletionInfo.timeRemaining} left</div>
            <div className="text-[15px] mt-0.5 text-tb-text-secondary">Permanently deleted on {deletionInfo.formatted}</div>
          </div>
          <button onClick={()=> setShowCancelPopup(true)} className="px-3 h-8 rounded-lg text-[15px] font-semibold flex-shrink-0 btn-secondary">Cancel deletion</button>
        </div>
      )}

      {/* Data & analytics */}
      <div className="rounded-xl overflow-hidden bg-tb-surface-1 border border-tb-border">
        <div className="px-5 py-4 border-b border-tb-border">
          <h3 className="text-[16px] font-semibold flex items-center gap-2 text-tb-text-primary"><BarChart3 size={15} className="text-tb-text-muted" /> Data & analytics</h3>
          <p className="text-[15px] mt-1 text-tb-text-muted">Help Tirbeo improve by sharing usage data. Crash reports help fix breaks.</p>
        </div>
        <div>
          {[
            { key:"allowAnalytics" as const, label:"Analytics", desc:"Help Tirbeo improve by sharing usage data.", icon:<BarChart3 size={14} /> },
            { key:"allowCrashReports" as const, label:"Crash reports", desc:"Automatically send error reports when something breaks.", icon:<Shield size={14} /> },
          ].map((item,i)=>(
            <div key={item.key} className={`flex items-center justify-between gap-4 px-5 py-4 ${i?"border-t border-tb-border":""}`}>
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-tb-surface-2 text-tb-text-secondary border border-tb-border">{item.icon}</div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[15px] font-medium text-tb-text-primary">{item.label}</span>
                    {savingKey===item.key && <span className="w-3 h-3 rounded-full border-2 border-current border-t-transparent animate-spin text-tb-text-muted" />}
                    {savedKey===item.key && <span className="inline-flex items-center gap-1 text-[15px] font-medium text-tb-green"><Check size={11}/> Saved</span>}
                  </div>
                  <div className="text-[14px] mt-0.5 text-tb-text-muted">{item.desc}</div>
                </div>
              </div>
              <Toggle checked={privacy[item.key]} onChange={(v)=> save(item.key, v)} />
            </div>
          ))}
        </div>
      </div>

      {/* Data Export */}
      <div className="rounded-xl overflow-hidden bg-tb-surface-1 border border-tb-border">
        <div className="px-5 py-4 border-b border-tb-border">
          <h3 className="text-[16px] font-semibold flex items-center gap-2 text-tb-text-primary"><Download size={15} className="text-tb-text-muted" /> Data export</h3>
          <p className="text-[15px] mt-1 text-tb-text-muted">Download a copy of everything stored in your account.</p>
        </div>
        <div className="px-5 py-4">
          <div className="flex items-center gap-2 flex-wrap">
            <button onClick={handleExport} disabled={exporting} className="btn btn-sm btn-secondary">
              <Download size={13} /> {exporting ? "Preparing…" : "Export data"}
            </button>
            {!exporting && <span className="text-[15px] text-tb-text-muted">JSON · profile, tickets & activity</span>}
            {exporting && <span className="w-3 h-3 rounded-full border-2 border-current border-t-transparent animate-spin text-tb-text-muted" />}
          </div>
          {exportError && <div className="mt-3 flex items-center gap-1.5 text-[15px] px-3 py-2 rounded-lg bg-tb-red-soft text-tb-red border border-[rgba(232,93,106,0.15)]"><AlertTriangle size={12}/> {exportError}</div>}
          {exportSuccess && <div className="mt-3 flex items-center gap-1.5 text-[15px] px-3 py-2 rounded-lg bg-tb-green-soft text-tb-green border border-[rgba(115,184,92,0.15)]"><Check size={12}/> Download started</div>}
        </div>
      </div>

      {/* Danger Zone */}
      <div className="rounded-xl overflow-hidden border border-[rgba(232,93,106,0.25)] bg-tb-red-soft">
        <div className="px-5 py-4 flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-tb-red text-white"><Trash size={13} /></div>
          <h3 className="text-[15px] font-semibold text-tb-red">Danger zone</h3>
        </div>
        <div className="px-5 pb-4">
          <p className="text-[15px] leading-relaxed text-tb-text-secondary">Permanently delete your account and all data. This cannot be undone — 30-day grace to cancel.</p>
          <button onClick={openDeleteDialog} disabled={!!scheduledDeletion} className={`mt-3 inline-flex items-center gap-1.5 px-3 h-8 rounded-lg text-[15px] font-semibold transition disabled:opacity-40 btn-danger ${scheduledDeletion ? "bg-tb-surface-3 text-tb-text-muted" : "bg-tb-red text-white"}`}>
            <Trash size={12} /> {scheduledDeletion ? "Deletion scheduled" : "Delete account"}
          </button>
        </div>
      </div>

      {/* Dialogs */}
      <Dialog open={showDeletePopup} onClose={closeDeleteDialog}>
        <DialogHeader title="Delete account?" description="This cannot be undone." onClose={closeDeleteDialog} />
        <DialogBody>
          {deleteStep==="confirm" ? (
            <div className="flex flex-col gap-3">
              <div className="flex gap-2.5 rounded-lg px-3 py-2.5 bg-tb-red-soft border border-[rgba(232,93,106,0.15)]">
                <AlertTriangle size={14} className="text-tb-red flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-[15px] font-semibold text-tb-red">Warning</div>
                  <div className="text-[15px] leading-relaxed mt-0.5 text-tb-text-secondary">All data, tickets, sessions will be permanently removed.</div>
                </div>
              </div>
              <div className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 bg-tb-surface-2 border border-tb-border">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-tb-surface-3 text-tb-text-secondary border border-tb-border"><Mail size={13} /></div>
                <div className="min-w-0 flex-1">
                  <div className="text-[15px] font-medium text-tb-text-primary truncate">{userEmail || "Your account"}</div>
                  <div className="text-[15px] text-tb-text-muted">All data will be deleted</div>
                </div>
              </div>
              <div>
                <label className="block text-[15px] font-medium mb-1.5 text-tb-text-secondary">Type <span className="text-tb-text-primary font-bold">DELETE</span> to confirm</label>
                <input
                  value={deleteConfirm}
                  onChange={(e)=> setDeleteConfirm(e.target.value.toUpperCase().slice(0,6))}
                  placeholder="DELETE"
                  className="form-input w-full"
                  autoFocus
                />
              </div>
              {deleteError && <p className="text-[15px] text-tb-red">{deleteError}</p>}
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 bg-tb-surface-2 border border-tb-border">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-tb-blue-soft text-tb-blue"><Mail size={14} /></div>
                <div>
                  <div className="text-[15px] font-medium text-tb-text-primary">Code sent</div>
                  <div className="text-[15px] text-tb-text-muted">Sent to {otpSentTo || userEmail || "your email"} · 10 min</div>
                </div>
              </div>
              <div>
                <label className="block text-[15px] font-medium mb-1.5 text-tb-text-secondary">6-digit code</label>
                <input
                  value={otp}
                  onChange={(e)=> setOtp(e.target.value.replace(/\D/g,"").slice(0,6))}
                  placeholder="000000"
                  inputMode="numeric"
                  className="form-input w-full"
                />
              </div>
              <div className="flex items-center justify-center gap-2">
                <button onClick={handleResendOtp} disabled={requestingOtp} className={`text-[15px] px-2.5 py-1 rounded-lg btn-ghost ${requestingOtp?"opacity-60":""}`}>{requestingOtp?"Sending…":"Resend"}</button>
                <button onClick={()=>{ setDeleteStep("confirm"); setOtp(""); setOtpError(""); }} className="text-[15px] px-2 btn-ghost">Back</button>
              </div>
              {(otpError||deleteError) && <p className="text-[15px] text-center text-tb-red">{otpError||deleteError}</p>}
            </div>
          )}
        </DialogBody>
        <DialogFooter>
          <BtnCancel onClick={closeDeleteDialog}>Keep account</BtnCancel>
          {deleteStep==="confirm" ? <BtnDanger onClick={handleRequestOtp} disabled={deleteConfirm!=="DELETE"} loading={requestingOtp}>Send code</BtnDanger> : <BtnDanger onClick={handleVerifyOtp} disabled={otp.length<4} loading={verifyingOtp}>Delete</BtnDanger>}
        </DialogFooter>
      </Dialog>

      <Dialog open={showCancelPopup} onClose={()=> setShowCancelPopup(false)}>
        <DialogHeader title="Cancel deletion?" description="Restore immediately. You can delete again after 7 days." onClose={()=> setShowCancelPopup(false)} />
        <DialogBody><InfoCard icon={<Shield size={16} />} iconBg="var(--tb-green-soft)" title="Restore account" subtitle={`Scheduled for ${getDeletionInfo()?.formatted || ""} will be cleared.`} /></DialogBody>
        <DialogFooter><BtnCancel onClick={()=> setShowCancelPopup(false)}>Keep deletion</BtnCancel><BtnPrimary onClick={handleCancelDeletion} loading={cancelling}>Keep my account</BtnPrimary></DialogFooter>
      </Dialog>
    </div>
  );
}