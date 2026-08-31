"use client";
import { useMemo, useState, useEffect } from "react";
import {
  Check,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Key,
  Mail,
  Clock,
  BadgeCheck,
  ArrowRight,
  Lock,
  Zap,
  Sparkles,
} from "lucide-react";
import { useI18n } from "@/lib/i18n";

interface ScoreItem {
  id: string;
  label: string;
  description: string;
  passed: boolean;
  critical: boolean;
  points: number;
  icon: typeof Check;
  href?: string;
}

function calculateScore(user: any): {
  score: number;
  items: ScoreItem[];
  level: "excellent" | "good" | "fair" | "poor";
} {
  const items: ScoreItem[] = [
    {
      id: "password",
      label: "Password",
      description: user?.hasPassword
        ? "Strong password set"
        : "Add a password to keep your account safe",
      passed: !!user?.hasPassword,
      critical: true,
      points: 25,
      icon: Key,
      href: "/account/security",
    },
    {
      id: "2fa",
      label: "Two-factor authentication",
      description: user?.totpEnabled
        ? "Protected with an authenticator app"
        : "Add a second step — takes 30 seconds",
      passed: !!user?.totpEnabled,
      critical: true,
      points: 30,
      icon: Shield,
      href: "/account/security",
    },
    {
      id: "recovery",
      label: "Recovery email",
      description:
        user?.recoveryEmail && user?.recoveryEmailVerified
          ? "Verified — you can recover your account"
          : user?.recoveryEmail
            ? "Verify your recovery email"
            : "Add a recovery email so you never get locked out",
      passed: !!(user?.recoveryEmail && user?.recoveryEmailVerified),
      critical: false,
      points: 20,
      icon: Mail,
      href: "/account/security",
    },
    {
      id: "email-verified",
      label: "Email verified",
      description: user?.emailVerified
        ? "Your primary email is confirmed"
        : "Confirm your email to prove it's yours",
      passed: !!user?.emailVerified,
      critical: false,
      points: 10,
      icon: BadgeCheck,
      href: "/account/profile",
    },
    {
      id: "username",
      label: "Username",
      description: user?.username
        ? `@${user.username} — unique and ready`
        : "Pick a username for easier sign-in",
      passed: !!user?.username,
      critical: false,
      points: 5,
      icon: Check,
      href: "/account/profile",
    },
    {
      id: "password-age",
      label: "Fresh password",
      description: (() => {
        const ts = user?.updatedAt
          ? new Date(user.updatedAt).getTime()
          : 0;
        const days = ts
          ? Math.floor((Date.now() - ts) / 86_400_000)
          : 999;
        if (!ts) return "Update your password to start the 90-day clock";
        if (days < 90)
          return `Updated ${days === 0 ? "today" : `${days}d ago`} — good hygiene`;
        return `Last updated ${days}d ago — consider a refresh`;
      })(),
      passed: (() => {
        const ts = user?.updatedAt
          ? new Date(user.updatedAt).getTime()
          : 0;
        if (!ts) return false;
        return (Date.now() - ts) / 86_400_000 < 90;
      })(),
      critical: false,
      points: 10,
      icon: Clock,
      href: "/account/security",
    },
  ];

  const score = Math.round(
    items.reduce((s, i) => s + (i.passed ? i.points : 0), 0)
  );
  let level: "excellent" | "good" | "fair" | "poor";
  if (score >= 90) level = "excellent";
  else if (score >= 70) level = "good";
  else if (score >= 40) level = "fair";
  else level = "poor";
  return { score, items, level };
}

/* ── Hexagonal Shield Centerpiece ── */
function ShieldVisual({
  score,
  level,
  passedCount,
  totalCount,
}: {
  score: number;
  level: string;
  passedCount: number;
  totalCount: number;
}) {
  const [animScore, setAnimScore] = useState(0);

  useEffect(() => {
    const duration = 1200;
    const start = performance.now();
    const animate = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimScore(Math.round(eased * score));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [score]);

  const colors: Record<string, { main: string; glow: string; ring: string }> =
    {
      excellent: {
        main: "#22C55E",
        glow: "rgba(34,197,94,0.25)",
        ring: "rgba(34,197,94,0.6)",
      },
      good: {
        main: "#60A5FA",
        glow: "rgba(96,165,250,0.25)",
        ring: "rgba(96,165,250,0.6)",
      },
      fair: {
        main: "#EAB308",
        glow: "rgba(234,179,8,0.25)",
        ring: "rgba(234,179,8,0.6)",
      },
      poor: {
        main: "#EF4444",
        glow: "rgba(239,68,68,0.25)",
        ring: "rgba(239,68,68,0.6)",
      },
    };
  const c = colors[level] || colors.poor;

  // Segmented ring — 6 arcs for 6 checks
  const ringR = 52;
  const ringStroke = 6;
  const gapDeg = 8;
  const segDeg = (360 - 6 * gapDeg) / 6;

  return (
    <div className="shield-visual">
      {/* Ambient glow */}
      <div
        className="shield-glow"
        style={{
          background: `radial-gradient(circle, ${c.glow} 0%, transparent 70%)`,
        }}
      />

      <svg
        width={120}
        height={120}
        viewBox="0 0 120 120"
        className="shield-ring-svg"
      >
        {/* Background segments */}
        {Array.from({ length: 6 }).map((_, i) => {
          const start = -90 + i * (segDeg + gapDeg);
          const end = start + segDeg;
          const large = segDeg > 180 ? 1 : 0;
          const sRad = (start * Math.PI) / 180;
          const eRad = (end * Math.PI) / 180;
          const x1 = 60 + ringR * Math.cos(sRad);
          const y1 = 60 + ringR * Math.sin(sRad);
          const x2 = 60 + ringR * Math.cos(eRad);
          const y2 = 60 + ringR * Math.sin(eRad);
          const filled = (i + 1) * (100 / 6) <= score;
          return (
            <path
              key={i}
              d={`M ${x1} ${y1} A ${ringR} ${ringR} 0 ${large} 1 ${x2} ${y2}`}
              fill="none"
              stroke={filled ? c.ring : "var(--tb-border)"}
              strokeWidth={ringStroke}
              strokeLinecap="round"
              className={filled ? "shield-seg-active" : "shield-seg-dim"}
              style={{
                filter: filled ? `drop-shadow(0 0 4px ${c.glow})` : "none",
              }}
            />
          );
        })}
      </svg>

      {/* Center hexagon + score */}
      <div className="shield-center">
        <div className="shield-hex" style={{ borderColor: c.main }}>
          <span className="shield-score-num" style={{ color: c.main }}>
            {animScore}
          </span>
          <span className="shield-score-total">/100</span>
        </div>
      </div>
    </div>
  );
}

/* ── Floating Status Badges ── */
function StatusBadges({
  items,
  level,
}: {
  items: ScoreItem[];
  level: string;
}) {
  const passed = items.filter((i) => i.passed);
  const failed = items.filter((i) => !i.passed);

  return (
    <div className="shield-badges">
      {items.map((it, idx) => {
        const Icon = it.icon;
        return (
          <div
            key={it.id}
            className={`shield-badge ${it.passed ? "passed" : "failed"} ${it.critical && !it.passed ? "critical" : ""}`}
            style={{ animationDelay: `${idx * 60}ms` }}
            title={`${it.label}: ${it.passed ? "Done" : `+${it.points} available`}`}
          >
            <div className="shield-badge-icon">
              {it.passed ? <Check size={10} /> : <Icon size={10} />}
            </div>
            <span className="shield-badge-label">
              {it.id === "2fa" ? "2FA" : it.label.split(" ")[0]}
            </span>
          </div>
        );
      })}
    </div>
  );
}

/* ── Level Meta ── */
const levelMeta: Record<
  string,
  { label: string; color: string; bg: string; desc: string; icon: typeof Check }
> = {
  excellent: {
    label: "Excellent",
    color: "#22C55E",
    bg: "rgba(34,197,94,0.08)",
    desc: "Your account is well protected — keep it up!",
    icon: ShieldCheck,
  },
  good: {
    label: "Good",
    color: "#60A5FA",
    bg: "rgba(96,165,250,0.08)",
    desc: "Solid security. A couple tweaks will get you to excellent.",
    icon: Shield,
  },
  fair: {
    label: "Needs attention",
    color: "#EAB308",
    bg: "rgba(234,179,8,0.08)",
    desc: "A few gaps to close. The fixes below take under a minute each.",
    icon: ShieldAlert,
  },
  poor: {
    label: "At risk",
    color: "#EF4444",
    bg: "rgba(239,68,68,0.08)",
    desc: "Critical protections missing — please fix the highlighted items.",
    icon: ShieldAlert,
  },
};

/* ── Compact Mode ── */
function CompactScore({
  score,
  items,
  level,
  onNavigate,
}: {
  score: number;
  items: ScoreItem[];
  level: string;
  onNavigate?: (href: string) => void;
}) {
  const meta = levelMeta[level] ?? levelMeta.fair;
  const passed = items.filter((i) => i.passed);
  const todo = items
    .filter((i) => !i.passed)
    .sort((a, b) =>
      a.critical === b.critical ? b.points - a.points : a.critical ? -1 : 1
    );
  const next = todo[0];
  const pct = Math.round((passed.length / items.length) * 100);

  return (
    <div className="sec-score-card sec-score-compact">
      <div className="sec-score-compact-inner">
        {/* Left: mini shield */}
        <div className="sec-score-compact-left">
          <div className="sec-mini-ring">
            <svg width={44} height={44} viewBox="0 0 44 44">
              <circle
                cx={22}
                cy={22}
                r={18}
                fill="none"
                stroke="var(--tb-border)"
                strokeWidth={4}
              />
              <circle
                cx={22}
                cy={22}
                r={18}
                fill="none"
                stroke={meta.color}
                strokeWidth={4}
                strokeLinecap="round"
                strokeDasharray={`${(pct / 100) * 113.1} 113.1`}
                transform="rotate(-90 22 22)"
                className="sec-mini-ring-fill"
              />
            </svg>
            <span className="sec-mini-score" style={{ color: meta.color }}>
              {score}
            </span>
          </div>
        </div>

        {/* Middle: info */}
        <div className="sec-score-compact-mid">
          <div className="sec-score-compact-title">
            <span className="sec-score-label-text">Security</span>
            <span
              className="sec-score-level-pill"
              style={{ background: meta.bg, color: meta.color }}
            >
              {meta.label}
            </span>
            <span className="sec-score-pct">
              · {pct}% · {passed.length}/{items.length}
            </span>
          </div>
          {todo.length && next ? (
            <div className="sec-score-compact-next">
              <span className="sec-next-chip">
                <span
                  className="sec-next-chip-icon"
                  style={{
                    background: next.critical
                      ? "rgba(239,68,68,0.12)"
                      : "var(--tb-surface-3)",
                    color: next.critical ? "var(--tb-red)" : "var(--tb-text-muted)",
                  }}
                >
                  <next.icon size={10} />
                </span>
                {next.label}
              </span>
              <span className="sec-next-points">
                +{next.points} → fix
              </span>
            </div>
          ) : (
            <div className="sec-score-compact-done">
              <Sparkles size={11} /> All 6 locked — excellent
            </div>
          )}
        </div>

        {/* Right: action */}
        {todo.length && next ? (
          <button
            className="sec-score-action-btn"
            onClick={() => onNavigate?.(next.href || "/account/security")}
            aria-label={`Fix ${next.label}`}
          >
            <ArrowRight size={14} />
          </button>
        ) : (
          <div className="sec-score-done-badge">
            <Check size={14} />
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Full Mode ── */
function FullScore({
  score,
  items,
  level,
  onNavigate,
}: {
  score: number;
  items: ScoreItem[];
  level: string;
  onNavigate?: (href: string) => void;
}) {
  const meta = levelMeta[level] ?? levelMeta.fair;
  const LevelIcon = meta.icon;
  const passed = items.filter((i) => i.passed);
  const todo = items
    .filter((i) => !i.passed)
    .sort((a, b) =>
      a.critical === b.critical ? b.points - a.points : a.critical ? -1 : 1
    );
  const pct = Math.round((passed.length / items.length) * 100);

  return (
    <div className="sec-score-card sec-score-full">
      {/* Top: Shield visual + summary */}
      <div className="sec-score-hero">
        <ShieldVisual
          score={score}
          level={level}
          passedCount={passed.length}
          totalCount={items.length}
        />

        <div className="sec-score-hero-info">
          <div className="sec-score-hero-top">
            <span
              className="sec-score-level-badge"
              style={{ background: meta.bg, color: meta.color, borderColor: `${meta.color}22` }}
            >
              <LevelIcon size={12} /> {meta.label}
            </span>
            <span className="sec-score-hero-stat">
              {passed.length} of {items.length} protected
            </span>
          </div>

          <p className="sec-score-hero-desc">{meta.desc}</p>

          {/* Animated progress bar */}
          <div className="sec-progress-track">
            <div
              className="sec-progress-fill"
              style={{
                width: `${pct}%`,
                background: `linear-gradient(90deg, ${meta.color}, ${meta.color}cc)`,
                boxShadow: `0 0 12px ${meta.color}40`,
              }}
            />
          </div>
          <div className="sec-progress-labels">
            <span>{pct}% complete</span>
            <span>{todo.length === 0 ? "All set" : `${todo.length} to go`}</span>
          </div>
        </div>
      </div>

      {/* Floating status badges */}
      <StatusBadges items={items} level={level} />

      {/* Checklist grid */}
      <div className="sec-score-checklist">
        {items.map((it) => {
          const Icon = it.icon;
          return (
            <div
              key={it.id}
              className={`sec-check-item ${it.passed ? "passed" : ""}`}
            >
              <div
                className="sec-check-icon"
                style={{
                  background: it.passed
                    ? "rgba(34,197,94,0.12)"
                    : it.critical
                      ? "rgba(239,68,68,0.12)"
                      : "var(--tb-surface-3)",
                  borderColor: it.passed
                    ? "rgba(34,197,94,0.22)"
                    : it.critical
                      ? "rgba(239,68,68,0.18)"
                      : "var(--tb-border)",
                  color: it.passed
                    ? "#22C55E"
                    : it.critical
                      ? "#EF4444"
                      : "var(--tb-text-muted)",
                }}
              >
                {it.passed ? <Check size={13} /> : <Icon size={13} />}
              </div>
              <div className="sec-check-info">
                <div className="sec-check-label">
                  {it.label}
                  {it.critical && !it.passed && (
                    <span className="sec-critical-tag">Critical</span>
                  )}
                </div>
                <div className="sec-check-desc">{it.description}</div>
              </div>
              <span
                className="sec-check-points"
                style={{
                  color: it.passed ? "#22C55E" : "var(--tb-text-muted)",
                }}
              >
                {it.passed ? `+${it.points}` : `${it.points}`}
              </span>
            </div>
          );
        })}
      </div>

      {/* Fix next section */}
      {todo.length > 0 ? (
        <div className="sec-score-fix">
          <div className="sec-fix-header">
            <Lock size={12} />
            Fix next — {todo.length} step{todo.length > 1 ? "s" : ""} to{" "}
            {level === "poor" ? "good" : "excellent"}
          </div>
          <div className="sec-fix-list">
            {todo.slice(0, 3).map((it) => (
              <button
                key={it.id}
                className="sec-fix-item"
                onClick={() => onNavigate?.(it.href || "/account/security")}
              >
                <div
                  className="sec-fix-icon"
                  style={{
                    background: it.critical
                      ? "rgba(239,68,68,0.12)"
                      : "var(--tb-surface-3)",
                    color: it.critical ? "#EF4444" : "var(--tb-text-muted)",
                  }}
                >
                  <it.icon size={13} />
                </div>
                <div className="sec-fix-info">
                  <div className="sec-fix-title">
                    {it.id === "2fa"
                      ? "Enable two-factor authentication"
                      : it.id === "recovery"
                        ? "Add recovery email"
                        : it.label}
                  </div>
                  <div className="sec-fix-desc">
                    {it.id === "2fa"
                      ? "30s setup with any authenticator app"
                      : it.id === "recovery"
                        ? "Recover access even if locked out"
                        : it.description}
                  </div>
                </div>
                <span className="sec-fix-arrow">
                  Fix <ArrowRight size={12} />
                </span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="sec-score-all-set">
          <Check size={14} /> All protections active — nice work!
        </div>
      )}
    </div>
  );
}

/* ── Main Export ── */
export default function SecurityScore({
  user,
  onNavigate,
  compact = false,
}: {
  user: any;
  onNavigate?: (href: string) => void;
  compact?: boolean;
}) {
  const { score, items, level } = useMemo(() => calculateScore(user), [user]);

  if (compact) {
    return (
      <CompactScore
        score={score}
        items={items}
        level={level}
        onNavigate={onNavigate}
      />
    );
  }

  return (
    <FullScore
      score={score}
      items={items}
      level={level}
      onNavigate={onNavigate}
    />
  );
}
