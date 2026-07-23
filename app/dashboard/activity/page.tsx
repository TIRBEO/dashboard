"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { Activity, Shield, User, Settings, Bell, LogIn, LogOut, Key, Trash2, Edit3, Eye, Globe, Smartphone, AlertTriangle, CheckCircle2 } from "lucide-react";
import { PageContainer, PageHeader, Card, Badge, EmptyState, StatCard, FilterTabs, Skeleton, Toast, useToast } from "../components";

var API = process.env.NEXT_PUBLIC_API_URL || "https://api.tirbeo.app";

type AuditEvent = {
  id: string; action: string; targetType?: string; targetId?: string;
  metadata?: Record<string, unknown>; severity: string; createdAt: string;
  actor?: { name?: string; email?: string; photoUrl?: string } | null;
};

var ACTION_CONFIG: Record<string, { icon: typeof Activity; color: string; label: string }> = {
  "user.login": { icon: LogIn, color: "var(--success)", label: "Signed in" },
  "user.logout": { icon: LogOut, color: "var(--text-muted)", label: "Signed out" },
  "user.signup": { icon: User, color: "#57c1ff", label: "Account created" },
  "user.deleted": { icon: Trash2, color: "var(--danger)", label: "Account deleted" },
  "user.updated": { icon: Edit3, color: "var(--text-secondary)", label: "Profile updated" },
  "user.banned": { icon: AlertTriangle, color: "var(--danger)", label: "Account banned" },
  "user.unbanned": { icon: CheckCircle2, color: "var(--success)", label: "Account unbanned" },
  "password.changed": { icon: Key, color: "var(--gold)", label: "Password changed" },
  "2fa.enabled": { icon: Shield, color: "var(--success)", label: "2FA enabled" },
  "2fa.disabled": { icon: Shield, color: "var(--danger)", label: "2FA disabled" },
  "session.revoked": { icon: LogOut, color: "var(--gold)", label: "Session revoked" },
  "role.created": { icon: User, color: "#57c1ff", label: "Role created" },
  "role.updated": { icon: Edit3, color: "var(--text-secondary)", label: "Role updated" },
  "role.deleted": { icon: Trash2, color: "var(--danger)", label: "Role deleted" },
  "settings.updated": { icon: Settings, color: "var(--text-secondary)", label: "Settings changed" },
  "notification.sent": { icon: Bell, color: "#57c1ff", label: "Notification sent" },
  "integration.connected": { icon: Globe, color: "var(--success)", label: "Integration connected" },
  "integration.disconnected": { icon: Globe, color: "var(--danger)", label: "Integration disconnected" },
  "workspace.created": { icon: Activity, color: "#57c1ff", label: "Workspace created" },
  "workspace.deleted": { icon: Trash2, color: "var(--danger)", label: "Workspace deleted" },
  "backup_codes.generated": { icon: Key, color: "var(--gold)", label: "Backup codes generated" },
  "recovery_email.updated": { icon: Bell, color: "var(--text-secondary)", label: "Recovery email updated" },
  "recovery_phone.updated": { icon: Smartphone, color: "var(--text-secondary)", label: "Recovery phone updated" },
  "passkey.added": { icon: Eye, color: "var(--success)", label: "Passkey added" },
  "passkey.removed": { icon: Eye, color: "var(--danger)", label: "Passkey removed" },
};

function relativeTime(dateStr: string): string {
  var diff = Date.now() - new Date(dateStr).getTime();
  var sec = Math.floor(diff / 1000);
  if (sec < 60) return "Just now";
  var min = Math.floor(sec / 60);
  if (min < 60) return min + "m ago";
  var hr = Math.floor(min / 60);
  if (hr < 24) return hr + "h ago";
  var d = Math.floor(hr / 24);
  if (d < 7) return d + "d ago";
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

var FILTERS = ["All", "Security", "Account", "System", "Admin"];

export default function ActivityPage() {
  var [events, setEvents] = useState<AuditEvent[]>([]);
  var [loading, setLoading] = useState(true);
  var [filter, setFilter] = useState("All");
  var fetched = useRef(false);
  var toast = useToast();

  useEffect(function() {
    if (fetched.current) return;
    fetched.current = true;
    fetch(API + "/api/user/activity?limit=100", { credentials: "include" })
      .then(function(r) { return r.ok ? r.json() : []; })
      .then(setEvents)
      .catch(function() {})
      .finally(function() { setLoading(false); });
  }, []);

  var filteredEvents = useMemo(function() {
    if (filter === "All") return events;
    return events.filter(function(e) {
      var action = e.action.toLowerCase();
      if (filter === "Security") return action.includes("2fa") || action.includes("password") || action.includes("session") || action.includes("passkey") || action.includes("recovery") || action.includes("backup");
      if (filter === "Account") return action.includes("user.") || action.includes("profile");
      if (filter === "System") return action.includes("settings") || action.includes("notification") || action.includes("workspace") || action.includes("integration");
      if (filter === "Admin") return action.includes("role") || action.includes("banned") || action.includes("seed");
      return true;
    });
  }, [events, filter]);

  var groupedEvents = useMemo(function() {
    var groups: { date: string; events: AuditEvent[] }[] = [];
    var currentDate = "";
    filteredEvents.forEach(function(e) {
      var d = new Date(e.createdAt).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
      if (d !== currentDate) { currentDate = d; groups.push({ date: d, events: [] }); }
      groups[groups.length - 1].events.push(e);
    });
    return groups;
  }, [filteredEvents]);

  var filterCounts = useMemo(function() {
    var counts: Record<string, number> = { All: events.length, Security: 0, Account: 0, System: 0, Admin: 0 };
    events.forEach(function(e) {
      var a = e.action.toLowerCase();
      if (a.includes("2fa") || a.includes("password") || a.includes("session") || a.includes("passkey")) counts.Security++;
      if (a.includes("user.") || a.includes("profile")) counts.Account++;
      if (a.includes("settings") || a.includes("notification") || a.includes("workspace")) counts.System++;
      if (a.includes("role") || a.includes("banned")) counts.Admin++;
    });
    return counts;
  }, [events]);

  if (loading) return <Skeleton count={4} height={60} />;

  return (
    <PageContainer>
      {toast.toast && <Toast message={toast.toast.message} type={toast.toast.type} onClose={toast.hide} />}

      <PageHeader title="Activity" description="Complete audit trail of everything that happened on your account" />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 12 }}>
        <StatCard label="Total Events" value={events.length} icon={Activity} />
        <StatCard label="Security Events" value={filterCounts.Security} icon={Shield} />
        <StatCard label="Account Changes" value={filterCounts.Account} icon={User} />
        <StatCard label="System Events" value={filterCounts.System} icon={Settings} />
      </div>

      <FilterTabs
        tabs={FILTERS.map(function(f) { return { id: f, label: f, count: filterCounts[f] || 0 }; })}
        active={filter}
        onChange={setFilter}
      />

      {groupedEvents.length === 0 ? (
        <EmptyState icon={Activity} title="No activity found" description="Events will appear as you use Tirbeo" />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {groupedEvents.map(function(group) {
            return (
              <div key={group.date}>
                <p style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", marginBottom: 12, paddingLeft: 4 }}>{group.date}</p>
                <Card>
                  <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                    {group.events.map(function(event) {
                      var config = ACTION_CONFIG[event.action] || { icon: Activity, color: "var(--text-muted)", label: event.action };
                      var Icon = config.icon;
                      return (
                        <div key={event.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0", borderBottom: "1px solid var(--border)" }}>
                          <div style={{ width: 28, height: 28, borderRadius: 8, background: config.color + "20", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            <Icon size={12} style={{ color: config.color }} />
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ fontSize: 13, color: "var(--text)", margin: 0 }}>{config.label}</p>
                            <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 3 }}>
                              <span style={{ fontSize: 11, color: "var(--text-ash)" }}>{relativeTime(event.createdAt)}</span>
                              {event.metadata?.ip && <span style={{ fontSize: 11, color: "var(--text-ash)" }}>IP: {String(event.metadata.ip)}</span>}
                              {event.metadata?.device && <span style={{ fontSize: 11, color: "var(--text-ash)" }}>{String(event.metadata.device)}</span>}
                              {event.metadata?.location && <span style={{ fontSize: 11, color: "var(--text-ash)" }}>{String(event.metadata.location)}</span>}
                            </div>
                          </div>
                          <Badge variant={event.severity === "warning" || event.severity === "critical" ? "danger" : "default"}>
                            {event.severity}
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                </Card>
              </div>
            );
          })}
        </div>
      )}
    </PageContainer>
  );
}
