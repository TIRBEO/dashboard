"use client";
import { useEffect, useState } from "react";
import { api, getCurrentUser } from "@/lib/api";
import { setDirtyGlobal } from "@/lib/unsaved";
import { Skeleton } from "@/components/ui/Skeleton";
import { useI18n } from "@/lib/i18n";
import { SUPPORTED_LANGS } from "@/lib/locales";
import { Check, Loader2, Settings, Globe, Clock, CalendarDays, Hourglass } from "lucide-react";

function PrefsSkeleton() {
  return (
    <div className="flex flex-col gap-6 max-w-[1200px] mx-auto">
      <div>
        <Skeleton width={180} height={24} className="mb-1.5" />
        <Skeleton width={280} height={14} />
      </div>
      <div className="rounded-2xl border border-tb-border bg-tb-surface-1">
        <Skeleton width={100} height={18} className="mx-6 mt-5 mb-4" />
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`flex items-center justify-between py-3 px-6 ${i < 3 ? 'border-b border-tb-border' : ''}`}
          >
            <Skeleton width={90} height={13} />
            <Skeleton width={280} height={38} borderRadius={10} />
          </div>
        ))}
      </div>
    </div>
  );
}

const TIMEZONE_OPTIONS = [
  { value: "UTC", labelKey: "prefs.timezoneUTC" },
  { value: "Asia/Kathmandu", labelKey: "prefs.kathmandu" },
  { value: "America/New_York", labelKey: "prefs.eastern" },
  { value: "America/Chicago", labelKey: "prefs.central" },
  { value: "America/Denver", labelKey: "prefs.mountain" },
  { value: "America/Los_Angeles", labelKey: "prefs.pacific" },
  { value: "Europe/London", labelKey: "prefs.london" },
  { value: "Europe/Berlin", labelKey: "prefs.berlin" },
  { value: "Asia/Tokyo", labelKey: "prefs.tokyo" },
  { value: "Asia/Shanghai", labelKey: "prefs.shanghai" },
  { value: "Asia/Kolkata", labelKey: "prefs.kolkata" },
];

export default function PreferencesPage() {
  const { t, setLang } = useI18n();
  const [user, setUser] = useState<any>(null);
  const [form, setForm] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCurrentUser()
      .then((u) => {
        setUser(u);
        setForm({
          language: u.language || "en",
          timezone: u.timezone || "UTC",
          dateFormat: u.dateFormat || "MM/DD/YYYY",
          timeFormat: u.timeFormat || "12h",
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const save = async (key?: string, value?: string) => {
    if (key && value) {
      setForm((prev) => ({ ...prev, [key]: value }));
      setDirtyGlobal(true);
    }
    setSaving(true);
    setSaved(false);
    const data = key ? { [key]: value } : form;
    try {
      await api.patch("/api/users/me", data);
      setSaved(true);
      setDirtyGlobal(false);
      setTimeout(() => setSaved(false), 2000);
    } catch {}
    setSaving(false);
  };

  if (loading) return <PrefsSkeleton />;

  const fields = [
    {
      key: "language",
      label: t("prefs.language"),
      icon: <Globe size={14} />,
      type: "select" as const,
      options: SUPPORTED_LANGS.map((l) => ({ value: l.code, label: l.label })),
      onChange: (v: string) => {
        setLang(v);
        save("language", v);
      },
    },
    {
      key: "timezone",
      label: t("prefs.timezone"),
      icon: <Clock size={14} />,
      type: "select" as const,
      options: TIMEZONE_OPTIONS.map((o) => ({ value: o.value, label: t(o.labelKey as any) })),
      onChange: (v: string) => save("timezone", v),
    },
    {
      key: "dateFormat",
      label: t("prefs.dateFormat"),
      icon: <CalendarDays size={14} />,
      type: "select" as const,
      options: [
        { value: "MM/DD/YYYY", label: "MM/DD/YYYY" },
        { value: "DD/MM/YYYY", label: "DD/MM/YYYY" },
        { value: "YYYY-MM-DD", label: "YYYY-MM-DD" },
      ],
      onChange: (v: string) => save("dateFormat", v),
    },
    {
      key: "timeFormat",
      label: t("prefs.timeFormat"),
      icon: <Hourglass size={14} />,
      type: "select" as const,
      options: [
        { value: "12h", label: t("prefs.h12") },
        { value: "24h", label: t("prefs.h24") },
      ],
      onChange: (v: string) => save("timeFormat", v),
    },
  ];

  return (
    <div className="flex flex-col gap-6 max-w-[1200px] mx-auto">
      {/* ── Page Header ── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="min-w-0">
          <h1 className="text-[24px] font-semibold text-tb-text-primary tracking-tight flex items-center gap-2.5">
            <Settings size={22} className="text-tb-text-muted" />
            {t("prefs.title")}
          </h1>
          <p className="text-sm text-tb-text-muted mt-1">{t("prefs.subtitle")}</p>
        </div>
        <span
          className={`inline-flex items-center gap-1.5 text-[13px] font-medium px-3 py-1 rounded-lg transition-all duration-200 ${saved ? 'bg-tb-green-soft text-tb-green border border-tb-green' : 'bg-tb-surface-2 text-tb-text-muted border border-tb-border'}`}
        >
           {saving ? <Loader2 size={12} className="animate-spin" /> : saved && <Check size={12} />}
          {saving ? t("common.saving") : saved ? t("common.saved") : t("common.autoSaved")}
        </span>
      </div>

      {/* ═══ General Settings Card ═══ */}
      <div className="rounded-2xl border border-tb-border bg-tb-surface-1 overflow-hidden">
        <div className="px-6 py-5 border-b border-tb-border">
          <h3 className="text-[16px] font-semibold text-tb-text-primary flex items-center gap-2.5">
            <Settings size={15} className="text-tb-text-muted" />
            {t("prefs.general")}
          </h3>
        </div>
        <div>
          {fields.map((f, i) => (
            <div
              key={f.key}
              className={`flex items-center justify-between gap-4 px-6 py-4 transition-all duration-100 hover:bg-tb-surface-2 ${i < fields.length - 1 ? 'border-b border-tb-border' : ''}`}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-tb-surface-3 text-tb-text-muted"
                >
                  {f.icon}
                </div>
                <span className="text-[15px] font-medium text-tb-text-primary">{f.label}</span>
              </div>
              <select
                className="h-9 rounded-lg px-3 text-sm border border-tb-border bg-tb-surface-2 text-tb-text-primary outline-none transition-all duration-150 hover:border-tb-border-strong focus:border-tb-border-strong focus:shadow-[0_0_0_2px_var(--tb-border)] cursor-pointer min-w-[180px]"
                value={form[f.key] || ""}
                onChange={(e) => f.onChange(e.target.value)}
              >
                {f.options.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          ))}
        </div>
      </div>

      {/* Note: Email preferences live in /account/notifications (single source of truth) */}
    </div>
  );
}
