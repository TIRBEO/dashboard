"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Users, DollarSign, Activity, Clock } from "lucide-react";
import { PageContainer, PageHeader, Card, StatCard, Select, Skeleton } from "../../components";

const API = process.env.NEXT_PUBLIC_API_URL || "https://api.tirbeo.app";

type AnalyticsData = {
  period: string;
  users: { current: number; change: number; trend: "up" | "down" | "neutral" };
  revenue: { current: number; change: number; trend: "up" | "down" | "neutral" };
  activity: { current: number; change: number; trend: "up" | "down" | "neutral" };
  signups: { current: number; change: number; trend: "up" | "down" | "neutral" };
  engagement: { current: number; change: number; trend: "up" | "down" | "neutral" };
};

type HistoricalData = {
  date: string;
  users: number;
  revenue: number;
  signups: number;
  sessions: number;
  transactions: number;
};

export default function WorkspaceOverviewPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [historical, setHistorical] = useState<HistoricalData[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("month");
  const fetched = useRef(false);

  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;
    loadData(period);
  }, [period]);

  const loadData = useCallback((p: string) => {
    setLoading(true);
    Promise.all([
      fetch(API + "/api/workspaces/1/analytics?period=" + p, { credentials: "include" }).then((r) => (r.ok ? r.json() : null)),
      fetch(API + "/api/workspaces/1/analytics/historical?period=" + p, { credentials: "include" }).then((r) => (r.ok ? r.json() : [])),
    ])
      .then(([analyticsData, historicalData]) => {
        setData(analyticsData || null);
        setHistorical(historicalData || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
  };

  if (loading || !data) {
    return (
      <PageContainer>
        <Skeleton count={1} height={60} />
        <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}>
          {[...Array(5)].map((_, i) => <Skeleton key={i} height={100} />)}
        </div>
        <Skeleton count={1} height={300} />
      </PageContainer>
    );
  }

  const trendChange = (change: number, trend: string) => {
    if (trend === "up") return "+" + change + "%";
    if (trend === "down") return change + "%";
    return "0%";
  };

  return (
    <PageContainer>
      <PageHeader title="Workspace Overview" description="Analytics and insights for your workspace" />

      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8 }}>
        <Select
          value={period}
          onChange={(v) => { setPeriod(v); }}
          options={[
            { label: "Today", value: "today" },
            { label: "This Week", value: "week" },
            { label: "This Month", value: "month" },
            { label: "This Quarter", value: "quarter" },
            { label: "This Year", value: "year" },
          ]}
        />
      </div>

      <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}>
        <StatCard label="Active Users" value={data.users.current} change={trendChange(data.users.change, data.users.trend)} icon={Users} color="var(--success)" />
        <StatCard label="Revenue" value={formatCurrency(data.revenue.current)} change={trendChange(data.revenue.change, data.revenue.trend)} icon={DollarSign} color="var(--gold)" />
        <StatCard label="Activity" value={data.activity.current} change={trendChange(data.activity.change, data.activity.trend)} icon={Activity} color="var(--success)" />
        <StatCard label="Signups" value={data.signups.current} change={trendChange(data.signups.change, data.signups.trend)} icon={Users} color="var(--gold)" />
        <StatCard label="Engagement" value={data.engagement.current + "%"} change={trendChange(data.engagement.change, data.engagement.trend)} icon={Clock} color="var(--gold)" />
      </div>

      <Card title="Historical Trends" subtitle={historical.length + " data points"}>
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          <button className="btn btn-ghost" style={{ height: 32, padding: "0 12px", fontSize: 12 }}>Export</button>
          <button className="btn btn-ghost" style={{ height: 32, padding: "0 12px", fontSize: 12 }}>Import</button>
        </div>
        <div style={{ height: 300, position: "relative" }}>
          <div style={{ display: "flex", height: "100%", alignItems: "flex-end", gap: 2, paddingBottom: 20 }}>
            {historical.slice(-14).map((day) => {
              var maxValue = Math.max(...historical.map((d) => d.users));
              var height = maxValue > 0 ? Math.max(4, (day.users / maxValue) * 100) : 4;
              return (
                <div key={day.date} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                  <div style={{ height: height + "%", background: "var(--gold)", borderRadius: "2px 2px 0 0", width: "100%", maxWidth: 24, transition: "height 0.3s ease" }} />
                  <p style={{ fontSize: 10, color: "var(--text-muted)" }}>{new Date(day.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</p>
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))" }}>
        <Card title="User Sources">
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[
              { label: "Direct", pct: "45%", color: "var(--gold)" },
              { label: "Social", pct: "30%", color: "var(--text-muted)" },
              { label: "Referrals", pct: "25%", color: "var(--text-ash)" },
            ].map((s) => (
              <div key={s.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--border)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 12, height: 12, borderRadius: "50%", background: s.color }} />
                  <span style={{ fontSize: 12, color: "var(--text)" }}>{s.label}</span>
                </div>
                <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{s.pct}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Activity Summary">
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[
              { label: "New Members", value: "12 today", color: "var(--success)" },
              { label: "Active Sessions", value: "128 total", color: "var(--gold)" },
              { label: "Messages", value: "47 today", color: "var(--text-muted)" },
            ].map((s) => (
              <div key={s.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--border)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 12, height: 12, borderRadius: "50%", background: s.color }} />
                  <span style={{ fontSize: 12, color: "var(--text)" }}>{s.label}</span>
                </div>
                <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{s.value}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </PageContainer>
  );
}
