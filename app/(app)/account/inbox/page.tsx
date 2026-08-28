"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  CheckCheck,
  ChevronDown,
  Delete,
  ExternalLink,
  Inbox as InboxIcon,
  RefreshCw,
  Search,
  X,
} from "lucide-react";
import {
  deleteNotification,
  deleteNotifications,
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
import { notifyNotificationsChanged } from "@/lib/notification-events";
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
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();

    return (Array.isArray(notifs) ? notifs : []).filter((notification) => {
      if (filter === "unread" && notification?.read) return false;
      if (filter === "read" && !notification?.read) return false;
      if (!query) return true;

      return [notification?.title, notification?.body, notification?.type]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(query));
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
      const response = await listNotifications(PAGE_SIZE, offset);

      const incoming = Array.isArray(response?.notifications) ? response.notifications : [];
      setNotifs((previous) =>
        isInitial ? incoming : [...(Array.isArray(previous) ? previous : []), ...incoming],
      );

      setTotal(typeof response?.total === "number" ? response.total : 0);
      setUnread(typeof response?.unread === "number" ? response.unread : 0);

      const loadedCount = isInitial
        ? incoming.length
        : offset + incoming.length;

      setHasMore(loadedCount < (response?.total ?? 0));

      if (isInitial) {
        setExpandedId((current) =>
          current && incoming.some((notification) => notification?.id === current)
            ? current
            : null,
        );
      }
    } catch {
      // Keep the current UI state if refreshing fails.
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    void load(0);
  }, [load]);

  const markAll = useCallback(async () => {
    if (unread === 0) return;

    await markAllNotificationsRead().catch(() => {});

    setNotifs((previous) =>
      previous.map((notification) => ({ ...notification, read: true })),
    );
    setUnread(0);
    notifyNotificationsChanged();
  }, [unread]);

  const markOneRead = useCallback(
    async (id: string) => {
      const notification = notifs.find((item) => item.id === id);
      if (!notification || notification.read) return;

      setNotifs((previous) =>
        previous.map((item) =>
          item.id === id ? { ...item, read: true } : item,
        ),
      );
      setUnread((current) => Math.max(0, current - 1));

      await markNotificationsRead([id]).catch(() => {});
      notifyNotificationsChanged();
    },
    [notifs],
  );

  const toggleExpand = useCallback(
    (notification: NotificationItem) => {
      setExpandedId((current) =>
        current === notification.id ? null : notification.id,
      );
      void markOneRead(notification.id);
    },
    [markOneRead],
  );

  const deleteOne = useCallback(
    async (id: string) => {
      const notification = notifs.find((item) => item.id === id);
      if (!notification) return;

      await deleteNotification(id).catch(() => {});

      setNotifs((previous) => previous.filter((item) => item.id !== id));
      setTotal((current) => Math.max(0, current - 1));

      if (!notification.read) {
        setUnread((current) => Math.max(0, current - 1));
      }

      setExpandedId((current) => (current === id ? null : current));
      notifyNotificationsChanged();
    },
    [notifs],
  );

  const tabs = [
    { key: "all" as const, label: t("inbox.tabAll"), count: total },
    { key: "unread" as const, label: t("inbox.tabUnread"), count: unread },
    { key: "read" as const, label: t("inbox.tabRead"), count: Math.max(0, total - unread) },
  ];

  return (
    <div className="page-stack inbox-page">
      <header className="page-header">
        <div className="page-header-row">
          <div className="page-header-left">
            <div className="inbox-title-row">
              <div className="inbox-title-icon" aria-hidden="true">
                <InboxIcon size={18} />
              </div>
              <div>
                <h1 className="page-header-title">{t("inbox.title")}</h1>
                <p className="page-header-description">
                  {unread > 0
                    ? t("inbox.descUnread", { unread, total })
                    : t("inbox.descTotal", { total })}
                </p>
              </div>
            </div>
          </div>

          <div className="page-header-actions">
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => void load(0)}
              disabled={refreshing}
              type="button"
              aria-label={t("inbox.loadMore")}
            >
              <RefreshCw size={14} className={refreshing ? "inbox-spin" : ""} />
            </button>

            {unread > 0 && (
              <button className="btn btn-primary btn-sm" onClick={markAll} type="button">
                <CheckCheck size={14} />
                {t("inbox.markAllRead")}
              </button>
            )}
          </div>
        </div>
      </header>

      <section className="inbox-card" aria-label={t("inbox.title")}>
        <div className="inbox-toolbar">
          <div className="inbox-tabs" role="tablist">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                className={`inbox-tab ${filter === tab.key ? "active" : ""}`}
                onClick={() => setFilter(tab.key)}
                type="button"
                role="tab"
                aria-selected={filter === tab.key}
              >
                <span>{tab.label}</span>
                {tab.count > 0 && <span className="inbox-tab-count">{tab.count}</span>}
              </button>
            ))}
          </div>

          <div className="inbox-search">
            <Search size={14} className="inbox-search-icon" />
            <input
              type="search"
              placeholder={t("inbox.searchPlaceholder")}
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="inbox-search-input"
              aria-label={t("inbox.searchPlaceholder")}
            />
            {search && (
              <button
                className="inbox-search-clear"
                onClick={() => setSearch("")}
                type="button"
                aria-label="Clear search"
              >
                <X size={13} />
              </button>
            )}
          </div>
        </div>

        <div className="inbox-list">
          {loading ? (
            <div className="inbox-skeleton-list" aria-hidden="true">
              {Array.from({ length: 6 }).map((_, index) => (
                <div className="inbox-skeleton-row" key={index}>
                  <Skeleton width={36} height={36} borderRadius={10} />
                  <div className="inbox-skeleton-copy">
                    <Skeleton width={`${45 + (index % 3) * 12}%`} height={12} />
                    <Skeleton width="65%" height={10} />
                  </div>
                  <Skeleton width={34} height={10} />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="inbox-empty">
              <div className="inbox-empty-icon">
                {search ? (
                  <Search size={24} />
                ) : filter === "unread" ? (
                  <CheckCheck size={24} />
                ) : (
                  <InboxIcon size={24} />
                )}
              </div>
              <p className="inbox-empty-title">
                {search
                  ? t("inbox.noMatching")
                  : filter === "unread"
                    ? t("inbox.allCaughtUp")
                    : t("inbox.inboxEmpty")}
              </p>
              <p className="inbox-empty-desc">
                {search
                  ? t("inbox.noMatchingDesc")
                  : filter === "unread"
                    ? t("inbox.allCaughtUpDesc")
                    : t("inbox.inboxEmptyDesc")}
              </p>
            </div>
          ) : (
            <>
              {filtered.map((notification) => {
                const meta = getTypeMeta(notification.type, t);
                const TypeIcon = meta.icon;
                const expanded = expandedId === notification.id;

                return (
                  <article
                    key={notification.id}
                    className={[
                      "inbox-item",
                      expanded && "expanded",
                      !notification.read && "unread",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  >
                    <div
                      className="inbox-item-row"
                      onClick={() => toggleExpand(notification)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          toggleExpand(notification);
                        }
                      }}
                    >
                      {!notification.read && (
                        <span className="inbox-item-dot" aria-label="Unread" />
                      )}

                      <div className="inbox-item-icon">
                        <TypeIcon size={16} />
                      </div>

                      <div className="inbox-item-content">
                        <div className="inbox-item-top">
                          <span
                            className={`inbox-item-title ${!notification.read ? "font-semibold" : ""}`}
                          >
                            {translateText(t, notification.title, lang)}
                          </span>
                        </div>
                        {!expanded && notification.body && (
                          <p className="inbox-item-preview">
                            {translateText(t, notification.body, lang)}
                          </p>
                        )}
                      </div>

                      <div className="inbox-item-side">
                        <time
                          className="inbox-item-time"
                          dateTime={notification.createdAt}
                          title={fullDate(notification.createdAt, lang)}
                        >
                          {timeAgo(notification.createdAt, t, lang)}
                        </time>
                        <ChevronDown
                          size={14}
                          className={`inbox-item-chevron ${expanded ? "open" : ""}`}
                        />
                      </div>
                    </div>

                    {expanded && (
                      <div className="inbox-item-expanded">
                        <div className="inbox-detail-grid">
                          <div>
                            <span className="inbox-detail-label">{t("inbox.when")}</span>
                            <span className="inbox-detail-value">{fullDate(notification.createdAt, lang)}</span>
                          </div>
                          {!!notification.metadata?.ip && (
                            <div>
                              <span className="inbox-detail-label">{t("inbox.where")}</span>
                              <span className="inbox-detail-value mono">{String(notification.metadata.ip)}</span>
                            </div>
                          )}
                          {!!notification.metadata?.device && (
                            <div>
                              <span className="inbox-detail-label">{t("inbox.device")}</span>
                              <span className="inbox-detail-value">{String(notification.metadata.device)}</span>
                            </div>
                          )}
                          <div>
                            <span className="inbox-detail-label">{t("inbox.category")}</span>
                            <span className="inbox-detail-value">{meta.label}</span>
                          </div>
                        </div>

                        <div className="inbox-item-expanded-body">
                          {notification.body
                            ? translateText(t, notification.body, lang)
                            : t("inbox.noContent")}
                        </div>

                        <div className="inbox-item-expanded-actions">
                          {notification.link && (
                            <button
                              className="btn btn-primary btn-sm"
                              onClick={() => router.push(notification.link!)}
                              type="button"
                            >
                              {t("inbox.open")}
                              <ExternalLink size={13} />
                            </button>
                          )}
                          <button
                            className="btn btn-ghost btn-sm inbox-delete-btn"
                            onClick={(event) => {
                              event.stopPropagation();
                              void deleteOne(notification.id);
                            }}
                            type="button"
                          >
                            <Delete size={13} />
                            {t("inbox.delete")}
                          </button>
                        </div>
                      </div>
                    )}
                  </article>
                );
              })}

              {hasMore && (
                <div className="inbox-load-more">
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => void load(notifs.length)}
                    disabled={loadingMore}
                    type="button"
                  >
                    {loadingMore ? <span className="btn-spinner" /> : t("inbox.loadMore")}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
}
