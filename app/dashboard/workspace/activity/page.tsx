"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Calendar, Activity, User, Clock, FileText } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "https://api.tirbeo.app";

type ActivityEvent = {
  id: string;
  action: string;
  actor: { name: string; email: string };
  createdAt: string;
  metadata?: Record<string, unknown>;
};

export default function WorkspaceActivityPage() {
  const [events, setEvents] = useState<ActivityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const fetched = useRef(false);

  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;

    fetch(`${API}/api/workspaces/1/activity?limit=100`, { credentials: "include" })
      .then((r) => (r.ok ? r.json() : []))
      .then(setEvents)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const formatTime = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="glass card-section animate-in">
          <div className="skeleton" style={{ height: 60 }} />
        </div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="glass card-section animate-in">
            <div className="skeleton" style={{ height: 80 }} />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="section-header">
        <h1>Activity</h1>
        <p>Recent activity in your workspace</p>
      </div>

      <div className="glass card-section">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <div>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: "#ffffff", margin: 0 }}>Timeline</h3>
            <p style={{ fontSize: 13, color: "#7b7e84", margin: "4px 0 0" }}>{events.length} total events</p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <select className="input-field" style={{ height: 36, fontSize: 12, padding: "4px 8px" }}>
              <option>All Events</option>
              <option>Recent Week</option>
              <option>Recent Month</option>
            </select>
          </div>
        </div>

        {events.length === 0 ? (
          <div className="text-center py-12">
            <Activity size={48} style={{ color: "var(--text-muted)", margin: "0 auto 12px" }} />
            <p style={{ fontSize: 15, color: "var(--text-muted)" }}>No activity yet</p>
            <p style={{ fontSize: 13, color: "var(--text-ash)", marginTop: 8 }}>Activity will appear as members work</p>
          </div>
        ) : (
          <div className="relative ml-6 space-y-6" style={{ paddingLeft: 30 }}>
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-border" style={{ marginLeft: -20 }} />
            {events.map((event, idx) => (
              <div key={event.id} className="relative pl-8">
                <div className="absolute left-0 top-2 w-6 h-6 rounded-full bg-surface-elevated border-2 border-accent flex items-center justify-center">
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--accent)" }} />
                </div>
                <div className="glass card-section" style={{ marginLeft: 8, marginBottom: 0 }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: "#ffffff", margin: 0 }}>
                        {event.action.split(".").pop()?.replace(/([A-Z])/g, " $1").trim()}
                      </p>
                      <p style={{ fontSize: 12, color: "#7b7e84", marginTop: 2 }}>
                        by <span style={{ color: "var(--accent)" }}>{event.actor.name || event.actor.email}</span> • {formatTime(event.createdAt)}
                      </p>
                    </div>
                    <span style={{ fontSize: 11, color: "#7b7e84" }}>{new Date(event.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                  </div>
                  {event.metadata && Object.keys(event.metadata).length > 0 && (
                    <div style={{ marginTop: 8, padding: 8, borderRadius: 6, background: "rgba(28,31,35,0.4)" }}>
                      {Object.entries(event.metadata).slice(0, 2).map(([key, value]) => (
                        <div key={key} style={{ fontSize: 11, color: "#7b7e84", marginBottom: 2 }}>
                          <span style={{ color: "#9c9c9d" }}>{key}:</span> {String(value)}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
