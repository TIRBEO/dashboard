"use client";

import { useState } from "react";
import { Bell, CalendarDays, Moon, Monitor } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "https://api.tirbeo.app";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [markAllLoading, setMarkAllLoading] = useState(false);

  const loadNotifications = () => {
    setLoading(true);
    fetch(`${API}/api/notifications?limit=50`, { credentials: "include" })
      .then((r) => r.ok ? r.json() : { notifications: [], unread: 0 })
      .then((d) => {
        setNotifications(d.notifications || []);
        setUnreadCount(d.unread || 0);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  const markAllRead = async () => {
    setMarkAllLoading(true);
    try {
      await fetch(`${API}/api/notifications`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAll: true }),
      });
      setNotifications((n) => n.map((item) => ({ ...item, read: true })));
      setUnreadCount(0);
    } catch {}
    setMarkAllLoading(false);
  };

  const deleteNotification = async (id: string) => {
    try {
      await fetch(`${API}/api/notifications?id=${id}`, {
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

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Notifications</h1>
          <p className="text-muted-foreground mt-1">Manage all your notifications and alerts</p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            disabled={markAllLoading}
            className="px-4 py-2 bg-surface-elevated text-white rounded-lg border border-hairline hover:border-primary/30 disabled:opacity-50"
          >
            {markAllLoading ? "Marking..." : `Mark All Read (${unreadCount})`}
          </button>
        )}
      </div>

      <div className="glass card-section">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-8">
            <Bell size={48} className="mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium text-white mb-2">No notifications</h3>
            <p className="text-muted-foreground">You're all caught up!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notif) => (
              <div
                key={notif.id}
                className={`p-4 rounded-lg border transition-colors ${notif.read ? "bg-surface border-hairline" : "bg-primary/10 border-primary/30"
                  }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {!notif.read && (
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                      )}
                      <h3 className={`font-medium ${notif.read ? "text-muted-foreground" : "text-white"}`}>{notif.title}</h3>
                      {notif.type && (
                        <span className="px-2 py-0.5 rounded text-xs bg-surface-elevated text-muted-foreground">
                          {notif.type}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {notif.body}
                    </p>
                    <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                      <span>{new Date(notif.createdAt).toLocaleString()}</span>
                      {notif.link && (
                        <a href={notif.link} className="text-primary hover:underline">
                          View details
                        </a>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => deleteNotification(notif.id)}
                    className="text-muted-foreground hover:text-white ml-4"
                    title="Delete notification"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
