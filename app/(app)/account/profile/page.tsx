"use client";

import { useEffect, useRef, useState } from "react";
import { api, getCurrentUser } from "@/lib/api";
import { setDirtyGlobal } from "@/lib/unsaved";
import {
  Camera,
  User,
  Briefcase,
  Link2,
  Info,
  Check,
  AlertCircle,
  Loader2,
  Pencil,
  Shield,
  Calendar,
  Globe,
  Mail,
  ChevronRight,
} from "lucide-react";
import { Skeleton } from "@/components/ui/Skeleton";
import { useI18n } from "@/lib/i18n";

function ProfileSkeleton() {
  return (
    <div className="mx-auto w-full max-w-[1100px] space-y-8">
      <div className="space-y-2">
        <Skeleton width={180} height={30} />
        <Skeleton width={300} height={16} />
      </div>

      <div className="rounded-3xl border border-tb-border bg-tb-surface-1 p-6 sm:p-8">
        <div className="flex items-center gap-5">
          <Skeleton width={88} height={88} borderRadius="50%" />
          <div className="space-y-2">
            <Skeleton width={180} height={22} />
            <Skeleton width={220} height={15} />
          </div>
        </div>
      </div>

      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="rounded-3xl border border-tb-border bg-tb-surface-1 p-6"
        >
          <Skeleton width={130} height={20} />
          <div className="mt-6 space-y-5">
            <Skeleton width="100%" height={44} borderRadius={10} />
            <Skeleton width="100%" height={44} borderRadius={10} />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function ProfilePage() {
  const { t } = useI18n();

  const [user, setUser] = useState<any>(null);
  const [form, setForm] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [avatarError, setAvatarError] = useState("");
  const [saveError, setSaveError] = useState("");
  const [imgFailed, setImgFailed] = useState(false);

  const [unameStatus, setUnameStatus] = useState<
    "idle" | "checking" | "available" | "taken" | "reserved" | "invalid"
  >("idle");

  const originalUsername = useRef("");
  const fileRef = useRef<HTMLInputElement>(null);
  const unameCheckTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    getCurrentUser()
      .then((u) => {
        setUser(u);
        setImgFailed(false);
        originalUsername.current = (u.username || "").toLowerCase();

        setForm({
          name: u.name || "",
          username: u.username || "",
          bio: u.bio || "",
          gender: u.gender || "",
          birthday: u.birthday ? u.birthday.split("T")[0] : "",
          country: u.country || "",
          occupation: u.occupation || "",
          companyName: u.companyName || "",
          companyRole: u.companyRole || "",
          industry: u.industry || "",
          companySize: u.companySize || "",
          website: u.website || "",
          linkedin: u.linkedin || "",
          githubUsername: u.githubUsername || "",
          twitter: u.twitter || "",
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (unameCheckTimer.current) {
      clearTimeout(unameCheckTimer.current);
    }

    const uname = (form.username || "").toLowerCase().trim();

    if (!uname || uname === originalUsername.current) {
      setUnameStatus("idle");
      return;
    }

    if (!/^[a-zA-Z0-9_-]{3,20}$/.test(uname)) {
      setUnameStatus("invalid");
      return;
    }

    setUnameStatus("checking");

    unameCheckTimer.current = setTimeout(() => {
      api
        .get<{
          available?: boolean;
          taken?: boolean;
          reserved?: boolean;
        }>(
          `/api/profile/check-username?username=${encodeURIComponent(uname)}`
        )
        .then((r) => {
          setUnameStatus(
            r.available
              ? "available"
              : r.taken
                ? "taken"
                : r.reserved
                  ? "reserved"
                  : "available"
          );
        })
        .catch(() => setUnameStatus("idle"));
    }, 500);

    return () => {
      if (unameCheckTimer.current) {
        clearTimeout(unameCheckTimer.current);
      }
    };
  }, [form.username]);

  const unameBlocked =
    unameStatus === "taken" ||
    unameStatus === "reserved" ||
    unameStatus === "invalid";

  const updateField = (key: string, value: string) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));

    setDirtyGlobal(true);
    setSaved(false);
  };

  const save = async () => {
    if (!form.name?.trim()) {
      setSaveError(t("profile.errorNameRequired"));
      return;
    }

    setSaving(true);
    setSaveError("");
    setSaved(false);

    try {
      const clean: Record<string, any> = {};

      for (const [key, value] of Object.entries(form)) {
        if (key === "secondaryEmail" && (!value || !value.trim())) continue;
        if (key === "website" && value && !value.trim()) continue;

        if (key === "name") {
          clean[key] = value;
          continue;
        }

        if (value !== undefined && value !== null) {
          clean[key] = value;
        }
      }

      await api.patch("/api/profile", clean);

      setUser((prev: any) => ({
        ...prev,
        ...form,
      }));

      window.dispatchEvent(
        new CustomEvent("tb:user-updated", {
          detail: form,
        })
      );

      setSaved(true);
      setDirtyGlobal(false);

      setTimeout(() => {
        setSaved(false);
      }, 3000);
    } catch (err: any) {
      setSaveError(
        err?.message || t("profile.errorSaveFailed")
      );
    }

    setSaving(false);
  };

  const uploadAvatar = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    if (!file) return;

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      setAvatarError(t("profile.errorInvalidImageType"));

      if (fileRef.current) {
        fileRef.current.value = "";
      }

      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setAvatarError(t("profile.errorImageTooLarge"));

      if (fileRef.current) {
        fileRef.current.value = "";
      }

      return;
    }

    setUploading(true);
    setAvatarError("");

    try {
      const formData = new FormData();
      formData.append("avatar", file);

      const data = await api.request<{
        photoUrl?: string;
        url?: string;
      }>("/api/profile/avatar", {
        method: "POST",
        body: formData,
      });

      const newUrl = data?.photoUrl || data?.url;

      if (newUrl) {
        setImgFailed(false);

        setUser((prev: any) => ({
          ...prev,
          photoUrl: newUrl,
        }));

        window.dispatchEvent(
          new CustomEvent("tb:user-updated", {
            detail: {
              photoUrl: newUrl,
            },
          })
        );
      } else {
        setAvatarError(t("profile.errorUploadUrl"));
      }
    } catch (err: any) {
      const msg = err?.message || "";

      if (
        msg.includes("CORS") ||
        msg.includes("NetworkError") ||
        msg.includes("Failed to fetch")
      ) {
        setAvatarError(t("profile.errorNetwork"));
      } else if (
        msg.includes("413") ||
        msg.includes("too large") ||
        msg.includes("5MB")
      ) {
        setAvatarError(t("profile.errorImageTooLarge"));
      } else if (
        msg.includes("415") ||
        msg.includes("Unsupported") ||
        msg.includes("type")
      ) {
        setAvatarError(t("profile.errorInvalidImageType"));
      } else {
        setAvatarError(
          msg || t("profile.errorUploadGeneric")
        );
      }
    }

    setUploading(false);

    if (fileRef.current) {
      fileRef.current.value = "";
    }
  };

  if (loading) {
    return <ProfileSkeleton />;
  }

  const initialsOf = (
    name: string | null | undefined
  ) => {
    if (!name) return "?";

    const parts = name.trim().split(/\s+/);

    return parts.length === 1
      ? parts[0].slice(0, 2).toUpperCase()
      : (
          parts[0][0] +
          parts[parts.length - 1][0]
        ).toUpperCase();
  };

  const sections = [
    {
      title: t("profile.personal"),
      description: "Your basic personal information.",
      icon: <User size={17} />,
      fields: [
        {
          key: "name",
          label: t("profile.fullName"),
          placeholder: t("profile.fullNamePh"),
        },
        {
          key: "username",
          label: t("profile.username"),
          placeholder: t("profile.usernamePh"),
        },
        {
          key: "bio",
          label: t("profile.bio"),
          placeholder: t("profile.bioPh"),
          type: "textarea",
        },
        {
          key: "gender",
          label: t("profile.gender"),
          type: "select",
          options: [
            {
              value: "",
              label: t("profile.selectOption"),
            },
            {
              value: "male",
              label: t("profile.male"),
            },
            {
              value: "female",
              label: t("profile.female"),
            },
            {
              value: "other",
              label: t("profile.other"),
            },
            {
              value: "prefer-not-to-say",
              label: t("profile.preferNot"),
            },
          ],
        },
        {
          key: "birthday",
          label: t("profile.birthday"),
          type: "date",
        },
        {
          key: "country",
          label: t("profile.country"),
          placeholder: t("profile.countryPh"),
        },
      ],
    },
    {
      title: t("profile.work"),
      description: "Tell people what you do.",
      icon: <Briefcase size={17} />,
      fields: [
        {
          key: "occupation",
          label: t("profile.occupation"),
          placeholder: t("profile.occupationPh"),
        },
        {
          key: "companyName",
          label: t("profile.company"),
          placeholder: t("profile.companyPh"),
        },
        {
          key: "companyRole",
          label: t("profile.role"),
          placeholder: t("profile.roleAtCompanyPh"),
        },
        {
          key: "industry",
          label: t("profile.industry"),
          placeholder: t("profile.industryPh"),
        },
        {
          key: "companySize",
          label: t("profile.companySize"),
          type: "select",
          options: [
            {
              value: "",
              label: t("profile.selectOption"),
            },
            {
              value: "1",
              label: t("profile.justMe"),
            },
            {
              value: "2-10",
              label: "2–10",
            },
            {
              value: "11-50",
              label: "11–50",
            },
            {
              value: "51-200",
              label: "51–200",
            },
            {
              value: "201-1000",
              label: "201–1,000",
            },
            {
              value: "1001+",
              label: "1,001+",
            },
          ],
        },
      ],
    },
    {
      title: t("profile.links"),
      description: "Connect your public profiles.",
      icon: <Link2 size={17} />,
      fields: [
        {
          key: "website",
          label: t("profile.website"),
          placeholder: t("profile.websitePh"),
        },
        {
          key: "linkedin",
          label: t("profile.linkedin"),
          placeholder: t("profile.linkedinPh"),
        },
        {
          key: "githubUsername",
          label: t("profile.github"),
          placeholder: t("profile.githubPh"),
        },
        {
          key: "twitter",
          label: t("profile.twitter"),
          placeholder: t("profile.twitterPh"),
        },
      ],
    },
  ];

  const fieldCls = `
    w-full
    min-h-[46px]
    rounded-xl
    border
    border-tb-border
    bg-tb-input
    px-3.5
    text-sm
    text-tb-text-primary
    outline-none
    transition
    placeholder:text-tb-text-muted
    focus:border-tb-brand
    focus:ring-2
    focus:ring-tb-brand/10
  `;

  return (
    <div className="mx-auto w-full max-w-[1100px] pb-28">

      {/* HEADER */}
      <header className="mb-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-3 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.16em] text-tb-text-muted">
              <User size={14} />
              Account
            </div>

            <h1 className="text-3xl font-semibold tracking-[-0.045em] sm:text-4xl">
              {t("profile.title")}
            </h1>

            <p className="mt-2 max-w-lg text-sm leading-6 text-tb-text-muted">
              {t("profile.subtitle")}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {saved && (
              <span className="flex items-center gap-1.5 text-xs font-medium text-tb-green">
                <Check size={14} />
                {t("common.saved")}
              </span>
            )}

            <button
              onClick={save}
              disabled={saving || unameBlocked}
              className="
                inline-flex
                h-10
                items-center
                gap-2
                rounded-xl
                px-4
                text-sm
                font-semibold
                transition
                hover:opacity-90
                disabled:cursor-not-allowed
                disabled:opacity-40
                cursor-pointer
              "
            >
              {saving ? (
                <Loader2
                  size={15}
                  className="animate-spin"
                />
              ) : (
                <Pencil size={14} />
              )}

              {saving
                ? t( "Saving...")
                : t("Save changes")}
            </button>
          </div>
        </div>
      </header>


      {/* SAVE ERROR */}
      {saveError && (
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-[rgba(232,93,106,0.2)] bg-tb-red-soft px-4 py-3 text-sm text-tb-red">
          <AlertCircle
            size={16}
            className="mt-0.5 shrink-0"
          />
          <span>{saveError}</span>
        </div>
      )}

      {/* PROFILE HERO */}
      <section className="mb-8 overflow-hidden rounded-3xl border border-tb-border bg-tb-surface-1">
        <div className="h-20 bg-gradient-to-r from-tb-surface-2 via-tb-surface-3 to-tb-surface-2" />

        <div className="-mt-10 px-5 pb-6 sm:px-8 sm:pb-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end">

            {/* Avatar */}
            <div className="relative shrink-0">
              <div
                onClick={() => fileRef.current?.click()}
                className="
                  flex
                  h-24
                  w-24
                  cursor-pointer
                  items-center
                  justify-center
                  overflow-hidden
                  rounded-full
                  border-4
                  border-tb-surface-1
                  bg-tb-surface-3
                  text-2xl
                  font-semibold
                  text-tb-text-muted
                  shadow-sm
                  transition
                  hover:opacity-90
                "
              >
                {user?.photoUrl && !imgFailed ? (
                  <img
                    src={user.photoUrl}
                    alt=""
                    className="h-full w-full object-cover"
                    onError={() => setImgFailed(true)}
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  initialsOf(
                    user?.name ?? user?.email
                  )
                )}
              </div>

              <button
                onClick={() =>
                  fileRef.current?.click()
                }
                disabled={uploading}
                aria-label="Change profile photo"
                className="
                  absolute
                  bottom-0
                  right-0
                  flex
                  h-8
                  w-8
                  items-center
                  justify-center
                  rounded-full
                  border-2
                  border-tb-surface-1
                  bg-tb-surface-2
                  text-tb-text-muted
                  shadow-sm
                  transition
                  hover:text-tb-text-primary
                "
              >
                {uploading ? (
                  <Loader2
                    size={13}
                    className="animate-spin"
                  />
                ) : (
                  <Camera size={14} />
                )}
              </button>

              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                onChange={uploadAvatar}
                className="hidden"
              />
            </div>

            {/* Identity */}
            <div className="min-w-0 flex-1 pb-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-semibold tracking-[-0.025em]">
                  {user?.name ||
                    t("profile.noNameSet")}
                </h2>

                {user?.isVerified && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-tb-green-soft px-2 py-1 text-[10px] font-semibold text-tb-green">
                    <Check size={10} />
                    {t("profile.verified")}
                  </span>
                )}
              </div>

              <p className="mt-1 text-sm text-tb-text-muted">
                {user?.email}
              </p>

              {user?.username && (
                <p className="mt-2 text-xs text-tb-text-muted">
                  @{user.username}
                </p>
              )}
            </div>
          </div>

          {avatarError && (
            <div className="mt-4 text-xs text-tb-red">
              {avatarError}
            </div>
          )}
        </div>
      </section>

      {/* FORM SECTIONS */}
      <div className="space-y-6">
        {sections.map((section) => (
          <section
            key={section.title}
            className="
              overflow-hidden
              rounded-3xl
              border
              border-tb-border
              bg-tb-surface-1
            "
          >
            {/* Section header */}
            <div className="border-b border-tb-border px-5 py-5 sm:px-7">
              <div className="flex items-start gap-3">
                <div className="
                  flex
                  h-9
                  w-9
                  shrink-0
                  items-center
                  justify-center
                  rounded-xl
                  bg-tb-surface-2
                  text-tb-text-muted
                ">
                  {section.icon}
                </div>

                <div>
                  <h3 className="text-sm font-semibold">
                    {section.title}
                  </h3>

                  <p className="mt-1 text-xs text-tb-text-muted">
                    {section.description}
                  </p>
                </div>
              </div>
            </div>

            {/* Fields */}
            <div>
              {section.fields.map((field, index) => (
                <div
                  key={field.key}
                  className={`
                    grid
                    grid-cols-1
                    gap-2
                    px-5
                    py-4
                    sm:grid-cols-[180px_minmax(0,1fr)]
                    sm:items-start
                    sm:gap-8
                    sm:px-7
                    ${
                      index !== section.fields.length - 1
                        ? "border-b border-tb-border"
                        : ""
                    }
                  `}
                >
                  <label className="pt-2 text-sm font-medium text-tb-text-primary">
                    {field.label}
                  </label>

                  <div className="min-w-0">
                    {field.type === "textarea" ? (
                      <textarea
                        className={`${fieldCls} min-h-[110px] resize-y py-3 leading-6`}
                        value={form[field.key] || ""}
                        onChange={(e) =>
                          updateField(
                            field.key,
                            e.target.value
                          )
                        }
                        placeholder={field.placeholder}
                        rows={4}
                      />
                    ) : field.type === "select" ? (
                      <select
                        className={`${fieldCls} cursor-pointer`}
                        value={form[field.key] || ""}
                        onChange={(e) =>
                          updateField(
                            field.key,
                            e.target.value
                          )
                        }
                      >
                        {field.options?.map(
                          (option: any) => (
                            <option
                              key={option.value}
                              value={option.value}
                            >
                              {option.label}
                            </option>
                          )
                        )}
                      </select>
                    ) : field.type === "date" ? (
                      <input
                        type="date"
                        className={`${fieldCls} cursor-pointer`}
                        value={form[field.key] || ""}
                        onChange={(e) =>
                          updateField(
                            field.key,
                            e.target.value
                          )
                        }
                      />
                    ) : (
                      <>
                        <input
                          className={`
                            ${fieldCls}
                            ${
                              field.key === "username" &&
                              unameStatus === "taken"
                                ? "!border-tb-red"
                                : ""
                            }
                            ${
                              field.key === "username" &&
                              unameStatus === "reserved"
                                ? "!border-tb-red"
                                : ""
                            }
                            ${
                              field.key === "username" &&
                              unameStatus === "invalid"
                                ? "!border-tb-red"
                                : ""
                            }
                            ${
                              field.key === "username" &&
                              unameStatus === "available"
                                ? "!border-tb-green"
                                : ""
                            }
                          `}
                          value={
                            form[field.key] || ""
                          }
                          onChange={(e) =>
                            updateField(
                              field.key,
                              e.target.value
                            )
                          }
                          placeholder={
                            field.placeholder
                          }
                        />

                        {field.key ===
                          "username" &&
                          unameStatus !==
                            "idle" && (
                            <div className="mt-2 flex items-center gap-1.5 text-xs">
                              {unameStatus ===
                                "checking" && (
                                <>
                                  <Loader2
                                    size={12}
                                    className="animate-spin text-tb-text-muted"
                                  />
                                  <span className="text-tb-text-muted">
                                    {t(
                                      "profile.usernameChecking"
                                    )}
                                  </span>
                                </>
                              )}

                              {unameStatus ===
                                "available" && (
                                <>
                                  <Check
                                    size={12}
                                    className="text-tb-green"
                                  />
                                  <span className="text-tb-green">
                                    {t(
                                      "profile.usernameAvailable"
                                    )}
                                  </span>
                                </>
                              )}

                              {(
                                [
                                  "taken",
                                  "reserved",
                                  "invalid",
                                ] as const
                              ).includes(
                                unameStatus as any
                              ) && (
                                <>
                                  <AlertCircle
                                    size={12}
                                    className="text-tb-red"
                                  />
                                  <span className="text-tb-red">
                                    {t(
                                      unameStatus ===
                                        "taken"
                                        ? "profile.usernameTaken"
                                        : unameStatus ===
                                            "reserved"
                                          ? "profile.usernameReserved"
                                          : "profile.usernameInvalid"
                                    )}
                                  </span>
                                </>
                              )}
                            </div>
                          )}
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>

      {/* ACCOUNT INFO */}
      <section className="mt-6 overflow-hidden rounded-3xl border border-tb-border bg-tb-surface-1">
        <div className="border-b border-tb-border px-5 py-5 sm:px-7">
          <div className="flex items-center gap-3">
            <div className="
              flex
              h-9
              w-9
              items-center
              justify-center
              rounded-xl
              bg-tb-surface-2
              text-tb-text-muted
            ">
              <Info size={17} />
            </div>

            <div>
              <h3 className="text-sm font-semibold">
                {t("profile.accountInfo")}
              </h3>

              <p className="mt-1 text-xs text-tb-text-muted">
                Account and security information.
              </p>
            </div>
          </div>
        </div>

        <div>
          {[
            {
              label: t("profile.email"),
              icon: <Mail size={13} />,
              value: user?.email,
              verified: user?.emailVerified,
            },
            user?.secondaryEmail
              ? {
                  label: t(
                    "profile.recoveryEmail"
                  ),
                  icon: <Mail size={13} />,
                  value: user.secondaryEmail,
                  verified:
                    user.secondaryEmailVerified,
                }
              : null,
            {
              label: t("profile.memberSince"),
              icon: <Calendar size={13} />,
              value: user?.createdAt
                ? new Date(
                    user.createdAt
                  ).toLocaleDateString(
                    undefined,
                    {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    }
                  )
                : "—",
            },
            {
              label: t("profile.lastActive"),
              icon: <Globe size={13} />,
              value: user?.lastActiveAt
                ? new Date(
                    user.lastActiveAt
                  ).toLocaleString()
                : "—",
            },
          ]
            .filter(Boolean)
            .map((row: any, index) => (
              <div
                key={index}
                className="
                  grid
                  grid-cols-1
                  gap-2
                  border-b
                  border-tb-border
                  px-5
                  py-4
                  sm:grid-cols-[180px_minmax(0,1fr)]
                  sm:gap-8
                  sm:px-7
                "
              >
                <div className="flex items-center gap-2 text-sm font-medium">
                  <span className="text-tb-text-muted">
                    {row.icon}
                  </span>
                  {row.label}
                </div>

                <div className="min-w-0">
                  <div className="break-all font-mono text-sm text-tb-text-primary">
                    {row.value}
                  </div>

                  {row.verified !==
                    undefined && (
                    <span
                      className={`
                        mt-1.5
                        inline-flex
                        items-center
                        gap-1
                        rounded-full
                        px-2
                        py-1
                        text-[10px]
                        font-semibold
                        ${
                          row.verified
                            ? "bg-tb-green-soft text-tb-green"
                            : "bg-tb-yellow-soft text-tb-yellow"
                        }
                      `}
                    >
                      {row.verified ? (
                        <Check size={10} />
                      ) : (
                        <AlertCircle size={10} />
                      )}

                      {row.verified
                        ? t("profile.verified")
                        : t("profile.unverified")}
                    </span>
                  )}
                </div>
              </div>
            ))}

          {/* Connected accounts */}
          <div className="grid grid-cols-1 gap-2 px-5 py-4 sm:grid-cols-[180px_minmax(0,1fr)] sm:gap-8 sm:px-7">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Shield
                size={13}
                className="text-tb-text-muted"
              />
              {t(
                "profile.connectedAccounts"
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {user?.hasGoogle && (
                <span className="rounded-full border border-tb-border bg-tb-surface-2 px-3 py-1 text-xs font-medium">
                  Google
                </span>
              )}

              {user?.hasGithub && (
                <span className="rounded-full border border-tb-border bg-tb-surface-2 px-3 py-1 text-xs font-medium">
                  GitHub
                </span>
              )}

              {user?.hasDiscord && (
                <span className="rounded-full border border-tb-border bg-tb-surface-2 px-3 py-1 text-xs font-medium">
                  Discord
                </span>
              )}

              {!user?.hasGoogle &&
                !user?.hasGithub &&
                !user?.hasDiscord && (
                  <span className="text-xs text-tb-text-muted">
                    {t(
                      "profile.noneConnected"
                    )}
                  </span>
                )}
            </div>
          </div>
        </div>
      </section>

     
    </div>
  );
}