"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  Bell,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  CreditCard,
  Fingerprint,
  Globe,
  Hash,
  History,
  Info,
  KeyRound,
  LifeBuoy,
  LogIn,
  LogOut,
  Mail,
  Monitor,
  MonitorSmartphone,
  MapPin,
  Merge,
  Search,
  Shield,
  ShieldAlert,
  Smartphone,
  User,
  UserCog,
  X,
} from "lucide-react";
import { getUserActivity } from "@/lib/api";
import { Skeleton } from "@/components/ui/Skeleton";
import { useI18n } from "@/lib/i18n";

interface ActivityItem {
  id: string;
  source?: string;
  action: string;
  targetType?: string | null;
  targetId?: string | null;
  metadata?: any;
  severity?: string;
  createdAt: string;
}

type FilterType = "all" | "security" | "account" | "tickets";
type TimePeriod = "daily" | "weekly" | "monthly";

interface ActionMeta {
  icon: typeof LogIn;
  color: string;
  bg: string;
  labelKey: string;
  category: FilterType;
}

const CAT_LABEL: Record<FilterType, string> = {
  security: "Security",
  account: "Account",
  tickets: "Tickets",
  all: "All",
};

const ACTIONS: Array<ActionMeta & { match: string[] }> = [
  { match: ["login_failed", "auth.login_failed"], icon: ShieldAlert, color: "var(--tb-red)", bg: "var(--tb-red-soft)", labelKey: "history.act.loginFailed", category: "security" },
  { match: ["suspicious", "denied", "blocked"], icon: ShieldAlert, color: "var(--tb-red)", bg: "var(--tb-red-soft)", labelKey: "history.act.suspiciousLoginDenied", category: "security" },
  { match: ["login_2fa", "auth.login_2fa"], icon: KeyRound, color: "var(--tb-blue)", bg: "var(--tb-blue-soft)", labelKey: "history.act.login2fa", category: "security" },
  { match: ["login_otp", "auth.login_otp", "suspicious_login_otp"], icon: KeyRound, color: "var(--tb-blue)", bg: "var(--tb-blue-soft)", labelKey: "history.act.loginOtp", category: "security" },
  { match: ["backup_code", "auth.login_recovery_2fa"], icon: KeyRound, color: "var(--tb-blue)", bg: "var(--tb-blue-soft)", labelKey: "history.act.backupCodesRegenerated", category: "security" },
  { match: ["recovery_email", "auth.login_recovery_email"], icon: Mail, color: "var(--tb-blue)", bg: "var(--tb-blue-soft)", labelKey: "history.act.recoveryEmailVerified", category: "security" },
  { match: ["magic_link", "auth.login_magic_link"], icon: Mail, color: "var(--tb-blue)", bg: "var(--tb-blue-soft)", labelKey: "history.act.loginOtp", category: "security" },
  { match: ["passkey.authenticated", "passkey_authenticated", "cli_login", "CLI_LOGIN"], icon: Fingerprint, color: "var(--tb-blue)", bg: "var(--tb-blue-soft)", labelKey: "history.act.passkeyAuth", category: "security" },
  { match: ["user.login", "auth.login_success", "login_success", "auth.login_password"], icon: LogIn, color: "var(--tb-green)", bg: "var(--tb-green-soft)", labelKey: "history.act.login", category: "security" },
  { match: ["logout", "session.revoked_all", "sessions_revoked"], icon: LogOut, color: "var(--tb-text-muted)", bg: "var(--tb-surface-2)", labelKey: "history.act.sessionsRevokedAll", category: "security" },
  { match: ["session.revoked"], icon: LogOut, color: "var(--tb-text-muted)", bg: "var(--tb-surface-2)", labelKey: "history.act.sessionRevoked", category: "security" },
  { match: ["device.seen", "device_seen"], icon: MonitorSmartphone, color: "var(--tb-blue)", bg: "var(--tb-blue-soft)", labelKey: "history.act.deviceSeen", category: "security" },
  { match: ["password.reset", "password_reset"], icon: KeyRound, color: "var(--tb-blue)", bg: "var(--tb-blue-soft)", labelKey: "history.act.passwordReset", category: "security" },
  { match: ["password.changed", "password_changed"], icon: KeyRound, color: "var(--tb-blue)", bg: "var(--tb-blue-soft)", labelKey: "history.act.passwordChanged", category: "security" },
  { match: ["2fa.enabled", "totp.enabled", "2fa_enabled"], icon: Shield, color: "var(--tb-green)", bg: "var(--tb-green-soft)", labelKey: "history.act.twofaEnabled", category: "security" },
  { match: ["2fa.disabled", "totp.disabled", "2fa_disabled"], icon: Shield, color: "var(--tb-text-muted)", bg: "var(--tb-surface-2)", labelKey: "history.act.twofaDisabled", category: "security" },
  { match: ["passkey.registered"], icon: Fingerprint, color: "var(--tb-blue)", bg: "var(--tb-blue-soft)", labelKey: "history.act.passkeyRegistered", category: "security" },
  { match: ["passkey.deleted"], icon: Fingerprint, color: "var(--tb-text-muted)", bg: "var(--tb-surface-2)", labelKey: "history.act.passkeyDeleted", category: "security" },
  { match: ["recovery_email.verified"], icon: Mail, color: "var(--tb-green)", bg: "var(--tb-green-soft)", labelKey: "history.act.recoveryEmailVerified", category: "account" },
  { match: ["recovery_email.updated"], icon: Mail, color: "var(--tb-blue)", bg: "var(--tb-blue-soft)", labelKey: "history.act.recoveryEmailUpdated", category: "account" },
  { match: ["recovery_email.removed"], icon: Mail, color: "var(--tb-text-muted)", bg: "var(--tb-surface-2)", labelKey: "history.act.recoveryEmailRemoved", category: "account" },
  { match: ["phone.added"], icon: Smartphone, color: "var(--tb-blue)", bg: "var(--tb-blue-soft)", labelKey: "history.act.phoneAdded", category: "account" },
  { match: ["phone.verified"], icon: Smartphone, color: "var(--tb-green)", bg: "var(--tb-green-soft)", labelKey: "history.act.phoneVerified", category: "account" },
  { match: ["phone.removed"], icon: Smartphone, color: "var(--tb-text-muted)", bg: "var(--tb-surface-2)", labelKey: "history.act.phoneRemoved", category: "account" },
  { match: ["email_verified", "email.verified"], icon: Mail, color: "var(--tb-green)", bg: "var(--tb-green-soft)", labelKey: "history.act.emailVerified", category: "account" },
  { match: ["merge.login"], icon: Merge, color: "var(--tb-blue)", bg: "var(--tb-blue-soft)", labelKey: "history.act.mergeLogin", category: "account" },
  { match: ["merge"], icon: Merge, color: "var(--tb-blue)", bg: "var(--tb-blue-soft)", labelKey: "history.act.oauthMerged", category: "account" },
  { match: ["avatar", "photoUrl"], icon: User, color: "var(--tb-blue)", bg: "var(--tb-blue-soft)", labelKey: "history.act.avatarUpdated", category: "account" },
  { match: ["username"], icon: UserCog, color: "var(--tb-blue)", bg: "var(--tb-blue-soft)", labelKey: "history.act.usernameUpdated", category: "account" },
  { match: ["consent.updated"], icon: Shield, color: "var(--tb-blue)", bg: "var(--tb-blue-soft)", labelKey: "history.act.consentUpdated", category: "account" },
  { match: ["profile.updated", "profile_updated", "user.updated"], icon: UserCog, color: "var(--tb-blue)", bg: "var(--tb-blue-soft)", labelKey: "history.act.profileUpdated", category: "account" },
  { match: ["data_export", "DATA_EXPORT"], icon: CreditCard, color: "var(--tb-purple)", bg: "var(--tb-purple-soft)", labelKey: "history.act.dataExportRequested", category: "account" },
  { match: ["DELETE_ACCOUNT", "account_deleted", "deletion"], icon: AlertTriangle, color: "var(--tb-red)", bg: "var(--tb-red-soft)", labelKey: "history.act.deleteAccountRequested", category: "account" },
  { match: ["user.created", "signup"], icon: User, color: "var(--tb-green)", bg: "var(--tb-green-soft)", labelKey: "history.act.signup", category: "account" },
  { match: ["ticket.created", "TICKET_CREATED"], icon: LifeBuoy, color: "var(--tb-purple)", bg: "var(--tb-purple-soft)", labelKey: "history.act.ticketCreated", category: "tickets" },
  { match: ["ticket.replied", "TICKET_REPLIED"], icon: Mail, color: "var(--tb-purple)", bg: "var(--tb-purple-soft)", labelKey: "history.act.ticketReplied", category: "tickets" },
  { match: ["ticket.closed", "TICKET_CLOSED"], icon: LifeBuoy, color: "var(--tb-text-muted)", bg: "var(--tb-surface-2)", labelKey: "history.act.ticketClosed", category: "tickets" },
];

function getActionMeta(action: string): ActionMeta {
  const lower = (action || "").toLowerCase();
  for (const rule of ACTIONS) {
    for (const token of rule.match) {
      if (lower.includes(token.toLowerCase())) {
        return { icon: rule.icon, color: rule.color, bg: rule.bg, labelKey: rule.labelKey, category: rule.category };
      }
    }
  }
  return { icon: Bell, color: "var(--tb-text-muted)", bg: "var(--tb-surface-2)", labelKey: "history.act.unknown", category: "account" };
}

function categorize(action: string): FilterType {
  return getActionMeta(action).category;
}

function parseDevice(ua?: string): string | null {
  if (!ua) return null;
  let browser = "Unknown browser";
  if (/edg\//i.test(ua)) browser = "Edge";
  else if (/opr\/|opera/i.test(ua)) browser = "Opera";
  else if (/chrome|crios/i.test(ua)) browser = "Chrome";
  else if (/firefox|fxios/i.test(ua)) browser = "Firefox";
  else if (/safari/i.test(ua)) browser = "Safari";
  let os = "Unknown OS";
  if (/windows/i.test(ua)) os = "Windows";
  else if (/android/i.test(ua)) os = "Android";
  else if (/iphone|ipad|ipod/i.test(ua)) os = "iOS";
  else if (/mac os x|macintosh/i.test(ua)) os = "macOS";
  else if (/linux/i.test(ua)) os = "Linux";
  return `${browser} · ${os}`;
}

function cleanIp(ip?: string | null) {
  if (!ip) return null;
  return ip.replace(/^::ffff:/, "");
}

function humanizeActionRaw(action: string) {
  if (!action) return "Activity";
  return action.replace(/[_\.]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()).trim();
}

const METHOD_LABELS: Record<string, string> = {
  password: "Password", magic_link: "Magic link", totp: "Authenticator app",
  otp: "One-time code", passkey: "Passkey", admin_password: "Admin password",
  backup_code: "Backup code", recovery_email: "Recovery email",
  google: "Google", github: "GitHub", discord: "Discord",
};

function timeAgo(iso: string, t: (k: string, vars?: Record<string, string | number>) => string) {
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  if (diff < 60_000) return t("common.justNow");
  if (diff < 3600_000) return t("common.agoM", { n: Math.floor(diff / 60_000) });
  if (diff < 86400_000) return t("common.agoH", { n: Math.floor(diff / 3600_000) });
  if (diff < 172800_000) return t("common.yesterday");
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function fullDate(iso: string, lang: string) {
  return new Date(iso).toLocaleString(lang, {
    weekday: "short", month: "short", day: "numeric", year: "numeric",
    hour: "numeric", minute: "2-digit", second: "2-digit",
  });
}

function dayLabel(iso: string, lang: string, t: (k: string) => string): string {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date(Date.now() - 86_400_000);
  const sameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  if (sameDay(d, today)) return t("history.today");
  if (sameDay(d, yesterday)) return t("common.yesterday");
  return d.toLocaleDateString(lang, { weekday: "long", month: "long", day: "numeric", year: "numeric" });
}

function buildDetail(item: ActivityItem, t: (k: string) => string) {
  const m = (item.metadata || {}) as Record<string, any>;
  const ip = cleanIp(typeof m.ip === "string" ? m.ip : typeof m.ipAddress === "string" ? m.ipAddress : null);
  const ua = typeof m.userAgent === "string" ? m.userAgent : null;
  const device = parseDevice(ua || undefined);
  const email = typeof m.email === "string" ? m.email : null;
  const provider = typeof m.provider === "string" ? m.provider : null;
  const methodRaw = typeof m.method === "string" ? m.method : typeof m.reason === "string" && METHOD_LABELS[m.reason.toLowerCase()] ? m.reason : null;
  const methodLabel = methodRaw ? (METHOD_LABELS[methodRaw.toLowerCase()] || methodRaw.replace(/_/g, " ")) : null;
  const reason = typeof m.reason === "string" && !METHOD_LABELS[m.reason] ? m.reason.replace(/_/g, " ") : null;
  const fields: string[] | null = Array.isArray(m.fields) ? m.fields : Array.isArray(m.changedFields) ? m.changedFields : null;
  const target = item.targetType ? `${item.targetType}${item.targetId ? ` · ${String(item.targetId).slice(0, 8)}` : ""}` : null;
  const success = typeof m.success === "boolean" ? m.success : null;

  const meta = getActionMeta(item.action);
  const title = (() => {
    try {
      const translated = t(meta.labelKey as any);
      if (translated && translated !== meta.labelKey) return translated;
    } catch {}
    return humanizeActionRaw(item.action);
  })();

  const where = [device, ip].filter(Boolean).join(" · ");
  const ctx: string[] = [];
  if (methodLabel) ctx.push(methodLabel);
  else if (provider) ctx.push(provider.charAt(0).toUpperCase() + provider.slice(1));
  if (where) ctx.push(`from ${where}`);
  if (email) ctx.push(email);
  else if (target && !target.startsWith("user")) ctx.push(target);
  if (reason) ctx.push(reason);
  const context = ctx.filter(Boolean).join(" · ");

  const rows: Array<{ label: string; value: string; icon: any }> = [];
  if (email) rows.push({ label: "Who", value: email, icon: Mail });
  if (methodLabel) rows.push({ label: "Method", value: methodLabel, icon: KeyRound });
  if (provider) rows.push({ label: "Provider", value: provider, icon: Globe });
  if (device) rows.push({ label: "Device", value: device, icon: Monitor });
  if (ip) rows.push({ label: "IP address", value: ip, icon: Globe });
  if (target) rows.push({ label: "Target", value: target, icon: Hash });
  if (fields && fields.length) rows.push({ label: "Changed fields", value: fields.join(", "), icon: UserCog });
  if (reason) rows.push({ label: "Reason", value: reason, icon: Info });
  if (success !== null) rows.push({ label: "Result", value: success ? "Success" : "Failed", icon: success ? Shield : ShieldAlert });
  if (m.rayId) rows.push({ label: "Ray ID", value: String(m.rayId).slice(0, 16), icon: Hash });

  return { title, context, rows, ip, device, methodLabel, email, reason, fields, success, ua };
}

/* ═══════════════════════════════════════════════════════════════
   SVG BAR CHART — pure React, no external lib, dark-themed
   ═══════════════════════════════════════════════════════════════ */

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

interface ChartBar {
  label: string;
  fullLabel: string;
  count: number;
  security: number;
  account: number;
  tickets: number;
  dateKey: string;
}

function ActivityChart({
  bars,
  period,
  onPeriodChange,
  hoveredBar,
  onHoverBar,
  lang,
}: {
  bars: ChartBar[];
  period: TimePeriod;
  onPeriodChange: (p: TimePeriod) => void;
  hoveredBar: number | null;
  onHoverBar: (i: number | null) => void;
  lang: string;
}) {
  const maxCount = Math.max(...bars.map((b) => b.count), 1);
  const W = 100; // viewBox width percentage
  const H = 140;
  const barGap = period === "daily" ? 2 : period === "weekly" ? 4 : 6;
  const barW = Math.max(1, (W - barGap * (bars.length + 1)) / bars.length);
  const chartPadTop = 20;
  const chartH = H - chartPadTop;



  return (
    <div className="relative">
      {/* Period tabs */}
      <div className="flex items-center gap-1 mb-4">
        {(["daily", "weekly", "monthly"] as TimePeriod[]).map((p) => (
          <button
            key={p}
            onClick={() => onPeriodChange(p)}
            className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all duration-150 cursor-pointer border ${
              period === p
                ? "bg-tb-surface-1 text-tb-text-primary border-tb-border shadow-sm"
                : "bg-transparent text-tb-text-muted border-transparent hover:bg-tb-surface-2"
            }`}
          >
            {p.charAt(0).toUpperCase() + p.slice(1)}
          </button>
        ))}
      </div>

      {/* Chart */}
      <div className="relative">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full h-auto"
          style={{ minHeight: 120 }}
          onMouseLeave={() => onHoverBar(null)}
        >
          {/* Grid lines */}
          {[0.25, 0.5, 0.75, 1].map((frac) => (
            <g key={frac}>
              <line
                x1={0}
                y1={chartPadTop + chartH * (1 - frac)}
                x2={W}
                y2={chartPadTop + chartH * (1 - frac)}
                stroke="var(--tb-border)"
                strokeWidth={0.15}
                strokeDasharray="0.5 0.5"
              />
              <text
                x={0.5}
                y={chartPadTop + chartH * (1 - frac) - 0.8}
                fill="var(--tb-text-muted)"
                fontSize={2.2}
                fontFamily="inherit"
              >
                {Math.round(maxCount * frac)}
              </text>
            </g>
          ))}

          {/* Bars */}
          {bars.map((bar, i) => {
            const x = barGap + i * (barW + barGap);
            const h = maxCount > 0 ? (bar.count / maxCount) * chartH : 0;
            const y = chartPadTop + chartH - h;
            const isHovered = hoveredBar === i;

            // Stack: security on bottom, account middle, tickets top
            const secH = bar.count > 0 ? (bar.security / maxCount) * chartH : 0;
            const accH = bar.count > 0 ? (bar.account / maxCount) * chartH : 0;
            const tktH = bar.count > 0 ? (bar.tickets / maxCount) * chartH : 0;

            return (
              <g
                key={i}
                onMouseEnter={() => onHoverBar(i)}
                onMouseLeave={() => onHoverBar(null)}
                style={{ cursor: "pointer" }}
              >
                {/* Invisible hit area */}
                <rect x={x - 0.5} y={0} width={barW + 1} height={H} fill="transparent" />

                {/* Tickets (top) */}
                {tktH > 0 && (
                  <rect
                    x={x}
                    y={chartPadTop + chartH - secH - accH - tktH}
                    width={barW}
                    height={tktH}
                    rx={0.8}
                    fill="var(--tb-purple)"
                    opacity={isHovered ? 0.9 : 0.65}
                  />
                )}
                {/* Account (middle) */}
                {accH > 0 && (
                  <rect
                    x={x}
                    y={chartPadTop + chartH - secH - accH}
                    width={barW}
                    height={accH}
                    rx={tktH > 0 ? 0 : 0.8}
                    fill="var(--tb-blue)"
                    opacity={isHovered ? 0.9 : 0.65}
                  />
                )}
                {/* Security (bottom) */}
                {secH > 0 && (
                  <rect
                    x={x}
                    y={chartPadTop + chartH - secH}
                    width={barW}
                    height={secH}
                    rx={accH > 0 || tktH > 0 ? 0 : 0.8}
                    fill="var(--tb-green)"
                    opacity={isHovered ? 0.9 : 0.65}
                  />
                )}
                {/* Total bar (no stacking, just outline when hovered) */}
                {bar.count === 0 && (
                  <rect
                    x={x}
                    y={chartPadTop + chartH - 1}
                    width={barW}
                    height={1}
                    rx={0.5}
                    fill="var(--tb-border)"
                    opacity={0.5}
                  />
                )}

                {/* Hover highlight */}
                {isHovered && (
                  <rect
                    x={x - 0.3}
                    y={chartPadTop}
                    width={barW + 0.6}
                    height={chartH}
                    rx={1}
                    fill="var(--tb-text-primary)"
                    opacity={0.04}
                  />
                )}

                {/* X-axis label */}
                <text
                  x={x + barW / 2}
                  y={H - 1}
                  textAnchor="middle"
                  fill={isHovered ? "var(--tb-text-primary)" : "var(--tb-text-muted)"}
                  fontSize={period === "daily" ? 2.2 : 2.4}
                  fontFamily="inherit"
                  fontWeight={isHovered ? 600 : 400}
                >
                  {bar.label}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Tooltip */}
        {hoveredBar !== null && bars[hoveredBar] && (
          <div
            className="absolute z-50 pointer-events-none px-3 py-2.5 rounded-xl bg-tb-surface-1 border border-tb-border shadow-[0_8px_32px_rgba(0,0,0,0.4)] animate-fade-in"
            style={{
              left: `${((barGap + hoveredBar * (barW + barGap) + barW / 2) / W) * 100}%`,
              top: 8,
              transform: "translateX(-50%)",
            }}
          >
            <div className="text-[11px] font-semibold text-tb-text-primary mb-1.5 whitespace-nowrap">
              {bars[hoveredBar].fullLabel}
            </div>
            <div className="flex items-center gap-3 text-[11px]">
              <span className="font-bold text-tb-text-primary">{bars[hoveredBar].count} events</span>
              {bars[hoveredBar].security > 0 && (
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-tb-green" />
                  <span className="text-tb-text-muted">{bars[hoveredBar].security} security</span>
                </span>
              )}
              {bars[hoveredBar].account > 0 && (
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-tb-blue" />
                  <span className="text-tb-text-muted">{bars[hoveredBar].account} account</span>
                </span>
              )}
              {bars[hoveredBar].tickets > 0 && (
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-tb-purple" />
                  <span className="text-tb-text-muted">{bars[hoveredBar].tickets} tickets</span>
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SVG LINE CHART — area fill + smooth curve, pure React
   ═══════════════════════════════════════════════════════════════ */

function ActivityLineChart({ bars, lang }: { bars: ChartBar[]; lang: string }) {
  const maxCount = Math.max(...bars.map((b) => b.count), 1);
  const W = 100;
  const H = 80;
  const padTop = 12;
  const padBot = 12;
  const padSide = 2;
  const chartH = H - padTop - padBot;
  const chartW = W - padSide * 2;

  const pts = bars.map((b, i) => ({
    x: padSide + (i / Math.max(bars.length - 1, 1)) * chartW,
    y: padTop + chartH - (b.count / maxCount) * chartH,
  }));

  // Catmull-Rom → cubic bezier approximation for smooth curves
  function smoothPath(points: { x: number; y: number }[]): string {
    if (points.length < 2) return "";
    let d = `M ${points[0].x},${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[Math.max(i - 1, 0)];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[Math.min(i + 2, points.length - 1)];
      const tension = 0.3;
      const cp1x = p1.x + (p2.x - p0.x) * tension;
      const cp1y = p1.y + (p2.y - p0.y) * tension;
      const cp2x = p2.x - (p3.x - p1.x) * tension;
      const cp2y = p2.y - (p3.y - p1.y) * tension;
      d += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`;
    }
    return d;
  }

  const lineD = smoothPath(pts);
  const areaD = lineD + ` L ${pts[pts.length - 1].x},${padTop + chartH} L ${pts[0].x},${padTop + chartH} Z`;

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" style={{ minHeight: 60 }}>
        <defs>
          <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--tb-green)" stopOpacity={0.25} />
            <stop offset="100%" stopColor="var(--tb-green)" stopOpacity={0} />
          </linearGradient>
        </defs>
        {/* Grid */}
        {[0.5, 1].map((f) => (
          <line key={f} x1={padSide} y1={padTop + chartH * (1 - f)} x2={W - padSide} y2={padTop + chartH * (1 - f)} stroke="var(--tb-border)" strokeWidth={0.12} strokeDasharray="0.5 0.5" />
        ))}
        {/* Area */}
        <path d={areaD} fill="url(#lineGrad)" />
        {/* Line */}
        <path d={lineD} fill="none" stroke="var(--tb-green)" strokeWidth={0.6} strokeLinecap="round" strokeLinejoin="round" />
        {/* Dots */}
        {pts.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={0.8} fill="var(--tb-green)" stroke="var(--tb-surface-1)" strokeWidth={0.3} />
        ))}
      </svg>
      {/* Labels */}
      <div className="flex justify-between px-1 mt-1">
        {bars.map((b, i) => (
          <span key={i} className="text-[10px] text-tb-text-muted" style={{ flex: 1, textAlign: i === 0 ? "left" : i === bars.length - 1 ? "right" : "center" }}>{b.label}</span>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SVG DONUT CHART — category breakdown, pure React
   ═══════════════════════════════════════════════════════════════ */

function CategoryDonut({ security, account, tickets }: { security: number; account: number; tickets: number }) {
  const total = security + account + tickets;
  const segments = [
    { label: "Security", count: security, color: "var(--tb-green)" },
    { label: "Account", count: account, color: "var(--tb-blue)" },
    { label: "Tickets", count: tickets, color: "var(--tb-purple)" },
  ].filter((s) => s.count > 0);

  const R = 16;
  const cx = 20;
  const cy = 20;
  const circumference = 2 * Math.PI * R;

  let cumulative = 0;
  const arcs = segments.map((seg) => {
    const pct = total > 0 ? seg.count / total : 0;
    const dashLen = pct * circumference;
    const dashOff = -cumulative * circumference;
    cumulative += pct;
    return { ...seg, pct, dashLen, dashOff };
  });

  return (
    <div className="flex items-center gap-5">
      <svg viewBox="0 0 40 40" className="w-[80px] h-[80px] shrink-0">
        {/* Background ring */}
        <circle cx={cx} cy={cy} r={R} fill="none" stroke="var(--tb-border)" strokeWidth={4} />
        {/* Segments */}
        {arcs.map((a, i) => (
          <circle
            key={i}
            cx={cx}
            cy={cy}
            r={R}
            fill="none"
            stroke={a.color}
            strokeWidth={4}
            strokeDasharray={`${a.dashLen} ${circumference - a.dashLen}`}
            strokeDashoffset={a.dashOff}
            strokeLinecap="round"
            style={{ transition: "stroke-dasharray 400ms ease, stroke-dashoffset 400ms ease" }}
          />
        ))}
        {/* Center text */}
        <text x={cx} y={cy - 1.5} textAnchor="middle" fill="var(--tb-text-primary)" fontSize={5} fontWeight="700" fontFamily="inherit">{total}</text>
        <text x={cx} y={cy + 3.5} textAnchor="middle" fill="var(--tb-text-muted)" fontSize={2.8} fontFamily="inherit">events</text>
      </svg>
      <div className="flex flex-col gap-2.5">
        {segments.map((seg) => (
          <div key={seg.label} className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: seg.color }} />
            <span className="text-[13px] text-tb-text-secondary">{seg.label}</span>
            <span className="text-[13px] font-semibold text-tb-text-primary ml-auto">{seg.count}</span>
            <span className="text-[11px] text-tb-text-muted w-[36px] text-right">{total > 0 ? Math.round((seg.count / total) * 100) : 0}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════════════════ */

const PAGE_SIZE = 50;

export default function HistoryPage() {
  const { t, lang } = useI18n();
  const [items, setItems] = useState<ActivityItem[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [filter, setFilter] = useState<FilterType>("all");
  const [timePeriod, setTimePeriod] = useState<TimePeriod>("daily");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [rawFor, setRawFor] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Load initial data
  useEffect(() => {
    getUserActivity(PAGE_SIZE, 0)
      .then((r) => {
        const data = Array.isArray(r) ? r : r?.events ?? [];
        setItems(data);
        setTotal(r?.total ?? data.length);
        setHasMore(data.length >= PAGE_SIZE);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const itemsLenRef = useRef(0);
  useEffect(() => { itemsLenRef.current = items.length; }, [items.length]);

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const r = await getUserActivity(PAGE_SIZE, itemsLenRef.current);
      const data = Array.isArray(r) ? r : r?.events ?? [];
      const serverTotal = Array.isArray(r) ? 0 : (r as any)?.total ?? 0;
      if (serverTotal) setTotal(serverTotal);
      if (data.length === 0) setHasMore(false);
      else {
        setItems((prev) => [...prev, ...data]);
        setHasMore(serverTotal > 0 ? itemsLenRef.current + data.length < serverTotal : data.length >= PAGE_SIZE);
      }
    } catch {} finally { setLoadingMore(false); }
  }, [loadingMore, hasMore]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || loading || !hasMore) return;
    const scrollRoot = (document.querySelector(".dashboard-main") as HTMLElement) || document.scrollingElement || null;
    const observer = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting && !loadingMore && hasMore) loadMore(); },
      { root: scrollRoot, rootMargin: "400px 0px", threshold: 0 },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loadMore, hasMore, loading, loadingMore]);

  // ── Real computed stats ──
  const stats = useMemo(() => {
    const all = items;
    const security = all.filter((i) => categorize(i.action) === "security").length;
    const account = all.filter((i) => categorize(i.action) === "account").length;
    const tickets = all.filter((i) => categorize(i.action) === "tickets").length;
    const failed = all.filter((i) => {
      const m = i.metadata || {};
      return m.success === false || /failed|suspicious|denied|blocked/i.test(i.action);
    }).length;
    return { total: total || all.length, security, account, tickets, failed };
  }, [items, total]);

  // ── Chart data — computed from real items ──
  const chartBars = useMemo(() => {
    const now = Date.now();
    const DAY = 86_400_000;
    const bars: ChartBar[] = [];

    if (timePeriod === "daily") {
      // Last 7 days
      for (let i = 6; i >= 0; i--) {
        const dayStart = new Date(now - (i + 1) * DAY);
        const dayEnd = new Date(now - i * DAY);
        const dayItems = items.filter((it) => {
          const t = new Date(it.createdAt).getTime();
          return t >= dayStart.getTime() && t < dayEnd.getTime();
        });
        const d = new Date(dayEnd);
        const dayName = DAY_NAMES[d.getDay()];
        const fullLabel = d.toLocaleDateString(lang, { weekday: "long", month: "short", day: "numeric" });
        bars.push({
          label: dayName,
          fullLabel,
          count: dayItems.length,
          security: dayItems.filter((i) => categorize(i.action) === "security").length,
          account: dayItems.filter((i) => categorize(i.action) === "account").length,
          tickets: dayItems.filter((i) => categorize(i.action) === "tickets").length,
          dateKey: dayEnd.toISOString().slice(0, 10),
        });
      }
    } else if (timePeriod === "weekly") {
      // Last 4 weeks
      for (let i = 3; i >= 0; i--) {
        const weekStart = new Date(now - (i + 1) * 7 * DAY);
        const weekEnd = new Date(now - i * 7 * DAY);
        const weekItems = items.filter((it) => {
          const t = new Date(it.createdAt).getTime();
          return t >= weekStart.getTime() && t < weekEnd.getTime();
        });
        const ws = new Date(weekStart);
        const we = new Date(weekEnd);
        const label = `W${4 - i}`;
        const fullLabel = `${ws.toLocaleDateString(lang, { month: "short", day: "numeric" })} – ${we.toLocaleDateString(lang, { month: "short", day: "numeric" })}`;
        bars.push({
          label,
          fullLabel,
          count: weekItems.length,
          security: weekItems.filter((i) => categorize(i.action) === "security").length,
          account: weekItems.filter((i) => categorize(i.action) === "account").length,
          tickets: weekItems.filter((i) => categorize(i.action) === "tickets").length,
          dateKey: weekEnd.toISOString().slice(0, 10),
        });
      }
    } else {
      // Last 6 months
      for (let i = 5; i >= 0; i--) {
        const monthDate = new Date(now - i * 30 * DAY);
        const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
        const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0, 23, 59, 59, 999);
        const monthItems = items.filter((it) => {
          const t = new Date(it.createdAt).getTime();
          return t >= monthStart.getTime() && t <= monthEnd.getTime();
        });
        const label = MONTH_NAMES[monthDate.getMonth()];
        const fullLabel = monthDate.toLocaleDateString(lang, { month: "long", year: "numeric" });
        bars.push({
          label,
          fullLabel,
          count: monthItems.length,
          security: monthItems.filter((i) => categorize(i.action) === "security").length,
          account: monthItems.filter((i) => categorize(i.action) === "account").length,
          tickets: monthItems.filter((i) => categorize(i.action) === "tickets").length,
          dateKey: monthEnd.toISOString().slice(0, 10),
        });
      }
    }

    return bars;
  }, [items, timePeriod, lang]);

  // ── Filtered items ──
  const filtered = useMemo(() => {
    return items.filter((item) => {
      if (filter !== "all" && categorize(item?.action) !== filter) return false;
      if (!query.trim()) return true;
      const q = query.toLowerCase();
      const detail = buildDetail(item, t as any);
      const hay = [detail.title, detail.context, item.action, item.source, item.targetType, JSON.stringify(item.metadata)].join(" ").toLowerCase();
      return hay.includes(q);
    });
  }, [items, filter, query, t]);

  // ── Grouped by day ──
  const groups = useMemo(() => {
    const out: Array<{ label: string; items: ActivityItem[] }> = [];
    for (const item of filtered) {
      const label = dayLabel(item.createdAt, lang, t);
      const last = out[out.length - 1];
      if (last && last.label === label) last.items.push(item);
      else out.push({ label, items: [item] });
    }
    return out;
  }, [filtered, lang, t]);

  const tabs: Array<{ key: FilterType; label: string; count: number }> = [
    { key: "all", label: t("history.tabAll") || "All", count: stats.total },
    { key: "security", label: t("history.tabSecurity") || "Security", count: stats.security },
    { key: "account", label: t("history.tabAccount") || "Account", count: stats.account },
    { key: "tickets", label: t("history.tabTickets") || "Tickets", count: stats.tickets },
  ];

  const toggleExpand = (id: string) => {
    setExpanded((prev) => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; });
  };

  const statCards = [
    { label: "Total events", value: stats.total, icon: History, color: "var(--tb-text-primary)", bg: "var(--tb-surface-3)" },
    { label: "Security", value: stats.security, icon: Shield, color: "var(--tb-green)", bg: "var(--tb-green-soft)" },
    { label: "Account", value: stats.account, icon: User, color: "var(--tb-blue)", bg: "var(--tb-blue-soft)" },
    { label: "Tickets", value: stats.tickets, icon: LifeBuoy, color: "var(--tb-purple)", bg: "var(--tb-purple-soft)" },
  ];

  return (
    <div className="flex flex-col gap-6 max-w-[1200px] mx-auto">
      {/* ── Page Header ── */}
      <div>
        <h1 className="text-[28px] font-bold text-tb-text-primary tracking-tight flex items-center gap-2.5">
          <History size={24} className="text-tb-yellow" />
          {t("history.title")}
        </h1>
        <p className="text-[14px] text-tb-text-muted mt-1">{t("history.subtitle")}</p>
      </div>

      {/* ═══ Stats Cards ═══ */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-xl border border-tb-border bg-tb-surface-1 p-4">
              <div className="flex items-center gap-3">
                <Skeleton width={32} height={32} borderRadius={8} />
                <div>
                  <Skeleton width={60} height={10} className="mb-1.5" />
                  <Skeleton width={28} height={20} />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {statCards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.label}
                className="rounded-xl border border-tb-border bg-tb-surface-1 p-4 transition-all duration-200 hover:border-tb-border-hover"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: card.bg, color: card.color }}
                  >
                    <Icon size={15} />
                  </div>
                  <div>
                    <div className="text-[11px] font-medium text-tb-text-muted uppercase tracking-wide">{card.label}</div>
                    <div className="text-[20px] font-bold text-tb-text-primary leading-tight mt-0.5">{card.value}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ═══ Event Feed ═══ */}
      <div className="rounded-2xl border border-tb-border bg-tb-surface-1 overflow-hidden">
        {/* Toolbar */}
        <div className="flex items-center justify-between gap-3 px-5 py-3.5 border-b border-tb-border flex-wrap">
          <div className="flex items-center gap-1.5 bg-tb-surface-2 p-1 rounded-xl" role="tablist">
            {tabs.map((tab) => {
              const active = filter === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setFilter(tab.key)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12.5px] font-semibold transition-all duration-150 cursor-pointer ${
                    active
                      ? "bg-tb-surface-1 text-tb-text-primary shadow-[0_1px_2px_rgba(0,0,0,0.08)] border border-tb-border"
                      : "bg-transparent text-tb-text-muted border border-transparent"
                  }`}
                >
                  {tab.label}
                  <span className={`text-[10.5px] font-bold px-1.5 py-px rounded-full ${active ? "bg-tb-brand-soft text-tb-text-primary" : "bg-tb-surface-3 text-tb-text-muted"}`}>
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="relative flex-[0_1_240px] min-w-[160px]">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-tb-text-muted pointer-events-none" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search…"
              className="w-full h-8 pl-8 pr-8 rounded-lg text-[13px] border border-tb-border bg-tb-surface-2 text-tb-text-primary placeholder:text-tb-text-muted outline-none transition-all duration-150 focus:border-tb-border-strong"
            />
            {query && (
              <button onClick={() => setQuery("")} aria-label="Clear" className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded-md text-tb-text-muted hover:text-tb-text-primary cursor-pointer bg-transparent border-none">
                <X size={13} />
              </button>
            )}
          </div>
        </div>

        {/* Loading skeleton */}
        {loading ? (
          <div aria-hidden="true">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className={`flex items-start gap-4 px-5 py-4 ${i < 5 ? "border-b border-tb-border" : ""}`}>
                <Skeleton width={34} height={34} borderRadius={10} />
                <div className="flex-1 min-w-0">
                  <Skeleton width={`${40 + i * 5}%`} height={13} className="mb-1.5" />
                  <Skeleton width="50%" height={11} />
                </div>
                <Skeleton width={46} height={11} />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 px-6 text-center">
            <div className="w-14 h-14 rounded-2xl border border-tb-border bg-tb-surface-2 inline-flex items-center justify-center text-tb-text-muted mb-4">
              <Clock size={24} />
            </div>
            <p className="text-[16px] font-semibold text-tb-text-primary">{query ? "No matching activity" : t("history.noActivity")}</p>
            <p className="text-[14px] text-tb-text-muted mt-1">{query ? `No results for "${query}".` : t("history.noActivityDesc")}</p>
          </div>
        ) : (
          <div>
            {groups.map((group) => (
              <div key={group.label}>
                <div className="flex items-center justify-between px-5 py-3 sticky top-0 z-[2] bg-tb-surface-1 border-b border-tb-border">
                  <span className="text-[12px] font-bold tracking-[0.16em] uppercase text-tb-text-muted">{group.label}</span>
                  <span className="text-[12px] font-medium text-tb-text-muted">{group.items.length} event{group.items.length !== 1 ? "s" : ""}</span>
                </div>
                {group.items.map((item) => {
                  const meta = getActionMeta(item.action);
                  const Icon = meta.icon;
                  const detail = buildDetail(item, t as any);
                  const isFailed = detail.success === false;
                  const isImportant = isFailed || (item.severity && ["warning", "critical", "high", "error"].includes(String(item.severity).toLowerCase())) || /failed|suspicious|denied|blocked|revoked|alert/i.test(item.action);
                  const isExpanded = expanded.has(item.id);

                  return (
                    <div key={item.id} className={`transition-colors duration-100 ${isExpanded ? "bg-tb-surface-2 border-l-2 border-l-tb-text-primary" : "bg-tb-surface-1 border-l-2 border-l-transparent"}`}>
                      <button
                        type="button"
                        onClick={() => toggleExpand(item.id)}
                        aria-expanded={isExpanded}
                        className="w-full text-left flex items-start gap-3.5 px-5 py-4 transition-colors duration-100 hover:bg-tb-surface-2 focus-visible:bg-tb-surface-2 focus-visible:shadow-[inset_0_0_0_2px_var(--tb-border-strong)] focus-visible:outline-none cursor-pointer border-b border-tb-border bg-transparent border-t-0 border-l-0 border-r-0 font-[inherit]"
                      >
                        <div className="flex-shrink-0 mt-0.5">
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${isImportant ? "bg-tb-red-soft text-tb-red" : ""}`} style={isImportant ? undefined : { background: meta.bg, color: meta.color }}>
                            <Icon size={15} />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0 flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-[14px] font-semibold text-tb-text-primary tracking-[-0.01em]">{detail.title}</span>
                              {isImportant && <span className="text-[10px] font-bold tracking-wider uppercase px-1.5 py-px rounded" style={{ color: "var(--tb-red)" }}>{isFailed ? "Failed" : "Alert"}</span>}
                            </div>
                            {detail.context && <div className="text-[13px] text-tb-text-muted mt-1 truncate max-w-[560px]" title={detail.context}>{detail.context}</div>}
                          </div>
                          <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                            <time className="text-[12px] text-tb-text-muted whitespace-nowrap" dateTime={item.createdAt} title={fullDate(item.createdAt, lang)}>
                              {timeAgo(item.createdAt, t)}
                            </time>
                            <span className="text-[12px] text-tb-text-muted flex items-center gap-1">
                              {CAT_LABEL[meta.category]}
                              <ChevronDown size={13} style={{ transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 150ms" }} />
                            </span>
                          </div>
                        </div>
                      </button>

                      {isExpanded && (
                        <div className="px-5 pb-5 animate-in fade-in slide-in-from-top-1 duration-200">
                          {detail.rows.length > 0 && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-0.5">
                              {detail.rows.map((r) => {
                                const RIcon = r.icon;
                                return (
                                  <div key={r.label + r.value} className="flex items-center gap-2.5 min-w-0 rounded-lg px-3 py-2 bg-tb-surface-2 border border-tb-border">
                                    <span className="text-tb-text-muted flex-shrink-0"><RIcon size={13} /></span>
                                    <span className="text-[11px] font-semibold uppercase tracking-wider text-tb-text-muted flex-shrink-0">{r.label}</span>
                                    <span className="text-[13px] text-tb-text-secondary truncate">{r.value}</span>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                          <button type="button" onClick={() => setRawFor((cur) => (cur === item.id ? null : item.id))} className="mt-3 inline-flex items-center gap-1.5 text-[12px] font-medium text-tb-text-muted hover:text-tb-text-primary transition-colors cursor-pointer">
                            <Hash size={12} /> Raw event
                            <ChevronDown size={12} className="transition-transform duration-150" style={{ transform: rawFor === item.id ? "rotate(180deg)" : "rotate(0deg)" }} />
                          </button>
                          {rawFor === item.id && (
                            <pre className="m-0 mt-2 text-[12px] leading-relaxed font-mono whitespace-pre-wrap break-all rounded-lg px-3.5 py-3 text-tb-text-secondary bg-tb-surface-2 border border-dashed border-tb-border">
                              {`id: ${item.id}\naction: ${item.action}`}{item.source ? `\nsource: ${item.source}` : ""}{item.severity ? `\nseverity: ${item.severity}` : ""}{`\nmetadata: ${JSON.stringify(item.metadata, null, 2).slice(0, 900)}`}
                            </pre>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}

            <div ref={sentinelRef} className="h-1" />
            {hasMore && !loading && (
              <div className="flex justify-center py-5 border-t border-tb-border">
                <button onClick={loadMore} disabled={loadingMore} className="inline-flex items-center gap-1.5 px-5 h-9 rounded-xl text-[14px] font-medium border border-tb-border bg-tb-surface-1 text-tb-text-primary hover:bg-tb-surface-2 hover:border-tb-border-hover transition-all duration-150 disabled:opacity-40 cursor-pointer">
                  {loadingMore ? <><span className="w-3 h-3 animate-spin rounded-full border-2 border-current border-t-transparent" /> Loading…</> : "Load more"}
                </button>
              </div>
            )}
            {!hasMore && items.length > 0 && (
              <div className="flex flex-col items-center gap-3 py-8 border-t border-tb-border bg-tb-surface-1">
                <span className="w-10 h-px bg-tb-border" />
                <span className="text-[13px] text-tb-text-muted">You're all caught up — {total} events</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
