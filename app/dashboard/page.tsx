"use client";

import { useState, useEffect, useRef } from "react";
import {
  User,
  Shield,
  Bell,
  MapPin,
  TrendingUp,
  Activity,
  ArrowUpRight,
  CheckCircle2,
  XCircle,
  Calendar,
  Smartphone,
  ChevronRight,
  Lock,
  AlertTriangle,
  FileText,
  KeyRound,
  RefreshCw,
  Settings,
  Globe,
} from "lucide-react";
import { Card, RingProgress, ProgressBar, Badge } from "./components";

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
  body?: string;
  read?: boolean;
  createdAt: string;
  type?: string;
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return minutes + "m ago";
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return hours + "h ago";
  const days = Math.floor(hours / 24);
  if (days < 30) return days + "d ago";
  const months = Math.floor(days / 30);
  return months + "mo ago";
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
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

function getInitials(name?: string): string {
  if (!name) return "?";
  return name.split(" ").map(function (w) { return w[0]; }).join("").toUpperCase().slice(0, 2);
}

// ─── Welcome ───────────────────────────────────────────────────

function WelcomeSection({ user }: { user: UserProfile }) {
  const greeting = getGreeting();
  const name = user.full_name || user.username || "User";
  const photo = user.photoUrl || user.avatar_url;
  const isOnline = user.lastActiveAt
    ? Date.now() - new Date(user.lastActiveAt).getTime() < 300000
    : false;

  return (
    <div className="glass" style={{ padding: 32, position: "relative", overflow: "hidden" }}>
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 3,
        background: "linear-gradient(90deg, var(--accent), var(--gold), var(--accent))", opacity: 0.5,
      }} />

      <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
        {/* Avatar */}
        <div style={{
          width: 64, height: 64, borderRadius: "50%",
          background: photo ? "none" : "var(--bg-elevated)",
          border: "2px solid var(--border)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 24, fontWeight: 600, color: "var(--text)", flexShrink: 0, overflow: "hidden",
        }}>
          {photo ? (
            <img src={photo} alt={name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            getInitials(name)
          )}
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ fontSize: 22, fontWeight: 600, color: "var(--text)" }}>
            {greeting}, {name}
          </div>
          <div style={{
            display: "flex", alignItems: "center", gap: 12, marginTop: 6, flexWrap: "wrap",
            fontSize: 13, color: "var(--text-muted)",
          }}>
            {user.email && (
              <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <User size={13} /> {user.email}
              </span>
            )}
            {user.occupation && (
              <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <FileText size={13} /> {user.occupation}
              </span>
            )}
            {user.country && (
              <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <MapPin size={13} /> {user.country}
              </span>
            )}
            <span style={{
              display: "flex", alignItems: "center", gap: 4,
              color: isOnline ? "var(--success)" : "var(--text-muted)",
            }}>
              <span style={{
                width: 7, height: 7, borderRadius: "50%", display: "inline-block",
                background: isOnline ? "var(--success)" : "var(--text-muted)",
              }} />
              {isOnline ? "Online" : "Offline"}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
          <a href="/dashboard/profile" className="btn btn-ghost" style={{ fontSize: 13, gap: 6 }}>
            <User size={14} /> Edit Profile
          </a>
          <a href="/dashboard/security" className="btn btn-ghost" style={{ fontSize: 13, gap: 6 }}>
            <Shield size={14} /> Security
          </a>
        </div>
      </div>
    </div>
  );
}

// ─── Profile Completion ────────────────────────────────────────

function ProfileCompletionCard({ user }: { user: UserProfile }) {
  const checks = [
    { label: "Full name set", done: !!user.full_name },
    { label: "Email verified", done: !!user.is_verified },
    { label: "2FA enabled", done: !!user.is2FAEnabled },
    { label: "Secondary email", done: !!user.secondaryEmail },
    { label: "Country set", done: !!user.country },
    { label: "Phone verified", done: !!user.phoneNumber },
    { label: "Occupation set", done: !!user.occupation },
    { label: "Bio written", done: !!user.bio },
  ];

  const completed = checks.filter(function (c) { return c.done; }).length;
  const total = checks.length;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  let ringColor = "var(--danger)";
  if (pct >= 75) ringColor = "var(--success)";
  else if (pct >= 40) ringColor = "var(--accent)";

  return (
    <Card title="Profile Completion" subtitle={completed + "/" + total}>
      <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 16 }}>
        <div style={{ position: "relative", flexShrink: 0 }}>
          <RingProgress value={pct} color={ringColor} />
          <div style={{
            position: "absolute", inset: 0, display: "flex",
            alignItems: "center", justifyContent: "center",
            fontSize: 18, fontWeight: 700, color: "var(--text)",
          }}>
            {pct}%
          </div>
        </div>
        <div style={{ flex: 1 }}>
          <ProgressBar value={pct} color={ringColor} />
          <div style={{ marginTop: 8, fontSize: 12, color: "var(--text-muted)" }}>
            {pct < 100 ? "Complete your profile to unlock more features" : "Your profile is fully complete!"}
          </div>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {checks.map(function (check) {
          return (
            <div key={check.label} style={{
              display: "flex", alignItems: "center", gap: 8, fontSize: 12,
              color: check.done ? "var(--text-secondary)" : "var(--text-muted)",
            }}>
              {check.done ? (
                <CheckCircle2 size={13} style={{ color: "var(--success)", flexShrink: 0 }} />
              ) : (
                <XCircle size={13} style={{ color: "var(--text-ash)", flexShrink: 0 }} />
              )}
              {check.label}
            </div>
          );
        })}
      </div>
    </Card>
  );
}

// ─── Security Score ────────────────────────────────────────────

function SecurityScoreCard({ user }: { user: UserProfile }) {
  const has2FA = !!user.is2FAEnabled;
  const hasRecoveryEmail = !!user.secondaryEmail;
  const hasBackupCodes = has2FA;

  const items = [
    { label: "Two-Factor Auth", done: has2FA, icon: <Lock size={14} /> },
    { label: "Recovery email", done: hasRecoveryEmail, icon: <RefreshCw size={14} /> },
    { label: "Backup codes", done: hasBackupCodes, icon: <Shield size={14} /> },
  ];

  const score = items.filter(function (i) { return i.done; }).length;
  const total = items.length;
  const isStrong = score >= 3;
  const securityPct = (score / total) * 100;

  return (
    <Card title="Security Profile">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ position: "relative", flexShrink: 0 }}>
            <RingProgress value={securityPct} color={isStrong ? "var(--success)" : "var(--danger)"} />
            <div style={{
              position: "absolute", inset: 0, display: "flex",
              alignItems: "center", justifyContent: "center",
              fontSize: 16, fontWeight: 700, color: "var(--text)",
            }}>
              {score}/{total}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>
              {isStrong ? "Your account is well protected" : "Enable more security features"}
            </div>
            <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
              {total - score} recommendation{total - score !== 1 ? "s" : ""} remaining
            </div>
          </div>
        </div>
        <Badge variant={isStrong ? "success" : "danger"} style={{ fontSize: 11 }}>
          {isStrong ? "Strong" : "Weak"}
        </Badge>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 12 }}>
        {items.map(function (item) {
          return (
            <div key={item.label} style={{
              display: "flex", alignItems: "center", gap: 8, fontSize: 12,
              color: item.done ? "var(--text-secondary)" : "var(--text-muted)",
            }}>
              {item.done ? (
                <CheckCircle2 size={13} style={{ color: "var(--success)", flexShrink: 0 }} />
              ) : (
                <AlertTriangle size={13} style={{ color: "var(--danger)", flexShrink: 0 }} />
              )}
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                {item.icon}
                {item.label}
              </span>
            </div>
          );
        })}
      </div>

      <a href="/dashboard/security" className="btn btn-ghost"
        style={{ fontSize: 12, width: "100%", justifyContent: "center", gap: 6 }}>
        <Shield size={13} /> Security Settings <ChevronRight size={13} />
      </a>
    </Card>
  );
}

// ─── Activity Chart ────────────────────────────────────────────

function ActivityCard({ activity }: { activity: ActivityEntry[] }) {
  const hourlyCounts: number[] = Array(24).fill(0);
  activity.forEach(function (entry) {
    const hour = new Date(entry.created_at).getHours();
    hourlyCounts[hour]++;
  });

  const maxCount = Math.max.apply(null, hourlyCounts.concat([1]));
  const labels = ["0:00", "6:00", "12:00", "18:00", "23:00"];

  return (
    <Card title="Recent Activity" subtitle={activity.length + " events"}>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 2, height: 120, padding: "0 4px" }}>
        {hourlyCounts.map(function (count, hour) {
          const pct = maxCount > 0 ? (count / maxCount) * 100 : 0;
          const barHeight = Math.max(pct, 2);
          const barBg = count > 0
            ? "linear-gradient(to top, var(--accent), var(--accent-hover, var(--accent)))"
            : "var(--border)";
          return (
            <div key={hour} style={{
              flex: 1, display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "flex-end", height: "100%", position: "relative",
            }}>
              <div
                title={hour + ":00 — " + count + " events"}
                style={{
                  width: "100%", maxWidth: 20, height: barHeight + "%",
                  background: barBg, borderRadius: "2px 2px 0 0",
                  transition: "height 0.5s ease-out", cursor: "pointer", opacity: count > 0 ? 0.85 : 0.3,
                }}
              />
            </div>
          );
        })}
      </div>

      <div style={{
        display: "flex", justifyContent: "space-between", marginTop: 6,
        fontSize: 10, color: "var(--text-ash)", padding: "0 4px",
      }}>
        {labels.map(function (lbl) {
          return <span key={lbl}>{lbl}</span>;
        })}
      </div>

      {activity.length === 0 && (
        <div style={{ textAlign: "center", padding: "20px 0 0", fontSize: 13, color: "var(--text-muted)" }}>
          No activity recorded yet
        </div>
      )}
    </Card>
  );
}

// ─── Sessions Preview ──────────────────────────────────────────

function SessionsPreviewCard({ sessions }: { sessions: SessionEntry[] }) {
  const preview = sessions.slice(0, 3);

  return (
    <Card title="Active Sessions" subtitle={sessions.length + " total"}>
      {preview.length === 0 && (
        <div style={{ fontSize: 13, color: "var(--text-muted)", padding: "12px 0" }}>
          No active sessions
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {preview.map(function (session) {
          const info = parseUserAgent(session.userAgent);
          return (
            <div key={session.id} className="device-card" style={{
              display: "flex", alignItems: "center", gap: 12,
              padding: "10px 12px", borderRadius: 8, background: "var(--bg-elevated)",
              border: session.isCurrent ? "1px solid var(--accent)" : "1px solid var(--border)",
            }}>
              <div style={{ color: "var(--text-secondary)", flexShrink: 0 }}>
                {info.device === "Mobile" ? <Smartphone size={16} /> : <Globe size={16} />}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: 13, fontWeight: 500, color: "var(--text)",
                  whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                }}>
                  {info.browser} on {info.os}
                  {session.isCurrent && (
                    <Badge variant="success" style={{ marginLeft: 8, fontSize: 10, padding: "1px 6px" }}>
                      Current
                    </Badge>
                  )}
                </div>
                <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>
                  {session.ip || "Unknown IP"} &middot; {timeAgo(session.lastActiveAt || session.createdAt)}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {sessions.length > 3 && (
        <a href="/dashboard/sessions" className="btn btn-ghost"
          style={{ fontSize: 12, width: "100%", justifyContent: "center", marginTop: 12, gap: 6 }}>
          View all sessions <ChevronRight size={13} />
        </a>
      )}
    </Card>
  );
}

// ─── Quick Actions ─────────────────────────────────────────────

function QuickActionsCard() {
  const links = [
    { icon: <User size={18} />, label: "Profile", description: "Edit your personal info", href: "/dashboard/profile" },
    { icon: <Shield size={18} />, label: "Security", description: "2FA, passwords, sessions", href: "/dashboard/security" },
    { icon: <Bell size={18} />, label: "Notifications", description: "Manage alert preferences", href: "/dashboard/notifications" },
    { icon: <Settings size={18} />, label: "Preferences", description: "Theme, language, layout", href: "/dashboard/preferences" },
  ];

  return (
    <Card title="Quick Actions">
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        {links.map(function (link) {
          return (
            <a key={link.label} href={link.href} style={{
              display: "flex", alignItems: "center", gap: 10, padding: 12,
              borderRadius: 8, background: "var(--bg-elevated)", border: "1px solid var(--border)",
              textDecoration: "none", color: "var(--text)", transition: "border-color 0.15s",
            }}
            onMouseEnter={function (e) { (e.currentTarget as HTMLElement).style.borderColor = "var(--accent)"; }}
            onMouseLeave={function (e) { (e.currentTarget as HTMLElement).style.borderColor = "var(--border)"; }}
            >
              <div style={{
                width: 36, height: 36, borderRadius: 8, background: "var(--bg-surface)",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "var(--accent)", flexShrink: 0,
              }}>{link.icon}</div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{link.label}</div>
                <div style={{
                  fontSize: 11, color: "var(--text-muted)",
                  whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                }}>
                  {link.description}
                </div>
              </div>
              <ArrowUpRight size={14} style={{ marginLeft: "auto", color: "var(--text-ash)", flexShrink: 0 }} />
            </a>
          );
        })}
      </div>
    </Card>
  );
}

// ─── Notifications Preview ─────────────────────────────────────

function NotificationsPreviewCard({ notifications }: { notifications: NotificationEntry[] }) {
  const preview = notifications.slice(0, 5);
  const unreadCount = notifications.filter(function (n) { return !n.read; }).length;

  return (
    <Card title="Notifications">
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        {unreadCount > 0 && (
          <Badge variant="danger" style={{ fontSize: 10, padding: "1px 6px" }}>
            {unreadCount} new
          </Badge>
        )}
      </div>

      {preview.length === 0 && (
        <div style={{ fontSize: 13, color: "var(--text-muted)", padding: "12px 0" }}>
          No notifications
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {preview.map(function (notification) {
          const isUnread = !notification.read;
          return (
            <div key={notification.id} style={{
              display: "flex", alignItems: "flex-start", gap: 10,
              padding: "10px 12px", borderRadius: 8,
              background: isUnread ? "var(--bg-elevated)" : "transparent",
              border: isUnread ? "1px solid var(--border)" : "none",
            }}>
              <div style={{
                width: 6, height: 6, borderRadius: "50%", flexShrink: 0, marginTop: 6,
                background: isUnread ? "var(--accent)" : "transparent",
              }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: 13, fontWeight: isUnread ? 500 : 400, color: "var(--text)",
                  whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                }}>
                  {notification.title || notification.body || "Notification"}
                </div>
                {notification.body && notification.title && (
                  <div style={{
                    fontSize: 11, color: "var(--text-muted)", marginTop: 2,
                    whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                  }}>
                    {notification.body}
                  </div>
                )}
                <div style={{ fontSize: 11, color: "var(--text-ash)", marginTop: 3 }}>
                  {timeAgo(notification.createdAt)}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <a href="/dashboard/notifications" className="btn btn-ghost"
        style={{ fontSize: 12, width: "100%", justifyContent: "center", marginTop: 12, gap: 6 }}>
        View all notifications <ChevronRight size={13} />
      </a>
    </Card>
  );
}

// ─── Account Overview ──────────────────────────────────────────

function AccountOverviewCard({ user }: { user: UserProfile }) {
  const memberSince = user.created_at
    ? new Date(user.created_at).toLocaleDateString("en-US", {
        year: "numeric", month: "long", day: "numeric",
      })
    : "Unknown";

  const karma = user.karma_points ?? 0;

  const fields = [
    { label: "Role", value: user.adminRole ? user.adminRole.replace("_", " ") : "User", icon: <Shield size={13} /> },
    { label: "Member since", value: memberSince, icon: <Calendar size={13} /> },
    { label: "Country", value: user.country || "Not set", icon: <MapPin size={13} /> },
  ];

  return (
    <Card title="Account Overview">
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
        <div style={{
          padding: 16, borderRadius: 10, background: "var(--bg-elevated)",
          border: "1px solid var(--border)", textAlign: "center",
        }}>
          <div style={{ color: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 8 }}>
            <TrendingUp size={16} />
          </div>
          <div style={{ fontSize: 22, fontWeight: 700, color: "var(--text)", lineHeight: 1.2 }}>
            {karma.toLocaleString()}
          </div>
          <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>Karma Points</div>
        </div>

        <div style={{
          padding: 16, borderRadius: 10, background: "var(--bg-elevated)",
          border: "1px solid var(--border)", textAlign: "center",
        }}>
          <div style={{ color: "var(--success)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 8 }}>
            <Activity size={16} />
          </div>
          <div style={{ fontSize: 22, fontWeight: 700, color: "var(--text)", lineHeight: 1.2 }}>
            {user.is_verified ? "Verified" : "Unverified"}
          </div>
          <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>Email Status</div>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {fields.map(function (field) {
          const isRole = field.label === "Role";
          return (
            <div key={field.label} style={{
              display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 13,
            }}>
              <span style={{ color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 6 }}>
                {field.icon}
                {field.label}
              </span>
              <span style={{
                color: "var(--text-secondary)", fontWeight: 500,
                textTransform: isRole ? "capitalize" : "none",
              }}>
                {field.value}
              </span>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

// ─── Page ──────────────────────────────────────────────────────

export default function DashboardHome() {
  const fetched = useRef(false);

  const [user, setUser] = useState<UserProfile | null>(null);
  const [activity, setActivity] = useState<ActivityEntry[]>([]);
  const [sessions, setSessions] = useState<SessionEntry[]>([]);
  const [notifications, setNotifications] = useState<NotificationEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(function () {
    if (fetched.current) return;
    fetched.current = true;

    var headers: HeadersInit = { "Content-Type": "application/json" };

    Promise.allSettled([
      fetch(API + "/api/profile", { credentials: "include", headers }).then(function (r) {
        return r.ok ? r.json() : null;
      }),
      fetch(API + "/api/user/activity?limit=50", { credentials: "include", headers }).then(function (r) {
        return r.ok ? r.json() : [];
      }),
      fetch(API + "/api/security/sessions", { credentials: "include", headers }).then(function (r) {
        return r.ok ? r.json() : [];
      }),
      fetch(API + "/api/notifications?limit=5", { credentials: "include", headers }).then(function (r) {
        return r.ok ? r.json() : [];
      }),
    ]).then(function (results) {
      var profileRes = results[0];
      var activityRes = results[1];
      var sessionsRes = results[2];
      var notifRes = results[3];

      if (profileRes.status === "fulfilled" && profileRes.value) {
        var profile = profileRes.value;
        if (profile.error) {
          window.location.href = "https://accounts.tirbeo.app/login?redirect=" + encodeURIComponent(window.location.href);
          return;
        }
        setUser(profile);
      } else {
        window.location.href = "https://accounts.tirbeo.app/login?redirect=" + encodeURIComponent(window.location.href);
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
  }, []);

  if (loading || !user) {
    return (
      <div style={{ padding: "24px 0" }}>
        <div className="glass" style={{ padding: 32, marginBottom: 16 }}>
          <div style={{ height: 24, width: 200, background: "var(--bg-elevated)", borderRadius: 6, marginBottom: 8 }} />
          <div style={{ height: 14, width: 300, background: "var(--bg-elevated)", borderRadius: 4 }} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div className="glass" style={{ height: 200 }} />
          <div className="glass" style={{ height: 200 }} />
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: "24px 0", display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Welcome — full width */}
      <WelcomeSection user={user} />

      {/* Two-column layout */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))",
        gap: 16,
      }}>
        <ProfileCompletionCard user={user} />
        <SecurityScoreCard user={user} />
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))",
        gap: 16,
      }}>
        <QuickActionsCard />
        <AccountOverviewCard user={user} />
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))",
        gap: 16,
      }}>
        <ActivityCard activity={activity} />
        <SessionsPreviewCard sessions={sessions} />
      </div>

      <NotificationsPreviewCard notifications={notifications} />
    </div>
  );
}
