"use client";
import { useEffect, useState, useRef, useMemo } from "react";
import { api } from "@/lib/api";
import { useI18n } from "@/lib/i18n";
import { Skeleton } from "@/components/ui/Skeleton";
import {
  Database,
  Activity,
  Clock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Server,
  Wifi,
  WifiOff,
  MemoryStick,
  Zap,
  TrendingUp,
  TrendingDown,
  Shield,
} from "lucide-react";

/* ═══ Types ═══ */
interface PoolData {
  timestamp: string;
  database: { connected: boolean; latencyMs: number };
  pool: {
    totalCount: number;
    idleCount: number;
    waitingCount: number;
    config: { max: number; min: number; idleTimeoutMillis: number; connectionTimeoutMillis: number };
    utilization: { activeConnections: number; utilizationPercent: number; saturationPercent: number };
    health: { hasWaitingClients: boolean; isNearMaxCapacity: boolean; idleRatio: number };
    coldStart: { isColdStart: boolean; coldStartCount: number; avgWakeTimeMs: number; lastColdStartAt: string | null; idleThresholdMs: number };
    uptimeMs: number;
    uptimeFormatted: string;
    memory: { heapUsedMB: number; heapTotalMB: number; rssMB: number };
  };
  alerts: {
    isExhausted: boolean;
    waitingDurationMs: number;
    waitingDurationFormatted: string;
    totalAlerts: number;
    lastWarningAt: string | null;
    lastCriticalAt: string | null;
    thresholds: { warnMs: number; critMs: number };
  };
}

interface HealthData {
  status: string;
  checks: {
    database: { status: string; latencyMs: number };
    redis: { status: string; latencyMs: number; error?: string };
    redisConnections: {
      configured: boolean;
      total: number;
      connected: number;
      reconnects: number;
      failedRequests: number;
      healthy: boolean;
      clients: Record<string, { connected: boolean; reconnectCount: number; failedRequests: number; lastError: string; lastKeepAliveAt: number; keepAliveFailures: number }>;
    };
  };
}

/* ═══ Sparkline (inline SVG) ═══ */
function MiniSpark({ data, color = "var(--tb-brand)", w = 80, h = 24 }: { data: number[]; color?: string; w?: number; h?: number }) {
  if (data.length < 2) return null;
  const max = Math.max(...data, 1);
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - (v / max) * h}`);
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="block">
      <polyline points={pts.join(" ")} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ═══ Gauge Ring ═══ */
function GaugeRing({ value, max, label, color, size = 100 }: { value: number; max: number; label: string; color: string; size?: number }) {
  const pct = max > 0 ? Math.min(value / max, 1) : 0;
  const r = (size - 12) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - pct);
  return (
    <div className="flex flex-col items-center gap-1.5">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--tb-border)" strokeWidth="6" opacity="0.3" />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth="6" strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" transform={`rotate(-90 ${size / 2} ${size / 2})`} style={{ transition: "stroke-dashoffset 500ms ease" }} />
        <text x={size / 2} y={size / 2 + 2} textAnchor="middle" fontSize="18" fontWeight="700" fill="var(--tb-text-primary)" fontFamily="inherit">{Math.round(pct * 100)}%</text>
      </svg>
      <div className="text-[11px] text-tb-text-muted text-center">{label}</div>
    </div>
  );
}

/* ═══ Metric Card ═══ */
function MetricCard({ icon, label, value, sub, color }: { icon: React.ReactNode; label: string; value: string | number; sub?: string; color?: string }) {
  return (
    <div className="rounded-xl border border-tb-border bg-tb-surface-1 p-4 flex items-start gap-3">
      <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${color || "var(--tb-brand)"}15`, color: color || "var(--tb-brand)" }}>
        {icon}
      </div>
      <div className="min-w-0">
        <div className="text-[11px] text-tb-text-muted uppercase tracking-wider font-medium">{label}</div>
        <div className="text-xl font-bold text-tb-text-primary mt-0.5 leading-none">{value}</div>
        {sub && <div className="text-[11px] text-tb-text-muted mt-1">{sub}</div>}
      </div>
    </div>
  );
}

/* ═══ Status Badge ═══ */
function StatusBadge({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md ${ok ? "bg-[rgba(34,197,94,0.1)] text-[#22C55E] border border-[rgba(34,197,94,0.2)]" : "bg-[rgba(239,68,68,0.1)] text-[#EF4444] border border-[rgba(239,68,68,0.2)]"}`}>
      {ok ? <CheckCircle2 size={10} /> : <XCircle size={10} />}
      {label}
    </span>
  );
}

/* ═══ History Chart (SVG) ═══ */
function HistoryChart({ history, keys, colors, labels, h = 140 }: { history: Record<string, number>[]; keys: string[]; colors: string[]; labels: string[]; h?: number }) {
  const W = 600;
  const padL = 36;
  const padR = 8;
  const padT = 8;
  const padB = 20;
  const chartW = W - padL - padR;
  const chartH = h - padT - padB;

  const maxVal = Math.max(1, ...history.flatMap((snap) => keys.map((k) => snap[k] ?? 0)));

  function linePath(key: string) {
    return history
      .map((snap, i) => {
        const x = padL + (i / Math.max(history.length - 1, 1)) * chartW;
        const y = padT + chartH - ((snap[key] ?? 0) / maxVal) * chartH;
        return `${i === 0 ? "M" : "L"} ${x},${y}`;
      })
      .join(" ");
  }

  // Grid
  const ticks = [maxVal, Math.round(maxVal / 2), 0];
  const grid = ticks.map((t, i) => {
    const y = padT + ((maxVal - t) / maxVal) * chartH;
    return `<line x1="${padL}" x2="${W - padR}" y1="${y}" y2="${y}" stroke="var(--tb-border)" stroke-width="0.6" stroke-dasharray="${i === ticks.length - 1 ? "0" : "3 3"}" opacity="0.5"/><text x="${padL - 6}" y="${y + 3}" text-anchor="end" font-size="9" fill="var(--tb-text-muted)" font-family="inherit">${t}</text>`;
  }).join("");

  const lines = keys.map((k, i) => `<path d="${linePath(k)}" fill="none" stroke="${colors[i]}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" opacity="0.85"/>`).join("");

  const legendHtml = labels.map((l, i) => `<text x="${padL + i * 90}" y="${h - 4}" font-size="9" fill="${colors[i]}" font-family="inherit">${l}</text>`).join("");

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${h}`} className="block" style={{ minHeight: h }}>
      <defs>{grid}</defs>
      {grid}
      {lines}
      {legendHtml}
    </svg>
  );
}

/* ═══ Main Page ═══ */
export default function DebugPoolPage() {
  const { t } = useI18n();
  const [pool, setPool] = useState<PoolData | null>(null);
  const [health, setHealth] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(0);
  const [history, setHistory] = useState<Record<string, number>[]>([]);
  const [dbLatencyHistory, setDbLatencyHistory] = useState<number[]>([]);
  const [redisLatencyHistory, setRedisLatencyHistory] = useState<number[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchData = async () => {
    try {
      const [poolData, healthData] = await Promise.all([
        api.get<PoolData>("/api/health/pool"),
        api.get<HealthData>("/api/health"),
      ]);
      setPool(poolData);
      setHealth(healthData);
      setLastRefresh(Date.now());

      // Append to history (keep last 60 data points = 5 min at 5s interval)
      setHistory((prev) => {
        const snap: Record<string, number> = {
          total: poolData.pool?.totalCount ?? 0,
          idle: poolData.pool?.idleCount ?? 0,
          active: poolData.pool?.utilization?.activeConnections ?? 0,
          waiting: poolData.pool?.waitingCount ?? 0,
        };
        const next = [...prev, snap];
        return next.length > 60 ? next.slice(-60) : next;
      });
      setDbLatencyHistory((prev) => {
        const next = [...prev, poolData.database?.latencyMs ?? 0];
        return next.length > 60 ? next.slice(-60) : next;
      });
      setRedisLatencyHistory((prev) => {
        const next = [...prev, healthData.checks?.redis?.latencyMs ?? 0];
        return next.length > 60 ? next.slice(-60) : next;
      });
    } catch {
      // silently fail — will retry next tick
    }
  };

  useEffect(() => {
    fetchData().finally(() => setLoading(false));
    timerRef.current = setInterval(fetchData, 5000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col gap-6 max-w-[1200px] mx-auto p-6">
        <Skeleton width={200} height={24} />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">{[1, 2, 3, 4].map((i) => <Skeleton key={i} height={90} borderRadius={12} />)}</div>
        <Skeleton height={220} borderRadius={12} />
      </div>
    );
  }

  const p = pool?.pool;
  const db = pool?.database;
  const alerts = pool?.alerts;
  const rc = health?.checks?.redisConnections;
  const redis = health?.checks?.redis;
  const cold = p?.coldStart;

  const utilizationColor = (p?.utilization?.utilizationPercent ?? 0) > 80 ? "#EF4444" : (p?.utilization?.utilizationPercent ?? 0) > 50 ? "#EAB308" : "#22C55E";
  const saturationColor = (p?.utilization?.saturationPercent ?? 0) > 50 ? "#EF4444" : (p?.utilization?.saturationPercent ?? 0) > 20 ? "#EAB308" : "#22C55E";

  return (
    <div className="flex flex-col gap-5 max-w-[1200px] mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[26px] font-bold text-tb-text-primary tracking-[-0.03em] flex items-center gap-2.5 m-0">
            <Database size={22} className="text-tb-text-muted" />
            Pool Monitor
          </h1>
          <p className="text-[13px] text-tb-text-muted mt-1">Real-time database connection pool &amp; Redis health</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchData} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium bg-tb-surface-2 border border-tb-border text-tb-text-secondary hover:text-tb-text-primary cursor-pointer transition-colors">
            <RefreshCw size={12} className={lastRefresh && Date.now() - lastRefresh < 2000 ? "animate-spin" : ""} />
            Refresh
          </button>
          <span className="text-[10px] text-tb-text-muted">
            {new Date(lastRefresh).toLocaleTimeString()}
          </span>
        </div>
      </div>

      {/* Status bar */}
      <div className="flex items-center gap-3 flex-wrap">
        <StatusBadge ok={db?.connected ?? false} label={db?.connected ? `DB Connected (${db?.latencyMs}ms)` : "DB Disconnected"} />
        <StatusBadge ok={redis?.status === "ok"} label={redis?.status === "ok" ? `Redis OK (${redis?.latencyMs}ms)` : `Redis ${redis?.status || "unknown"}`} />
        <StatusBadge ok={!alerts?.isExhausted} label={alerts?.isExhausted ? `Pool Exhausted (${alerts.waitingDurationFormatted})` : "Pool Healthy"} />
        {cold?.isColdStart && <StatusBadge ok={false} label="Cold Start" />}
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <MetricCard icon={<Database size={16} />} label="Total Connections" value={p?.totalCount ?? 0} sub={`max: ${p?.config?.max ?? "?"}`} color="var(--tb-brand)" />
        <MetricCard icon={<Activity size={16} />} label="Active" value={p?.utilization?.activeConnections ?? 0} sub={`${p?.utilization?.utilizationPercent ?? 0}% utilization`} color="var(--tb-green)" />
        <MetricCard icon={<Clock size={16} />} label="Idle" value={p?.idleCount ?? 0} sub={`idle ratio: ${p?.health?.idleRatio ?? 0}%`} color="var(--tb-blue)" />
        <MetricCard icon={<AlertTriangle size={16} />} label="Waiting" value={p?.waitingCount ?? 0} sub={alerts?.isExhausted ? `for ${alerts.waitingDurationFormatted}` : "none waiting"} color={alerts?.isExhausted ? "#EF4444" : "var(--tb-text-muted)"} />
      </div>

      {/* Gauges + Latency chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Gauges */}
        <div className="rounded-2xl border border-tb-border bg-tb-surface-1 p-5 flex flex-col items-center justify-center gap-4">
          <div className="text-[13px] font-semibold text-tb-text-primary">Utilization</div>
          <div className="flex gap-6">
            <GaugeRing value={p?.utilization?.activeConnections ?? 0} max={p?.config?.max ?? 1} label="Active / Max" color={utilizationColor} />
            <GaugeRing value={p?.waitingCount ?? 0} max={Math.max(p?.config?.max ?? 1, 5)} label="Saturation" color={saturationColor} />
          </div>
          {p?.health?.isNearMaxCapacity && (
            <div className="text-[11px] text-[#EAB308] flex items-center gap-1 mt-1">
              <AlertTriangle size={11} /> Near max capacity ({p.utilization?.utilizationPercent}%)
            </div>
          )}
        </div>

        {/* Connection history */}
        <div className="lg:col-span-2 rounded-2xl border border-tb-border bg-tb-surface-1 p-5">
          <div className="text-[13px] font-semibold text-tb-text-primary mb-3">Connection History</div>
          {history.length > 1 ? (
            <HistoryChart
              history={history}
              keys={["total", "active", "idle", "waiting"]}
              colors={["var(--tb-brand)", "var(--tb-green)", "var(--tb-blue)", "#EF4444"]}
              labels={["Total", "Active", "Idle", "Waiting"]}
            />
          ) : (
            <div className="flex items-center justify-center h-[140px] text-[12px] text-tb-text-muted">Collecting data...</div>
          )}
        </div>
      </div>

      {/* Latency + Memory */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* DB Latency */}
        <div className="rounded-2xl border border-tb-border bg-tb-surface-1 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="text-[13px] font-semibold text-tb-text-primary">DB Latency</div>
            <div className="text-[18px] font-bold text-tb-text-primary">{db?.latencyMs ?? 0}<span className="text-[11px] font-normal text-tb-text-muted ml-1">ms</span></div>
          </div>
          {dbLatencyHistory.length > 1 ? (
            <svg width="100%" viewBox="0 0 300 80" className="block" style={{ minHeight: 80 }}>
              {(() => {
                const max = Math.max(...dbLatencyHistory, 10);
                const pts = dbLatencyHistory.map((v, i) => `${(i / (dbLatencyHistory.length - 1)) * 300},${80 - (v / max) * 70}`);
                return (
                  <>
                    <polyline points={pts.join(" ")} fill="none" stroke="var(--tb-brand)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <line x1="0" y1={80 - (100 / max) * 70} x2="300" y2={80 - (100 / max) * 70} stroke="#EAB308" strokeWidth="0.6" strokeDasharray="4 4" opacity="0.5" />
                    <text x="302" y={80 - (100 / max) * 70 + 3} fontSize="8" fill="#EAB308" fontFamily="inherit">100ms</text>
                  </>
                );
              })()}
            </svg>
          ) : (
            <div className="flex items-center justify-center h-[80px] text-[12px] text-tb-text-muted">Collecting data...</div>
          )}
        </div>

        {/* Memory */}
        <div className="rounded-2xl border border-tb-border bg-tb-surface-1 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="text-[13px] font-semibold text-tb-text-primary">Memory</div>
            <div className="text-[18px] font-bold text-tb-text-primary">{p?.memory?.heapUsedMB ?? 0}<span className="text-[11px] font-normal text-tb-text-muted ml-1">MB</span></div>
          </div>
          {p?.memory && (
            <div className="flex flex-col gap-2.5">
              {[
                { label: "Heap Used", value: p.memory.heapUsedMB, max: p.memory.heapTotalMB, color: "var(--tb-brand)" },
                { label: "Heap Total", value: p.memory.heapTotalMB, max: p.memory.rssMB || p.memory.heapTotalMB * 1.5, color: "var(--tb-blue)" },
                { label: "RSS", value: p.memory.rssMB, max: Math.max(p.memory.rssMB * 1.2, 512), color: "var(--tb-green)" },
              ].map((m) => (
                <div key={m.label}>
                  <div className="flex justify-between text-[10px] text-tb-text-muted mb-0.5">
                    <span>{m.label}</span>
                    <span>{m.value} MB</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-tb-border overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-500" style={{ width: `${Math.min((m.value / m.max) * 100, 100)}%`, background: m.color }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Redis Connections */}
      <div className="rounded-2xl border border-tb-border bg-tb-surface-1 p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Server size={15} className="text-tb-text-muted" />
            <div className="text-[13px] font-semibold text-tb-text-primary">Redis Connections</div>
          </div>
          {rc && (
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-tb-text-muted">{rc.connected}/{rc.total} connected</span>
              <StatusBadge ok={rc.healthy} label={rc.healthy ? "Healthy" : "Degraded"} />
            </div>
          )}
        </div>
        {rc && rc.total > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {Object.entries(rc.clients).map(([name, client]) => (
              <div key={name} className="rounded-lg border border-tb-border bg-tb-surface-2 p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    {client.connected ? <Wifi size={12} className="text-[#22C55E]" /> : <WifiOff size={12} className="text-[#EF4444]" />}
                    <span className="text-[12px] font-semibold text-tb-text-primary">{name}</span>
                  </div>
                  <StatusBadge ok={client.connected} label={client.connected ? "Connected" : "Disconnected"} />
                </div>
                <div className="flex flex-col gap-1 text-[10px] text-tb-text-muted">
                  <div className="flex justify-between"><span>Reconnects</span><span className={client.reconnectCount > 0 ? "text-[#EAB308]" : ""}>{client.reconnectCount}</span></div>
                  <div className="flex justify-between"><span>Failed requests</span><span className={client.failedRequests > 0 ? "text-[#EF4444]" : ""}>{client.failedRequests}</span></div>
                  <div className="flex justify-between"><span>Keep-alive failures</span><span className={client.keepAliveFailures > 0 ? "text-[#EAB308]" : ""}>{client.keepAliveFailures}</span></div>
                  {client.lastError && <div className="text-[9px] text-[#EF4444] mt-1 truncate" title={client.lastError}>Last error: {client.lastError}</div>}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-[12px] text-tb-text-muted text-center py-6">
            {rc?.configured === false ? "Redis not configured" : "No Redis clients active"}
          </div>
        )}
      </div>

      {/* Cold Start + Config + Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Cold Start */}
        <div className="rounded-2xl border border-tb-border bg-tb-surface-1 p-5">
          <div className="flex items-center gap-2 mb-3">
            <Zap size={15} className={cold?.isColdStart ? "text-[#EAB308]" : "text-tb-text-muted"} />
            <div className="text-[13px] font-semibold text-tb-text-primary">Cold Start</div>
          </div>
          <div className="flex flex-col gap-2 text-[11px]">
            <div className="flex justify-between"><span className="text-tb-text-muted">Status</span><StatusBadge ok={!cold?.isColdStart} label={cold?.isColdStart ? "Waking up" : "Warm"} /></div>
            <div className="flex justify-between"><span className="text-tb-text-muted">Total cold starts</span><span className="text-tb-text-primary font-medium">{cold?.coldStartCount ?? 0}</span></div>
            <div className="flex justify-between"><span className="text-tb-text-muted">Avg wake time</span><span className="text-tb-text-primary font-medium">{cold?.avgWakeTimeMs ?? 0}ms</span></div>
            {cold?.lastColdStartAt && <div className="flex justify-between"><span className="text-tb-text-muted">Last cold start</span><span className="text-tb-text-primary font-medium">{new Date(cold.lastColdStartAt).toLocaleString()}</span></div>}
          </div>
        </div>

        {/* Config */}
        <div className="rounded-2xl border border-tb-border bg-tb-surface-1 p-5">
          <div className="flex items-center gap-2 mb-3">
            <Shield size={15} className="text-tb-text-muted" />
            <div className="text-[13px] font-semibold text-tb-text-primary">Pool Config</div>
          </div>
          <div className="flex flex-col gap-2 text-[11px]">
            <div className="flex justify-between"><span className="text-tb-text-muted">Max connections</span><span className="text-tb-text-primary font-medium">{p?.config?.max ?? "?"}</span></div>
            <div className="flex justify-between"><span className="text-tb-text-muted">Min connections</span><span className="text-tb-text-primary font-medium">{p?.config?.min ?? "?"}</span></div>
            <div className="flex justify-between"><span className="text-tb-text-muted">Idle timeout</span><span className="text-tb-text-primary font-medium">{p?.config?.idleTimeoutMillis ? `${p.config.idleTimeoutMillis / 1000}s` : "?"}</span></div>
            <div className="flex justify-between"><span className="text-tb-text-muted">Connect timeout</span><span className="text-tb-text-primary font-medium">{p?.config?.connectionTimeoutMillis ? `${p.config.connectionTimeoutMillis / 1000}s` : "?"}</span></div>
            <div className="flex justify-between"><span className="text-tb-text-muted">Uptime</span><span className="text-tb-text-primary font-medium">{p?.uptimeFormatted ?? "?"}</span></div>
          </div>
        </div>

        {/* Alert State */}
        <div className="rounded-2xl border border-tb-border bg-tb-surface-1 p-5">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={15} className={alerts?.isExhausted ? "text-[#EF4444]" : "text-tb-text-muted"} />
            <div className="text-[13px] font-semibold text-tb-text-primary">Alert State</div>
          </div>
          <div className="flex flex-col gap-2 text-[11px]">
            <div className="flex justify-between"><span className="text-tb-text-muted">Exhausted</span><StatusBadge ok={!alerts?.isExhausted} label={alerts?.isExhausted ? "Yes" : "No"} /></div>
            <div className="flex justify-between"><span className="text-tb-text-muted">Total alerts fired</span><span className="text-tb-text-primary font-medium">{alerts?.totalAlerts ?? 0}</span></div>
            <div className="flex justify-between"><span className="text-tb-text-muted">Warn threshold</span><span className="text-tb-text-primary font-medium">{alerts?.thresholds?.warnMs ? `${alerts.thresholds.warnMs / 1000}s` : "?"}</span></div>
            <div className="flex justify-between"><span className="text-tb-text-muted">Critical threshold</span><span className="text-tb-text-primary font-medium">{alerts?.thresholds?.critMs ? `${alerts.thresholds.critMs / 1000}s` : "?"}</span></div>
            {alerts?.lastWarningAt && <div className="flex justify-between"><span className="text-tb-text-muted">Last warning</span><span className="text-tb-text-primary font-medium">{new Date(alerts.lastWarningAt).toLocaleString()}</span></div>}
            {alerts?.lastCriticalAt && <div className="flex justify-between"><span className="text-tb-text-muted">Last critical</span><span className="text-[#EF4444] font-medium">{new Date(alerts.lastCriticalAt).toLocaleString()}</span></div>}
          </div>
        </div>
      </div>
    </div>
  );
}
