'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getCurrentUser, User } from '../../lib/auth';
import { api } from '../../lib/api-client';
import { FileText, Grid3X3, Bell, Clock, ExternalLink, Activity, MessageSquare } from 'lucide-react';

type Tab = 'overview' | 'apps' | 'activity' | 'notifications';

interface KpiData {
  label: string;
  value: string | number;
  sub: string;
  icon: typeof Grid3X3;
}

const TABS: { id: Tab; label: string; icon: typeof Grid3X3 }[] = [
  { id: 'overview', label: 'Overview', icon: Grid3X3 },
  { id: 'apps', label: 'Apps', icon: FileText },
  { id: 'activity', label: 'Activity', icon: Clock },
  { id: 'notifications', label: 'Notifications', icon: Bell },
];

export default function DashboardHome() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState<User | null>(null);
  const [apps, setApps] = useState<any[]>([]);
  const [activity, setActivity] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const tab = searchParams.get('tab') as Tab | null;
    if (tab && ['overview', 'apps', 'activity', 'notifications'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  useEffect(() => {
    getCurrentUser().then(setUser);
    Promise.all([
      api.get('/api/content/apps').then((d: any) => Array.isArray(d) ? d : d?.data || []),
      api.get('/api/user/activity?limit=20').then((d: any) => d || []),
      api.get('/api/notifications?limit=20').then((d: any) => d?.notifications || []),
    ]).then(([appsData, activityData, notifData]) => {
      setApps(appsData);
      setActivity(activityData);
      setNotifications(notifData);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const formCount = apps.filter((a: any) => a.name?.toLowerCase().includes('form')).length;

  const kpis: KpiData[] = [
    { label: 'Applications', value: apps.length.toLocaleString(), sub: 'available to you', icon: Grid3X3 },
    { label: 'Forms', value: formCount.toLocaleString(), sub: formCount ? 'linked to your account' : 'none created yet', icon: MessageSquare },
    { label: 'Notifications', value: notifications.length.toLocaleString(), sub: 'unread / recent', icon: Bell },
    { label: 'Recent Activity', value: activity.length.toLocaleString(), sub: 'last 30 days', icon: Activity },
  ];

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
    const url = new URL(window.location.href);
    url.searchParams.set('tab', tab);
    window.history.pushState({}, '', url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin w-8 h-8 border-2 border-[var(--color-primary)] border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-[28px] font-semibold text-[var(--color-text)] leading-tight">
          {greeting}, {user?.name?.split(' ')[0] || 'there'}
        </h1>
        <p className="mt-1.5 text-[var(--color-text-secondary)]">
          Here&apos;s what&apos;s happening with your account.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-[var(--color-border)] mb-6">
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => handleTabChange(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors relative ${
              activeTab === tab.id
                ? 'text-[var(--color-primary)]'
                : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text)]'
            }`}>
            <tab.icon className="w-4 h-4" />
            {tab.label}
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--color-primary)]" />
            )}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {kpis.map(kpi => (
              <div key={kpi.label} className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm">
                <div className="flex items-start justify-between mb-3">
                  <p className="text-sm font-medium text-[var(--color-text-secondary)]">{kpi.label}</p>
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--color-primary-surface)] text-[var(--color-primary)]">
                    <kpi.icon className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-2xl font-semibold text-[var(--color-text)]">{kpi.value}</p>
                <p className="text-sm text-[var(--color-text-secondary)] mt-2">{kpi.sub}</p>
              </div>
            ))}
          </div>

          <section>
            <h2 className="text-sm font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider mb-4">Quick actions</h2>
            <div className="flex flex-wrap gap-3">
              {[
                { label: 'Open apps', href: '/dashboard/apps' },
                { label: 'View activity', href: '/dashboard/activity' },
                { label: 'Notifications', href: '/dashboard/notifications' },
                { label: 'My forms', href: '/dashboard/forms' },
              ].map(action => (
                <a key={action.label} href={action.href}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-sm font-medium text-[var(--color-text)] hover:bg-[var(--color-surface-muted)] transition-colors shadow-sm">
                  {action.label}
                </a>
              ))}
            </div>
          </section>

          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Your applications</h2>
              <button onClick={() => handleTabChange('apps')} className="text-sm font-medium text-[var(--color-primary)] hover:underline">View all</button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {apps.length === 0 ? (
                <>
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 text-center hover:shadow-sm transition-shadow">
                      <div className="w-10 h-10 rounded-lg bg-[var(--color-surface-muted)] mx-auto mb-3" />
                      <div className="h-4 w-20 bg-[var(--color-surface-muted)] rounded mx-auto" />
                    </div>
                  ))}
                </>
              ) : (
                apps.slice(0, 4).map((app: any) => (
                  <a key={app.id} href={app.url || '#'}
                    className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 text-center hover:shadow-sm transition-shadow group">
                    <div className="w-10 h-10 rounded-lg bg-[var(--color-primary-surface)] flex items-center justify-center mx-auto mb-3">
                      <span className="text-[var(--color-primary)] font-semibold">{app.name?.charAt(0)}</span>
                    </div>
                    <p className="text-sm font-medium text-[var(--color-text)]">{app.name}</p>
                    <ExternalLink className="w-3 h-3 text-[var(--color-text-secondary)] mx-auto mt-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                ))
              )}
            </div>
          </section>
        </div>
      )}

      {/* Apps Tab */}
      {activeTab === 'apps' && (
        <div>
          <h2 className="text-lg font-semibold text-[var(--color-text)] mb-4">Your Applications</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {apps.length === 0 ? (
              <div className="col-span-full text-center py-12 text-[var(--color-text-secondary)]">No applications yet</div>
            ) : (
              apps.map((app: any) => (
                <a key={app.id} href={app.url || '#'}
                  className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 text-center hover:shadow-sm transition-shadow group">
                  <div className="w-12 h-12 rounded-lg bg-[var(--color-primary-surface)] flex items-center justify-center mx-auto mb-3">
                    <span className="text-[var(--color-primary)] font-semibold text-lg">{app.name?.charAt(0)}</span>
                  </div>
                  <p className="text-sm font-medium text-[var(--color-text)]">{app.name}</p>
                  <p className="text-xs text-[var(--color-text-secondary)] mt-1">{app.description || 'Application'}</p>
                </a>
              ))
            )}
          </div>
        </div>
      )}

      {/* Activity Tab */}
      {activeTab === 'activity' && (
        <div>
          <h2 className="text-lg font-semibold text-[var(--color-text)] mb-4">Recent Activity</h2>
          {activity.length === 0 ? (
            <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-8 text-center">
              <Clock className="w-8 h-8 mx-auto mb-3 text-[var(--color-text-secondary)]" />
              <p className="text-sm text-[var(--color-text-secondary)]">No recent activity</p>
            </div>
          ) : (
            <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] divide-y divide-[var(--color-border)]">
              {activity.map((a: any) => (
                <div key={a.id} className="flex items-center gap-4 p-4 hover:bg-[var(--color-surface-muted)] transition-colors">
                  <div className="w-2 h-2 rounded-full bg-[var(--color-primary)] flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[var(--color-text)] truncate">{a.event_type || a.title || 'Activity'}</p>
                    <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
                      {a.createdAt ? new Date(a.createdAt).toLocaleDateString() : ''}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-[var(--color-text)]">Notifications</h2>
            <button className="text-sm font-medium text-[var(--color-primary)] hover:underline">Mark all as read</button>
          </div>
          {notifications.length === 0 ? (
            <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-8 text-center">
              <Bell className="w-8 h-8 mx-auto mb-3 text-[var(--color-text-secondary)]" />
              <p className="text-sm text-[var(--color-text-secondary)]">You&apos;re all caught up</p>
            </div>
          ) : (
            <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] divide-y divide-[var(--color-border)]">
              {notifications.map((n: any) => (
                <div key={n.id} className={`flex items-start gap-4 p-4 transition-colors ${n.read ? '' : 'bg-[var(--color-primary-surface)]'}`}>
                  <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${n.read ? 'bg-transparent' : 'bg-[var(--color-primary)]'}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[var(--color-text)]">{n.title || n.message}</p>
                    <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
                      {n.createdAt ? new Date(n.createdAt).toLocaleDateString() : ''}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
