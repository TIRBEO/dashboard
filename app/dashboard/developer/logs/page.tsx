"use client";

import { useState, useEffect, useRef } from "react";
import { Database, RefreshCw, AlertTriangle, Clock } from "lucide-react";
import { PageContainer, PageHeader, Card, Button, Badge, EmptyState, Skeleton, Toast, useToast } from "../../components";

const API = process.env.NEXT_PUBLIC_API_URL || "https://api.tirbeo.app";

type LogEntry = {
  id: string;
  action: string;
  targetType?: string;
  targetId?: string;
  severity?: string;
  metadata?: Record<string, any>;
  createdAt: string;
};

function severityColor(s?: string) {
  switch (s) {
    case "critical": return "danger";
    case "high": return "warning";
    case "medium": return "gold";
    default: return "default";
  }
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return minutes + "m ago";
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return hours + "h ago";
  const days = Math.floor(hours / 24);
  return days + "d ago";
}

export default function LogsPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "errors" | "auth" | "profile">("all");
  const fetched = useRef(false);
  const { toast, show, hide } = useToast();

  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;
    loadLogs();
  }, []);

  const loadLogs = () => {
    setLoading(true);
    fetch(API + "/api/user/activity?limit=100", { credentials: "include" })
      .then(r => r.ok ? r.json() : { activities: [] })
      .then(d => setLogs(d.activities || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  const filtered = logs.filter(log => {
    if (filter === "all") return true;
    if (filter === "errors") return log.severity === "critical" || log.severity === "high" || log.action.includes("DELETE") || log.action.includes("FAIL");
    if (filter === "auth") return log.action.includes("LOGIN") || log.action.includes("LOGOUT") || log.action.includes("SIGNUP") || log.action.includes("PASSWORD") || log.action.includes("2FA") || log.action.includes("SESSION");
    if (filter === "profile") return log.action.includes("PROFILE") || log.action.includes("AVATAR") || log.action.includes("PREFERENCE");
    return true;
  });

  const tabs = [
    { id: "all" as const, label: "All" },
    { id: "auth" as const, label: "Auth" },
    { id: "profile" as const, label: "Profile" },
    { id: "errors" as const, label: "Errors" },
  ];

  return (
    <PageContainer>
      {toast && <Toast message={toast.message} type={toast.type} onClose={hide} />}

      <PageHeader
        title="Activity Logs"
        description="Audit trail of all account activity"
        action={
          <Button variant="ghost" size="sm" onClick={loadLogs}>
            <RefreshCw size={13} /> Refresh
          </Button>
        }
      />

      <div style={{ display: "flex", gap: 4, marginBottom: 16 }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            style={{
              padding: "6px 14px", borderRadius: 8, fontSize: 12, fontWeight: 500, cursor: "pointer",
              background: filter === tab.id ? "var(--accent-muted)" : "transparent",
              color: filter === tab.id ? "var(--text)" : "var(--text-muted)",
              border: "1px solid " + (filter === tab.id ? "var(--border)" : "transparent"),
              transition: "all 0.15s",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <Card>
        {loading ? (
          <Skeleton count={5} height={56} />
        ) : filtered.length === 0 ? (
          <EmptyState icon={Database} title="No logs found" description="Activity will appear here as you use your account." />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {filtered.map(log => (
              <div key={log.id} style={{
                display: "flex", alignItems: "flex-start", gap: 12,
                padding: "10px 14px", borderRadius: 8,
                background: log.severity === "critical" || log.severity === "high" ? "rgba(255,97,97,0.05)" : "transparent",
              }}>
                <div style={{
                  width: 6, height: 6, borderRadius: "50%", flexShrink: 0, marginTop: 6,
                  background: log.severity === "critical" ? "var(--danger)" : log.severity === "high" ? "var(--warning)" : "var(--text-ash)",
                }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 13, fontWeight: 500, color: "var(--text)", fontFamily: "monospace" }}>
                      {log.action}
                    </span>
                    {log.targetType && (
                      <Badge>{log.targetType}</Badge>
                    )}
                    {(log.severity === "critical" || log.severity === "high") && (
                      <Badge variant={severityColor(log.severity)}>
                        <AlertTriangle size={10} style={{ marginRight: 3 }} /> {log.severity}
                      </Badge>
                    )}
                  </div>
                  {log.metadata && Object.keys(log.metadata).length > 0 && (
                    <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 3, fontFamily: "monospace" }}>
                      {Object.entries(log.metadata).slice(0, 3).map(([k, v]) => (
                        <span key={k} style={{ marginRight: 12 }}>{k}: {String(v).slice(0, 50)}</span>
                      ))}
                    </div>
                  )}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0, fontSize: 11, color: "var(--text-ash)" }}>
                  <Clock size={10} />
                  {timeAgo(log.createdAt)}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </PageContainer>
  );
}
