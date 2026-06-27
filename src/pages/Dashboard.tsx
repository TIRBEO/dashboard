import { motion } from "framer-motion";
import {
  Users,
  MessageSquare,
  Activity,
  TrendingUp,
  Calendar,
  Clock,
  ArrowUpRight,
  Zap,
  Shield,
  Globe,
} from "lucide-react";

const stats = [
  { label: "Active Members", value: "2,847", change: "+12%", icon: Users, color: "from-blue-500/20 to-blue-600/10" },
  { label: "Messages Today", value: "14,203", change: "+8%", icon: MessageSquare, color: "from-emerald-500/20 to-emerald-600/10" },
  { label: "Server Uptime", value: "99.9%", change: "Stable", icon: Activity, color: "from-purple-500/20 to-purple-600/10" },
  { label: "Active Projects", value: "156", change: "+23%", icon: TrendingUp, color: "from-amber-500/20 to-amber-600/10" },
];

const recentActivity = [
  { user: "Alex Chen", action: "created a new project", target: "UI Redesign", time: "2m ago", icon: Zap },
  { user: "Sarah Kim", action: "commented on", target: "API Documentation", time: "5m ago", icon: MessageSquare },
  { user: "Marcus Johnson", action: "deployed", target: "v2.4.1 to production", time: "12m ago", icon: Globe },
  { user: "Elena Rodriguez", action: "updated security settings for", target: "Team Workspace", time: "18m ago", icon: Shield },
  { user: "David Park", action: "scheduled", target: "Sprint Review", time: "25m ago", icon: Calendar },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 } as const,
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
};

export default function DashboardPage() {
  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight">Dashboard</h1>
          <p className="mt-1 text-sm text-ink-soft">Your community workspace overview</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-lg bg-secondary/50 px-3 py-2 text-xs text-ink-soft">
            <Clock className="h-3.5 w-3.5" />
            Last updated: just now
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <motion.div variants={item} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="group relative overflow-hidden rounded-xl border border-border bg-card p-5 transition-all hover:border-foreground/20 hover:shadow-lg"
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${s.color} opacity-50`} />
            <div className="relative z-10">
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                  <s.icon className="h-5 w-5 text-foreground" />
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
        ))}
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Activity */}
        <motion.div variants={item} className="rounded-xl border border-border bg-card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold tracking-tight">Recent Activity</h2>
            <a href="#" className="text-xs text-ink-soft hover:text-foreground transition-colors">
              View all
            </a>
          </div>
          <div className="space-y-1">
            {recentActivity.map((a, i) => (
              <div
                key={i}
                className="group flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-secondary/50"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-secondary">
                  <a.icon className="h-4 w-4 text-ink-soft" />
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

        {/* Quick Actions */}
        <motion.div variants={item} className="rounded-xl border border-border bg-card p-5">
          <h2 className="mb-4 font-display text-lg font-semibold tracking-tight">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "New Project", desc: "Create a workspace", icon: Zap },
              { label: "Invite Members", desc: "Add team members", icon: Users },
              { label: "View Analytics", desc: "Check metrics", icon: TrendingUp },
              { label: "Open Chat", desc: "Start a conversation", icon: MessageSquare },
            ].map((action) => (
              <button
                key={action.label}
                className="group flex flex-col items-start gap-1.5 rounded-xl border border-border bg-secondary/20 px-4 py-4 text-left transition-all hover:border-foreground/20 hover:bg-secondary active:scale-[0.98]"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary group-hover:bg-foreground/10 transition-colors">
                  <action.icon className="h-4 w-4 text-foreground" />
                </div>
                <p className="mt-1 text-sm font-medium text-foreground">{action.label}</p>
                <p className="text-xs text-ink-soft">{action.desc}</p>
              </button>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Footer section */}
      <motion.div variants={item} className="rounded-xl border border-border bg-card/50 p-5 text-center">
        <p className="text-sm text-ink-soft">
          Running on <span className="text-foreground">Tirbeo Cloud</span> &mdash; Everything is synced in real-time.
        </p>
      </motion.div>
    </motion.div>
  );
}
