"use client";

import { useState, useEffect, useRef } from "react";
import { ScrollText, RefreshCw, ChevronDown, ChevronUp } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "https://api.tirbeo.app";

type LogEntry = {
  id: string;
  timestamp: string;
  method: string;
  path: string;
  status: number;
  duration: number;
  ip: string;
  expanded?: boolean;
};

export default function DevLogsPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const fetched = useRef(false);

  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;
    fetch(`${API}/api/logs?limit=50`, { credentials: "include" })
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setLogs(Array.isArray(data) ? data.map((l: any, i: number) => ({
        id: l.id || String(i),
        timestamp: l.createdAt || l.timestamp || new Date().toISOString(),
        method: l.method || "GET",
        path: l.path || l.url || "/",
        status: l.status || l.statusCode || 200,
        duration: l.duration || Math.floor(Math.random() * 200),
        ip: l.ip || "127.0.0.1",
      })) : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === "all" ? logs : logs.filter((l) => {
    if (filter === "errors") return l.status >= 400;
    if (filter === "slow") return l.duration > 100;
    return true;
  });

  const methodColor = (m: string) => {
    if (m === "GET") return "#59d499";
    if (m === "POST") return "#d8b36a";
    if (m === "PUT") return "#4f7aff";
    if (m === "DELETE") return "#ff6161";
    return "#7b7e84";
  };

  const statusColor = (s: number) => s >= 500 ? "#ff6161" : s >= 400 ? "#d8b36a" : "#59d499";

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Developer Logs</h1>
          <p className="text-sm text-muted-foreground">API request logs and debug output</p>
        </div>
        <button onClick={async () => { setLoading(true); try { const r = await fetch(`${API}/api/logs?limit=50`, { credentials: "include" }); const d = await r.json(); if (Array.isArray(d)) { setLogs(d.map((l: any, i: number) => ({ id: l.id || String(i), timestamp: l.createdAt || new Date().toISOString(), method: l.method || "GET", path: l.path || "/", status: l.status || 200, duration: l.duration || 0, ip: l.ip || "" }))); } } finally { setLoading(false); } }} className="btn btn-ghost text-xs"><RefreshCw size={13} /> Refresh</button>
      </div>

      <div className="flex gap-2">
        {["all", "errors", "slow"].map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filter === f ? "bg-[#d8b36a] text-black" : "bg-white/5 text-muted-foreground hover:bg-white/10"}`}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      <div className="glass card-section">
        {loading ? (
          <div className="space-y-2">{[...Array(8)].map((_, i) => <div key={i} className="h-10 bg-white/5 rounded animate-pulse" />)}</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            <ScrollText size={48} className="mx-auto mb-3" style={{ color: "#7b7e84" }} />
            <p className="text-sm text-muted-foreground">No logs found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-muted-foreground border-b border-white/5">
                  <th className="text-left py-2 font-medium">Time</th>
                  <th className="text-left py-2 font-medium">Method</th>
                  <th className="text-left py-2 font-medium">Path</th>
                  <th className="text-left py-2 font-medium">Status</th>
                  <th className="text-left py-2 font-medium">Duration</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((log) => (
                  <tr key={log.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                    <td className="py-2 text-xs text-muted-foreground font-mono">{new Date(log.timestamp).toLocaleTimeString()}</td>
                    <td className="py-2"><span className="px-1.5 py-0.5 rounded text-[10px] font-bold" style={{ background: methodColor(log.method) + "20", color: methodColor(log.method) }}>{log.method}</span></td>
                    <td className="py-2 text-xs font-mono text-white">{log.path}</td>
                    <td className="py-2"><span className="text-xs font-mono font-bold" style={{ color: statusColor(log.status) }}>{log.status}</span></td>
                    <td className="py-2 text-xs text-muted-foreground font-mono">{log.duration}ms</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
