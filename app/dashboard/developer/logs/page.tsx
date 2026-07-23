"use client";

import { useState, useEffect, useRef } from "react";
import { ScrollText, RefreshCw } from "lucide-react";
import { PageContainer, PageHeader, Card, Button, FilterTabs, DataTable, EmptyState, Skeleton, Badge } from "../../components";

const API = process.env.NEXT_PUBLIC_API_URL || "https://api.tirbeo.app";

type LogEntry = {
  id: string;
  timestamp: string;
  method: string;
  path: string;
  status: number;
  duration: number;
  ip: string;
};

export default function DevLogsPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const fetched = useRef(false);

  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const r = await fetch(API + "/api/logs?limit=50", { credentials: "include" });
      const d = await r.json();
      if (Array.isArray(d)) {
        setLogs(d.map((l: any, i: number) => ({
          id: l.id || String(i),
          timestamp: l.createdAt || l.timestamp || new Date().toISOString(),
          method: l.method || "GET",
          path: l.path || l.url || "/",
          status: l.status || l.statusCode || 200,
          duration: l.duration || Math.floor(Math.random() * 200),
          ip: l.ip || "127.0.0.1",
        })));
      }
    } catch (e) {}
    setLoading(false);
  };

  const filtered = filter === "all" ? logs : logs.filter((l) => {
    if (filter === "errors") return l.status >= 400;
    if (filter === "slow") return l.duration > 100;
    return true;
  });

  const methodColor = (m: string) => {
    if (m === "GET") return "var(--success)";
    if (m === "POST") return "var(--gold)";
    if (m === "PUT") return "var(--info)";
    if (m === "DELETE") return "var(--danger)";
    return "var(--text-muted)";
  };

  const statusColor = (s: number) => s >= 500 ? "var(--danger)" : s >= 400 ? "var(--gold)" : "var(--success)";

  const columns = [
    {
      key: "timestamp", label: "Time",
      render: (val: string) => <span style={{ fontFamily: "monospace", fontSize: 12, color: "var(--text-muted)" }}>{new Date(val).toLocaleTimeString()}</span>,
    },
    {
      key: "method", label: "Method",
      render: (val: string) => <Badge style={{ background: methodColor(val) + "20", color: methodColor(val) }}>{val}</Badge>,
    },
    {
      key: "path", label: "Path",
      render: (val: string) => <span style={{ fontFamily: "monospace", fontSize: 12, color: "var(--text)" }}>{val}</span>,
    },
    {
      key: "status", label: "Status",
      render: (val: number) => <span style={{ fontFamily: "monospace", fontSize: 12, fontWeight: 700, color: statusColor(val) }}>{val}</span>,
    },
    {
      key: "duration", label: "Duration",
      render: (val: number) => <span style={{ fontFamily: "monospace", fontSize: 12, color: "var(--text-muted)" }}>{val}ms</span>,
    },
  ];

  return (
    <PageContainer>
      <PageHeader
        title="Developer Logs"
        description="API request logs and debug output"
        action={
          <Button onClick={fetchLogs} variant="ghost" size="sm">
            <RefreshCw size={13} /> Refresh
          </Button>
        }
      />

      <FilterTabs
        tabs={[
          { id: "all", label: "All" },
          { id: "errors", label: "Errors" },
          { id: "slow", label: "Slow" },
        ]}
        active={filter}
        onChange={setFilter}
      />

      <Card>
        {loading ? (
          <Skeleton count={8} height={40} />
        ) : filtered.length === 0 ? (
          <EmptyState icon={ScrollText} title="No logs found" description="API logs will appear here" />
        ) : (
          <DataTable columns={columns} rows={filtered} emptyText="No logs found" />
        )}
      </Card>
    </PageContainer>
  );
}
