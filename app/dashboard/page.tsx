"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  User, Shield, Bell, Clock, Zap,
  Settings, Activity, ArrowUpRight, CheckCircle2, XCircle,
} from "lucide-react";
import { HomeSkeleton } from "../components/Skeleton";

const API = process.env.NEXT_PUBLIC_API_URL || "https://api.tirbeo.app";

type Me = {
  id: string; email: string; name: string | null; photoUrl: string | null;
  occupation: string | null; adminRole: string | null;
  createdAt: string; emailVerified: boolean; phoneVerified: boolean;
  is2FAEnabled: boolean; bio: string | null; secondaryEmail: string | null;
  language: string | null; country: string | null; theme: string | null;
};

type ActivityLog = { id: string; action: string; createdAt: string };

export default function DashboardHome() {
  const [user, setUser] = useState<Me | null>(null);
  const [activity, setActivity] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const fetched = useRef(false);

  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;
    fetch(`${API}/api/profile`, { credentials: "include" }).then(r => r.ok ? r.json() : null).then(setUser).catch(() => {});
    fetch(`${API}/api/user/activity?limit=5`, { credentials: "include" }).then(r => r.ok ? r.json() : []).then(setActivity).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading || !user) return <HomeSkeleton />;

  const initials = user.name ? user.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() : user.email[0].toUpperCase();
  const checks = [
    { label: "Name set", ok: !!user.name },
    { label: "Email verified", ok: user.emailVerified },
    { label: "2FA enabled", ok: user.is2FAEnabled },
    { label: "Secondary email", ok: !!user.secondaryEmail },
    { label: "Country set", ok: !!user.country },
  ];
  const pct = Math.round((checks.filter(c => c.ok).length / checks.length) * 100);

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <div className="avatar" style={{ width: 52, height: 52, fontSize: 18, borderRadius: 14 }}>
          {user.photoUrl ? <img src={user.photoUrl} alt="" /> : initials}
        </div>
        <div className="flex-1 min-w-0">
          <h1 style={{ fontSize: 20, fontWeight: 700, color: "#ffffff", letterSpacing: "-0.03em" }}>{user.name || "Welcome"}</h1>
          <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 2 }}>{user.occupation || "Member"}</p>
        </div>
        <Link href="/dashboard/profile" className="btn btn-ghost" style={{ fontSize: 12 }}>
          <User size={13} /> Edit <ArrowUpRight size={11} />
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {[
          { label: "Completion", value: `${pct}%`, icon: Zap },
          { label: "2FA", value: user.is2FAEnabled ? "Active" : "Off", icon: Shield },
        ].map((s) => (
          <div key={s.label} className="glass" style={{ padding: "18px 20px" }}>
            <div className="flex items-center gap-2 mb-3">
              <s.icon size={13} style={{ color: "var(--text-muted)" }} />
              <span style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-muted)" }}>{s.label}</span>
            </div>
            <p style={{ fontSize: 24, fontWeight: 700, color: "#ffffff", letterSpacing: "-0.03em" }}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="glass" style={{ padding: "22px 24px" }}>
        <div className="flex items-center gap-2 mb-5">
          <Activity size={14} style={{ color: "var(--text-muted)" }} />
          <h3 style={{ fontSize: 14, fontWeight: 600, color: "#ffffff" }}>Quick Actions</h3>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Profile", desc: "Edit your info", href: "/dashboard/profile", icon: User },
            { label: "Security", desc: "Password & 2FA", href: "/dashboard/security", icon: Shield },
            { label: "Notifications", desc: "Manage alerts", href: "/dashboard/notifications", icon: Bell },
            { label: "Settings", desc: "Preferences", href: "/dashboard/preferences", icon: Settings },
          ].map(q => (
            <Link key={q.href} href={q.href} className="glass-subtle group" style={{ padding: "14px 16px", display: "block", textDecoration: "none", transition: "all 0.15s", borderRadius: 12 }}>
              <div className="flex items-center justify-between mb-3">
                <q.icon size={16} style={{ color: "var(--text-secondary)" }} />
                <ArrowUpRight size={11} style={{ color: "var(--text-muted)" }} className="opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <p style={{ fontSize: 13, fontWeight: 500, color: "#ffffff" }}>{q.label}</p>
              <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 3 }}>{q.desc}</p>
            </Link>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="glass" style={{ padding: "22px 24px" }}>
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle2 size={14} style={{ color: "var(--text-muted)" }} />
            <h3 style={{ fontSize: 14, fontWeight: 600, color: "#ffffff" }}>Account Status</h3>
          </div>
          <div>
            {checks.map(c => (
              <div key={c.label} className="table-row" style={{ padding: "10px 0" }}>
                <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>{c.label}</span>
                {c.ok ? (
                  <CheckCircle2 size={14} style={{ color: "rgba(255,255,255,0.7)" }} />
                ) : (
                  <XCircle size={14} style={{ color: "var(--text-muted)" }} />
                )}
              </div>
            ))}
          </div>
          {pct < 100 && (
            <Link href="/dashboard/profile" style={{ fontSize: 12, color: "#ffffff", textDecoration: "none", marginTop: 12, display: "inline-block" }}>
              Complete your profile →
            </Link>
          )}
        </div>

        <div className="glass" style={{ padding: "22px 24px" }}>
          <div className="flex items-center gap-2 mb-4">
            <Clock size={14} style={{ color: "var(--text-muted)" }} />
            <h3 style={{ fontSize: 14, fontWeight: 600, color: "#ffffff" }}>Recent Activity</h3>
          </div>
          {activity.length === 0 ? (
            <p style={{ fontSize: 13, color: "var(--text-muted)" }}>No recent activity</p>
          ) : (
            <div>
              {activity.map((a) => (
                <div key={a.id} className="table-row" style={{ padding: "10px 0" }}>
                  <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>{a.action}</span>
                  <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{new Date(a.createdAt).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="glass-subtle" style={{ padding: "12px 16px", display: "flex", alignItems: "center", gap: 10, borderRadius: 10 }}>
        <div style={{ width: 6, height: 6, borderRadius: "50%", background: "rgba(255,255,255,0.4)", flexShrink: 0 }} />
        <p style={{ fontSize: 11, color: "var(--text-muted)" }}>
          Member since {new Date(user.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
          {user.country ? ` · ${user.country}` : ""}
          {user.language ? ` · ${user.language.toUpperCase()}` : ""}
        </p>
      </div>
    </div>
  );
}
