"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { BarChart, TrendingUp, TrendingDown, Users, DollarSign, Activity, Calendar, Clock, Download, Upload } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "https://api.tirbeo.app";

type AnalyticsData = {
  period: "today" | "week" | "month" | "quarter" | "year";
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
  const [period, setPeriod] = useState<"today" | "week" | "month" | "quarter" | "year">("month");
  const fetched = useRef(false);

  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;
    loadData(period);
  }, [period]);

  const loadData = useCallback((p: typeof period) => {
    setLoading(true);
    Promise.all([
      fetch(`${API}/api/workspaces/1/analytics?period=${p}`, { credentials: "include" }).then((r) => (r.ok ? r.json() : null)),
      fetch(`${API}/api/workspaces/1/analytics/historical?period=${p}`, { credentials: "include" }).then((r) => (r.ok ? r.json() : [])),
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

  const getTrendIcon = (trend: "up" | "down" | "neutral") => {
    switch (trend) {
      case "up": return <TrendingUp size={14} style={{ color: "#59d499" }} />;
      case "down": return <TrendingDown size={14} style={{ color: "#ff6161" }} />;
      default: return <BarChart size={14} style={{ color: "#7b7e84" }} />;
    }
  };

  const getTrendColor = (trend: "up" | "down" | "neutral") => {
    switch (trend) {
      case "up": return "#59d499";
      case "down": return "#ff6161";
      default: return "#7b7e84";
    }
  };

  if (loading || !data) {
    return (
      <div className="space-y-6">
        <div className="glass card-section animate-in">
          <div className="skeleton" style={{ height: 60 }} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="glass card-section animate-in">
              <div className="skeleton" style={{ height: 100 }} />
            </div>
          ))}
        </div>
        <div className="glass card-section animate-in">
          <div className="skeleton" style={{ height: 300 }} />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="section-header">
        <h1>Workspace Overview</h1>
        <p>Analytics and insights for your workspace</p>
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 20 }}>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value as typeof period)}
          className="input-field"
          style={{ height: 36, width: 140, fontSize: 12 }}
        >
          <option value="today">Today</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="quarter">This Quarter</option>
          <option value="year">This Year</option>
        </select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <div className="glass card-section">
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
            <div style={{ padding: "8px", borderRadius: 8, background: "rgba(87,212,153,0.1)" }}>
              <Users size={18} style={{ color: "#59d499" }} />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 12, color: "#9c9c9d", marginBottom: 4 }}>Active Users</p>
              <p style={{ fontSize: 20, fontWeight: 700, color: "#ffffff" }}>{data.users.current}</p>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            {getTrendIcon(data.users.trend)}
            <span style={{ fontSize: 11, color: getTrendColor(data.users.trend) }}>{data.users.change > 0 ? `+${data.users.change}%` : `${data.users.change}%`} vs previous</span>
          </div>
        </div>

        <div className="glass card-section">
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
            <div style={{ padding: "8px", borderRadius: 8, background: "rgba(216,179,106,0.1)" }}>
              <DollarSign size={18} style={{ color: "#d8b36a" }} />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 12, color: "#9c9c9d", marginBottom: 4 }}>Revenue</p>
              <p style={{ fontSize: 20, fontWeight: 700, color: "#ffffff" }}>{formatCurrency(data.revenue.current)}</p>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            {getTrendIcon(data.revenue.trend)}
            <span style={{ fontSize: 11, color: getTrendColor(data.revenue.trend) }}>{data.revenue.change > 0 ? `+${data.revenue.change}%` : `${data.revenue.change}%`} vs previous</span>
          </div>
        </div>

        <div className="glass card-section">
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
            <div style={{ padding: "8px", borderRadius: 8, background: "rgba(87,212,153,0.1)" }}>
              <Activity size={18} style={{ color: "#59d499" }} />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 12, color: "#9c9c9d", marginBottom: 4 }}>Activity</p>
              <p style={{ fontSize: 20, fontWeight: 700, color: "#ffffff" }}>{data.activity.current}</p>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            {getTrendIcon(data.activity.trend)}
            <span style={{ fontSize: 11, color: getTrendColor(data.activity.trend) }}>{data.activity.change > 0 ? `+${data.activity.change}%` : `${data.activity.change}%`} vs previous</span>
          </div>
        </div>

        <div className="glass card-section">
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
            <div style={{ padding: "8px", borderRadius: 8, background: "rgba(87,212,153,0.1)" }}>
              <Users size={18} style={{ color: "#59d499" }} />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 12, color: "#9c9c9d", marginBottom: 4 }}>Signups</p>
              <p style={{ fontSize: 20, fontWeight: 700, color: "#ffffff" }}>{data.signups.current}</p>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            {getTrendIcon(data.signups.trend)}
            <span style={{ fontSize: 11, color: getTrendColor(data.signups.trend) }}>{data.signups.change > 0 ? `+${data.signups.change}%` : `${data.signups.change}%`} vs previous</span>
          </div>
        </div>

        <div className="glass card-section">
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
            <div style={{ padding: "8px", borderRadius: 8, background: "rgba(216,179,106,0.1)" }}>
              <Clock size={18} style={{ color: "#d8b36a" }} />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 12, color: "#9c9c9d", marginBottom: 4 }}>Engagement</p>
              <p style={{ fontSize: 20, fontWeight: 700, color: "#ffffff" }}>{data.engagement.current}%</p>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            {getTrendIcon(data.engagement.trend)}
            <span style={{ fontSize: 11, color: getTrendColor(data.engagement.trend) }}>{data.engagement.change > 0 ? `+${data.engagement.change}%` : `${data.engagement.change}%`} vs previous</span>
          </div>
        </div>
      </div>

      <div className="glass card-section">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <div>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: "#ffffff", margin: 0 }}>Historical Trends</h3>
            <p style={{ fontSize: 13, color: "#7b7e84", margin: "4px 0 0" }}>{historical.length} data points</p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn btn-ghost" style={{ height: 32, padding: "0 12px", fontSize: 12 }}>
              <Download size={14} /> Export
            </button>
            <button className="btn btn-ghost" style={{ height: 32, padding: "0 12px", fontSize: 12 }}>
              <Upload size={14} /> Import
            </button>
          </div>
        </div>

        <div style={{ height: 300, position: "relative" }}>
          <div style={{ display: "flex", height: "100%", alignItems: "flex-end", gap: 2, paddingBottom: 20 }}>
            {historical.slice(-14).map((day, idx) => {
              const maxValue = Math.max(...historical.map(d => d.users));
              const height = maxValue > 0 ? Math.max(4, (day.users / maxValue) * 100) : 4;
              return (
                <div key={day.date} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                  <div
                    style={{
                      height: `${height}%`,
                      background: "#d8b36a",
                      borderRadius: "2px 2px 0 0",
                      width: "100%",
                      maxWidth: "24px",
                      transition: "height 0.3s ease",
                    }}
                  />
                  <p style={{ fontSize: 10, color: "#9c9c9d" }}>{new Date(day.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</p>
                </div>
              );
            })}
          </div>
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 20, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 4px" }}>
            <span style={{ fontSize: 10, color: "#9c9c9d" }}>0</span>
            <span style={{ fontSize: 10, color: "#9c9c9d" }}>{Math.max(...historical.map(d => d.users))}</span>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="glass card-section">
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
            <Users size={16} style={{ color: "#d8b36a" }} />
            <h3 style={{ fontSize: 13, fontWeight: 600, color: "#ffffff" }}>User Sources</h3>
          </div>
          <div className="space-y-3">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--border)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#d8b36a" }} />
                <span style={{ fontSize: 12, color: "#ffffff" }}>Direct</span>
              </div>
              <span style={{ fontSize: 12, color: "#7b7e84" }}>45%</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--border)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#7b7e84" }} />
                <span style={{ fontSize: 12, color: "#ffffff" }}>Social</span>
              </div>
              <span style={{ fontSize: 12, color: "#7b7e84" }}>30%</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 0" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#9c9c9d" }} />
                <span style={{ fontSize: 12, color: "#ffffff" }}>Referrals</span>
              </div>
              <span style={{ fontSize: 12, color: "#7b7e84" }}>25%</span>
            </div>
          </div>
        </div>

        <div className="glass card-section">
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
            <Calendar size={16} style={{ color: "#d8b36a" }} />
            <h3 style={{ fontSize: 13, fontWeight: 600, color: "#ffffff" }}>Activity Summary</h3>
          </div>
          <div className="space-y-3">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--border)\" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#59d499" }} />
                <span style={{ fontSize: 12, color: "#ffffff" }}>New Members</span>
              </div>
              <span style={{ fontSize: 12, color: "#7b7e84" }}>12 today</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--border)\" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#d8b36a" }} />
                <span style={{ fontSize: 12, color: "#ffffff" }}>Active Sessions</span>
              </div>
              <span style={{ fontSize: 12, color: "#7b7e84" }}>128 total</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 0\" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#9c9c9d\" }} >
                  <span style={{ fontSize: 12, color: "#ffffff" }}>Messages</span>
                </div>
                <span style={{ fontSize: 12, color: "#7b7e84" }}>47 today</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
