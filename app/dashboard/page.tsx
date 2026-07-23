"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Shield,
  Bell,
  Clock,
  Zap,
  Settings,
  Activity,
  ArrowUpRight,
  CheckCircle2,
  XCircle,
  MapPin,
  Globe,
  TrendingUp,
  Calendar,
  Smartphone,
  ChevronRight,
  Lock,
  Eye,
  AlertTriangle,
  FileText,
  KeyRound,
  RefreshCw,
} from "lucide-react";
import { HOME_WIDGETS, type WidgetConfig } from "../dashboard-config";
import { HomeSkeleton } from "../components/Skeleton";

const API = process.env.NEXT_PUBLIC_API_URL || "https://api.tirbeo.app";

type UserProfile = {
  id: string;
  email?: string;
  full_name?: string;
  username?: string;
  photoUrl?: string;
  avatar_url?: string;
  occupation?: string;
  country?: string;
  bio?: string;
  is_verified?: boolean;
  karma_points?: number;
  secondaryEmail?: string;
  phoneNumber?: string;
  is2FAEnabled?: boolean;
  adminRole?: string;
  created_at?: string;
  lastActiveAt?: string;
  district?: string;
};

type ActivityEntry = {
  id: string;
  action: string;
  entity_type?: string;
  created_at: string;
  metadata?: Record<string, unknown>;
};

type SessionEntry = {
  id: string;
  ip?: string;
  userAgent?: string;
  createdAt: string;
  lastActiveAt?: string;
  isCurrent?: boolean;
};

type NotificationEntry = {
  id: string;
  title?: string;
  message?: string;
  read?: boolean;
  created_at: string;
  type?: string;
};

type WidgetData = {
  user: UserProfile | null;
  activity: ActivityEntry[];
  sessions: SessionEntry[];
  notifications: NotificationEntry[];
  loading: boolean;
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function getInitials(name?: string): string {
  if (!name) return "?";
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function parseUserAgent(ua?: string): { browser: string; os: string; device: string } {
  if (!ua) return { browser: "Unknown", os: "Unknown", device: "Unknown" };
  let browser = "Other";
  if (ua.includes("Firefox")) browser = "Firefox";
  else if (ua.includes("Edg/")) browser = "Edge";
  else if (ua.includes("Chrome")) browser = "Chrome";
  else if (ua.includes("Safari")) browser = "Safari";

  let os = "Other";
  if (ua.includes("Windows")) os = "Windows";
  else if (ua.includes("Mac OS")) os = "macOS";
  else if (ua.includes("Linux")) os = "Linux";
  else if (ua.includes("Android")) os = "Android";
  else if (ua.includes("iPhone") || ua.includes("iPad")) os = "iOS";

  let device = "Desktop";
  if (ua.includes("Mobile") || ua.includes("Android") || ua.includes("iPhone")) device = "Mobile";
  else if (ua.includes("iPad")) device = "Tablet";

  return { browser, os, device };
}

function RingProgress({
  value,
  size = 80,
  stroke = 6,
  color = "var(--success)",
}: {
  value: number;
  size?: number;
  stroke?: number;
  color?: string;
}) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="var(--border)"
        strokeWidth={stroke}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 0.8s ease-out" }}
      />
    </svg>
  );
}

function WelcomeWidget({ data }: { data: WidgetData }) {
  const user = data.user;
  const greeting = getGreeting();
  const name = user?.full_name || user?.username || "User";
  const photo = user?.photoUrl || user?.avatar_url;
  const isOnline = user?.lastActiveAt
    ? Date.now() - new Date(user.lastActiveAt).getTime() < 300000
    : false;

  return (
    <div className="glass" style={{ padding: "32px", position: "relative", overflow: "hidden" }}>
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "3px",
          background: "linear-gradient(90deg, var(--accent), var(--success), var(--accent))",
          opacity: 0.6,
        }}
      />
      <div style={{ display: "flex", alignItems: "center", gap: "20px", flexWrap: "wrap" }}>
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: "50%",
            background: photo ? "none" : "var(--bg-elevated)",
            border: "2px solid var(--border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "24px",
            fontWeight: 600,
            color: "var(--text)",
            flexShrink: 0,
            overflow: "hidden",
          }}
        >
          {photo ? (
            <img
              src={photo}
              alt={name}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            getInitials(name)
          )}
        </div>

        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ fontSize: "22px", fontWeight: 600, color: "var(--text)" }}>
            {greeting}, {name}
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              marginTop: "6px",
              flexWrap: "wrap",
            }}
          >
            {user?.email && (
              <span
                style={{
                  fontSize: "13px",
                  color: "var(--text-secondary)",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                <User size={13} /> {user.email}
              </span>
            )}
            {user?.occupation && (
              <span
                style={{
                  fontSize: "13px",
                  color: "var(--text-secondary)",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                <FileText size={13} /> {user.occupation}
              </span>
            )}
            {user?.country && (
              <span
                style={{
                  fontSize: "13px",
                  color: "var(--text-secondary)",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                <MapPin size={13} /> {user.country}
              </span>
            )}
            <span
              style={{
                fontSize: "12px",
                display: "flex",
                alignItems: "center",
                gap: "4px",
                color: isOnline ? "var(--success)" : "var(--text-muted)",
              }}
            >
              <span
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  background: isOnline ? "var(--success)" : "var(--text-muted)",
                  display: "inline-block",
                }}
              />
              {isOnline ? "Online" : "Offline"}
            </span>
          </div>
        </div>

        <div style={{ display: "flex", gap: "8px", flexShrink: 0 }}>
          <a href="/dashboard/profile" className="btn btn-ghost" style={{ fontSize: "13px", gap: "6px" }}>
            <User size={14} /> Edit Profile
          </a>
          <a href="/dashboard/security" className="btn btn-ghost" style={{ fontSize: "13px", gap: "6px" }}>
            <Shield size={14} /> Security
          </a>
        </div>
      </div>
    </div>
  );
}

function StatsWidget({ data }: { data: WidgetData }) {
  const user = data.user;
  const checks = [
    { label: "Full name set", done: !!user?.full_name },
    { label: "Email verified", done: !!user?.is_verified },
    { label: "2FA enabled", done: !!user?.is2FAEnabled },
    { label: "Secondary email", done: !!user?.secondaryEmail },
    { label: "Country set", done: !!user?.country },
    { label: "Phone verified", done: !!user?.phoneNumber },
    { label: "Occupation set", done: !!user?.occupation },
    { label: "Bio written", done: !!user?.bio },
  ];

  const completed = checks.filter((c) => c.done).length;
  const total = checks.length;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  let ringColor = "var(--danger)";
  if (pct >= 75) ringColor = "var(--success)";
  else if (pct >= 40) ringColor = "var(--accent)";

  return (
    <div className="glass" style={{ padding: "24px" }}>
      <div className="section-header" style={{ marginBottom: "16px" }}>
        <span style={{ fontSize: "14px", fontWeight: 600, color: "var(--text)" }}>
          Profile Completion
        </span>
        <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>
          {completed}/{total}
        </span>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "20px",
          marginBottom: "16px",
        }}
      >
        <div style={{ position: "relative", flexShrink: 0 }}>
          <RingProgress value={pct} color={ringColor} />
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "18px",
              fontWeight: 700,
              color: "var(--text)",
            }}
          >
            {pct}%
          </div>
        </div>

        <div style={{ flex: 1 }}>
          <div className="progress-bar">
            <div
              className="progress-bar-fill"
              style={{
                width: `${pct}%`,
                background: ringColor,
                transition: "width 0.8s ease-out",
              }}
            />
          </div>
          <div style={{ marginTop: "8px", fontSize: "12px", color: "var(--text-muted)" }}>
            {pct < 100
              ? "Complete your profile to unlock more features"
              : "Your profile is fully complete!"}
          </div>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        {checks.map((check) => (
          <div
            key={check.label}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "12px",
              color: check.done ? "var(--text-secondary)" : "var(--text-muted)",
            }}
          >
            {check.done ? (
              <CheckCircle2 size={13} style={{ color: "var(--success)", flexShrink: 0 }} />
            ) : (
              <XCircle size={13} style={{ color: "var(--text-ash)", flexShrink: 0 }} />
            )}
            {check.label}
          </div>
        ))}
      </div>
    </div>
  );
}

function SecurityProfileWidget({ data }: { data: WidgetData }) {
  const user = data.user;
  const has2FA = !!user?.is2FAEnabled;
  const hasPassword = true;
  const hasRecoveryEmail = !!user?.secondaryEmail;
  const hasBackupCodes = has2FA;

  const items = [
    { label: "Two-Factor Authentication", done: has2FA, icon: <Lock size={14} /> },
    { label: "Strong password", done: hasPassword, icon: <KeyRound size={14} /> },
    { label: "Recovery email", done: hasRecoveryEmail, icon: <RefreshCw size={14} /> },
    { label: "Backup codes", done: hasBackupCodes, icon: <Shield size={14} /> },
  ];

  const score = items.filter((i) => i.done).length;
  const total = items.length;
  const isStrong = score >= 3;

  return (
    <div className="glass" style={{ padding: "24px" }}>
      <div className="section-header" style={{ marginBottom: "16px" }}>
        <span style={{ fontSize: "14px", fontWeight: 600, color: "var(--text)" }}>
          Security Profile
        </span>
        <span
          className={isStrong ? "badge badge-success" : "badge badge-danger"}
          style={{ fontSize: "11px" }}
        >
          {isStrong ? "Strong" : "Weak"}
        </span>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "16px",
          marginBottom: "16px",
        }}
      >
        <div style={{ position: "relative", flexShrink: 0 }}>
          <RingProgress
            value={(score / total) * 100}
            color={isStrong ? "var(--success)" : "var(--danger)"}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "16px",
              fontWeight: 700,
              color: "var(--text)",
            }}
          >
            {score}/{total}
          </div>
        </div>
        <div>
          <div style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
            {isStrong
              ? "Your account is well protected"
              : "Enable more security features"}
          </div>
          <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>
            {total - score} recommendation{total - score !== 1 ? "s" : ""} remaining
          </div>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "12px" }}>
        {items.map((item) => (
          <div
            key={item.label}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "12px",
              color: item.done ? "var(--text-secondary)" : "var(--text-muted)",
            }}
          >
            {item.done ? (
              <CheckCircle2 size={13} style={{ color: "var(--success)", flexShrink: 0 }} />
            ) : (
              <AlertTriangle size={13} style={{ color: "var(--danger)", flexShrink: 0 }} />
            )}
            <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              {item.icon}
              {item.label}
            </span>
          </div>
        ))}
      </div>

      <a
        href="/dashboard/security"
        className="btn btn-ghost"
        style={{ fontSize: "12px", width: "100%", justifyContent: "center", gap: "6px" }}
      >
        <Shield size={13} /> Security Settings <ChevronRight size={13} />
      </a>
    </div>
  );
}

function ChartWidget({ data }: { data: WidgetData }) {
  const activity = data.activity;

  const hourlyCounts: number[] = Array(24).fill(0);
  activity.forEach((entry) => {
    const hour = new Date(entry.created_at).getHours();
    hourlyCounts[hour]++;
  });

  const maxCount = Math.max(...hourlyCounts, 1);

  return (
    <div className="glass" style={{ padding: "24px" }}>
      <div className="section-header" style={{ marginBottom: "20px" }}>
        <span style={{ fontSize: "14px", fontWeight: 600, color: "var(--text)" }}>
          Recent Activity
        </span>
        <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
          {activity.length} events
        </span>
      </div>

      <div
        className="chart-bar"
        style={{
          display: "flex",
          alignItems: "flex-end",
          gap: "2px",
          height: "120px",
          padding: "0 4px",
        }}
      >
        {hourlyCounts.map((count, hour) => {
          const pct = maxCount > 0 ? (count / maxCount) * 100 : 0;
          return (
            <div
              key={hour}
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "flex-end",
                height: "100%",
                position: "relative",
              }}
            >
              <div
                className="chart-bar-segment"
                title={`${hour}:00 — ${count} events`}
                style={{
                  width: "100%",
                  maxWidth: "20px",
                  height: `${Math.max(pct, 2)}%`,
                  background:
                    count > 0
                      ? "linear-gradient(to top, var(--accent), var(--accent-hover, var(--accent)))"
                      : "var(--border)",
                  borderRadius: "2px 2px 0 0",
                  transition: "height 0.5s ease-out",
                  cursor: "pointer",
                  opacity: count > 0 ? 0.85 : 0.3,
                }}
              />
            </div>
          );
        })}
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: "6px",
          fontSize: "10px",
          color: "var(--text-ash)",
          padding: "0 4px",
        }}
      >
        <span>0:00</span>
        <span>6:00</span>
        <span>12:00</span>
        <span>18:00</span>
        <span>23:00</span>
      </div>

      {activity.length === 0 && (
        <div
          style={{
            textAlign: "center",
            padding: "20px 0 0",
            fontSize: "13px",
            color: "var(--text-muted)",
          }}
        >
          No activity recorded yet
        </div>
      )}
    </div>
  );
}

function SessionsPreviewWidget({ data }: { data: WidgetData }) {
  const sessions = data.sessions.slice(0, 3);

  const deviceIcon = (device: string) => {
    if (device === "Mobile") return <Smartphone size={16} />;
    return <Globe size={16} />;
  };

  return (
    <div className="glass" style={{ padding: "24px" }}>
      <div className="section-header" style={{ marginBottom: "16px" }}>
        <span style={{ fontSize: "14px", fontWeight: 600, color: "var(--text)" }}>
          Active Sessions
        </span>
        <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
          {data.sessions.length} total
        </span>
      </div>

      {sessions.length === 0 && (
        <div style={{ fontSize: "13px", color: "var(--text-muted)", padding: "12px 0" }}>
          No active sessions
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {sessions.map((session) => {
          const info = parseUserAgent(session.userAgent);
          return (
            <div
              key={session.id}
              className="device-card"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "10px 12px",
                borderRadius: "8px",
                background: "var(--bg-elevated)",
                border: session.isCurrent ? "1px solid var(--accent)" : "1px solid var(--border)",
              }}
            >
              <div style={{ color: "var(--text-secondary)", flexShrink: 0 }}>
                {deviceIcon(info.device)}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: "13px",
                    fontWeight: 500,
                    color: "var(--text)",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {info.browser} on {info.os}
                  {session.isCurrent && (
                    <span
                      className="badge badge-success"
                      style={{ marginLeft: "8px", fontSize: "10px", padding: "1px 6px" }}
                    >
                      Current
                    </span>
                  )}
                </div>
                <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>
                  {session.ip || "Unknown IP"} &middot; {timeAgo(session.lastActiveAt || session.createdAt)}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {data.sessions.length > 3 && (
        <a
          href="/dashboard/sessions"
          className="btn btn-ghost"
          style={{
            fontSize: "12px",
            width: "100%",
            justifyContent: "center",
            marginTop: "12px",
            gap: "6px",
          }}
        >
          View all sessions <ChevronRight size={13} />
        </a>
      )}
    </div>
  );
}

function QuickLinksWidget({ data }: { data: WidgetData }) {
  const links = [
    {
      icon: <User size={18} />,
      label: "Profile",
      description: "Edit your personal info",
      href: "/dashboard/profile",
    },
    {
      icon: <Shield size={18} />,
      label: "Security",
      description: "2FA, passwords, sessions",
      href: "/dashboard/security",
    },
    {
      icon: <Bell size={18} />,
      label: "Notifications",
      description: "Manage alert preferences",
      href: "/dashboard/notifications",
    },
    {
      icon: <Settings size={18} />,
      label: "Preferences",
      description: "Theme, language, layout",
      href: "/dashboard/preferences",
    },
  ];

  return (
    <div className="glass" style={{ padding: "24px" }}>
      <div className="section-header" style={{ marginBottom: "16px" }}>
        <span style={{ fontSize: "14px", fontWeight: 600, color: "var(--text)" }}>
          Quick Actions
        </span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
        {links.map((link) => (
          <a
            key={link.label}
            href={link.href}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "12px",
              borderRadius: "8px",
              background: "var(--bg-elevated)",
              border: "1px solid var(--border)",
              textDecoration: "none",
              color: "var(--text)",
              transition: "border-color 0.15s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = "var(--accent)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: "8px",
                background: "var(--bg-surface)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--accent)",
                flexShrink: 0,
              }}
            >
              {link.icon}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: "13px", fontWeight: 500 }}>{link.label}</div>
              <div
                style={{
                  fontSize: "11px",
                  color: "var(--text-muted)",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {link.description}
              </div>
            </div>
            <ArrowUpRight
              size={14}
              style={{
                marginLeft: "auto",
                color: "var(--text-ash)",
                flexShrink: 0,
              }}
            />
          </a>
        ))}
      </div>
    </div>
  );
}

function NotificationsPreviewWidget({ data }: { data: WidgetData }) {
  const notifications = data.notifications.slice(0, 5);

  return (
    <div className="glass" style={{ padding: "24px" }}>
      <div className="section-header" style={{ marginBottom: "16px" }}>
        <span style={{ fontSize: "14px", fontWeight: 600, color: "var(--text)" }}>
          Notifications
        </span>
        {data.notifications.filter((n) => !n.read).length > 0 && (
          <span
            className="badge badge-danger"
            style={{ fontSize: "10px", padding: "1px 6px" }}
          >
            {data.notifications.filter((n) => !n.read).length} new
          </span>
        )}
      </div>

      {notifications.length === 0 && (
        <div style={{ fontSize: "13px", color: "var(--text-muted)", padding: "12px 0" }}>
          No notifications
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        {notifications.map((notification) => (
          <div
            key={notification.id}
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "10px",
              padding: "10px 12px",
              borderRadius: "8px",
              background: notification.read ? "transparent" : "var(--bg-elevated)",
              border: notification.read ? "none" : "1px solid var(--border)",
            }}
          >
            <div
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: notification.read ? "transparent" : "var(--accent)",
                flexShrink: 0,
                marginTop: "6px",
              }}
            />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: "13px",
                  fontWeight: notification.read ? 400 : 500,
                  color: "var(--text)",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {notification.title || notification.message || "Notification"}
              </div>
              {notification.message && notification.title && (
                <div
                  style={{
                    fontSize: "11px",
                    color: "var(--text-muted)",
                    marginTop: "2px",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {notification.message}
                </div>
              )}
              <div style={{ fontSize: "11px", color: "var(--text-ash)", marginTop: "3px" }}>
                {timeAgo(notification.created_at)}
              </div>
            </div>
          </div>
        ))}
      </div>

      <a
        href="/dashboard/notifications"
        className="btn btn-ghost"
        style={{
          fontSize: "12px",
          width: "100%",
          justifyContent: "center",
          marginTop: "12px",
          gap: "6px",
        }}
      >
        View all notifications <ChevronRight size={13} />
      </a>
    </div>
  );
}

function WorkspaceInfoWidget({ data }: { data: WidgetData }) {
  const user = data.user;
  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Unknown";

  const fields = [
    {
      label: "Role",
      value: user?.adminRole ? user.adminRole.replace("_", " ") : "User",
      icon: <Shield size={13} />,
    },
    {
      label: "Member since",
      value: memberSince,
      icon: <Calendar size={13} />,
    },
    {
      label: "Country",
      value: user?.country || "Not set",
      icon: <MapPin size={13} />,
    },
    {
      label: "Language",
      value: "English",
      icon: <Globe size={13} />,
    },
  ];

  return (
    <div className="glass" style={{ padding: "24px" }}>
      <div className="section-header" style={{ marginBottom: "16px" }}>
        <span style={{ fontSize: "14px", fontWeight: 600, color: "var(--text)" }}>
          Workspace
        </span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {fields.map((field) => (
          <div
            key={field.label}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              fontSize: "13px",
            }}
          >
            <span
              style={{
                color: "var(--text-muted)",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              {field.icon}
              {field.label}
            </span>
            <span
              style={{
                color: "var(--text-secondary)",
                fontWeight: 500,
                textTransform: field.label === "Role" ? "capitalize" : "none",
              }}
            >
              {field.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function UsageWidget({ data }: { data: WidgetData }) {
  const user = data.user;
  const karma = user?.karma_points ?? 0;
  const activityCount = data.activity.length;

  const stats = [
    {
      label: "Karma Points",
      value: karma.toLocaleString(),
      icon: <TrendingUp size={16} />,
      color: "var(--accent)",
    },
    {
      label: "Activity Events",
      value: activityCount.toLocaleString(),
      icon: <Activity size={16} />,
      color: "var(--success)",
    },
  ];

  return (
    <div className="glass" style={{ padding: "24px" }}>
      <div className="section-header" style={{ marginBottom: "16px" }}>
        <span style={{ fontSize: "14px", fontWeight: 600, color: "var(--text)" }}>
          Usage
        </span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="stat-card"
            style={{
              padding: "16px",
              borderRadius: "10px",
              background: "var(--bg-elevated)",
              border: "1px solid var(--border)",
              textAlign: "center",
            }}
          >
            <div
              style={{
                color: stat.color,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "8px",
              }}
            >
              {stat.icon}
            </div>
            <div
              style={{
                fontSize: "22px",
                fontWeight: 700,
                color: "var(--text)",
                lineHeight: 1.2,
              }}
            >
              {stat.value}
            </div>
            <div
              style={{
                fontSize: "11px",
                color: "var(--text-muted)",
                marginTop: "4px",
              }}
            >
              {stat.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function renderWidget(widget: WidgetConfig, data: WidgetData): React.ReactNode {
  switch (widget.type) {
    case "welcome":
      return <WelcomeWidget key={widget.id} data={data} />;
    case "stats":
      return <StatsWidget key={widget.id} data={data} />;
    case "security-profile":
      return <SecurityProfileWidget key={widget.id} data={data} />;
    case "chart":
      return <ChartWidget key={widget.id} data={data} />;
    case "sessions":
      return <SessionsPreviewWidget key={widget.id} data={data} />;
    case "quicklinks":
      return <QuickLinksWidget key={widget.id} data={data} />;
    case "notifications":
      return <NotificationsPreviewWidget key={widget.id} data={data} />;
    case "workspace":
      return <WorkspaceInfoWidget key={widget.id} data={data} />;
    case "usage":
      return <UsageWidget key={widget.id} data={data} />;
    default:
      return null;
  }
}

export default function DashboardHome() {
  const router = useRouter();
  const fetched = useRef(false);

  const [user, setUser] = useState<UserProfile | null>(null);
  const [activity, setActivity] = useState<ActivityEntry[]>([]);
  const [sessions, setSessions] = useState<SessionEntry[]>([]);
  const [notifications, setNotifications] = useState<NotificationEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;

    const headers: HeadersInit = { "Content-Type": "application/json" };

    Promise.allSettled([
      fetch(`${API}/api/profile`, { credentials: "include", headers }).then((r) =>
        r.ok ? r.json() : null
      ),
      fetch(`${API}/api/user/activity?limit=50`, { credentials: "include", headers }).then(
        (r) => (r.ok ? r.json() : [])
      ),
      fetch(`${API}/api/security/sessions`, { credentials: "include", headers }).then(
        (r) => (r.ok ? r.json() : [])
      ),
      fetch(`${API}/api/notifications?limit=5`, { credentials: "include", headers }).then(
        (r) => (r.ok ? r.json() : [])
      ),
    ]).then(([profileRes, activityRes, sessionsRes, notifRes]) => {
      if (profileRes.status === "fulfilled" && profileRes.value) {
        const profile = profileRes.value;
        if (profile.error) {
          router.replace("/login");
          return;
        }
        setUser(profile);
      } else {
        router.replace("/login");
        return;
      }

      if (activityRes.status === "fulfilled") {
        setActivity(Array.isArray(activityRes.value) ? activityRes.value : []);
      }
      if (sessionsRes.status === "fulfilled") {
        setSessions(Array.isArray(sessionsRes.value) ? sessionsRes.value : []);
      }
      if (notifRes.status === "fulfilled") {
        setNotifications(Array.isArray(notifRes.value) ? notifRes.value : []);
      }

      setLoading(false);
    });
  }, [router]);

  if (loading) {
    return <HomeSkeleton />;
  }

  const widgetData: WidgetData = {
    user,
    activity,
    sessions,
    notifications,
    loading,
  };

  const visibleWidgets = HOME_WIDGETS.filter((w) => w.visible).sort(
    (a, b) => a.order - b.order
  );

  return (
    <div
      style={{
        display: "grid",
        gap: "16px",
        gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
        padding: "24px 0",
      }}
    >
      {visibleWidgets.map((widget) => (
        <div
          key={widget.id}
          style={
            widget.size === "full"
              ? { gridColumn: "1 / -1" }
              : widget.size === "lg"
              ? { gridColumn: "span 2" }
              : undefined
          }
        >
          {renderWidget(widget, widgetData)}
        </div>
      ))}
    </div>
  );
}