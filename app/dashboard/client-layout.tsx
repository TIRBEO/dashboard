'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { DashboardShell, type NavSection, type AppLink } from '@tirbeo/ui';
import { useThemeToggle } from '@tirbeo/theme';
import { getCurrentUser, getLoginUrl, accountsUrl, User } from '../../lib/auth';
import { api } from '../../lib/api-client';
import {
  LayoutDashboard, Grid3X3, Activity, Bell, FileText,
  Settings, HelpCircle, UserCircle, Shield, Lock, SlidersHorizontal,
  Key, Fingerprint, Monitor,
  Sun, Moon,
} from 'lucide-react';

const NAV_SECTIONS: NavSection[] = [
  {
    label: 'Overview',
    items: [
      { href: '/dashboard', label: 'Home', icon: LayoutDashboard },
      { href: '/dashboard/apps', label: 'Apps', icon: Grid3X3 },
      { href: '/dashboard/activity', label: 'Activity', icon: Activity },
      { href: '/dashboard/notifications', label: 'Notifications', icon: Bell },
    ],
  },
  {
    label: 'Content',
    items: [
      { href: '/dashboard/forms', label: 'My Forms', icon: FileText },
    ],
  },
  {
    label: 'Account',
    items: [
      { href: '/dashboard/settings', label: 'All Settings', icon: Settings },
      { href: '/dashboard/settings/account', label: 'Account', icon: UserCircle },
      { href: '/dashboard/settings/profile', label: 'Profile', icon: UserCircle },
      { href: '/dashboard/settings/security', label: 'Security', icon: Shield },
      { href: '/dashboard/settings/sessions', label: 'Sessions', icon: Monitor },
      { href: '/dashboard/settings/passkeys', label: 'Passkeys', icon: Fingerprint },
      { href: '/dashboard/settings/mfa', label: '2-Step Verification', icon: Key },
      { href: '/dashboard/settings/privacy', label: 'Privacy', icon: Lock },
      { href: '/dashboard/settings/preferences', label: 'Preferences', icon: SlidersHorizontal },
    ],
  },
];

const FOOTER_LINKS = [
  { href: '/dashboard/settings', label: 'All Settings', icon: Settings },
  { href: '/dashboard/help', label: 'Help & Support', icon: HelpCircle },
];

export default function DashboardClientLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [config, setConfig] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [apps, setApps] = useState<AppLink[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const router = useRouter();
  const pathname = usePathname();
  const { isDark, toggle } = useThemeToggle();

  useEffect(() => {
    getCurrentUser().then(u => {
      if (!u) { window.location.href = getLoginUrl(); return; }
      setUser(u);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    api.get<{ notifications?: any[] }>('/api/notifications?limit=8')
      .then(d => {
        const list = (d?.notifications || []).map((n: any) => ({
          id: n.id,
          title: n.title || n.message || 'Notification',
          body: n.body || '',
          time: n.createdAt ? new Date(n.createdAt).toLocaleDateString() : '',
          unread: !n.read,
          href: n.href || '/dashboard/notifications',
        }));
        setNotifications(list);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    api.get<{ config: any; branding?: any }>('/api/public/app-config?app=dashboard')
      .then(data => {
        if (data?.config) {
          const branding = data?.branding || {};
          setConfig({
            ...data.config,
            brand: {
              name: branding.brandName || data.config.brand?.name || 'Tirbeo',
              logo: branding.logoUrl || data.config.brand?.logo || '',
              ...(data.config.brand || {}),
            },
          });
          if (data.config.apps) {
            setApps(data.config.apps);
          }
        }
      })
      .catch(() => {});
    api.get<{ config: any }>('/api/public/app-config?app=_apps')
      .then(data => {
        if (data?.config?.apps) setApps(data.config.apps);
      })
      .catch(() => {});
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[var(--color-bg)]">
        <div className="animate-spin w-8 h-8 border-2 border-[var(--color-primary)] border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <>
      {/* Theme Toggle */}
      <button
        onClick={toggle}
        className="theme-toggle"
        aria-label={`Switch to ${isDark ? 'light' : 'dark'} theme`}
      >
        {isDark ? <Sun className="h-5 w-5" strokeWidth={2} /> : <Moon className="h-5 w-5" strokeWidth={2} />}
      </button>
      <DashboardShell
        navSections={NAV_SECTIONS}
        footerLinks={FOOTER_LINKS}
        apps={apps}
        brand={config.brand}
        user={user}
        onLogout={() => { window.location.href = accountsUrl('/logout'); }}
        onNavigate={href => router.push(href)}
        currentPath={pathname}
        onSearch={query => {
          if (query.trim()) router.push(`/dashboard/activity?q=${encodeURIComponent(query)}`);
        }}
        searchPlaceholder="Search apps, settings, activity..."
        searchGroups={NAV_SECTIONS.map(section => ({
          label: section.label,
          items: section.items.map(item => ({ label: item.label, href: item.href, icon: item.icon })),
        }))}
        notifications={notifications}
        onMarkAllRead={() => {
          setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
        }}
      >
        {children}
      </DashboardShell>
    </>
  );
}
