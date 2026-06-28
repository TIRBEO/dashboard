import { useEffect, useState } from "react";
import { useOutletContext, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Users, MessageSquare, Activity, TrendingUp,
  ArrowUpRight, Globe, Settings,
  Loader2, Sparkles,
} from "lucide-react";
import { getStats, getRecentActivity, type DashboardStats, type ActivityItem } from "@/lib/dashboard";
import { getProfile, type UserProfile } from "@/lib/profile";
import type { Session } from "@/lib/session";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
};

const iconMap = [Users, MessageSquare, Activity, TrendingUp] as const;
const colorMap = [
  "from-blue-500/20 to-blue-600/10",
  "from-emerald-500/20 to-emerald-600/10",
  "from-purple-500/20 to-purple-600/10",
  "from-amber-500/20 to-amber-600/10",
] as const;

export default function DashboardPage() {
  const session = useOutletContext<Session>();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getStats(), getRecentActivity(), getProfile(session.user.id)])
      .then(([s, a, p]) => { setStats(s); setActivity(a); setProfile(p); })
      .finally(() => setLoading(false));
  }, [session.user.id]);

  const statCards = stats ? [
    { label: "Active Members", value: stats.memberCount.toLocaleString(), change: "+12%", color: colorMap[0] },
    { label: "Messages Today", value: stats.messageCount.toLocaleString(), change: "+8%", color: colorMap[1] },
    { label: "Server Uptime", value: "99.9%", change: "Stable", color: colorMap[2] },
    { label: "Active Channels", value: stats.channelCount.toLocaleString(), change: "+23%", color: colorMap[3] },
  ] : [];

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-8">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-secondary text-xl font-semibold text-foreground overflow-hidden">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="" className="h-full w-full object-cover" />
            ) : (
              session.user.displayName?.charAt(0)?.toUpperCase() || "U"
            )}
          </div>
          <div>
            <h1 className="font-display text-3xl font-semibold tracking-tight">
              Welcome back, {session.user.displayName}
            </h1>
            <div className="mt-1 flex items-center gap-3 text-sm text-ink-soft">
              <span className="flex items-center gap-1">
                <Sparkles className="h-3.5 w-3.5 text-[var(--clay)]" />
                Your personal workspace
              </span>
            </div>
          </div>
        </div>
        <Link
          to="/settings"
          className="flex items-center gap-2 rounded-lg border border-border bg-secondary/50 px-3 py-2 text-xs text-ink-soft hover:text-foreground hover:bg-secondary transition-colors"
        >
          <Settings className="h-3.5 w-3.5" />
          Quick Settings
        </Link>
      </div>

      {loading ? (
        <div className="flex h-60 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-ink-soft" />
        </div>
      ) : (
        <>
          <motion.div variants={item} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {statCards.map((s, i) => {
              const Icon = iconMap[i];
              return (
                <div key={s.label} className="group relative overflow-hidden rounded-xl border border-border bg-card p-5 transition-all hover:border-foreground/20 hover:shadow-lg">
                  <div className={`absolute inset-0 bg-gradient-to-br ${s.color} opacity-50`} />
                  <div className="relative z-10">
                    <div className="flex items-center justify-between">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                        <Icon className="h-5 w-5 text-foreground" />
                      </div>
                      <span className="inline-flex items-center gap-0.5 rounded-full bg-green-500/10 px-2 py-0.5 text-xs font-medium text-green-500">
                        {s.change}
                        <ArrowUpRight className="h-3 w-3" />
                      </span>
                    </div>
                    <p className="mt-4 font-display text-2xl font-semibold tracking-tight">{s.value}</p>
                    <p className="mt-0.5 text-xs text-ink-soft">{s.label}</p>
                  </div>
                </div>
              );
            })}
          </motion.div>

          <div className="grid gap-6 lg:grid-cols-2">
            <motion.div variants={item} className="rounded-xl border border-border bg-card p-5">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-display text-lg font-semibold tracking-tight">Recent Activity</h2>
              </div>
              <div className="space-y-1">
                {activity.length === 0 && (
                  <p className="py-8 text-center text-sm text-ink-soft">No recent activity</p>
                )}
                {activity.map((a, i) => (
                  <div key={i} className="group flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-secondary/50">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-secondary">
                      <MessageSquare className="h-4 w-4 text-ink-soft" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-foreground">
                        <span className="font-medium">{a.user}</span>{" "}
                        {a.action}{" "}
                        <span className="font-medium text-ink-soft">{a.target}</span>
                      </p>
                    </div>
                    <span className="shrink-0 text-xs text-ink-soft">{a.time}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div variants={item} className="rounded-xl border border-border bg-card p-5">
              <h2 className="mb-4 font-display text-lg font-semibold tracking-tight">Quick Actions</h2>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Open Chat", desc: "Start a conversation", icon: MessageSquare, href: "/chat" },
                  { label: "Members", desc: "View team members", icon: Users, href: "/members" },
                  { label: "Settings", desc: "Manage your profile", icon: Settings, href: "/settings" },
                  { label: "View Docs", desc: "Read the guide", icon: Globe, href: "https://docs.tirbeo.com", external: true },
                ].map((action) =>
                  action.external ? (
                    <a
                      key={action.label}
                      href={action.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex flex-col items-start gap-1.5 rounded-xl border border-border bg-secondary/20 px-4 py-4 text-left transition-all hover:border-foreground/20 hover:bg-secondary active:scale-[0.98]"
                    >
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary group-hover:bg-foreground/10 transition-colors">
                        <action.icon className="h-4 w-4 text-foreground" />
                      </div>
                      <p className="mt-1 text-sm font-medium text-foreground">{action.label}</p>
                      <p className="text-xs text-ink-soft">{action.desc}</p>
                    </a>
                  ) : (
                    <button
                      key={action.label}
                      onClick={() => navigate(action.href)}
                      className="group flex flex-col items-start gap-1.5 rounded-xl border border-border bg-secondary/20 px-4 py-4 text-left transition-all hover:border-foreground/20 hover:bg-secondary active:scale-[0.98]"
                    >
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary group-hover:bg-foreground/10 transition-colors">
                        <action.icon className="h-4 w-4 text-foreground" />
                      </div>
                      <p className="mt-1 text-sm font-medium text-foreground">{action.label}</p>
                      <p className="text-xs text-ink-soft">{action.desc}</p>
                    </button>
                  )
                )}
              </div>
            </motion.div>
          </div>

          <motion.div variants={item} className="rounded-xl border border-border bg-card/50 p-5 text-center">
            <p className="text-sm text-ink-soft">
              Running on <span className="text-foreground">Tirbeo Cloud</span> &mdash; Everything is synced in real-time.
            </p>
          </motion.div>
        </>
      )}
    </motion.div>
  );
}
