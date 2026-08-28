"use client";
import { useEffect, useState } from "react";
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
  Shield,
} from "lucide-react";
import { Skeleton } from "@/components/ui/Skeleton";
import { Switch } from "@/components/ui/switch";
import { useI18n } from "@/lib/i18n";

export default function PrivacyPage() {
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
  const [scheduledDeletion, setScheduledDeletion] = useState<string | null>(
    null
  );
  const [cancelling, setCancelling] = useState(false);

  const [privacy, setPrivacy] = useState({
    allowAnalytics: false,
    allowCrashReports: true,
  });

  useEffect(() => {
    Promise.all([
      getPreferences().catch(() => null),
      fetch(`${API}/api/users/me`, { credentials: "include" })
        .then((r) => r.json())
        .catch(() => null),
    ])
      .then(([prefs, user]: [any, any]) => {
        // API returns: { ok: true, preferences: { privacy: { allowAnalytics, allowCrashReports } } }
        // Also handle flat response or nested consents from /api/users/me
        const p =
          prefs?.preferences?.privacy ||
          prefs?.privacy ||
          prefs?.consents ||
          {};
        setPrivacy((prev) => ({
          allowAnalytics: p.allowAnalytics ?? user?.consents?.allowAnalytics ?? prev.allowAnalytics,
          allowCrashReports: p.allowCrashReports ?? user?.consents?.allowCrashReports ?? prev.allowCrashReports,
        }));
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
    } catch {
      // revert on error
      try {
        const p = await getPreferences();
        const restored = p?.preferences?.privacy || p?.privacy || {};
        setPrivacy({
          allowAnalytics: restored.allowAnalytics ?? false,
          allowCrashReports: restored.allowCrashReports ?? true,
        });
      } catch {}
    }
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

  const consentItems = [
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
      icon: <Shield size={14} />,
    },
  ];

  return (
    <div className="mx-auto max-w-[720px] px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-[20px] font-semibold tracking-tight text-[var(--tb-text-primary)]">
            {t("privacy.title")}
          </h1>
          <p className="text-[12px] text-[var(--tb-text-muted)] mt-1">
            {t("privacy.subtitle")}
          </p>
        </div>
        <div className="flex items-center gap-2 text-[12px]">
          {saving && (
            <span className="text-[var(--tb-text-muted)]">
              {t("common.saving")}
            </span>
          )}
          {saved && (
            <span className="inline-flex items-center gap-1 text-[var(--tb-green)]">
              <Check size={13} /> {t("common.saved")}
            </span>
          )}
        </div>
      </div>

      {/* Scheduled deletion banner */}
      {scheduledDeletion && (
        <div className="mt-4 flex items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3">
          <AlertTriangle
            size={16}
            className="text-red-500 shrink-0"
          />
          <div className="flex-1 min-w-0">
            <div className="text-[13px] font-semibold text-red-500">
              Account scheduled for deletion
            </div>
            <div className="text-[12px] text-red-500/70 mt-0.5">
              Your account will be permanently deleted on{" "}
              {new Date(scheduledDeletion).toLocaleDateString()}. All your data
              will be removed.
            </div>
          </div>
          <button
            type="button"
            onClick={handleCancelDeletion}
            disabled={cancelling}
            className="h-8 rounded-full bg-red-500 px-4 text-[12px] font-medium text-white hover:bg-red-600 disabled:opacity-50 whitespace-nowrap shrink-0"
          >
            {cancelling ? "Cancelling..." : "Cancel Deletion"}
          </button>
        </div>
      )}

      {/* ═══ Data & Analytics ═══ */}
      <div className="mt-6 rounded-xl border border-[var(--tb-border)] bg-[var(--tb-surface-1)] overflow-hidden">
        <div className="px-5 py-4 border-b border-[var(--tb-border)]">
          <h3 className="flex items-center gap-2 text-[13px] font-semibold text-[var(--tb-text-primary)]">
            <BarChart3 size={14} className="text-[var(--tb-text-muted)]" />{" "}
            Data & analytics
          </h3>
          <p className="text-[12px] text-[var(--tb-text-muted)] mt-1">
            {t("privacy.dataAnalytics")}
          </p>
        </div>

        <div className="divide-y divide-[var(--tb-border)]">
          {loading
            ? Array.from({ length: 2 }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between px-5 py-4"
                >
                  <div className="space-y-1.5">
                    <Skeleton width={140} height={12} />
                    <Skeleton width={240} height={10} />
                  </div>
                  <Skeleton width={36} height={20} borderRadius={999} />
                </div>
              ))
            : consentItems.map((item) => (
                <label
                  key={item.key}
                  className="flex items-center justify-between gap-4 px-5 py-4 cursor-pointer hover:bg-[var(--tb-surface-2)]/50 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="grid h-8 w-8 place-items-center rounded-lg border border-[var(--tb-border)] bg-[var(--tb-surface-2)] text-[var(--tb-text-muted)] shrink-0">
                      {item.icon}
                    </span>
                    <div className="min-w-0">
                      <div className="text-[13px] font-medium text-[var(--tb-text-primary)]">
                        {item.label}
                      </div>
                      <div className="text-[11px] leading-4 text-[var(--tb-text-muted)]">
                        {item.desc}
                      </div>
                    </div>
                  </div>
                  <Switch
                    checked={privacy[item.key]}
                    onCheckedChange={(v) =>
                      save({ ...privacy, [item.key]: v })
                    }
                  />
                </label>
              ))}
        </div>

        <div className="px-5 py-2.5 bg-[var(--tb-surface-2)]/50 border-t border-[var(--tb-border)] text-[11px] text-[var(--tb-text-muted)]">
          Changes save automatically · Stored in{" "}
          <code className="px-1 py-0.5 rounded bg-[var(--tb-surface-1)] border border-[var(--tb-border)] text-[10px]">
            users.consents
          </code>
        </div>
      </div>

      {/* ═══ Data Export ═══ */}
      <div className="mt-4 rounded-xl border border-[var(--tb-border)] bg-[var(--tb-surface-1)] px-5 py-4">
        <h3 className="flex items-center gap-2 text-[13px] font-semibold text-[var(--tb-text-primary)]">
          <Download size={14} className="text-[var(--tb-text-muted)]" />{" "}
          {t("privacy.dataExport")}
        </h3>
        <p className="text-[12px] text-[var(--tb-text-muted)] mt-1">
          {t("privacy.dataExportDesc")}
        </p>
        <button
          onClick={handleExport}
          disabled={exporting}
          className="mt-3 inline-flex items-center gap-1.5 h-8 rounded-full border border-[var(--tb-border)] bg-[var(--tb-surface-2)] px-4 text-[12px] font-medium text-[var(--tb-text-secondary)] hover:bg-[var(--tb-surface-3)] hover:text-[var(--tb-text-primary)] disabled:opacity-50 transition-colors"
        >
          <Download size={13} />
          {exporting ? t("privacy.preparing") : t("privacy.exportData")}
        </button>
        <p className="text-[11px] text-[var(--tb-text-muted)] mt-2">
          {t("privacy.exportNote")}
        </p>
      </div>

      {/* ═══ Danger Zone ═══ */}
      <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/[0.04] px-5 py-4">
        <h3 className="flex items-center gap-2 text-[13px] font-semibold text-red-500">
          <Trash size={14} /> {t("privacy.dangerZone")}
        </h3>
        <p className="text-[12px] text-[var(--tb-text-muted)] mt-1">
          {t("privacy.dangerZoneDesc")}
        </p>
        <div className="mt-3">
          {scheduledDeletion ? (
            <div className="text-[12px] text-red-500/70">
              Account deletion is scheduled. You can only cancel it above.
            </div>
          ) : (
            <button
              onClick={() => setShowDeletePopup(true)}
              className="inline-flex items-center gap-1.5 h-8 rounded-full bg-red-500 px-4 text-[12px] font-medium text-white hover:bg-red-600 transition-colors"
            >
              <Trash size={13} /> {t("privacy.deleteAccount")}
            </button>
          )}
          <p className="text-[11px] text-[var(--tb-text-muted)] mt-2">
            {scheduledDeletion
              ? "Your account will be permanently deleted and all data removed."
              : t("privacy.irreversible")}
          </p>
        </div>
      </div>

      {/* ═══ Delete Account Dialog ═══ */}
      {showDeletePopup && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => {
            setShowDeletePopup(false);
            setDeleteConfirm("");
          }}
        >
          <div
            className="w-full max-w-[420px] rounded-2xl border border-[var(--tb-border)] bg-[var(--tb-surface-1)] p-5 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-[14px] font-semibold text-red-500">
              {t("privacy.deleteAccount")}
            </h3>
            <p className="text-[12px] text-[var(--tb-text-muted)] mt-1">
              {t("privacy.irreversible")}
            </p>

            <p className="text-[12px] text-[var(--tb-text-secondary)] mt-4">
              {t("privacy.typeDelete")}
            </p>
            <input
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
              placeholder={t("privacy.typeDeletePh")}
              autoFocus
              className="mt-2 h-9 w-full rounded-lg border border-[var(--tb-border)] bg-[var(--tb-input)] px-3 text-[13px] text-[var(--tb-text-primary)] outline-none focus:border-[var(--tb-border-strong)] transition-colors"
            />
            <input
              type="password"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
              placeholder="Enter password (if set)"
              className="mt-2 h-9 w-full rounded-lg border border-[var(--tb-border)] bg-[var(--tb-input)] px-3 text-[13px] text-[var(--tb-text-primary)] outline-none focus:border-[var(--tb-border-strong)] transition-colors"
            />
            {deleteError && (
              <div className="mt-2 text-[12px] text-red-500">
                {deleteError}
              </div>
            )}
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowDeletePopup(false);
                  setDeleteConfirm("");
                }}
                className="h-8 rounded-full border border-[var(--tb-border)] bg-[var(--tb-surface-2)] px-4 text-[12px] text-[var(--tb-text-secondary)] hover:bg-[var(--tb-surface-3)] transition-colors"
              >
                {t("common.cancel")}
              </button>
              <button
                disabled={deleteConfirm !== "DELETE" || deleting}
                onClick={handleDelete}
                className="h-8 rounded-full bg-red-500 px-4 text-[12px] font-medium text-white disabled:opacity-40 hover:bg-red-600 transition-colors"
              >
                {deleting ? t("privacy.deleting") : t("privacy.deleteAccount")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
