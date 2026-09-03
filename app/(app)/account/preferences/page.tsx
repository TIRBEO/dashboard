"use client";

import { useEffect, useState } from "react";
import { api, getCurrentUser } from "@/lib/api";
import { setDirtyGlobal } from "@/lib/unsaved";
import { Skeleton } from "@/components/ui/Skeleton";
import { useI18n } from "@/lib/i18n";
import { SUPPORTED_LANGS } from "@/lib/locales";
import {
  Check,
  Loader2,
  Settings,
  Globe,
  Clock,
  CalendarDays,
  Hourglass,
  ChevronDown,
  Languages,
  MapPin,
  Calendar,
  Timer,
} from "lucide-react";

function PrefsSkeleton() {
  return (
    <div className="flex flex-col gap-6 max-w-[1200px] mx-auto">
      <div>
        <Skeleton width={180} height={24} className="mb-1.5" />
        <Skeleton width={280} height={14} />
      </div>

      <div className="rounded-2xl border border-tb-border bg-tb-surface-1 overflow-hidden">
        <div className="px-6 py-5 border-b border-tb-border">
          <Skeleton width={110} height={18} />
          <Skeleton width={260} height={12} className="mt-2" />
        </div>

        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`
              flex items-center justify-between
              gap-4 px-6 py-5
              ${i < 3 ? "border-b border-tb-border" : ""}
            `}
          >
            <div className="flex items-center gap-3">
              <Skeleton width={36} height={36} borderRadius={10} />
              <div>
                <Skeleton width={100} height={13} className="mb-1.5" />
                <Skeleton width={180} height={11} />
              </div>
            </div>

            <Skeleton
              width={190}
              height={38}
              borderRadius={9}
            />
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

type PreferenceField = {
  key: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  options: {
    value: string;
    label: string;
  }[];
};

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
          dateFormat:
            u.dateFormat || "MM/DD/YYYY",
          timeFormat:
            u.timeFormat || "12h",
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const save = async (
    key?: string,
    value?: string
  ) => {
    if (key && value !== undefined) {
      setForm((prev) => ({
        ...prev,
        [key]: value,
      }));

      setDirtyGlobal(true);
    }

    setSaving(true);
    setSaved(false);

    const data = key
      ? { [key]: value }
      : form;

    try {
      await api.patch(
        "/api/users/me",
        data
      );

      setSaved(true);
      setDirtyGlobal(false);

      window.setTimeout(() => {
        setSaved(false);
      }, 2000);
    } catch {
      // Keep UI state intact if saving fails.
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <PrefsSkeleton />;
  }

  const fields: PreferenceField[] = [
    {
      key: "language",
      label: t("prefs.language"),
      description:
        "Choose the language used throughout your account.",
      icon: <Languages size={16} />,
      options: SUPPORTED_LANGS.map(
        (language) => ({
          value: language.code,
          label: language.label,
        })
      ),
    },
    {
      key: "timezone",
      label: t("prefs.timezone"),
      description:
        "Used when displaying dates, times, and activity.",
      icon: <MapPin size={16} />,
      options: TIMEZONE_OPTIONS.map(
        (timezone) => ({
          value: timezone.value,
          label: t(
            timezone.labelKey as any
          ),
        })
      ),
    },
    {
      key: "dateFormat",
      label: t("prefs.dateFormat"),
      description:
        "Choose how calendar dates are displayed.",
      icon: <Calendar size={16} />,
      options: [
        {
          value: "MM/DD/YYYY",
          label: "MM/DD/YYYY",
        },
        {
          value: "DD/MM/YYYY",
          label: "DD/MM/YYYY",
        },
        {
          value: "YYYY-MM-DD",
          label: "YYYY-MM-DD",
        },
      ],
    },
    {
      key: "timeFormat",
      label: t("prefs.timeFormat"),
      description:
        "Choose between 12-hour and 24-hour time.",
      icon: <Timer size={16} />,
      options: [
        {
          value: "12h",
          label: t("prefs.h12"),
        },
        {
          value: "24h",
          label: t("prefs.h24"),
        },
      ],
    },
  ];

  return (
    <div className="flex flex-col gap-6 max-w-[1200px] mx-auto pb-8">

      {/* =========================================================
          HEADER
      ========================================================= */}
      <div className="flex items-start justify-between gap-5 flex-wrap">
        <div className="min-w-0">
          <div className="flex items-center gap-2.5">
            <div
              className="
                w-9 h-9
                rounded-xl
                border border-tb-border
                bg-tb-surface-2
                flex items-center justify-center
                text-tb-text-secondary
              "
            >
              <Settings size={17} />
            </div>

            <div>
              <h1 className="
                text-[24px]
                font-semibold
                tracking-tight
                text-tb-text-primary
                leading-tight
              ">
                {t("prefs.title")}
              </h1>

              <p className="
                text-[13.5px]
                text-tb-text-muted
                mt-1
              ">
                {t("prefs.subtitle")}
              </p>
            </div>
          </div>
        </div>

        {/* Save State */}
        <div
          className={`
            inline-flex
            items-center
            gap-1.5
            h-8
            px-3
            rounded-lg
            text-[12px]
            font-medium
            border
            transition-all
            duration-200
            ${
              saving
                ? `
                  bg-tb-surface-2
                  border-tb-border
                  text-tb-text-muted
                `
                : saved
                ? `
                  bg-tb-green-soft
                  border-tb-green
                  text-tb-green
                `
                : `
                  bg-tb-surface-2
                  border-tb-border
                  text-tb-text-muted
                `
            }
          `}
        >
          {saving ? (
            <>
              <Loader2
                size={12}
                className="animate-spin"
              />
              {t("common.saving")}
            </>
          ) : saved ? (
            <>
              <Check size={12} />
              {t("common.saved")}
            </>
          ) : (
            <>
              <Check size={12} />
              {t("common.autoSaved")}
            </>
          )}
        </div>
      </div>

      {/* =========================================================
          GENERAL PREFERENCES
      ========================================================= */}
      <section
        className="
          rounded-2xl
          border border-tb-border
          bg-tb-surface-1
          overflow-hidden
        "
      >
        {/* Section Header */}
        <div
          className="
            px-6
            py-5
            border-b border-tb-border
            bg-tb-surface-1
          "
        >
          <div className="flex items-center gap-3">
            <div
              className="
                w-9 h-9
                rounded-xl
                bg-tb-surface-3
                border border-tb-border
                flex items-center justify-center
                text-tb-text-muted
              "
            >
              <Settings size={16} />
            </div>

            <div>
              <h2 className="
                text-[15px]
                font-semibold
                text-tb-text-primary
              ">
                {t("prefs.general")}
              </h2>

              <p className="
                text-[12px]
                text-tb-text-muted
                mt-0.5
              ">
                Customize how your account displays
                information.
              </p>
            </div>
          </div>
        </div>

        {/* Preference Rows */}
        <div>
          {fields.map((field, index) => {
            const currentValue =
              form[field.key] || "";

            return (
              <div
                key={field.key}
                className={`
                  group
                  flex
                  items-center
                  justify-between
                  gap-8
                  px-6
                  py-5
                  transition-colors
                  duration-150
                  hover:bg-tb-surface-2
                  ${
                    index <
                    fields.length - 1
                      ? "border-b border-tb-border"
                      : ""
                  }
                `}
              >
                {/* Left */}
                <div
                  className="
                    flex
                    items-center
                    gap-3.5
                    min-w-0
                  "
                >
                  <div
                    className="
                      w-9 h-9
                      rounded-xl
                      shrink-0
                      flex
                      items-center
                      justify-center
                      bg-tb-surface-3
                      border border-tb-border
                      text-tb-text-muted
                      transition-all
                      duration-150
                      group-hover:text-tb-text-secondary
                    "
                  >
                    {field.icon}
                  </div>

                  <div className="min-w-0">
                    <div className="
                      text-[14px]
                      font-medium
                      text-tb-text-primary
                    ">
                      {field.label}
                    </div>

                    <div className="
                      text-[12px]
                      text-tb-text-muted
                      mt-0.5
                      leading-[1.45]
                    ">
                      {field.description}
                    </div>
                  </div>
                </div>

                {/* Select */}
                <div className="
                  relative
                  shrink-0
                  w-[210px]
                ">
                  <select
                    value={currentValue}
                    onChange={(e) => {
                      const value =
                        e.target.value;

                      if (
                        field.key ===
                        "language"
                      ) {
                        setLang(value);
                      }

                      void save(
                        field.key,
                        value
                      );
                    }}
                    className="
                      appearance-none
                      w-full
                      h-10
                      rounded-xl
                      pl-3.5
                      pr-9
                      text-[13px]
                      font-medium
                      border
                      border-tb-border
                      bg-tb-surface-2
                      text-tb-text-primary
                      outline-none
                      cursor-pointer
                      transition-all
                      duration-150
                      hover:border-tb-border-strong
                      hover:bg-tb-surface-3
                      focus:border-tb-border-strong
                      focus:ring-2
                      focus:ring-tb-border
                    "
                  >
                    {field.options.map(
                      (option) => (
                        <option
                          key={option.value}
                          value={option.value}
                        >
                          {option.label}
                        </option>
                      )
                    )}
                  </select>

                  <ChevronDown
                    size={14}
                    className="
                      pointer-events-none
                      absolute
                      right-3
                      top-1/2
                      -translate-y-1/2
                      text-tb-text-muted
                    "
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* =========================================================
          INFORMATION FOOTER
      ========================================================= */}
      <div
        className="
          rounded-xl
          border border-tb-border
          bg-tb-surface-2
          px-5
          py-4
          flex
          items-start
          gap-3
        "
      >
        <div
          className="
            w-8 h-8
            rounded-lg
            shrink-0
            bg-tb-surface-3
            border border-tb-border
            flex items-center justify-center
            text-tb-text-muted
          "
        >
          <Clock size={14} />
        </div>

        <div>
          <p className="
            text-[13px]
            font-medium
            text-tb-text-primary
          ">
            {t("prefs.timezone")}
          </p>

          <p className="
            text-[12px]
            text-tb-text-muted
            mt-0.5
            leading-relaxed
          ">
            Your timezone and formatting preferences
            are automatically applied across your
            account.
          </p>
        </div>
      </div>

      {/* Email preferences intentionally remain
          under /account/notifications */}
    </div>
  );
}