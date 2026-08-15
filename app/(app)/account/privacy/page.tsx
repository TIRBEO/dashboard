"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getPreferences,
  updatePreferences,
  exportData,
  deleteAccount,
} from "@/lib/api";
import {
  AlertTriangle,
  BarChart3,
  Check,
  Download,
  Eye,
  FileText,
  Globe,
  Search,
  Shield,
  Trash,
  Zap,
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
  const [deleting, setDeleting] = useState(false);
  const [exporting, setExporting] = useState(false);

  const [privacy, setPrivacy] = useState({
    allowAnalytics: false,
    allowCrashReports: true,
    personalizedRecommendations: false,
    allowSearchEngines: true,
    showInDirectory: true,
  });

  useEffect(() => {
    getPreferences()
      .then((prefs: any) => {
        if (prefs?.privacy) {
          setPrivacy((prev) => ({
            ...prev,
            allowAnalytics: prefs.privacy.allowAnalytics ?? false,
            allowCrashReports: prefs.privacy.allowCrashReports ?? true,
            personalizedRecommendations:
              prefs.privacy.personalizedRecommendations ?? false,
            allowSearchEngines: prefs.privacy.allowSearchEngines ?? true,
            showInDirectory: prefs.privacy.showInDirectory ?? true,
          }));
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
      const result = await exportData();
      if (result?.downloadUrl) {
        window.open(result.downloadUrl, "_blank");
      }
    } catch {}
    setExporting(false);
  };

  const handleDelete = async () => {
    if (deleteConfirm !== "DELETE") return;
    setDeleting(true);
    try {
      await deleteAccount();
      window.location.href = "/";
    } catch {}
    setDeleting(false);
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
            ? Array.from({ length: 3 }).map((_, i) => (
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
                {
                  key: "personalizedRecommendations" as const,
                  label: t("privacy.personalizedRecs"),
                  desc: t("privacy.personalizedRecsDesc"),
                  icon: <Zap size={14} />,
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

      {/* Discoverability */}
      <div className="dashboard-card">
        <h3
          className="section-title"
          style={{ display: "flex", alignItems: "center", gap: 8 }}
        >
          <Globe size={15} />
          {t("privacy.discoverability")}
        </h3>
        <p className="section-desc">
          {t("privacy.discoverabilityDesc")}
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
                  key: "allowSearchEngines" as const,
                  label: t("privacy.searchEngine"),
                  desc: t("privacy.searchEngineDesc"),
                  icon: <Search size={14} />,
                },
                {
                  key: "showInDirectory" as const,
                  label: t("privacy.directory"),
                  desc: t("privacy.directoryDesc"),
                  icon: <Eye size={14} />,
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
          <button
            className="btn btn-danger btn-sm"
            onClick={() => setShowDeletePopup(true)}
          >
            <Trash size={14} /> {t("privacy.deleteAccount")}
          </button>
          <p
            style={{
              fontSize: 12,
              color: "var(--tb-text-muted)",
              marginTop: 8,
            }}
          >
            {t("privacy.irreversible")}
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
