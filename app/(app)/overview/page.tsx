"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  cancelDeletion,
  getCurrentUser,
  listTickets,
  listNotifications,
  getUserActivity,
  type Profile,
  type Ticket,
  type NotificationItem,
} from "@/lib/api";
import {
  Activity as ActivityIcon,
  AlertTriangle,
  ArrowRight,
  Bell,
  CheckCircle2,
  ChevronRight,
  Clock,
  Inbox as InboxIcon,
  LifeBuoy,
  LogOut,
  Mail,
  Shield,
  TrendingDown,
  TrendingUp,
  User as UserIcon,
  X,
} from "lucide-react";
import { Skeleton } from "@/components/ui/Skeleton";
import { useI18n, translateNotifText } from "@/lib/i18n";
import { LOCALES } from "@/lib/locales";

function initialsOf(name: string | null | undefined): string {
  if (!name) return "?";
  const p = name.trim().split(/\s+/);
  return p.length === 1
    ? p[0].slice(0, 2).toUpperCase()
    : (p[0][0] + p[p.length - 1][0]).toUpperCase();
}

function greetingOf(t: (k: string) => string): string {
  const h = new Date().getHours();
  if (h < 5) return t("overview.goodNight");
  if (h < 12) return t("overview.goodMorning");
  if (h < 17) return t("overview.goodAfternoon");
  if (h < 21) return t("overview.goodEvening");
  return t("overview.goodNight");
}

/* ═══ Token Card ═══ */
function Card({
  children,
  className = "",
  hover = false,
}: {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border border-tb-border bg-tb-surface-1 ${hover ? "transition-all duration-200 hover:border-tb-border-strong hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)]" : ""} ${className}`}
    >
      {children}
    </div>
  );
}

function CardHead({
  icon,
  title,
  right,
}: {
  icon: React.ReactNode;
  title: string;
  right?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between px-5 py-3.5 border-b border-tb-border">
      <h3 className="flex items-center gap-2 text-[14px] font-semibold text-tb-text-primary m-0">
        <span className="text-tb-text-muted">{icon}</span>
        {title}
      </h3>
      {right}
    </div>
  );
}

/* ═══ SVG Area Sparkline with tooltips ═══ */
function Sparkline({
  data,
  color,
  fill = true,
  height = 40,
}: {
  data: number[];
  color: string;
  fill?: boolean;
  height?: number;
}) {
  const w = 120;
  const h = height;
  const [hovered, setHovered] = useState<number | null>(null);
  if (!data || data.length < 2) {
    return <div style={{ height, width: w }} />;
  }
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * (w - 4) + 2;
    const y = h - 4 - ((v - min) / range) * (h - 10);
    return [x, y] as const;
  });
  const line = pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const area = `M${pts[0][0]},${h} L${line.split(" ").join(" L")} L${pts[pts.length - 1][0]},${h} Z`;
  const last = pts[pts.length - 1];

  // Compute date labels for tooltip
  const now = Date.now();
  const DAY = 86_400_000;

  return (
    <div className="relative" onMouseLeave={() => setHovered(null)}>
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} fill="none" className="block">
        {fill && <path d={area} fill={color} opacity={0.12} />}
        <polyline points={line} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        {/* Invisible hit areas for each point */}
        {pts.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={8} fill="transparent" onMouseEnter={() => setHovered(i)} />
        ))}
        {hovered !== null && pts[hovered] && (
          <circle cx={pts[hovered][0]} cy={pts[hovered][1]} r={3.5} fill={color} stroke="var(--tb-surface-1)" strokeWidth={1.5} />
        )}
      </svg>
      {hovered !== null && (
        <div className="absolute z-50 pointer-events-none px-2 py-1 rounded-md bg-tb-surface-1 border border-tb-border shadow-[0_4px_12px_rgba(0,0,0,0.3)] text-[10px] text-tb-text-primary whitespace-nowrap animate-fade-in" style={{ left: Math.min(Math.max(pts[hovered][0] - 20, 0), w - 48), top: -6 }}>
          {data[hovered]} events · {Math.floor((data.length - 1 - hovered))}d ago
        </div>
      )}
    </div>
  );
}

/* Activity Chart — smooth per-category curves with animated tooltips */
function ActivityChart({ days }: { days: { label: string; fullDate: string; count: number; security: number; account: number; support: number }[] }) {
  const { t } = useI18n();
  const [hovered, setHovered] = useState<number | null>(null);
  const [filter, setFilter] = useState<"all" | "security" | "account" | "support">("all");
  const W = 640;
  const H = 220;
  const padL = 40;
  const padR = 16;
  const padT = 24;
  const padB = 28;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;

  const categories = [
    { key: "security" as const, color: "var(--tb-green)", label: t("overview.catSecurity") },
    { key: "account" as const, color: "var(--tb-blue)", label: t("overview.catAccount") },
    { key: "support" as const, color: "var(--tb-purple)", label: t("overview.catSupport") },
  ];

  const visibleCats = filter === "all" ? categories : categories.filter((c) => c.key === filter);

  // Compute max across visible categories
  const maxVal = Math.max(
    ...days.map((d) => Math.max(...visibleCats.map((c) => d[c.key]))),
    1
  );

  function smoothPath(points: { x: number; y: number }[]): string {
    if (points.length < 2) return "";
    let path = `M ${points[0].x},${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[Math.max(i - 1, 0)];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[Math.min(i + 2, points.length - 1)];
      const tension = 0.35;
      const cp1x = p1.x + (p2.x - p0.x) * tension;
      const cp1y = p1.y + (p2.y - p0.y) * tension;
      const cp2x = p2.x - (p3.x - p1.x) * tension;
      const cp2y = p2.y - (p3.y - p1.y) * tension;
      path += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`;
    }
    return path;
  }

  function ptsFor(key: "security" | "account" | "support") {
    return days.map((d, i) => ({
      x: padL + (i / Math.max(days.length - 1, 1)) * chartW,
      y: padT + chartH - (d[key] / maxVal) * chartH,
    }));
  }

  // Grid lines
  const yTicks = [maxVal, Math.round(maxVal / 2), 0];
  const gridLines = yTicks.map((tick, i) => {
    const y = padT + ((maxVal - tick) / maxVal) * chartH;
    const dash = i === yTicks.length - 1 ? "0" : "4 4";
    return `<line x1="${padL}" x2="${W - padR}" y1="${y}" y2="${y}" stroke="var(--tb-border)" stroke-width="0.8" stroke-dasharray="${dash}" opacity="0.5"/><text x="${padL - 8}" y="${y + 4}" text-anchor="end" font-size="10" fill="var(--tb-text-muted)" font-family="inherit">${tick}</text>`;
  }).join("");

  // Build SVG paths for each visible category
  const defs: string[] = [];
  const paths: string[] = [];
  const dots: string[] = [];
  for (const cat of visibleCats) {
    const pts = ptsFor(cat.key);
    const lineD = smoothPath(pts);
    const areaD = lineD + ` L ${pts[pts.length - 1].x},${padT + chartH} L ${pts[0].x},${padT + chartH} Z`;
    const id = `grad-${cat.key}`;
    defs.push(`<linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="${cat.color}" stop-opacity="0.2"/><stop offset="100%" stop-color="${cat.color}" stop-opacity="0"/></linearGradient>`);
    paths.push(`<path d="${areaD}" fill="url(#${id})"/>`);
    paths.push(`<path d="${lineD}" fill="none" stroke="${cat.color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" opacity="0.9"/>`);
    // Data points
    pts.forEach((p, i) => {
      const r = hovered === i ? 5 : 3;
      const sw = hovered === i ? 2.5 : 1.5;
      dots.push(`<circle cx="${p.x}" cy="${p.y}" r="${r}" fill="var(--tb-bg)" stroke="${cat.color}" stroke-width="${sw}" style="transition: r 150ms ease"/>`);
    });
  }

  // X-axis labels
  const xLabels = days.map((d, i) => {
    const x = padL + (i / Math.max(days.length - 1, 1)) * chartW;
    const fill = hovered === i ? "var(--tb-text-primary)" : "var(--tb-text-muted)";
    const fw = hovered === i ? 600 : 400;
    return `<text x="${x}" y="${H - 6}" text-anchor="middle" font-size="10" fill="${fill}" font-weight="${fw}" font-family="inherit">${d.label}</text>`;
  }).join("");

  // Crosshair
  const crosshair = hovered !== null
    ? `<line x1="${padL + (hovered / Math.max(days.length - 1, 1)) * chartW}" y1="${padT}" x2="${padL + (hovered / Math.max(days.length - 1, 1)) * chartW}" y2="${padT + chartH}" stroke="var(--tb-text-muted)" stroke-width="0.8" stroke-dasharray="3 3" opacity="0.4"/>`
    : "";

  const svgHtml = [
    `<defs>${defs.join("")}</defs>`,
    gridLines,
    paths.join(""),
    dots.join(""),
    xLabels,
    crosshair,
  ].join("");

  return (
    <div>
      {/* Filter tabs */}
      <div className="flex gap-1 mb-3">
        {[{ key: "all" as const, label: t("overview.activityDefault") },
          ...categories.map((c) => ({ key: c.key, label: c.label, color: c.color }))
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key as any)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium border cursor-pointer transition-all duration-150 ${
              filter === tab.key
                ? "bg-tb-surface-2 border-tb-border-strong text-tb-text-primary"
                : "bg-transparent border-transparent text-tb-text-muted hover:text-tb-text-primary hover:bg-tb-surface-2"
            }`}
          >
            {"color" in tab && tab.color && <span className="w-1.5 h-1.5 rounded-full" style={{ background: tab.color }} />}
            {tab.label}
          </button>
        ))}
      </div>

      <div className="relative" onMouseLeave={() => setHovered(null)}>
        <svg
          width="100%"
          viewBox={`0 0 ${W} ${H}`}
          fill="none"
          className="block"
          style={{ minHeight: 160 }}
          dangerouslySetInnerHTML={{ __html: svgHtml }}
        />

        {/* Animated tooltip */}
        {hovered !== null && (
          <div
            className="absolute z-50 pointer-events-none rounded-xl bg-tb-surface-1 border border-tb-border shadow-lg transition-all duration-150 ease-out"
            style={{
              left: `${((padL + (hovered / Math.max(days.length - 1, 1)) * chartW) / W) * 100}%`,
              top: padT - 8,
              transform: "translateX(-50%) translateY(-100%)",
              opacity: 1,
            }}
          >
            <div className="px-3 py-2">
              <div className="text-[11px] font-semibold text-tb-text-primary mb-1">{days[hovered].fullDate}</div>
              <div className="flex flex-col gap-0.5">
                {visibleCats.map((cat) => (
                  <div key={cat.key} className="flex items-center gap-1.5 text-[10px]">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: cat.color }} />
                    <span className="text-tb-text-muted min-w-[52px]">{cat.label}</span>
                    <span className="font-semibold text-tb-text-primary">{days[hovered][cat.key]}</span>
                  </div>
                ))}
                <div className="border-t border-tb-border mt-0.5 pt-0.5 flex items-center gap-1.5 text-[10px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-tb-text-muted" />
                  <span className="text-tb-text-muted min-w-[52px]">{t("overview.statActivity")}</span>
                  <span className="font-bold text-tb-text-primary">{days[hovered].count}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Invisible hit areas */}
        {days.map((_, i) => (
          <div
            key={i}
            className="absolute"
            style={{
              left: `${((padL + (i / Math.max(days.length - 1, 1)) * chartW) / W) * 100}%`,
              top: padT,
              width: `${(chartW / days.length / W) * 100}%`,
              height: chartH,
              transform: "translateX(-50%)",
            }}
            onMouseEnter={() => setHovered(i)}
          />
        ))}
      </div>
    </div>
  );
}
/* Category color for activity */
function catOf(action: string): { color: string; label: string } {
  const a = (action || "").toLowerCase();
  if (/login|logout|session|2fa|passkey|password|recovery|device|verified|otp|backup|suspicious|denied|blocked|failed|magic/i.test(a))
    return { color: "var(--tb-green)", label: "Security" };
  if (/ticket/i.test(a)) return { color: "var(--tb-purple)", label: "Support" };
  return { color: "var(--tb-blue)", label: "Account" };
}

const CATEGORY_ICONS = {
  security: { icon: Shield, color: "var(--tb-blue)", bg: "var(--tb-blue-soft)" },
  support: { icon: LifeBuoy, color: "var(--tb-purple)", bg: "var(--tb-purple-soft)" },
  account: { icon: UserIcon, color: "var(--tb-green)", bg: "var(--tb-green-soft)" },
} as const;

function cleanIp(ip?: string | null) {
  if (!ip) return null;
  return ip.replace(/^::ffff:/, "");
}

function deviceOf(ua?: string) {
  if (!ua) return null;
  let browser = "browser";
  if (/edg\//i.test(ua)) browser = "Edge";
  else if (/chrome|crios/i.test(ua)) browser = "Chrome";
  else if (/firefox|fxios/i.test(ua)) browser = "Firefox";
  else if (/safari/i.test(ua)) browser = "Safari";
  return browser;
}

export default function OverviewPage() {
  const router = useRouter();
  const { t, lang } = useI18n();
  const [user, setUser] = useState<Profile | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [totalNotifs, setTotalNotifs] = useState(0);
  const [activity, setActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [scheduledAt, setScheduledAt] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [showCancelPopup, setShowCancelPopup] = useState(false);
  const [nowTick, setNowTick] = useState(() => Date.now());

  // Real sparkline data — notifications per day over last 14 days
  const notifSpark = useMemo(() => {
    const now = Date.now();
    const DAY = 86_400_000;
    const buckets: number[] = new Array(14).fill(0);
    for (const n of notifications) {
      const d = new Date(n.createdAt).getTime();
      const daysAgo = Math.floor((now - d) / DAY);
      if (daysAgo >= 0 && daysAgo < 14) buckets[13 - daysAgo]++;
    }
    return buckets;
  }, [notifications]);
  // Real sparkline data — tickets per day over last 14 days
  const ticketSpark = useMemo(() => {
    const now = Date.now();
    const DAY = 86_400_000;
    const buckets: number[] = new Array(14).fill(0);
    for (const t of tickets) {
      const d = new Date(t.createdAt).getTime();
      const daysAgo = Math.floor((now - d) / DAY);
      if (daysAgo >= 0 && daysAgo < 14) buckets[13 - daysAgo]++;
    }
    return buckets;
  }, [tickets]);

  useEffect(() => {
    Promise.all([
      getCurrentUser()
        .then((u) => {
          setUser(u);
          // Trust the API — if scheduledDeletionAt is null, clear stale state
          setScheduledAt((u as any)?.scheduledDeletionAt ?? null);
        })
        .catch(() => {}),
      listTickets({ limit: 50 })
        .then((r) => setTickets(Array.isArray(r?.data) ? r.data : []))
        .catch(() => {}),
      listNotifications(10, 0)
        .then((r) => {
          setNotifications(Array.isArray(r?.notifications) ? r.notifications : []);
          setTotalNotifs(r?.total ?? 0);
        })
        .catch(() => {}),
      getUserActivity(200, 0)
        .then((r) => setActivity(Array.isArray(r) ? r : r?.events ?? []))
        .catch(() => {}),
    ]).finally(() => setLoading(false));

    const onDeletion = (e: any) => {
      if (e?.detail?.scheduledAt) setScheduledAt(e.detail.scheduledAt);
    };
    try { window.addEventListener("tirbeo:deletion-scheduled" as any, onDeletion); } catch {}
    const onCancelled = () => setScheduledAt(null);
    try { window.addEventListener("tb:deletion-cancelled", onCancelled); } catch {}
    return () => {
      try { window.removeEventListener("tirbeo:deletion-scheduled" as any, onDeletion); } catch {}
      try { window.removeEventListener("tb:deletion-cancelled", onCancelled); } catch {}
    };
  }, []);

  useEffect(() => {
    if (!scheduledAt) return;
    const id = setInterval(() => setNowTick(Date.now()), 60_000);
    return () => clearInterval(id);
  }, [scheduledAt]);

  const unread = (Array.isArray(notifications) ? notifications : []).filter((n) => !n?.read).length;
  const openTickets = (Array.isArray(tickets) ? tickets : []).filter((t) => t?.status === "open").length;

  const weekChart = useMemo(() => {
    const now = new Date();
    const days: { date: Date; label: string; count: number; security: number; account: number; support: number }[] = [];
    const short = Intl.DateTimeFormat(localeFor(), { weekday: "short" });
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      days.push({ date: d, label: short.format(d).slice(0, 2), count: 0, security: 0, account: 0, support: 0 });
    }
    for (const a of activity) {
      const dt = new Date(a.createdAt);
      const idx = days.findIndex(
        (d) =>
          d.date.getFullYear() === dt.getFullYear() && d.date.getMonth() === dt.getMonth() && d.date.getDate() === dt.getDate()
      );
      if (idx >= 0 && !isNaN(dt.getTime())) {
        days[idx].count += 1;
        const cat = catOf(a.action);
        if (cat.label === "Security") days[idx].security += 1;
        else if (cat.label === "Support") days[idx].support += 1;
        else days[idx].account += 1;
      }
    }
    return days;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activity]);

  function localeFor() {
    return LOCALES[lang] ?? LOCALES.en;
  }

  const locale = LOCALES[lang] ?? LOCALES.en;
  const totalEvents = activity.length;
  const securityEvents = activity.filter((a: any) => /login|2fa|otp|passkey|session|suspicious|denied|blocked|password|security/i.test(a.action)).length;
  const supportEvents = activity.filter((a: any) => /ticket|support/i.test(a.action)).length;
  const accountEvents = totalEvents - securityEvents - supportEvents;

  const timeAgo = (iso: string) => {
    const d = new Date(iso);
    const diff = Date.now() - d.getTime();
    if (diff < 60_000) return t("common.justNow");
    if (diff < 3600_000) return t("common.agoM", { n: Math.floor(diff / 60_000) });
    if (diff < 86400_000) return t("common.agoH", { n: Math.floor(diff / 3600_000) });
    return new Intl.DateTimeFormat(locale, { month: "short", day: "numeric" }).format(d);
  };

  const deletionInfo = (() => {
    if (!scheduledAt) return null;
    const target = new Date(scheduledAt).getTime();
    const diff = Math.max(0, target - nowTick);
    const totalMins = Math.floor(diff / 60000);
    const d = Math.floor(totalMins / 1440);
    const h = Math.floor((totalMins % 1440) / 60);
    const m = totalMins % 60;
    return {
      formatted: new Date(scheduledAt).toLocaleString(locale === "ne" ? "en-US" : locale, {
        day: "numeric", month: "numeric", year: "numeric", hour: "numeric", minute: "2-digit", hour12: true,
      }),
      timeRemaining: `${d}d ${h}h ${m}m`,
    };
  })();

  const handleCancel = async () => {
    setCancelling(true);
    try {
      await cancelDeletion();
      setScheduledAt(null);
      try { window.dispatchEvent(new CustomEvent("tb:deletion-cancelled")); } catch {}
      setShowCancelPopup(false);
    } catch {}
    setCancelling(false);
  };

  const today = new Intl.DateTimeFormat(locale, {
    weekday: "long", month: "long", day: "numeric", year: "numeric",
  }).format(new Date());

  const recent = (Array.isArray(activity) ? activity : []).slice(0, 6);

  return (
    <div className="flex flex-col gap-5 max-w-[1200px] mx-auto">
      {/* ═══ Deletion Warning ═══ */}
      {scheduledAt && deletionInfo && (
        <div
          onClick={() => router.push("/account/privacy")}
          className="flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer bg-tb-red-soft border border-tb-red border-l-4"
        >
          <AlertTriangle size={15} className="text-tb-red shrink-0" />
          <span className="flex-1 text-[13px] text-tb-text-secondary">
            Account scheduled for deletion in{" "}
            <span className="font-bold text-tb-red font-mono">
              {deletionInfo.timeRemaining}
            </span>
          </span>
          <button
            onClick={(e) => { e.stopPropagation(); setShowCancelPopup(true); }}
            className="text-[12px] font-semibold px-3.5 py-1.5 rounded-lg cursor-pointer border-none bg-tb-text-primary text-tb-bg"
          >
            Keep account
          </button>
        </div>
      )}

      {/* ═══ Welcome Hero ═══ */}
      <div
        className="relative overflow-hidden rounded-2xl border border-tb-border"
        style={{
          background:
            "linear-gradient(135deg, color-mix(in srgb, tb-brand 8%, tb-surface-1) 0%, tb-surface-1 55%, tb-surface-2 100%)",
        }}
      >
        {/* decorative glows */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 -right-16 w-72 h-72 rounded-full blur-3xl"
          style={{ background: "color-mix(in srgb, tb-brand 14%, transparent)" }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-28 -left-10 w-64 h-64 rounded-full blur-3xl"
          style={{ background: "color-mix(in srgb, tb-brand-soft 30%, transparent)" }}
        />

        {loading ? (
          <div className="relative flex items-center gap-4 p-6">
            <Skeleton width={58} height={58} borderRadius={16} />
            <div className="flex-1">
              <Skeleton width={110} height={11} style={{ marginBottom: 8 }} />
              <Skeleton width={210} height={22} style={{ marginBottom: 10 }} />
              <div className="flex gap-2">
                <Skeleton width={120} height={28} borderRadius={999} />
                <Skeleton width={180} height={28} borderRadius={999} />
              </div>
            </div>
            <div className="hidden sm:flex gap-2 shrink-0">
              <Skeleton width={96} height={36} borderRadius={12} />
              <Skeleton width={108} height={36} borderRadius={12} />
            </div>
          </div>
        ) : (
          <div className="relative flex flex-col sm:flex-row sm:items-center gap-5 p-6">
            {/* Avatar w/ gradient ring + verified badge */}
            <div className="relative shrink-0">
              <div
                className="w-[58px] h-[58px] rounded-2xl flex items-center justify-center overflow-hidden text-[17px] font-semibold p-[2px]"
                style={{
                  background: "linear-gradient(135deg, tb-brand, tb-surface-3)",
                }}
              >
                <div className="w-full h-full rounded-[14px] flex items-center justify-center bg-tb-surface-1 text-tb-text-secondary">
                  {user?.photoUrl ? (
                    <img src={user.photoUrl} alt="" className="w-full h-full object-cover rounded-[14px]" referrerPolicy="no-referrer" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                  ) : (
                    initialsOf(user?.name ?? user?.email)
                  )}
                </div>
              </div>
              <span
                className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center bg-tb-brand text-tb-bg"
                title="Verified account"
              >
                <CheckCircle2 size={14} />
              </span>
            </div>

            {/* Text */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold tracking-[0.06em] uppercase text-tb-text-muted mb-1">
                <span className="w-1.5 h-1.5 rounded-full bg-tb-brand" />
                {t("overview.welcomeBack")}
              </div>
              <h2 className="text-[24px] font-bold leading-tight text-tb-text-primary tracking-tight">
                {greetingOf(t)}{" "}
                <span
                  className="bg-gradient-to-r from-tb-text-primary to-tb-brand bg-clip-text text-transparent"
                >
                  {user?.name ? user.name.split(" ")[0] : ""}
                </span>
              </h2>

              {/* Meta chips */}
              <div className="flex flex-wrap items-center gap-2 mt-3">
                <span className="inline-flex items-center gap-1.5 h-7 px-3 rounded-lg text-[12px] font-medium bg-tb-surface-2 border border-tb-border text-tb-text-muted">
                  <Clock size={12} /> {today}
                </span>
                <span
                  className="inline-flex items-center gap-1.5 h-7 px-3 rounded-lg text-[12px] font-medium border border-tb-border text-tb-text-secondary"
                  style={{ background: "color-mix(in srgb, tb-brand 8%, tb-surface-2)" }}
                >
                  <Shield size={12} className="text-tb-brand" /> {(user as any)?.email || ""}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 shrink-0 flex-wrap">
              <button
                onClick={() => router.push("/account/inbox")}
                className="h-9 px-4 rounded-xl text-[13px] font-medium cursor-pointer border border-tb-border bg-tb-surface-1 text-tb-text-secondary transition-all duration-150 hover:bg-tb-surface-2 hover:border-tb-border-strong"
              >
                <span className="inline-flex items-center gap-1.5"><InboxIcon size={14} />{t("overview.openInbox")}</span>
              </button>
              <button
                onClick={() => router.push("/support/tickets")}
                className="h-9 px-4 rounded-xl text-[13px] font-medium cursor-pointer border-none transition-all duration-150 bg-tb-brand text-tb-bg"
              >
                <span className="inline-flex items-center gap-1.5"><LifeBuoy size={14} />{t("overview.openTickets")}</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ═══ Stat Cards with sparklines ═══ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="p-5">
              <div className="flex items-center gap-2.5 mb-4">
                <Skeleton width={36} height={36} borderRadius={11} />
                <Skeleton width={80} height={11} />
              </div>
              <div className="flex items-end justify-between">
                <div>
                  <Skeleton width={44} height={28} style={{ marginBottom: 8 }} />
                  <Skeleton width={70} height={10} />
                </div>
                <Skeleton width={96} height={34} borderRadius={6} />
              </div>
            </Card>
          ))
        ) : (
          <>
            <StatCard
              icon={<Mail size={16} />} label={t("overview.statUnread")} value={unread}
              spark={<Sparkline data={notifSpark} color="var(--tb-brand)" />}
              trend={unread === 0 ? "clean" : unread > 5 ? "down" : "neutral"}
              href="/account/inbox" accent="var(--tb-brand)"
            />
            <StatCard
              icon={<LifeBuoy size={16} />} label={t("overview.statOpenTickets")} value={openTickets}
              spark={<Sparkline data={ticketSpark} color="var(--tb-purple)" />}
              trend={openTickets === 0 ? "clean" : openTickets > 3 ? "up" : "neutral"}
              href="/support/tickets" accent="var(--tb-purple)"
            />
            <StatCard
              icon={<Bell size={16} />} label={t("overview.statTotalNotif")} value={totalNotifs}
              spark={<Sparkline data={notifSpark} color="var(--tb-blue)" fill={false} />}
              trend="neutral" href="/account/inbox" accent="var(--tb-blue)"
            />
            <StatCard
              icon={<ActivityIcon size={16} />} label={t("overview.statActivity")} value={totalEvents}
              spark={<Sparkline data={weeklyBars(activity)} color="var(--tb-green)" />}
              trend={totalEvents === 0 ? "neutral" : "up"} href="/activity/history" accent="var(--tb-green)"
            />
          </>
        )}
      </div>

      {/* ═══ Activity Chart + Recent Activity ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Chart (2/3) */}
        <Card className="lg:col-span-2">
          <CardHead
            icon={<ActivityIcon size={15} />}
            title={t("overview.activityTitle")}
            right={
              <button
                onClick={() => router.push("/activity/history")}
                className="flex items-center gap-1 text-[12px] font-medium text-tb-text-muted hover:text-tb-text-primary cursor-pointer bg-transparent border-none"
              >
                {t("overview.allActivity")} <ArrowRight size={12} />
              </button>
            }
          />
          <div className="p-5">
            <div className="flex items-end justify-between mb-2">
              <div>
                <div className="text-[28px] font-bold text-tb-text-primary tracking-tight leading-none">{totalEvents}</div>
                <div className="text-[12px] text-tb-text-muted mt-1">{t("overview.eventsLast7Days")}</div>
              </div>
              <div className="flex gap-3">
                {[
                  { label: t("overview.catSecurity"), count: securityEvents, color: "var(--tb-green)" },
                  { label: t("overview.catAccount"), count: accountEvents, color: "var(--tb-blue)" },
                  { label: t("overview.catSupport"), count: supportEvents, color: "var(--tb-purple)" },
                ].filter(c => c.count > 0).map(c => (
                  <div key={c.label} className="text-right">
                    <div className="text-[18px] font-bold text-tb-text-primary leading-none">{c.count}</div>
                    <div className="flex items-center gap-1 mt-1 text-[11px] text-tb-text-muted"><span className="w-1.5 h-1.5 rounded-full" style={{ background: c.color }} />{c.label}</div>
                  </div>
                ))}
              </div>
            </div>
            {loading ? (
              <div className="flex items-end gap-3 h-[180px] pt-2" aria-hidden="true">
                {[0.45, 0.7, 0.5, 0.85, 0.6, 0.95, 0.75].map((h, i) => (
                  <Skeleton key={i} width="12%" height={Math.round(180 * h)} borderRadius={6} />
                ))}
              </div>
            ) : (
              <ActivityChart days={weekChart.map((d) => ({ label: d.label, fullDate: d.date.toLocaleDateString(localeFor(), { weekday: "long", month: "short", day: "numeric" }), count: d.count, security: d.security, account: d.account, support: d.support }))} />
            )}
          </div>
        </Card>

        {/* Recent activity (1/3) */}
        <Card>
          <CardHead
            icon={<ActivityIcon size={15} />}
            title={t("overview.recentActivity")}
            right={
              <button
                onClick={() => router.push("/activity/history")}
                className="flex items-center gap-1 text-[12px] font-medium text-tb-text-muted hover:text-tb-text-primary cursor-pointer bg-transparent border-none"
              >
                {t("common.viewAll")} <ChevronRight size={12} />
              </button>
            }
          />
          {loading ? (
            <div className="p-1.5">{[...Array(5)].map((_, i) => (
              <div key={i} className={`flex items-center gap-3 px-3.5 py-2.5 ${i < 4 ? "border-b border-tb-border" : ""}`}>
                <Skeleton width={30} height={30} borderRadius={9} />
                <div className="flex-1"><Skeleton width={`${45 + i * 8}%`} height={12} style={{ marginBottom: 5 }} /><Skeleton width="34%" height={9} /></div>
                <Skeleton width={44} height={9} />
              </div>
            ))}</div>
          ) : recent.length === 0 ? (
            <div className="p-8 text-center text-[13px] text-tb-text-muted">{t("overview.noRecentActivity")}</div>
          ) : (
            <div>
              {recent.map((a) => {
                const cat = catOf(a?.action);
                const cfg = CATEGORY_ICONS[cat.label.toLowerCase() as keyof typeof CATEGORY_ICONS] ?? CATEGORY_ICONS.account;
                const Ip = cfg.icon;
                const isLogout = /logout|revoked/i.test(a?.action || "");
                return (
                  <button
                    key={a.id}
                    onClick={() => router.push("/activity/history")}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-left cursor-pointer border-none bg-transparent transition-colors duration-150 hover:bg-tb-surface-2 border-b border-tb-border"
                  >
                    <div className="w-[30px] h-[30px] rounded-lg flex items-center justify-center shrink-0" style={{ background: cfg.bg, color: cfg.color }}>
                      {isLogout ? <LogOut size={14} /> : <Ip size={14} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-medium text-tb-text-primary truncate">
                        {humanize(a?.action)}
                      </div>
                      <div className="text-[11px] text-tb-text-muted">
                        {cleanIp((a?.metadata as any)?.ip) ? `from ${cleanIp((a?.metadata as any)?.ip)}` : deviceOf((a?.metadata as any)?.userAgent) || (a?.source || "dashboard")}
                      </div>
                    </div>
                    <time className="text-[11px] text-tb-text-muted shrink-0">{timeAgo(a.createdAt)}</time>
                  </button>
                );
              })}
            </div>
          )}
        </Card>
      </div>

      {/* ═══ Recent Notifications + Tickets ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Notifications */}
        <Card>
          <CardHead
            icon={<Bell size={15} />}
            title={t("overview.recentNotif")}
            right={unread > 0 ? (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-tb-brand-soft text-tb-brand">
                {unread} new
              </span>
            ) : undefined}
          />
          {loading ? (
            <div className="p-1.5">{[...Array(4)].map((_, i) => (
              <div key={i} className={`flex items-center gap-3 px-3.5 py-2.5 ${i < 3 ? "border-b border-tb-border" : ""}`}>
                <Skeleton width={8} height={8} borderRadius="50%" />
                <div className="flex-1"><Skeleton width={`${52 + i * 8}%`} height={12} style={{ marginBottom: 5 }} /><Skeleton width="26%" height={9} /></div>
                <Skeleton width={40} height={9} />
              </div>
            ))}</div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center text-[13px] text-tb-text-muted">{t("overview.noNotifYet")}</div>
          ) : (
            <div>
              {notifications.slice(0, 5).map((n) => (
                <div
                  key={n.id}
                  onClick={() => { if (n.link) router.push(n.link); }}
                  className="flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors duration-150 hover:bg-tb-surface-2 border-b border-tb-border"
                >
                  <span className={`w-2 h-2 rounded-full shrink-0 ${n.read ? "border border-tb-border-strong" : "bg-tb-brand"}`} />
                  <div className={`flex-1 min-w-0 text-[13px] truncate text-tb-text-primary ${n.read ? "" : "font-medium"}`}>
                    {translateNotifText(n.title, lang)}
                  </div>
                  <span className="text-[11px] text-tb-text-muted shrink-0">{timeAgo(n.createdAt)}</span>
                </div>
              ))}
              <button
                onClick={() => router.push("/account/inbox")}
                className="w-full text-center py-2.5 text-[12px] font-medium text-tb-text-muted hover:text-tb-text-primary cursor-pointer border-none bg-transparent transition-colors duration-150 hover:bg-tb-surface-2 border-t border-tb-border"
              >
                {t("common.viewAll")} <ChevronRight size={12} className="inline" />
              </button>
            </div>
          )}
        </Card>

        {/* Tickets */}
        <Card>
          <CardHead
            icon={<LifeBuoy size={15} />}
            title={t("overview.recentTickets")}
            right={
              <button
                onClick={() => router.push("/support/tickets/new")}
                className="text-[11px] font-semibold px-2.5 py-1 rounded-lg cursor-pointer transition-colors duration-150 border-none bg-tb-brand text-tb-bg"
              >
                + {t("common.new")}
              </button>
            }
          />
          {loading ? (
            <div className="p-1.5">{[...Array(3)].map((_, i) => (
              <div key={i} className={`flex items-center gap-3 px-3.5 py-2.5 ${i < 2 ? "border-b border-tb-border" : ""}`}>
                <div className="flex-1"><Skeleton width={`${46 + i * 10}%`} height={12} style={{ marginBottom: 5 }} /><Skeleton width="24%" height={9} /></div>
                <Skeleton width={40} height={18} borderRadius={6} />
              </div>
            ))}</div>
          ) : tickets.length === 0 ? (
            <div className="p-8 text-center text-[13px] text-tb-text-muted">{t("overview.noTicketsYet")}</div>
          ) : (
            <div>
              {tickets.slice(0, 5).map((ticket) => (
                <div
                  key={ticket.id}
                  onClick={() => router.push(`/support/tickets/${ticket.id}`)}
                  className="flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors duration-150 hover:bg-tb-surface-2 border-b border-tb-border"
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-medium text-tb-text-primary truncate">{ticket.subject}</div>
                    <div className="text-[11px] text-tb-text-muted font-mono">{ticket.id.slice(0, 8)} · {ticket.category || "general"}</div>
                  </div>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-md capitalize ${
                      ticket.status === "open" ? "bg-tb-green-soft text-tb-green" : "bg-tb-surface-2 text-tb-text-muted"
                    }`}
                  >
                    {ticket.status}
                  </span>
                </div>
              ))}
              <button
                onClick={() => router.push("/support/tickets")}
                className="w-full text-center py-2.5 text-[12px] font-medium text-tb-text-muted hover:text-tb-text-primary cursor-pointer border-none bg-transparent transition-colors duration-150 hover:bg-tb-surface-2 border-t border-tb-border"
              >
                {t("common.viewAll")} <ChevronRight size={12} className="inline" />
              </button>
            </div>
          )}
        </Card>
      </div>

      {/* ═══ Cancel Deletion Dialog ═══ */}
      {showCancelPopup && scheduledAt && (
        <div className="tb-dialog-overlay" onClick={() => setShowCancelPopup(false)}>
          <div className="tb-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 420 }}>
            <div className="tb-dialog-header">
              <div>
                <h3 className="tb-dialog-title">{t("overview.cancelDeletionTitle")}</h3>
                <p className="tb-dialog-desc">{t("overview.cancelDeletionDesc")}</p>
              </div>
              <button className="header-control" onClick={() => setShowCancelPopup(false)}><X size={16} /></button>
            </div>
            <div className="tb-dialog-body">
              <div className="flex gap-3 p-3 rounded-xl bg-tb-surface-2 border border-tb-border">
                <Clock size={14} className="text-tb-text-muted shrink-0 mt-0.5" />
                <div className="text-[12px] text-tb-text-secondary leading-relaxed">
                  <span className="font-semibold text-tb-text-primary">{t("overview.keepAccount")}</span> — scheduled deletion on {deletionInfo?.formatted} will be cleared.
                </div>
              </div>
            </div>
            <div className="tb-dialog-footer">
              <button onClick={() => setShowCancelPopup(false)} className="btn btn-ghost btn-sm">{t("overview.keepDeletion")}</button>
              <button onClick={handleCancel} disabled={cancelling} className="btn btn-primary btn-sm">
                {cancelling ? t("overview.cancelling") : t("overview.yesKeepAccount")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Stat card component ── */
function StatCard({
  icon, label, value, spark, trend, href, accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  spark: React.ReactNode;
  trend: "clean" | "up" | "down" | "neutral";
  href: string;
  accent: string;
}) {
  const router = useRouter();
  const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : CheckCircle2;
  const trendColor =
    trend === "up" ? "var(--tb-green)" : trend === "down" ? "var(--tb-red)" : "var(--tb-text-muted)";
  const trendLabel =
    trend === "clean" ? "All clear" : trend === "up" ? "Active" : trend === "down" ? "Needs attention" : "Steady";
  // Note: trend labels use hardcoded English since StatCard is a generic component

  return (
    <button
      onClick={() => router.push(href)}
      className="rounded-2xl border border-tb-border bg-tb-surface-1 p-5 cursor-pointer text-left transition-all duration-200 hover:border-tb-border-strong hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)]"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: `color-mix(in srgb, ${accent} 12%, transparent)`, color: accent }}
          >
            {icon}
          </div>
          <span className="text-[12.5px] font-medium text-tb-text-muted">{label}</span>
        </div>
      </div>
      <div className="flex items-end justify-between">
        <div>
          <div className="text-[30px] font-bold leading-none text-tb-text-primary tracking-tight">{value}</div>
          <div className="flex items-center gap-1 mt-2 text-[11px]" style={{ color: trendColor }}>
            <TrendIcon size={12} /> {trendLabel}
          </div>
        </div>
        {spark}
      </div>
    </button>
  );
}

/* helper: bars for activity sparkline */
function weeklyBars(activity: any[]): number[] {
  const now = new Date();
  const out: number[] = [];
  for (let i = 13; i >= 0; i--) {
    const t = new Date(now);
    t.setDate(now.getDate() - i);
    const key = `${t.getFullYear()}-${t.getMonth()}-${t.getDate()}`;
    const count = activity.reduce((acc, a) => {
      const d = new Date(a.createdAt);
      const k = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      return isNaN(d.getTime()) ? acc : acc + (k === key ? 1 : 0);
    }, 0);
    out.push(count);
  }
  return out;
}

function humanize(action: string): string {
  if (!action) return "Activity";
  return action
    .replace(/[_\.]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();
}
