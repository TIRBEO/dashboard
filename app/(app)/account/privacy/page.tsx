"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  API,
  getPreferences,
  updatePreferences,
  deleteAccount,
  cancelDeletion,
} from "@/lib/api";
import {
  AlertTriangle,
  BarChart3,
  Check,
  Download,
  Trash,
} from "lucide-react";
import { Skeleton } from "@/components/ui/Skeleton";
import { useI18n } from "@/lib/i18n";

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      className={`tb-toggle ${checked ? "checked" : ""}`}
      onClick={() => onChange(!checked)}
      type="button"
    >
      <div className="tb-toggle-knob" />
    </button>
  );
}

export default function PrivacyPage() {
  const router = useRouter();
  const { t } = useI18n();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [scheduledDeletion, setScheduledDeletion] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);

  const [privacy, setPrivacy] = useState({
    allowAnalytics: false,
    allowCrashReports: true,
  });

  useEffect(() => {
    Promise.all([
      getPreferences().catch(() => null),
      fetch(`${API}/api/users/me`, { credentials: 'include' }).then(r => r.json()).catch(() => null),
    ])
      .then(([prefs, user]: [any, any]) => {
        if (prefs?.privacy) {
          setPrivacy((prev) => ({
            ...prev,
            allowAnalytics: prefs.privacy.allowAnalytics ?? false,
            allowCrashReports: prefs.privacy.allowCrashReports ?? true,
          }));
        }
        if (user?.scheduledDeletionAt) {
          setScheduledDeletion(user.scheduledDeletionAt);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const save = async (updated: typeof privacy) => {
    setPrivacy(updated);
    setSaving(true);
    setSaved(false);
    try {
      await updatePreferences({ privacy: updated });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {}
    setSaving(false);
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await fetch(`${API}/api/user/export-data`, {
        credentials: "include",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth_token") || ""}`,
        },
      });
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download =
        res.headers
          .get("content-disposition")
          ?.match(/filename="(.+)"/)?.[1] || "tirbeo-data.json";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } catch {}
    setExporting(false);
  };

  const handleDelete = async () => {
    if (deleteConfirm !== "DELETE") return;
    setDeleting(true);
    setDeleteError("");
    try {
      const result = await deleteAccount(deletePassword || undefined);
      if (result?.scheduledAt) {
        setShowDeletePopup(false);
        setDeleteConfirm("");
        setDeletePassword("");
        setScheduledDeletion(result.scheduledAt);
      } else {
        window.location.href = "/";
      }
    } catch (e: any) {
      setDeleteError(e?.message || "Failed to schedule deletion");
    }
    setDeleting(false);
  };

  const handleCancelDeletion = async () => {
    setCancelling(true);
    try {
      await cancelDeletion();
      setScheduledDeletion(null);
    } catch {}
    setCancelling(false);
  };

  return (
    <div className="page-stack">
      <div className="page-header">
        <div className="page-header-row">
          <div className="page-header-left">
            <h1 className="page-header-title">{t("privacy.title")}</h1>
            <p className="page-header-description">
              {t("privacy.subtitle")}
            </p>
          </div>
          <div className="page-header-actions">
            {saving && (
              <span style={{ fontSize: 12, color: "var(--tb-text-muted)" }}>
                {t("common.saving")}
              </span>
            )}
            {saved && (
              <span
                style={{
                  fontSize: 12,
                  color: "var(--tb-green)",
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <Check size={14} /> {t("common.saved")}
              </span>
            )}
          </div>
        </div>
      </div>

      {scheduledDeletion && (
        <div style={{
          background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 10,
          padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <AlertTriangle size={16} style={{ color: '#ef4444', flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, fontSize: 14, color: '#ef4444' }}>
              Account scheduled for deletion
            </div>
            <div style={{ fontSize: 13, color: '#991b1b', marginTop: 2 }}>
              Your account will be permanently deleted on {new Date(scheduledDeletion).toLocaleDateString()}. All your data will be removed.
            </div>
          </div>
          <button type="button" onClick={handleCancelDeletion} disabled={cancelling}
            style={{ background: '#ef4444', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0 }}>
            {cancelling ? 'Cancelling...' : 'Cancel Deletion'}
          </button>
        </div>
      )}

      {/* Data & analytics */}
      <div className="dashboard-card">
        <h3
          className="section-title"
          style={{ display: "flex", alignItems: "center", gap: 8 }}
        >
          <BarChart3 size={15} />
          {t("privacy.dataAnalytics")}
        </h3>
        <p className="section-desc">
          {t("privacy.subtitle")}
        </p>
        <div className="card-flush">
          {loading
            ? Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="consent-row">
                  <div>
                    <Skeleton width={160} height={14} style={{ marginBottom: 4 }} />
                    <Skeleton width={240} height={11} />
                  </div>
                  <Skeleton width={36} height={20} borderRadius={10} />
                </div>
              ))
            : [
                {
                  key: "allowAnalytics" as const,
                  label: t("privacy.analytics"),
                  desc: t("privacy.analyticsDesc"),
                  icon: <BarChart3 size={14} />,
                },
                {
                  key: "allowCrashReports" as const,
                  label: t("privacy.crashReports"),
                  desc: t("privacy.crashReportsDesc"),
                  icon: <AlertTriangle size={14} />,
                },
              ].map((item) => (
                <div key={item.key} className="consent-row">
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                    <div
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 6,
                        background: "var(--tb-surface-3)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        marginTop: 2,
                        color: "var(--tb-text-muted)",
                      }}
                    >
                      {item.icon}
                    </div>
                    <div>
                      <div className="row-title">{item.label}</div>
                      <div className="row-desc">{item.desc}</div>
                    </div>
                  </div>
                  <Toggle
                    checked={privacy[item.key]}
                    onChange={(v) => save({ ...privacy, [item.key]: v })}
                  />
                </div>
              ))}
        </div>
      </div>

      {/* Data export */}
      <div className="dashboard-card">
        <h3
          className="section-title"
          style={{ display: "flex", alignItems: "center", gap: 8 }}
        >
          <Download size={15} />
          {t("privacy.dataExport")}
        </h3>
        <p className="section-desc">
          {t("privacy.dataExportDesc")}
        </p>
        <div style={{ padding: "0 18px 16px" }}>
          <button
            className="btn btn-secondary btn-sm"
            onClick={handleExport}
            disabled={exporting}
          >
            {exporting ? (
              <>
                <span className="btn-spinner" /> {t("privacy.preparing")}
              </>
            ) : (
              <>
                <Download size={14} /> {t("privacy.exportData")}
              </>
            )}
          </button>
          <p
            style={{
              fontSize: 12,
              color: "var(--tb-text-muted)",
              marginTop: 8,
            }}
          >
            {t("privacy.exportNote")}
          </p>
        </div>
      </div>

      {/* Danger zone */}
      <div
        className="dashboard-card"
        style={{ borderColor: "var(--tb-red-soft, rgba(239,68,68,0.3))" }}
      >
        <h3
          className="section-title"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            color: "var(--tb-red, #ef4444)",
          }}
        >
          <Trash size={15} />
          {t("privacy.dangerZone")}
        </h3>
        <p className="section-desc">
          {t("privacy.dangerZoneDesc")}
        </p>
        <div style={{ padding: "0 18px 16px" }}>
          {scheduledDeletion ? (
            <div style={{ fontSize: 13, color: '#991b1b' }}>
              Account deletion is scheduled. You can only cancel it.
            </div>
          ) : (
            <button
              className="btn btn-danger btn-sm"
              onClick={() => setShowDeletePopup(true)}
            >
              <Trash size={14} /> {t("privacy.deleteAccount")}
            </button>
          )}
          <p
            style={{
              fontSize: 12,
              color: "var(--tb-text-muted)",
              marginTop: 8,
            }}
          >
            {scheduledDeletion ? 'Your account will be permanently deleted and all data removed.' : t("privacy.irreversible")}
          </p>
        </div>
      </div>

      {/* Delete Account Popup */}
      {showDeletePopup && (
        <div
          className="tb-dialog-overlay"
          onClick={() => {
            setShowDeletePopup(false);
            setDeleteConfirm("");
          }}
        >
          <div className="tb-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="tb-dialog-header">
              <div>
                <h3 className="tb-dialog-title" style={{ color: "var(--tb-red, #ef4444)" }}>
                  {t("privacy.deleteAccount")}
                </h3>
                <p className="tb-dialog-desc">
                  {t("privacy.irreversible")}
                </p>
              </div>
              <button
                className="header-control"
                onClick={() => {
                  setShowDeletePopup(false);
                  setDeleteConfirm("");
                }}
              >
                <Trash size={16} />
              </button>
            </div>
            <div className="tb-dialog-body">
              <p
                style={{
                  fontSize: 13,
                  color: "var(--tb-text-secondary)",
                  marginBottom: 12,
                }}
              >
                {t("privacy.typeDelete")}
              </p>
              <input
                className="form-input"
                value={deleteConfirm}
                onChange={(e) => setDeleteConfirm(e.target.value)}
                placeholder={t("privacy.typeDeletePh")}
                autoFocus
              />
              <input
                className="form-input"
                type="password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                placeholder="Enter password (if set)"
                style={{ marginTop: 10 }}
              />
              {deleteError && (
                <div style={{ marginTop: 10, fontSize: 12, color: "var(--tb-red, #ef4444)" }}>
                  {deleteError}
                </div>
              )}
            </div>
            <div className="tb-dialog-footer">
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => {
                  setShowDeletePopup(false);
                  setDeleteConfirm("");
                }}
              >
                {t("common.cancel")}
              </button>
              <button
                className="btn btn-danger btn-sm"
                disabled={deleteConfirm !== "DELETE" || deleting}
                onClick={handleDelete}
              >
                {deleting ? (
                  <>
                    <span className="btn-spinner" /> {t("privacy.deleting")}
                  </>
                ) : (
                  t("privacy.deleteAccount")
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
