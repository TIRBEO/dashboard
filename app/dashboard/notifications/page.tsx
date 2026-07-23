"use client";

import { useState, useEffect, useCallback } from "react";
import { Bell, X } from "lucide-react";
import {
  PageContainer,
  PageHeader,
  Card,
  Button,
  Badge,
  EmptyState,
  Skeleton,
  Toast,
  useToast,
} from "../components";

const API = process.env.NEXT_PUBLIC_API_URL || "https://api.tirbeo.app";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [markAllLoading, setMarkAllLoading] = useState(false);
  const { toast, show, hide } = useToast();

  const loadNotifications = useCallback(() => {
    setLoading(true);
    fetch(API + "/api/notifications?limit=50", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : { notifications: [], unread: 0 }))
      .then((d) => {
        setNotifications(d.notifications || []);
        setUnreadCount(d.unread || 0);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const markAllRead = async () => {
    setMarkAllLoading(true);
    try {
      await fetch(API + "/api/notifications", {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAll: true }),
      });
      setNotifications((n) => n.map((item) => ({ ...item, read: true })));
      setUnreadCount(0);
      show("All notifications marked as read");
    } catch {
      show("Failed to mark notifications", "error");
    }
    setMarkAllLoading(false);
  };

  const deleteNotification = async (id: string) => {
    try {
      await fetch(API + "/api/notifications?id=" + id, {
        method: "DELETE",
        credentials: "include",
      });
      setNotifications((n) => n.filter((item) => item.id !== id));
      const deleted = notifications.find((item) => item.id === id);
      if (deleted && !deleted.read) {
        setUnreadCount((c) => Math.max(0, c - 1));
      }
    } catch {}
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "mention": return "@";
      case "message": return "\u2709";
      case "task": return "\u2713";
      case "system": return "\u2699";
      default: return "\u2022";
    }
  };

  return (
    <PageContainer>
      {toast && <Toast message={toast.message} type={toast.type} onClose={hide} />}

      <PageHeader
        title="Notifications"
        description="Manage all your notifications and alerts"
        action={
          unreadCount > 0 ? (
            <Button onClick={markAllRead} disabled={markAllLoading}>
              {markAllLoading ? "Marking..." : "Mark All Read (" + unreadCount + ")"}
            </Button>
          ) : undefined
        }
      />

      <Card>
        {loading ? (
          <Skeleton count={4} height={72} />
        ) : notifications.length === 0 ? (
          <EmptyState
            icon={Bell}
            title="No notifications"
            description="You're all caught up!"
          />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {notifications.map((notif) => (
              <div
                key={notif.id}
                style={{
                  padding: "12px 16px",
                  borderRadius: 10,
                  border: "1px solid " + (notif.read ? "var(--border)" : "rgba(216,179,106,0.3)"),
                  background: notif.read ? "transparent" : "rgba(216,179,106,0.05)",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 12,
                }}
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    background: "var(--bg-surface-elevated)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 14,
                    flexShrink: 0,
                    marginTop: 2,
                  }}
                >
                  {getTypeIcon(notif.type)}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    {!notif.read && (
                      <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#d8b36a", flexShrink: 0 }} />
                    )}
                    <p style={{ fontSize: 13, fontWeight: 500, color: notif.read ? "var(--text-muted)" : "var(--text)" }}>
                      {notif.title}
                    </p>
                    {notif.type && (
                      <Badge>{notif.type}</Badge>
                    )}
                  </div>
                  {notif.body && (
                    <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4, lineHeight: 1.5 }}>
                      {notif.body}
                    </p>
                  )}
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 8 }}>
                    <span style={{ fontSize: 11, color: "var(--text-ash)" }}>
                      {new Date(notif.createdAt).toLocaleString()}
                    </span>
                    {notif.link && (
                      <a
                        href={notif.link}
                        style={{ fontSize: 11, color: "var(--accent)", textDecoration: "none" }}
                      >
                        View details
                      </a>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => deleteNotification(notif.id)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "var(--text-ash)",
                    cursor: "pointer",
                    padding: 4,
                    fontSize: 16,
                    lineHeight: 1,
                    flexShrink: 0,
                  }}
                  title="Delete"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </Card>
    </PageContainer>
  );
}
