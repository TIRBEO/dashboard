"use client";
import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { api, API } from "@/lib/api";
import { useI18n } from "@/lib/i18n";
import { GoogleIcon, GitHubIcon, DiscordIcon } from "@/components/SocialIcons";
import { Dialog, DialogHeader, DialogBody, DialogFooter, BtnCancel, BtnDanger, BtnPrimary, InfoCard, WarningBlock } from "@/components/ui/Dialog";
import {
  Check,
  X,
  AlertTriangle,
  Link2,
  Unlink,
  Loader2,
  Shield,
  Mail,
  Plug,
  Calendar,
} from "lucide-react";

const PROVIDER_META: Record<string, { icon: React.ReactNode; color?: string; bg: string; border: string }> = {
  google: { icon: <GoogleIcon size={22} />, bg: "#ffffff", border: "#dadce0" },
  github: { icon: <GitHubIcon size={22} />, color: "var(--tb-text-primary)", bg: "var(--tb-surface-1)", border: "var(--tb-border)" },
  discord: { icon: <DiscordIcon size={24} />, color: "#5865f2", bg: "var(--tb-surface-1)", border: "var(--tb-border)" },
};

export default function ConnectedAppsPage() {
  return (
    <Suspense fallback={<div className="py-24 text-center text-[14px] text-tb-text-muted">Loading...</div>}>
      <ConnectedAppsInner />
    </Suspense>
  );
}

function ConnectedAppsInner() {
  const { t } = useI18n();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [integrations, setIntegrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState<string | null>(null);
  const [disconnecting, setDisconnecting] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [showDisconnect, setShowDisconnect] = useState<string | null>(null);
  const [mergeToken, setMergeToken] = useState<string | null>(null);
  const [mergeEmail, setMergeEmail] = useState("");
  const [mergeProvider, setMergeProvider] = useState("");
  const [merging, setMerging] = useState(false);
  const [showMerge, setShowMerge] = useState(false);

  const showToast = useCallback((msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  const load = useCallback(async () => {
    try {
      const r = await api.get<any>("/api/integrations");
      setIntegrations(Array.isArray(r) ? r : r?.data || []);
    } catch (e: any) {
      showToast(e?.message || "Could not load connected accounts", "error");
    }
    setLoading(false);
  }, [showToast]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const mt = searchParams.get("merge_token");
    const email = searchParams.get("email");
    const provider = searchParams.get("provider");
    if (mt) { setMergeToken(mt); setMergeEmail(email || ""); setMergeProvider(provider || "unknown"); setShowMerge(true); router.replace("/account/apps"); }
    const connected = searchParams.get("connected");
    if (connected) { showToast(`${connected.charAt(0).toUpperCase() + connected.slice(1)} connected successfully!`); router.replace("/account/apps"); }
  }, [searchParams, router, showToast]);

  const handleConnect = (provider: string) => { setConnecting(provider); window.location.href = `${API}/api/auth/${provider}?link=1`; };

  const handleDisconnect = async (provider: string) => {
    setDisconnecting(provider);
    try { await api.request("/api/integrations", { method: "DELETE", body: JSON.stringify({ provider }) }); await load(); showToast(`${provider.charAt(0).toUpperCase() + provider.slice(1)} disconnected`); }
    catch (e: any) { showToast(e?.message || "Failed to disconnect", "error"); }
    setDisconnecting(null); setShowDisconnect(null);
  };

  const handleMerge = async () => {
    if (!mergeToken) return;
    setMerging(true);
    try { const res = await api.post<any>("/api/integrations/merge", { merge_token: mergeToken, action: "merge" }); if (res?.ok) { showToast(t("apps.mergeSuccess")); await load(); } else { showToast(res?.error || "Merge failed", "error"); } }
    catch (e: any) { showToast(e?.message || "Failed to merge", "error"); }
    setMerging(false); setShowMerge(false); setMergeToken(null);
  };

  const handleCancelMerge = async () => {
    if (mergeToken) { try { await api.post("/api/integrations/merge", { merge_token: mergeToken, action: "cancel" }); } catch {} }
    setShowMerge(false); setMergeToken(null); showToast(t("apps.mergeCancelled"));
  };

  const getConnectedEmail = (provider: string) => {
    const integration = integrations.find((i: any) => i.provider === provider && i.connected);
    return integration?.metadata?.email || integration?.metadata?.[`${provider}Email`] || null;
  };

  const getConnectedDate = (provider: string) => {
    const integration = integrations.find((i: any) => i.provider === provider && i.connected);
    if (!integration?.updatedAt) return null;
    return new Date(integration.updatedAt).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
  };

  const PROVIDERS = [
    { id: "google", name: "Google", desc: t("apps.googleDesc"), color: "#4285f4" },
    { id: "github", name: "GitHub", desc: t("apps.githubDesc"), color: "#333" },
    { id: "discord", name: "Discord", desc: t("apps.discordDesc"), color: "#5865f2" },
  ];

  return (
    <div className="flex flex-col gap-6 max-w-[1200px] mx-auto">
      {/* ── Toast ── */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-[9999] px-5 py-3 rounded-xl text-[15px] font-medium animate-in fade-in slide-in-from-top-2 duration-200 shadow-[0_4px_12px_rgba(0,0,0,.15)] ${toast.type === 'success' ? 'bg-tb-green-soft text-tb-green border border-tb-green' : 'bg-tb-red-soft text-tb-red border border-tb-red'}`}
        >
          {toast.msg}
        </div>
      )}

      {/* ── Page Header ── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="min-w-0">
          <h1 className="text-[24px] font-semibold text-tb-text-primary tracking-tight flex items-center gap-2.5">
            <Plug size={22} className="text-tb-text-muted" />
            {t("apps.title")}
          </h1>
          <p className="text-sm text-tb-text-muted mt-1">{t("apps.subtitle")}</p>
        </div>
      </div>

      {/* ═══ Provider Cards ═══ */}
      {loading ? (
        <div className="rounded-2xl border border-tb-border bg-tb-surface-1 p-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className={`flex items-center justify-between py-4 opacity-50 ${i < 3 ? 'border-b border-tb-border' : ''}`}>
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-tb-surface-2" />
                <div>
                  <div className="w-24 h-4 rounded bg-tb-surface-2" />
                  <div className="w-40 h-3 rounded mt-1.5 bg-tb-surface-2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-tb-border bg-tb-surface-1 overflow-hidden">
          <div className="px-6 py-4 border-b border-tb-border">
            <h3 className="text-[15px] font-semibold text-tb-text-secondary">{t("apps.available")}</h3>
          </div>
          <div>
            {PROVIDERS.map((p, i) => {
              const connected = integrations.some((int: any) => int.provider === p.id && int.connected);
              const connectedEmail = getConnectedEmail(p.id);
              const connectedDate = getConnectedDate(p.id);
              const meta = PROVIDER_META[p.id];
              return (
                <div
                  key={p.id}
                  className={`flex items-center justify-between gap-4 px-6 py-4 transition-all duration-100 hover:bg-tb-surface-2 ${i < PROVIDERS.length - 1 ? 'border-b border-tb-border' : ''}`}
                >
                  <div className="flex items-center gap-3.5 flex-1 min-w-0">
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: meta?.bg || 'var(--tb-surface-2)', color: meta?.color || 'var(--tb-text-primary)', border: `1px solid ${meta?.border || 'var(--tb-border)'}` }}
                    >
                      {meta?.icon || p.name[0]}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[16px] font-semibold text-tb-text-primary">{p.name}</span>
                        {connected ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[12px] font-semibold bg-tb-green-soft text-tb-green">
                            <Check size={10} /> {t("apps.connected")}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[12px] font-semibold bg-tb-surface-2 text-tb-text-muted">
                            {t("apps.notConnected")}
                          </span>
                        )}
                      </div>
                      <div className="text-[14px] text-tb-text-muted mt-0.5">{p.desc}</div>
                      {connected && connectedEmail && (
                        <div className="flex items-center gap-1.5 mt-1.5 text-[13px] text-tb-text-muted">
                          <Mail size={12} className="flex-shrink-0" />
                          <span>{connectedEmail}</span>
                          {connectedDate && (
                            <span className="text-tb-text-disabled ml-1">
                              · {t("apps.connectedOn")} {connectedDate}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    {connected ? (
                      <button
                        onClick={() => setShowDisconnect(p.id)}
                        disabled={disconnecting === p.id}
                        className="inline-flex items-center gap-1.5 px-3 h-8 rounded-lg text-[14px] font-medium border border-tb-red text-tb-red hover:bg-tb-red-soft transition-all duration-150 disabled:opacity-40 whitespace-nowrap"
                      >
                        {disconnecting === p.id ? <Loader2 size={14} className="animate-spin" /> : <Unlink size={14} />}
                        {t("apps.disconnect")}
                      </button>
                    ) : (
                      <button
                        onClick={() => handleConnect(p.id)}
                        disabled={connecting === p.id}
                        className="inline-flex items-center gap-1.5 px-3 h-8 rounded-lg text-[14px] font-medium transition-all duration-150 active:scale-[0.97] disabled:opacity-40 whitespace-nowrap bg-tb-text-primary text-tb-bg"
                      >
                        {connecting === p.id ? <Loader2 size={14} className="animate-spin" /> : <Link2 size={14} />}
                        {t("apps.connect")}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ═══ Disconnect Confirmation Dialog ═══ */}
      <Dialog open={!!showDisconnect} onClose={() => setShowDisconnect(null)}>
        <DialogHeader title={t("apps.disconnectConfirm")} description={t("apps.disconnectDesc")} onClose={() => setShowDisconnect(null)} />
        <DialogBody>
          <WarningBlock>
            This will revoke access to your {showDisconnect ? showDisconnect.charAt(0).toUpperCase() + showDisconnect.slice(1) : ''} account. You won{'\u2019'}t be able to sign in with it until you reconnect.
          </WarningBlock>
          {showDisconnect && (() => {
            const p = PROVIDERS.find((pr) => pr.id === showDisconnect);
            return p ? (
              <InfoCard
                icon={PROVIDER_META[p.id]?.icon || <Plug size={18} />}
                iconBg={PROVIDER_META[p.id]?.bg || 'var(--tb-surface-2)'}
                title={p.name}
                subtitle={getConnectedEmail(p.id) || p.desc}
              />
            ) : null;
          })()}
        </DialogBody>
        <DialogFooter>
          <BtnCancel onClick={() => setShowDisconnect(null)}>Keep connected</BtnCancel>
          <BtnDanger onClick={() => showDisconnect && handleDisconnect(showDisconnect)} loading={!!disconnecting}>
            {t("apps.disconnect")}
          </BtnDanger>
        </DialogFooter>
      </Dialog>

      {/* ═══ Merge Conflict Dialog ═══ */}
      <Dialog open={showMerge} onClose={handleCancelMerge}>
        <DialogHeader title={t("apps.mergeTitle")} description={t("apps.mergeDesc")} onClose={handleCancelMerge} />
        <DialogBody>
          <WarningBlock>
            This will merge your {mergeProvider} account with your existing account. Data from both accounts will be combined and the duplicate account will be removed.
          </WarningBlock>
          {mergeEmail && (
            <InfoCard
              icon={<Shield size={18} />}
              iconBg="rgba(234,179,8,0.15)"
              title={mergeEmail}
              subtitle={`${t('apps.mergeEmail')} · ${mergeProvider}`}
            />
          )}
        </DialogBody>
        <DialogFooter>
          <BtnCancel onClick={handleCancelMerge}>Don't merge accounts</BtnCancel>
          <BtnPrimary onClick={handleMerge} disabled={merging} loading={merging}>
            {t("apps.mergeButton")}
          </BtnPrimary>
        </DialogFooter>
      </Dialog>
    </div>
  );
}
