"use client";
import { useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useI18n } from "@/lib/i18n";
import {
  Check,
  X,
  AlertTriangle,
  Link2,
  Unlink,
  Loader2,
  Shield,
  Mail,
} from "lucide-react";

const PROVIDER_META: Record<string, { color: string; icon: string; bg: string }> = {
  google: { color: "#4285f4", icon: "G", bg: "#e8f0fe" },
  github: { color: "#333", icon: "GH", bg: "#f0f0f0" },
  discord: { color: "#5865f2", icon: "D", bg: "#e8eaff" },
};

export default function ConnectedAppsPage() {
  const { t } = useI18n();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [integrations, setIntegrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState<string | null>(null);
  const [disconnecting, setDisconnecting] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  // Disconnect confirmation
  const [showDisconnect, setShowDisconnect] = useState<string | null>(null);

  // Merge conflict
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
    } catch { /* silent */ }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  // Handle merge token from URL
  useEffect(() => {
    const mt = searchParams.get("merge_token");
    const email = searchParams.get("email");
    const provider = searchParams.get("provider");
    if (mt) {
      setMergeToken(mt);
      setMergeEmail(email || "");
      setMergeProvider(provider || "unknown");
      setShowMerge(true);
      // Clean URL
      router.replace("/account/apps");
    }
    const connected = searchParams.get("connected");
    if (connected) {
      showToast(`${connected.charAt(0).toUpperCase() + connected.slice(1)} connected successfully!`);
      router.replace("/account/apps");
    }
  }, [searchParams, router, showToast]);

  const handleConnect = (provider: string) => {
    setConnecting(provider);
    const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
    window.location.href = `${base}/api/auth/${provider}?link=1`;
  };

  const handleDisconnect = async (provider: string) => {
    setDisconnecting(provider);
    try {
      await api.request("/api/integrations", {
        method: "DELETE",
        body: JSON.stringify({ provider }),
      });
      await load();
      showToast(`${provider.charAt(0).toUpperCase() + provider.slice(1)} disconnected`);
    } catch (e: any) {
      showToast(e?.message || "Failed to disconnect", "error");
    }
    setDisconnecting(null);
    setShowDisconnect(null);
  };

  const handleMerge = async () => {
    if (!mergeToken) return;
    setMerging(true);
    try {
      const res = await api.post<any>("/api/integrations/merge", {
        merge_token: mergeToken,
        action: "merge",
      });
      if (res?.ok) {
        showToast(t("apps.mergeSuccess"));
        await load();
      } else {
        showToast(res?.error || "Merge failed", "error");
      }
    } catch (e: any) {
      showToast(e?.message || "Failed to merge", "error");
    }
    setMerging(false);
    setShowMerge(false);
    setMergeToken(null);
  };

  const handleCancelMerge = async () => {
    if (mergeToken) {
      try {
        await api.post("/api/integrations/merge", { merge_token: mergeToken, action: "cancel" });
      } catch { /* silent */ }
    }
    setShowMerge(false);
    setMergeToken(null);
    showToast(t("apps.mergeCancelled"));
  };

  const getConnectedEmail = (provider: string) => {
    const integration = integrations.find((i: any) => i.provider === provider && i.connected);
    return integration?.metadata?.email || integration?.metadata?.[`${provider}Email`] || null;
  };

  const getConnectedDate = (provider: string) => {
    const integration = integrations.find((i: any) => i.provider === provider && i.connected);
    if (!integration?.updatedAt) return null;
    return new Date(integration.updatedAt).toLocaleDateString(undefined, {
      year: "numeric", month: "short", day: "numeric",
    });
  };

  const PROVIDERS = [
    { id: "google", name: "Google", desc: t("apps.googleDesc"), color: "#4285f4" },
    { id: "github", name: "GitHub", desc: t("apps.githubDesc"), color: "#333" },
    { id: "discord", name: "Discord", desc: t("apps.discordDesc"), color: "#5865f2" },
  ];

  return (
    <div className="page-stack">
      {/* Toast */}
      {toast && (
        <div style={{
          position: "fixed", top: 20, right: 20, zIndex: 9999,
          padding: "12px 20px", borderRadius: 10,
          background: toast.type === "success" ? "var(--tb-green-soft, #d4edda)" : "var(--tb-red-soft, #f8d7da)",
          color: toast.type === "success" ? "var(--tb-green, #28a745)" : "var(--tb-red, #dc3545)",
          border: `1px solid ${toast.type === "success" ? "var(--tb-green, #28a745)" : "var(--tb-red, #dc3545)"}`,
          fontSize: 14, fontWeight: 500, boxShadow: "0 4px 12px rgba(0,0,0,.15)",
          transition: "opacity 200ms",
        }}>
          {toast.msg}
        </div>
      )}

      <div className="page-header">
        <div className="page-header-row">
          <div className="page-header-left">
            <h1 className="page-header-title">{t("apps.title")}</h1>
            <p className="page-header-description">{t("apps.subtitle")}</p>
          </div>
        </div>
      </div>

      {/* Provider Cards */}
      {loading ? (
        <div className="dashboard-card">
          {[1, 2, 3].map((i) => (
            <div key={i} className="consent-row" style={{ opacity: 0.5 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ width: 44, height: 44, borderRadius: 10, background: "var(--tb-surface-2, #f5f5f5)" }} />
                <div>
                  <div style={{ width: 100, height: 16, borderRadius: 4, background: "var(--tb-surface-2, #f5f5f5)" }} />
                  <div style={{ width: 160, height: 12, borderRadius: 4, background: "var(--tb-surface-2, #f5f5f5)", marginTop: 6 }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="dashboard-card" style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--tb-border)", fontSize: 14, fontWeight: 600, color: "var(--tb-text-secondary, #666)" }}>
            {t("apps.available")}
          </div>
          {PROVIDERS.map((p) => {
            const connected = integrations.some((i: any) => i.provider === p.id && i.connected);
            const connectedEmail = getConnectedEmail(p.id);
            const connectedDate = getConnectedDate(p.id);
            const meta = PROVIDER_META[p.id];
            return (
              <div key={p.id} className="consent-row" style={{ gap: 16, padding: "16px 20px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14, flex: 1, minWidth: 0 }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center",
                    background: meta?.bg || "#f5f5f5", fontSize: 16, fontWeight: 700, color: meta?.color || "#333",
                    border: `1px solid ${meta?.color || "#ddd"}22`, flexShrink: 0,
                  }}>
                    {meta?.icon || p.name[0]}
                  </div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                      <span style={{ fontWeight: 600, fontSize: 15, color: "var(--tb-text-primary)" }}>{p.name}</span>
                      {connected ? (
                        <span style={{
                          display: "inline-flex", alignItems: "center", gap: 4,
                          padding: "2px 8px", borderRadius: 99, fontSize: 11, fontWeight: 600,
                          background: "var(--tb-green-soft, #d4edda)", color: "var(--tb-green, #28a745)",
                        }}>
                          <Check size={10} /> {t("apps.connected")}
                        </span>
                      ) : (
                        <span style={{
                          display: "inline-flex", alignItems: "center", gap: 4,
                          padding: "2px 8px", borderRadius: 99, fontSize: 11, fontWeight: 600,
                          background: "var(--tb-surface-2, #f5f5f5)", color: "var(--tb-text-muted, #999)",
                        }}>
                          {t("apps.notConnected")}
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: 13, color: "var(--tb-text-muted, #999)", marginTop: 2 }}>{p.desc}</div>
                    {connected && connectedEmail && (
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6, fontSize: 12, color: "var(--tb-text-muted, #888)" }}>
                        <Mail size={12} />
                        <span>{connectedEmail}</span>
                        {connectedDate && (
                          <span style={{ color: "var(--tb-text-muted, #bbb)", marginLeft: 4 }}>
                            · {t("apps.connectedOn")} {connectedDate}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <div style={{ flexShrink: 0 }}>
                  {connected ? (
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => setShowDisconnect(p.id)}
                      disabled={disconnecting === p.id}
                      style={{ display: "flex", alignItems: "center", gap: 6, whiteSpace: "nowrap" }}
                    >
                      {disconnecting === p.id ? <Loader2 size={14} className="animate-spin" /> : <Unlink size={14} />}
                      {t("apps.disconnect")}
                    </button>
                  ) : (
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => handleConnect(p.id)}
                      disabled={connecting === p.id}
                      style={{ display: "flex", alignItems: "center", gap: 6, whiteSpace: "nowrap" }}
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
      )}

      {/* Disconnect Confirmation Dialog */}
      {showDisconnect && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 10000,
          display: "flex", alignItems: "center", justifyContent: "center",
          background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)",
        }} onClick={() => setShowDisconnect(null)}>
          <div style={{
            background: "var(--tb-surface-1, #fff)", borderRadius: 16,
            padding: 28, maxWidth: 420, width: "90%",
            border: "1px solid var(--tb-border)", boxShadow: "0 20px 60px rgba(0,0,0,.3)",
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <div style={{
                width: 40, height: 40, borderRadius: 10,
                background: "var(--tb-red-soft, #fee)", display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <AlertTriangle size={20} color="var(--tb-red, #dc3545)" />
              </div>
              <h3 style={{ fontSize: 17, fontWeight: 600, color: "var(--tb-text-primary)", margin: 0 }}>
                {t("apps.disconnectConfirm")}
              </h3>
            </div>
            <p style={{ fontSize: 14, color: "var(--tb-text-secondary, #666)", margin: "0 0 20px", lineHeight: 1.5 }}>
              {t("apps.disconnectDesc")}
            </p>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowDisconnect(null)}>
                {t("apps.cancelButton")}
              </button>
              <button
                className="btn btn-danger btn-sm"
                onClick={() => showDisconnect && handleDisconnect(showDisconnect)}
                disabled={!!disconnecting}
                style={{ display: "flex", alignItems: "center", gap: 6 }}
              >
                {disconnecting ? <Loader2 size={14} className="animate-spin" /> : <Unlink size={14} />}
                {t("apps.disconnect")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Merge Conflict Dialog */}
      {showMerge && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 10000,
          display: "flex", alignItems: "center", justifyContent: "center",
          background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)",
        }} onClick={handleCancelMerge}>
          <div style={{
            background: "var(--tb-surface-1, #fff)", borderRadius: 16,
            padding: 28, maxWidth: 440, width: "90%",
            border: "1px solid var(--tb-border)", boxShadow: "0 20px 60px rgba(0,0,0,.3)",
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <div style={{
                width: 40, height: 40, borderRadius: 10,
                background: "#fff3cd", display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Shield size={20} color="#856404" />
              </div>
              <h3 style={{ fontSize: 17, fontWeight: 600, color: "var(--tb-text-primary)", margin: 0 }}>
                {t("apps.mergeTitle")}
              </h3>
            </div>
            <p style={{ fontSize: 14, color: "var(--tb-text-secondary, #666)", margin: "0 0 16px", lineHeight: 1.5 }}>
              {t("apps.mergeDesc")}
            </p>
            {mergeEmail && (
              <div style={{
                padding: "10px 14px", borderRadius: 8,
                background: "var(--tb-surface-2, #f8f9fa)", border: "1px solid var(--tb-border)",
                marginBottom: 20, fontSize: 13,
              }}>
                <span style={{ color: "var(--tb-text-muted, #999)" }}>{t("apps.mergeEmail")}: </span>
                <span style={{ fontWeight: 600, color: "var(--tb-text-primary)" }}>{mergeEmail}</span>
                <span style={{ color: "var(--tb-text-muted, #bbb)", marginLeft: 8 }}>
                  ({mergeProvider})
                </span>
              </div>
            )}
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button className="btn btn-ghost btn-sm" onClick={handleCancelMerge}>
                {t("apps.cancelButton")}
              </button>
              <button
                className="btn btn-primary btn-sm"
                onClick={handleMerge}
                disabled={merging}
                style={{ display: "flex", alignItems: "center", gap: 6 }}
              >
                {merging ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                {t("apps.mergeButton")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
