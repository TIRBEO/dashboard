"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Check,
  CheckCheck,
  ChevronRight,
  Delete,
  Filter,
  Inbox as InboxIcon,
  Key,
  LifeBuoy,
  Mail,
  MessageSquare,
  RefreshCw,
  Search,
  Shield,
  Star,
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
import { notifyNotificationsChanged } from "@/lib/notification-events";
import { useI18n, type I18nT, translateNotifText } from "@/lib/i18n";
import { Skeleton } from "@/components/ui/Skeleton";

type FilterType = "all" | "unread" | "read";

const PAGE_SIZE = 50;

const TYPE_META: Record<
  string,
  { icon: typeof Mail; color: string; labelKey: string }
> = {
  security: {
    icon: Shield,
    color: "#ef4444",
    labelKey: "inbox.typeSecurity",
  },
  forms: {
    icon: MessageSquare,
    color: "#3b82f6",
    labelKey: "inbox.typeForms",
  },
  product: {
    icon: Star,
    color: "#f59e0b",
    labelKey: "inbox.typeProduct",
  },
  support: {
    icon: LifeBuoy,
    color: "#10b981",
    labelKey: "inbox.typeSupport",
  },
  ticket: {
    icon: LifeBuoy,
    color: "#10b981",
    labelKey: "inbox.typeSupport",
  },
  login: {
    icon: Key,
    color: "#8b5cf6",
    labelKey: "inbox.typeLogin",
  },
};

function getTypeMeta(type?: string, t?: I18nT) {
  if (!type) {
    return {
      icon: Mail,
      color: "var(--tb-text-muted)",
      label: t ? t("inbox.typeNotification") : "Notification",
    };
  }

  const key = type.toLowerCase();

  for (const [name, meta] of Object.entries(TYPE_META)) {
    if (key.includes(name)) {
      return {
        icon: meta.icon,
        color: meta.color,
        label: t ? t(meta.labelKey) : type,
      };
    }
  }

  return {
    icon: Mail,
    color: "var(--tb-text-muted)",
    label: t ? t("inbox.typeNotification") : type,
  };
}

function translateText(t: I18nT, text?: string, lang?: string) {
  if (!text) return "";

  if (lang) return translateNotifText(text, lang);

  const translated = t(`notifTexts.${text}`);
  if (translated !== `notifTexts.${text}`) return translated;

  const match = text.match(
    /^Your recovery email \(([^)]+)\) has been confirmed\.$/,
  );

  if (match) {
    return t("notifTexts.recoveryEmailBody", { email: match[1] });
  }

  return text;
}

function timeAgo(iso: string, t: I18nT, lang: string) {
  const date = new Date(iso);
  const diff = Math.max(0, Date.now() - date.getTime());

  if (diff < 60_000) return t("common.justNow");
  if (diff < 3_600_000) {
    return t("common.agoM", { n: Math.floor(diff / 60_000) });
  }
  if (diff < 86_400_000) {
    return t("common.agoH", { n: Math.floor(diff / 3_600_000) });
  }
  if (diff < 172_800_000) return t("common.yesterday");

  return date.toLocaleDateString(lang, {
    month: "short",
    day: "numeric",
  });
}

function fullDate(iso: string, lang: string) {
  return new Date(iso).toLocaleString(lang, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function InboxPage() {
  const router = useRouter();
  const { t, lang } = useI18n();

  const [notifs, setNotifs] = useState<NotificationItem[]>([]);
  const [total, setTotal] = useState(0);
  const [unread, setUnread] = useState(0);

  const [filter, setFilter] = useState<FilterType>("all");
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    () => new Set(),
  );
  const [isSelectMode, setIsSelectMode] = useState(false);

  const listRef = useRef<HTMLDivElement>(null);

  const selectedNotif = useMemo(
    () => notifs.find((notification) => notification.id === selectedId) ?? null,
    [notifs, selectedId],
  );

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();

    return notifs.filter((notification) => {
      if (filter === "unread" && notification.read) return false;
      if (filter === "read" && !notification.read) return false;
      if (!query) return true;

      return [notification.title, notification.body, notification.type]
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

      setNotifs((previous) =>
        isInitial ? response.notifications : [...previous, ...response.notifications],
      );

      setTotal(response.total);
      setUnread(response.unread);

      const loadedCount = isInitial
        ? response.notifications.length
        : offset + response.notifications.length;

      setHasMore(loadedCount < response.total);

      if (isInitial) {
        setSelectedId((current) =>
          current && response.notifications.some((n) => n.id === current)
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

  const markSelectedRead = useCallback(async () => {
    const ids = [...selectedIds];
    if (!ids.length) return;

    const unreadSelectedCount = notifs.filter(
      (notification) =>
        ids.includes(notification.id) && !notification.read,
    ).length;

    await markNotificationsRead(ids).catch(() => {});

    setNotifs((previous) =>
      previous.map((notification) =>
        selectedIds.has(notification.id)
          ? { ...notification, read: true }
          : notification,
      ),
    );
    setUnread((current) => Math.max(0, current - unreadSelectedCount));
    setSelectedIds(new Set());
    setIsSelectMode(false);
    notifyNotificationsChanged();
  }, [notifs, selectedIds]);

  const deleteSelected = useCallback(async () => {
    const ids = [...selectedIds];
    if (!ids.length) return;

    const deletedUnreadCount = notifs.filter(
      (notification) =>
        ids.includes(notification.id) && !notification.read,
    ).length;

    await deleteNotifications(ids).catch(() => {});

    setNotifs((previous) =>
      previous.filter((notification) => !selectedIds.has(notification.id)),
    );
    setTotal((current) => Math.max(0, current - ids.length));
    setUnread((current) => Math.max(0, current - deletedUnreadCount));

    if (selectedId && selectedIds.has(selectedId)) {
      setSelectedId(null);
    }

    setSelectedIds(new Set());
    setIsSelectMode(false);
    notifyNotificationsChanged();
  }, [notifs, selectedId, selectedIds]);

  const deleteOne = useCallback(
    async (id: string) => {
      const notification = notifs.find((item) => item.id === id);
      if (!notification) return;

      await deleteNotification(id).catch(() => {});

      setNotifs((previous) =>
        previous.filter((item) => item.id !== id),
      );
      setTotal((current) => Math.max(0, current - 1));

      if (!notification.read) {
        setUnread((current) => Math.max(0, current - 1));
      }

      if (selectedId === id) {
        setSelectedId(null);
      }

      notifyNotificationsChanged();
    },
    [notifs, selectedId],
  );

  const markOneRead = useCallback(
    async (id: string) => {
      const notification = notifs.find((item) => item.id === id);
      if (!notification || notification.read) return;

      // Optimistic update: the unread count is changed exactly once here.
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

  const openNotif = useCallback(
    (notification: NotificationItem) => {
      setSelectedId(notification.id);
      void markOneRead(notification.id);
    },
    [markOneRead],
  );

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((previous) => {
      const next = new Set(previous);

      if (next.has(id)) next.delete(id);
      else next.add(id);

      return next;
    });
  }, []);

  const selectAll = useCallback(() => {
    setSelectedIds((previous) =>
      previous.size === filtered.length
        ? new Set()
        : new Set(filtered.map((notification) => notification.id)),
    );
  }, [filtered]);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
    setIsSelectMode(false);
  }, []);

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
      count: Math.max(0, total - unread),
    },
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

          {unread > 0 && (
            <div className="page-header-actions">
              <button
                className="btn btn-ghost btn-sm"
                onClick={markAll}
                type="button"
              >
                <CheckCheck size={14} />
                {t("inbox.markAllRead")}
              </button>
            </div>
          )}
        </div>
      </header>

      <section className="inbox-layout" aria-label={t("inbox.title")}>
        <div className="inbox-list-panel">
          <div className="inbox-toolbar">
            <div className="inbox-tabs" role="tablist">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  className={`inbox-tab ${
                    filter === tab.key ? "active" : ""
                  }`}
                  onClick={() => setFilter(tab.key)}
                  type="button"
                  role="tab"
                  aria-selected={filter === tab.key}
                >
                  <span>{tab.label}</span>
                  {tab.count > 0 && (
                    <span className="inbox-tab-count">{tab.count}</span>
                  )}
                </button>
              ))}
            </div>

            <div className="inbox-toolbar-right">
              {isSelectMode ? (
                <>
                  <button
                    className="inbox-mini-btn"
                    onClick={selectAll}
                    type="button"
                  >
                    {selectedIds.size === filtered.length
                      ? t("inbox.deselect")
                      : t("inbox.selectAll")}
                  </button>

                  {selectedIds.size > 0 && (
                    <>
                      <button
                        className="inbox-mini-btn"
                        onClick={markSelectedRead}
                        type="button"
                      >
                        <Check size={13} />
                        {t("inbox.read")}
                      </button>

                      <button
                        className="inbox-mini-btn danger"
                        onClick={deleteSelected}
                        type="button"
                      >
                        <Delete size={13} />
                        {t("inbox.delete")}
                      </button>
                    </>
                  )}

                  <button
                    className="inbox-icon-btn"
                    onClick={clearSelection}
                    type="button"
                    aria-label={t("inbox.delete")}
                  >
                    <X size={15} />
                  </button>
                </>
              ) : (
                <>
                  <button
                    className="inbox-mini-btn"
                    onClick={() => setIsSelectMode(true)}
                    type="button"
                  >
                    <Filter size={13} />
                    {t("inbox.select")}
                  </button>

                  <button
                    className="inbox-icon-btn"
                    onClick={() => void load(0)}
                    disabled={refreshing}
                    type="button"
                    aria-label={t("inbox.loadMore")}
                  >
                    <RefreshCw
                      size={15}
                      className={refreshing ? "inbox-spin" : ""}
                    />
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="inbox-search-bar">
            <Search size={15} className="inbox-search-icon" />
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

          <div className="inbox-list-scroll" ref={listRef}>
            {loading ? (
              <div className="inbox-skeleton-list" aria-hidden="true">
                {Array.from({ length: 7 }).map((_, index) => (
                  <div className="inbox-skeleton-row" key={index}>
                    <Skeleton width={38} height={38} borderRadius={11} />
                    <div className="inbox-skeleton-copy">
                      <Skeleton
                        width={`${45 + (index % 3) * 12}%`}
                        height={12}
                      />
                      <Skeleton width="70%" height={10} />
                    </div>
                    <Skeleton width={38} height={10} />
                  </div>
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="inbox-empty">
                <div className="inbox-empty-icon">
                  {search ? (
                    <Search size={25} />
                  ) : filter === "unread" ? (
                    <CheckCheck size={25} />
                  ) : (
                    <InboxIcon size={25} />
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
                  const isSelected = selectedId === notification.id;
                  const isChecked = selectedIds.has(notification.id);

                  return (
                    <article
                      key={notification.id}
                      className={[
                        "inbox-item",
                        isSelected && "selected",
                        !notification.read && "unread",
                        isChecked && "checked",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                      onClick={() =>
                        isSelectMode
                          ? toggleSelect(notification.id)
                          : openNotif(notification)
                      }
                    >
                      {isSelectMode && (
                        <button
                          className={`inbox-item-checkbox ${
                            isChecked ? "checked" : ""
                          }`}
                          onClick={(event) => {
                            event.stopPropagation();
                            toggleSelect(notification.id);
                          }}
                          type="button"
                          aria-label={
                            isChecked ? t("inbox.deselect") : t("inbox.select")
                          }
                        >
                          {isChecked && <Check size={12} />}
                        </button>
                      )}

                      {!notification.read && (
                        <span className="inbox-item-dot" aria-label="Unread" />
                      )}

                      <div
                        className="inbox-item-icon"
                        style={{
                          background: `${meta.color}15`,
                          color: meta.color,
                        }}
                      >
                        <TypeIcon size={16} />
                      </div>

                      <div className="inbox-item-content">
                        <div className="inbox-item-top">
                          <span
                            className={`inbox-item-title ${
                              !notification.read ? "font-semibold" : ""
                            }`}
                          >
                            {translateText(t, notification.title, lang)}
                          </span>
                          <time
                            className="inbox-item-time"
                            dateTime={notification.createdAt}
                            title={fullDate(notification.createdAt, lang)}
                          >
                            {timeAgo(notification.createdAt, t, lang)}
                          </time>
                        </div>

                        {notification.body && (
                          <p className="inbox-item-preview">
                            {translateText(t, notification.body, lang)}
                          </p>
                        )}

                        <div className="inbox-item-meta">
                          <span
                            className="inbox-item-type-badge"
                            style={{ color: meta.color }}
                          >
                            {meta.label}
                          </span>
                        </div>
                      </div>

                      {!isSelectMode && (
                        <button
                          className="inbox-item-delete"
                          onClick={(event) => {
                            event.stopPropagation();
                            void deleteOne(notification.id);
                          }}
                          type="button"
                          title={t("inbox.delete")}
                          aria-label={t("inbox.delete")}
                        >
                          <X size={13} />
                        </button>
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
                      {loadingMore ? (
                        <span className="btn-spinner" />
                      ) : (
                        t("inbox.loadMore")
                      )}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        <aside className="inbox-detail-panel">
          {selectedNotif ? (
            <div className="inbox-detail">
              <div className="inbox-detail-header">
                <button
                  className="inbox-detail-btn back-btn"
                  onClick={() => setSelectedId(null)}
                  type="button"
                >
                  <ArrowLeft size={15} />
                  {t("inbox.back")}
                </button>

                <div className="inbox-detail-actions">
                  {selectedNotif.link && (
                    <button
                      className="inbox-detail-btn"
                      onClick={() => router.push(selectedNotif.link!)}
                      type="button"
                    >
                      {t("inbox.open")}
                      <ChevronRight size={13} />
                    </button>
                  )}

                  <button
                    className="inbox-detail-btn danger"
                    onClick={() => void deleteOne(selectedNotif.id)}
                    type="button"
                    aria-label={t("inbox.delete")}
                  >
                    <Delete size={14} />
                  </button>
                </div>
              </div>

              <div className="inbox-detail-body">
                {(() => {
                  const meta = getTypeMeta(selectedNotif.type, t);
                  const TypeIcon = meta.icon;

                  return (
                    <div className="inbox-detail-icon-row">
                      <div
                        className="inbox-detail-icon"
                        style={{
                          background: `${meta.color}15`,
                          color: meta.color,
                        }}
                      >
                        <TypeIcon size={19} />
                      </div>

                      <div className="inbox-detail-meta">
                        <span className="inbox-detail-type">{meta.label}</span>
                        <time
                          className="inbox-detail-date"
                          dateTime={selectedNotif.createdAt}
                        >
                          {fullDate(selectedNotif.createdAt, lang)}
                        </time>
                      </div>
                    </div>
                  );
                })()}

                <h2 className="inbox-detail-title">
                  {translateText(t, selectedNotif.title, lang)}
                </h2>

                <div className="inbox-detail-divider" />

                <div className="inbox-detail-content">
                  {selectedNotif.body
                    ? translateText(t, selectedNotif.body, lang)
                    : t("inbox.noContent")}
                </div>

                {selectedNotif.link && (
                  <div className="inbox-detail-link-section">
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => router.push(selectedNotif.link!)}
                      type="button"
                    >
                      {t("inbox.viewDetails")}
                      <ChevronRight size={14} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="inbox-detail-empty">
              <div className="inbox-detail-empty-icon">
                <Mail size={30} />
              </div>
              <p className="inbox-detail-empty-title">
                {t("inbox.selectMessage")}
              </p>
              <p className="inbox-detail-empty-desc">
                {t("inbox.selectMessageDesc")}
              </p>
            </div>
          )}
        </aside>
      </section>
    </div>
  );
}