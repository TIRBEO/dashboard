"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import {
  CheckCheck,
  ChevronDown,
  Delete,
  ExternalLink,
  Inbox as InboxIcon,
  Inbox,
  Loader2,
  Mail,
  RefreshCw,
  Search,
  X,
  Eye,
  EyeOff,
  Bell,
} from "lucide-react";

import {
  deleteNotification,
  listNotifications,
  markAllNotificationsRead,
  markNotificationsRead,
  type NotificationItem,
} from "@/lib/api";

import {
  getTypeMeta,
  notifFullDate as fullDate,
  notifTimeAgo as timeAgo,
  translateNotif as translateText,
} from "@/lib/notif-shared";

import {
  notifyNotificationsChanged,
  onNotificationsChanged,
} from "@/lib/notification-events";

import { useI18n } from "@/lib/i18n";
import { Skeleton } from "@/components/ui/Skeleton";

type FilterType = "all" | "unread" | "read";

const PAGE_SIZE = 10;

export default function InboxPage() {
  const router = useRouter();
  const { t, lang } = useI18n();

  const [notifs, setNotifs] = useState<NotificationItem[]>([]);
  const [total, setTotal] = useState(0);
  const [unread, setUnread] = useState(0);

  const [filter, setFilter] = useState<FilterType>("all");
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);
  const [markingIds, setMarkingIds] = useState<Set<string>>(new Set());

  const sentinelRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();

    return (Array.isArray(notifs) ? notifs : []).filter((notification) => {
      if (filter === "unread" && notification?.read) {
        return false;
      }

      if (filter === "read" && !notification?.read) {
        return false;
      }

      if (!query) {
        return true;
      }

      return [
        notification?.title,
        notification?.body,
        notification?.type,
      ]
        .filter(Boolean)
        .some((value) =>
          value!.toLowerCase().includes(query)
        );
    });
  }, [filter, notifs, search]);

  const load = useCallback(async (offset = 0) => {
    const isInitial = offset === 0;

    if (isInitial) {
      setLoading(true);
      setRefreshing(true);
    } else {
      setLoadingMore(true);
    }

    try {
      const response = await listNotifications(
        PAGE_SIZE,
        offset
      );

      const incoming = Array.isArray(
        response?.notifications
      )
        ? response.notifications
        : [];

      setNotifs((previous) =>
        isInitial
          ? incoming
          : [
              ...(Array.isArray(previous)
                ? previous
                : []),
              ...incoming,
            ]
      );

      setTotal(
        typeof response?.total === "number"
          ? response.total
          : 0
      );

      setUnread(
        typeof response?.unread === "number"
          ? response.unread
          : 0
      );

      const loadedCount = isInitial
        ? incoming.length
        : offset + incoming.length;

      setHasMore(
        loadedCount < (response?.total ?? 0)
      );

      if (isInitial) {
        setExpandedId((current) =>
          current &&
          incoming.some(
            (notification) =>
              notification?.id === current
          )
            ? current
            : null
        );
      }
    } catch {
      // Keep current UI state if loading fails.
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    void load(0);
  }, [load]);

  /*
   * Keep inbox synchronized with the top-bar notification bell.
   */
  useEffect(() => {
    return onNotificationsChanged(() => {
      void load(0);
    });
  }, [load]);

  /*
   * Infinite scrolling.
   */
  useEffect(() => {
    const sentinel = sentinelRef.current;

    if (!sentinel || loading || !hasMore) {
      return;
    }

    const scrollRoot =
      (document.querySelector(
        ".dashboard-main"
      ) as HTMLElement | null) ||
      document.scrollingElement ||
      null;

    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          !loadingMore &&
          hasMore
        ) {
          void load(notifs.length);
        }
      },
      {
        root: scrollRoot,
        rootMargin: "400px 0px",
        threshold: 0,
      }
    );

    observer.observe(sentinel);

    return () => observer.disconnect();
  }, [
    loading,
    loadingMore,
    hasMore,
    notifs.length,
    load,
  ]);

  /*
   * Mark everything as read.
   */
  const markAll = useCallback(async () => {
    if (unread === 0) {
      return;
    }

    setMarkingAll(true);

    try {
      await markAllNotificationsRead().catch(() => {});

      setNotifs((previous) =>
        previous.map((notification) => ({
          ...notification,
          read: true,
        }))
      );

      setUnread(0);

      notifyNotificationsChanged();
    } catch {
      // Keep current state if request fails.
    } finally {
      setMarkingAll(false);
    }
  }, [unread]);

  /*
   * Mark one notification as read.
   *
   * IMPORTANT:
   * The API export is markNotificationsRead(),
   * not markNotificationRead().
   */
  const markOneRead = useCallback(
    async (id: string) => {
      const notification = notifs.find(
        (item) => item.id === id
      );

      if (!notification || notification.read) {
        return;
      }

      setMarkingIds((previous) => {
        const next = new Set(previous);
        next.add(id);
        return next;
      });

      // Optimistic update.
      setNotifs((previous) =>
        previous.map((item) =>
          item.id === id
            ? {
                ...item,
                read: true,
              }
            : item
        )
      );

      setUnread((current) =>
        Math.max(0, current - 1)
      );

      await markNotificationsRead([id]).catch(
        () => {}
      );

      notifyNotificationsChanged();

      setMarkingIds((previous) => {
        const next = new Set(previous);
        next.delete(id);
        return next;
      });
    },
    [notifs]
  );

  /*
   * Expand / collapse notification.
   */
  const toggleExpand = useCallback(
    (notification: NotificationItem) => {
      setExpandedId((current) =>
        current === notification.id
          ? null
          : notification.id
      );

      void markOneRead(notification.id);
    },
    [markOneRead]
  );

  /*
   * Delete notification.
   */
  const deleteOne = useCallback(
    async (id: string) => {
      const notification = notifs.find(
        (item) => item.id === id
      );

      if (!notification || deletingId) {
        return;
      }

      setDeletingId(id);

      const ok = await deleteNotification(id).then(
        () => true,
        () => false
      );

      if (ok) {
        setNotifs((previous) =>
          previous.filter(
            (item) => item.id !== id
          )
        );

        setTotal((current) =>
          Math.max(0, current - 1)
        );

        if (!notification.read) {
          setUnread((current) =>
            Math.max(0, current - 1)
          );
        }

        setExpandedId((current) =>
          current === id ? null : current
        );

        notifyNotificationsChanged();
      }

      setDeletingId(null);
    },
    [notifs, deletingId]
  );

  const tabs = [
    {
      key: "all" as const,
      label: t("inbox.tabAll"),
      count: total,
    },
    {
      key: "unread" as const,
      label: t("inbox.tabUnread"),
      count: unread,
    },
    {
      key: "read" as const,
      label: t("inbox.tabRead"),
      count: Math.max(
        0,
        total - unread
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6 max-w-[1200px] mx-auto">
      {/* Page Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="min-w-0">
          <h1 className="text-[24px] font-semibold text-tb-text-primary tracking-tight flex items-center gap-2.5">
            <Inbox
              size={22}
              className="text-tb-text-muted"
            />

            {t("inbox.title")}
          </h1>

          <p className="text-sm text-tb-text-muted mt-1">
            {unread > 0
              ? t("inbox.descUnread", {
                  unread,
                  total,
                })
              : t("inbox.descTotal", {
                  total,
                })}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => void load(0)}
            disabled={refreshing}
            className="
              inline-flex
              items-center
              justify-center
              w-8
              h-8
              rounded-lg
              border
              border-tb-border
              bg-tb-surface-1
              text-tb-text-secondary
              hover:border-tb-border-hover
              hover:bg-tb-surface-2
              hover:text-tb-text-primary
              transition-all
              duration-150
              disabled:opacity-40
            "
            aria-label="Refresh"
          >
            <RefreshCw
              size={14}
              className={
                refreshing
                  ? "animate-spin"
                  : ""
              }
            />
          </button>

          {unread > 0 && (
            <button
              onClick={markAll}
              disabled={markingAll}
              className="
                inline-flex
                items-center
                gap-1.5
                px-4
                h-8
                rounded-lg
                text-[14px]
                font-medium
                transition-all
                duration-150
                active:scale-[0.97]
                bg-tb-text-primary
                text-tb-bg
                disabled:opacity-50
              "
            >
              {markingAll ? (
                <Loader2
                  size={14}
                  className="animate-spin"
                />
              ) : (
                <CheckCheck size={14} />
              )}

              {t("inbox.markAllRead")}
            </button>
          )}
        </div>
      </div>

      {/* Stat Cards */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map(
            (_, index) => (
              <div
                key={index}
                className="
                  rounded-xl
                  border
                  border-tb-border
                  bg-tb-surface-1
                  p-4
                "
              >
                <div className="flex items-center gap-3">
                  <Skeleton
                    width={32}
                    height={32}
                    borderRadius={8}
                  />

                  <div>
                    <Skeleton
                      width={70}
                      height={10}
                      className="mb-1"
                    />

                    <Skeleton
                      width={28}
                      height={18}
                    />
                  </div>
                </div>
              </div>
            )
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              icon: <Bell size={15} />,
              label: "Total",
              value: total,
            },
            {
              icon: <Eye size={15} />,
              label: t("inbox.tabUnread"),
              value: unread,
              accent: unread > 0,
            },
            {
              icon: <EyeOff size={15} />,
              label: t("inbox.tabRead"),
              value: Math.max(
                0,
                total - unread
              ),
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="
                flex
                items-center
                gap-3
                rounded-xl
                border
                border-tb-border
                bg-tb-surface-1
                p-5
                transition-all
                duration-200
                hover:border-tb-border-strong
              "
            >
              <div
                className={`
                  w-8
                  h-8
                  rounded-lg
                  flex
                  items-center
                  justify-center
                  shrink-0
                  bg-tb-surface-3
                  ${
                    stat.accent
                      ? "text-tb-text-primary"
                      : "text-tb-text-muted"
                  }
                `}
              >
                {stat.icon}
              </div>

              <div>
                <div className="
                  text-[12px]
                  font-medium
                  text-tb-text-muted
                  tracking-wide
                  uppercase
                ">
                  {stat.label}
                </div>

                <div className="
                  text-[20px]
                  font-bold
                  text-tb-text-primary
                  leading-tight
                  mt-0.5
                ">
                  {stat.value}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Notification List */}
      <div className="
        rounded-2xl
        border
        border-tb-border
        bg-tb-surface-1
        overflow-hidden
      ">
        {/* Toolbar */}
        <div className="
          flex
          items-center
          justify-between
          gap-3
          px-5
          py-3.5
          border-b
          border-tb-border
          flex-wrap
        ">
          {/* Tabs */}
          <div
            className="flex items-center gap-1"
            role="tablist"
          >
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() =>
                  setFilter(tab.key)
                }
                className={`
                  flex
                  items-center
                  gap-1.5
                  px-2.5
                  py-1.5
                  rounded-lg
                  text-[12.5px]
                  font-medium
                  transition-all
                  duration-150
                  ${
                    filter === tab.key
                      ? "bg-tb-surface-3 text-tb-text-primary"
                      : "bg-transparent text-tb-text-muted hover:text-tb-text-primary"
                  }
                `}
                role="tab"
                aria-selected={
                  filter === tab.key
                }
              >
                <span>{tab.label}</span>

                {tab.count > 0 && (
                  <span className="
                    text-[10.5px]
                    font-semibold
                    px-1.5
                    py-px
                    rounded-full
                    bg-tb-brand-soft
                    opacity-85
                  ">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="
            relative
            min-w-[200px]
            flex-[0_1_260px]
            ml-auto
          ">
            <Search
              size={14}
              className="
                absolute
                left-3
                top-1/2
                -translate-y-1/2
                text-tb-text-muted
                pointer-events-none
              "
            />

            <input
              type="search"
              placeholder={t(
                "inbox.searchPlaceholder"
              )}
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              className="
                w-full
                h-9
                pl-9
                pr-8
                rounded-lg
                text-[14px]
                border
                border-tb-border
                bg-tb-surface-2
                text-tb-text-primary
                placeholder:text-tb-text-muted
                outline-none
                transition-all
                duration-150
                focus:border-tb-border-strong
                focus:bg-tb-surface-1
              "
              aria-label={t(
                "inbox.searchPlaceholder"
              )}
            />

            {search && (
              <button
                onClick={() => setSearch("")}
                className="
                  absolute
                  right-2
                  top-1/2
                  -translate-y-1/2
                  p-0.5
                  rounded-md
                  border-none
                  bg-transparent
                  cursor-pointer
                  text-tb-text-muted
                  hover:bg-tb-surface-3
                  hover:text-tb-text-primary
                  transition-colors
                "
                aria-label="Clear search"
              >
                <X size={13} />
              </button>
            )}
          </div>
        </div>

        {/* List */}
        <div className="overscroll-contain">
          {loading ? (
            <div aria-hidden="true">
              {Array.from({ length: 6 }).map(
                (_, index) => (
                  <div
                    key={index}
                    className="
                      flex
                      items-center
                      gap-3.5
                      px-5
                      py-3.5
                      border-b
                      border-tb-border
                    "
                  >
                    <Skeleton
                      width={36}
                      height={36}
                      borderRadius={10}
                    />

                    <div className="flex-1">
                      <Skeleton
                        width={`${
                          45 +
                          (index % 3) * 12
                        }%`}
                        height={12}
                        className="mb-1.5"
                      />

                      <Skeleton
                        width="65%"
                        height={10}
                      />
                    </div>

                    <Skeleton
                      width={34}
                      height={10}
                    />
                  </div>
                )
              )}
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-16 px-6 text-center">
              <div className="
                w-12
                h-12
                rounded-xl
                border
                border-tb-border
                bg-tb-surface-2
                inline-flex
                items-center
                justify-center
                text-tb-text-muted
                mb-3
              ">
                {search ? (
                  <Search size={24} />
                ) : filter === "unread" ? (
                  <CheckCheck size={24} />
                ) : (
                  <InboxIcon size={24} />
                )}
              </div>

              <p className="
                text-[15px]
                font-semibold
                text-tb-text-primary
              ">
                {search
                  ? t("inbox.noMatching")
                  : filter === "unread"
                  ? t("inbox.allCaughtUp")
                  : t("inbox.inboxEmpty")}
              </p>

              <p className="
                text-[14px]
                text-tb-text-muted
                mt-1
              ">
                {search
                  ? t("inbox.noMatchingDesc")
                  : filter === "unread"
                  ? t(
                      "inbox.allCaughtUpDesc"
                    )
                  : t(
                      "inbox.inboxEmptyDesc"
                    )}
              </p>
            </div>
          ) : (
            <>
              {filtered.map((notification) => {
                const meta = getTypeMeta(
                  notification.type,
                  t
                );

                const TypeIcon = meta.icon;
                const expanded =
                  expandedId ===
                  notification.id;

                const isMarking =
                  markingIds.has(
                    notification.id
                  );

                return (
                  <article
                    key={notification.id}
                    className={`
                      transition-colors
                      duration-100
                      border-b
                      border-tb-border
                      ${
                        expanded
                          ? "bg-tb-surface-2 border-l-2 border-l-tb-text-primary"
                          : !notification.read
                          ? "bg-tb-brand-soft border-l-2 border-l-transparent"
                          : "bg-tb-surface-1 border-l-2 border-l-transparent"
                      }
                    `}
                  >
                    {/* Row */}
                    <div
                      className="
                        flex
                        items-center
                        gap-3.5
                        px-5
                        py-3.5
                        cursor-pointer
                        transition-colors
                        duration-100
                        hover:bg-tb-surface-2
                        focus-visible:bg-tb-surface-2
                        focus-visible:outline-none
                      "
                      onClick={() =>
                        toggleExpand(
                          notification
                        )
                      }
                      role="button"
                      tabIndex={0}
                      aria-expanded={expanded}
                      onKeyDown={(event) => {
                        if (
                          event.key === "Enter" ||
                          event.key === " "
                        ) {
                          event.preventDefault();

                          toggleExpand(
                            notification
                          );
                        }
                      }}
                    >
                      {/* Unread */}
                      {!notification.read && (
                        <span
                          className="
                            w-[7px]
                            h-[7px]
                            rounded-full
                            bg-tb-green
                            flex-shrink-0
                            -ml-1
                          "
                          aria-label="Unread"
                        />
                      )}

                      {/* Icon */}
                      <div
                        className="
                          w-9
                          h-9
                          rounded-[10px]
                          flex
                          items-center
                          justify-center
                          flex-shrink-0
                        "
                        style={{
                          background: `color-mix(in srgb, ${meta.color} 14%, transparent)`,
                          color: meta.color,
                          border: `1px solid color-mix(in srgb, ${meta.color} 28%, transparent)`,
                        }}
                      >
                        <TypeIcon size={16} />
                      </div>

                      {/* Content */}
                      <div className="
                        flex-1
                        min-w-0
                      ">
                        <div className="
                          flex
                          items-center
                          gap-2
                          min-w-0
                        ">
                          <span
                            className="
                              text-[13.5px]
                              overflow-hidden
                              text-ellipsis
                              whitespace-nowrap
                            "
                            style={{
                              fontWeight:
                                !notification.read
                                  ? 600
                                  : 400,
                              color:
                                !notification.read
                                  ? "var(--tb-text-primary)"
                                  : "var(--tb-text-secondary)",
                            }}
                          >
                            {translateText(
                              t,
                              notification.title,
                              lang
                            )}
                          </span>

                          {isMarking && (
                            <Loader2
                              size={12}
                              className="
                                shrink-0
                                animate-spin
                                text-tb-text-muted
                              "
                            />
                          )}
                        </div>

                        {!expanded &&
                          notification.body && (
                            <p className="
                              text-[12.5px]
                              text-tb-text-muted
                              mt-0.5
                              overflow-hidden
                              text-ellipsis
                              whitespace-nowrap
                              leading-[1.45]
                            ">
                              {translateText(
                                t,
                                notification.body,
                                lang
                              )}
                            </p>
                          )}
                      </div>

                      {/* Date */}
                      <div className="
                        flex
                        items-center
                        gap-2
                        flex-shrink-0
                      ">
                        <time
                          className="
                            text-[11.5px]
                            text-tb-text-muted
                            whitespace-nowrap
                          "
                          dateTime={
                            notification.createdAt
                          }
                          title={fullDate(
                            notification.createdAt,
                            lang
                          )}
                        >
                          {timeAgo(
                            notification.createdAt,
                            t,
                            lang
                          )}
                        </time>

                        <ChevronDown
                          size={14}
                          className="
                            text-tb-text-muted
                            transition-transform
                            duration-150
                          "
                          style={{
                            transform: expanded
                              ? "rotate(180deg)"
                              : "rotate(0deg)",
                          }}
                        />
                      </div>
                    </div>

                    {/* Expanded Details */}
                    {expanded && (
                      <div className="
                        px-5
                        pb-5
                        pl-16
                        -mt-0.5
                      ">
                        <div className="
                          rounded-xl
                          border
                          border-tb-border
                          bg-tb-surface-1
                          p-4
                        ">
                          {/* Detail grid */}
                          <div className="
                            grid
                            grid-cols-1
                            sm:grid-cols-2
                            lg:grid-cols-4
                            gap-2.5
                            mb-3
                          ">
                            <div>
                              <span className="
                                block
                                text-[10.5px]
                                font-semibold
                                tracking-wide
                                uppercase
                                text-tb-text-muted
                                mb-0.5
                              ">
                                {t("inbox.when")}
                              </span>

                              <span className="
                                text-[12.5px]
                                text-tb-text-secondary
                              ">
                                {fullDate(
                                  notification.createdAt,
                                  lang
                                )}
                              </span>
                            </div>

                            {!!notification
                              .metadata?.ip && (
                              <div>
                                <span className="
                                  block
                                  text-[10.5px]
                                  font-semibold
                                  tracking-wide
                                  uppercase
                                  text-tb-text-muted
                                  mb-0.5
                                ">
                                  {t("inbox.where")}
                                </span>

                                <span className="
                                  text-[11.5px]
                                  text-tb-text-secondary
                                  font-mono
                                ">
                                  {String(
                                    notification
                                      .metadata.ip
                                  )}
                                </span>
                              </div>
                            )}

                            {!!notification
                              .metadata
                              ?.device && (
                              <div>
                                <span className="
                                  block
                                  text-[10.5px]
                                  font-semibold
                                  tracking-wide
                                  uppercase
                                  text-tb-text-muted
                                  mb-0.5
                                ">
                                  {t("inbox.device")}
                                </span>

                                <span className="
                                  text-[12.5px]
                                  text-tb-text-secondary
                                ">
                                  {String(
                                    notification
                                      .metadata.device
                                  )}
                                </span>
                              </div>
                            )}

                            <div>
                              <span className="
                                block
                                text-[10.5px]
                                font-semibold
                                tracking-wide
                                uppercase
                                text-tb-text-muted
                                mb-0.5
                              ">
                                {t(
                                  "inbox.category"
                                )}
                              </span>

                              <span className="
                                text-[12.5px]
                                text-tb-text-secondary
                              ">
                                {meta.label}
                              </span>
                            </div>
                          </div>

                          {/* Body */}
                          <div className="
                            text-[13.5px]
                            leading-[1.65]
                            text-tb-text-secondary
                            whitespace-pre-wrap
                            p-4
                            rounded-xl
                            bg-tb-surface-2
                            border
                            border-tb-border
                          ">
                            {notification.body
                              ? translateText(
                                  t,
                                  notification.body,
                                  lang
                                )
                              : t(
                                  "inbox.noContent"
                                )}
                          </div>

                          {/* Actions */}
                          <div className="
                            flex
                            items-center
                            gap-2
                            mt-3
                          ">
                            {notification.link && (
                              <button
                                onClick={(event) => {
                                  event.stopPropagation();

                                  router.push(
                                    notification.link!
                                  );
                                }}
                                className="
                                  inline-flex
                                  items-center
                                  gap-1.5
                                  px-3
                                  h-8
                                  rounded-lg
                                  text-[14px]
                                  font-medium
                                  transition-all
                                  duration-150
                                  active:scale-[0.97]
                                  bg-tb-text-primary
                                  text-tb-bg
                                  hover:opacity-90
                                "
                              >
                                {t("inbox.open")}

                                <ExternalLink
                                  size={13}
                                />
                              </button>
                            )}

                            <button
                              onClick={(event) => {
                                event.stopPropagation();

                                void deleteOne(
                                  notification.id
                                );
                              }}
                              disabled={
                                deletingId ===
                                notification.id
                              }
                              className="
                                inline-flex
                                items-center
                                gap-1.5
                                px-3
                                h-8
                                rounded-lg
                                text-[14px]
                                font-medium
                                text-tb-text-secondary
                                hover:text-tb-red
                                hover:bg-tb-red-soft
                                border
                                border-transparent
                                hover:border-tb-red
                                transition-all
                                duration-150
                                disabled:opacity-60
                                disabled:cursor-not-allowed
                              "
                            >
                              {deletingId ===
                              notification.id ? (
                                <Loader2
                                  size={13}
                                  className="animate-spin"
                                />
                              ) : (
                                <>
                                  <Delete size={13} />
                                  {t(
                                    "inbox.delete"
                                  )}
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </article>
                );
              })}

              {/* Infinite scroll sentinel */}
              {hasMore && (
                <div
                  ref={sentinelRef}
                  className="h-1"
                />
              )}

              {/* Load More */}
              {hasMore && (
                <div className="
                  flex
                  justify-center
                  py-2.5
                  border-t
                  border-tb-border
                ">
                  <button
                    onClick={() =>
                      void load(notifs.length)
                    }
                    disabled={loadingMore}
                    className="
                      inline-flex
                      items-center
                      gap-1.5
                      px-3
                      h-8
                      rounded-lg
                      text-[13px]
                      font-medium
                      text-tb-text-muted
                      hover:text-tb-text-primary
                      hover:bg-tb-surface-2
                      transition-all
                      duration-150
                      disabled:opacity-40
                    "
                  >
                    {loadingMore && (
                      <span className="
                        w-3
                        h-3
                        animate-spin
                        rounded-full
                        border-2
                        border-current
                        border-t-transparent
                      " />
                    )}

                    {t("inbox.loadMore")}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}