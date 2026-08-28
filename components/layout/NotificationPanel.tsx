"use client";

import { useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Inbox, Info } from "lucide-react";
import type { NotificationItem } from "@/lib/types";
import type { I18nT } from "@/lib/i18n";
import {
  getTypeMeta as getNotifMeta,
  notifFullDate as notifDate,
  notifTimeAgo as notifAgo,
} from "@/lib/notif-shared";
import { translateNotifText } from "@/lib/i18n";
import { cn } from "@/lib/utils";

/* ── Helpers ───────────────────────────────────────────────── */

function translateText(t: I18nT, text?: string, lang?: string) {
  if (!text) return text || "";
  if (lang) return translateNotifText(text, lang);
  const translated = t(`notifTexts.${text}`);
  if (translated !== `notifTexts.${text}`) return translated;
  const m = text.match(/^Your recovery email \(([^)]+)\) has been confirmed\.$/);
  if (m) return t("notifTexts.recoveryEmailBody", { email: m[1] });
  return text;
}

/* ── Notification Panel ────────────────────────────────────── */

interface NotificationPanelProps {
  open: boolean;
  notifications: NotificationItem[];
  unread: number;
  notifTotal: number;
  notifHasMore: boolean;
  notifLoading: boolean;
  lang: string;
  t: I18nT;
  onClose: () => void;
  onMarkAllRead: () => void;
  onMarkRead: (id: string) => void;
  onLoadMore: () => void;
}

export function NotificationPanel({
  open,
  notifications,
  unread,
  notifTotal,
  notifHasMore,
  notifLoading,
  lang,
  t,
  onClose,
  onMarkAllRead,
  onMarkRead,
  onLoadMore,
}: NotificationPanelProps) {
  const router = useRouter();
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  // Infinite scroll observer
  useEffect(() => {
    if (!open) return;
    const node = loadMoreRef.current;
    if (!node || !notifHasMore || notifLoading) return;
    const parent = node.parentElement;
    if (!parent) return;
    const obs = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting) void onLoadMore(); },
      { root: parent, threshold: 0.6, rootMargin: "120px" },
    );
    obs.observe(node);
    return () => obs.disconnect();
  }, [open, notifHasMore, notifLoading, onLoadMore]);

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[90] bg-black/40 backdrop-blur-[2px] animate-[fadeIn_150ms_ease-out]"
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className="fixed top-0 right-0 z-[95] w-[380px] max-w-[100vw] h-full bg-tb-bg border-l border-tb-border shadow-[-8px_0_30px_rgba(0,0,0,0.4)] flex flex-col animate-[slideInRight_200ms_cubic-bezier(0.16,1,0.3,1)]"
        role="dialog"
        aria-label={t("header.notifications")}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-tb-border shrink-0">
          <span className="flex items-center gap-2 text-sm font-semibold text-tb-text-primary">
            {t("notif.title")}
            {unread > 0 && (
              <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-tb-surface-3 text-[11px] font-semibold text-tb-text-secondary tabular-nums">
                {unread}
              </span>
            )}
          </span>
          <div className="flex items-center gap-1">
            {unread > 0 && (
              <button
                type="button"
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[13px] font-medium text-tb-text-muted hover:text-tb-text-primary hover:bg-tb-surface-2 transition-colors"
                onClick={onMarkAllRead}
              >
                {t("common.markRead")}
              </button>
            )}
            <button
              type="button"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[13px] font-medium text-tb-text-muted hover:text-tb-text-primary hover:bg-tb-surface-2 transition-colors"
              onClick={() => { onClose(); router.push("/account/inbox"); }}
            >
              <Inbox size={14} />
              {t("nav.inbox")}
            </button>
          </div>
        </div>

        {/* Retention notice */}
        <div className="flex items-center gap-2 px-5 py-2.5 text-[11px] text-tb-text-muted bg-tb-surface-1 border-b border-tb-border shrink-0">
          <Info size={13} className="shrink-0" />
          <span>{t("notif.retention")}</span>
        </div>

        {/* Notification list */}
        <div className="flex-1 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
              <Inbox size={32} className="text-tb-text-disabled mb-3" />
              <p className="text-sm text-tb-text-muted">{t("notif.empty")}</p>
            </div>
          ) : (
            notifications.map((n) => {
              const meta = getNotifMeta(n.type, t);
              const NotifIcon = meta.icon;
              return (
                <div
                  key={n.id}
                  className={cn(
                    "relative flex items-start gap-3 px-5 py-3.5 border-b border-tb-border/50 cursor-pointer transition-colors",
                    !n.read && "bg-[rgba(37,99,235,0.03)]",
                    "hover:bg-tb-surface-2/50"
                  )}
                  onClick={() => {
                    if (!n.read) void onMarkRead(n.id);
                    onClose();
                    router.push(n.link || "/account/inbox");
                  }}
                >
                  {/* Unread dot */}
                  {!n.read && (
                    <span className="absolute left-1.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-tb-blue shrink-0" />
                  )}

                  {/* Icon */}
                  <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-tb-surface-3 text-tb-text-muted shrink-0 mt-0.5">
                    <NotifIcon size={14} />
                  </div>

                  {/* Body */}
                  <div className="flex-1 min-w-0">
                    <div className={cn(
                      "text-[13px] leading-snug",
                      !n.read ? "font-medium text-tb-text-primary" : "text-tb-text-secondary"
                    )}>
                      {translateText(t, n.title, lang)}
                    </div>
                    {n.body && (
                      <div className="text-[12px] text-tb-text-muted mt-0.5 line-clamp-2">
                        {translateText(t, n.body, lang)}
                      </div>
                    )}
                  </div>

                  {/* Time */}
                  <span
                    className="text-[11px] text-tb-text-muted tabular-nums shrink-0 mt-0.5"
                    title={notifDate(n.createdAt, lang)}
                  >
                    {notifAgo(n.createdAt, t, lang)}
                  </span>
                </div>
              );
            })
          )}

          {/* Infinite scroll trigger */}
          {notifHasMore && (
            <div ref={loadMoreRef} className="flex items-center justify-center py-4 text-[12px] text-tb-text-muted">
              {notifLoading ? t("common.loading") : t("common.loadMore")}
            </div>
          )}
        </div>

        {/* Footer */}
        {notifTotal > 0 && (
          <button
            type="button"
            className="flex items-center justify-center w-full px-5 py-3 text-[13px] text-tb-text-muted hover:text-tb-text-primary hover:bg-tb-surface-1 border-t border-tb-border transition-colors shrink-0"
            onClick={() => { onClose(); router.push("/account/inbox"); }}
          >
            {notifTotal} {t("notif.total")} · {t("nav.inbox")}
          </button>
        )}
      </div>
    </>
  );
}
