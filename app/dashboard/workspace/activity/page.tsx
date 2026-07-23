"use client";

import { useState, useEffect, useRef } from "react";
import { Activity } from "lucide-react";
import { PageContainer, PageHeader, Card, Select, EmptyState, Skeleton } from "../../components";

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
  const [filter, setFilter] = useState("all");
  const fetched = useRef(false);

  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;
    fetch(API + "/api/workspaces/1/activity?limit=100", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : []))
      .then(setEvents)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const formatTime = (dateStr: string) => {
    var diff = Date.now() - new Date(dateStr).getTime();
    var minutes = Math.floor(diff / 60000);
    if (minutes < 1) return "Just now";
    if (minutes < 60) return minutes + "m ago";
    var hours = Math.floor(minutes / 60);
    if (hours < 24) return hours + "h ago";
    return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  if (loading) return <PageContainer><Skeleton count={6} height={80} /></PageContainer>;

  return (
    <PageContainer>
      <PageHeader title="Activity" description="Recent activity in your workspace" />

      <Card title="Timeline" subtitle={events.length + " total events"} action={
        <Select value={filter} onChange={setFilter} options={[{ label: "All Events", value: "all" }, { label: "Recent Week", value: "week" }, { label: "Recent Month", value: "month" }]} />
      }>
        {events.length === 0 ? (
          <EmptyState icon={Activity} title="No activity yet" description="Activity will appear as members work" />
        ) : (
          <div style={{ position: "relative", paddingLeft: 30, display: "flex", flexDirection: "column", gap: 24 }}>
            <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 2, background: "var(--border)", marginLeft: 4 }} />
            {events.map((event) => (
              <div key={event.id} style={{ position: "relative" }}>
                <div style={{ position: "absolute", left: -26, top: 4, width: 12, height: 12, borderRadius: "50%", background: "var(--gold)", border: "2px solid var(--bg)" }} />
                <div style={{ padding: 16, borderRadius: 10, background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", margin: 0 }}>
                        {event.action.split(".").pop()?.replace(/([A-Z])/g, " $1").trim()}
                      </p>
                      <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
                        by <span style={{ color: "var(--gold)" }}>{event.actor.name || event.actor.email}</span> · {formatTime(event.createdAt)}
                      </p>
                    </div>
                    <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{new Date(event.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                  </div>
                  {event.metadata && Object.keys(event.metadata).length > 0 && (
                    <div style={{ marginTop: 8, padding: 8, borderRadius: 6, background: "rgba(0,0,0,0.3)" }}>
                      {Object.entries(event.metadata).slice(0, 2).map(([key, value]) => (
                        <div key={key} style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 2 }}>
                          <span style={{ color: "var(--text-ash)" }}>{key}:</span> {String(value)}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </PageContainer>
  );
}
