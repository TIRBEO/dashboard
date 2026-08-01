'use client';

import { usePathname, useRouter } from 'next/navigation';
import { UserCircle, Shield, Lock, SlidersHorizontal, Bell, Grid3X3, ExternalLink } from 'lucide-react';

const ACCOUNTS_URL = 'https://accounts.tirbeo.app';

type SettingItem = { href: string; label: string; icon: any; managedIn: 'accounts' | 'app' };

const USER_SETTINGS: SettingItem[] = [
  { href: '/dashboard/settings/profile', label: 'Profile', icon: UserCircle, managedIn: 'accounts' as const },
  { href: '/dashboard/settings/account', label: 'Account', icon: UserCircle, managedIn: 'accounts' as const },
  { href: '/dashboard/settings/security', label: 'Security', icon: Shield, managedIn: 'accounts' as const },
  { href: '/dashboard/settings/privacy', label: 'Privacy', icon: Lock, managedIn: 'accounts' as const },
];

const APP_SETTINGS: SettingItem[] = [
  { href: '/dashboard/settings/preferences', label: 'Preferences', icon: SlidersHorizontal, managedIn: 'app' as const },
  { href: '/dashboard/settings/notifications', label: 'Notifications', icon: Bell, managedIn: 'app' as const },
  { href: '/dashboard/settings/apps', label: 'Connected apps', icon: Grid3X3, managedIn: 'app' as const },
];

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const renderNavItem = (item: SettingItem) => {
    const active = pathname === item.href;
    const isManagedInAccounts = item.managedIn === 'accounts';

    if (isManagedInAccounts) {
      const accountUrl = `${ACCOUNTS_URL}/account${item.href.replace('/dashboard/settings', '')}`;
      return (
        <a key={item.href} href={accountUrl} target="_blank" rel="noopener noreferrer"
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${active ? 'bg-[var(--color-sidebar-active)] text-[var(--color-primary)] font-medium' : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-sidebar-hover)] hover:text-[var(--color-text)]'}`}>
          <item.icon className="w-4 h-4 shrink-0" />
          <span className="flex-1 min-w-0 truncate">{item.label}</span>
          <ExternalLink className="w-3 h-3 shrink-0 text-[var(--color-text-muted)]" />
        </a>
      );
    }

    return (
      <a key={item.href} href={item.href} onClick={e => { e.preventDefault(); router.push(item.href); }}
        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${active ? 'bg-[var(--color-sidebar-active)] text-[var(--color-primary)] font-medium' : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-sidebar-hover)] hover:text-[var(--color-text)]'}`}>
        <item.icon className="w-4 h-4 shrink-0" />
        <span className="flex-1 min-w-0 truncate">{item.label}</span>
      </a>
    );
  };

  return (
    <div className="flex h-full">
      <nav className="hidden lg:block w-64 border-r border-[var(--color-border)] p-4 flex-shrink-0 overflow-y-auto">
        <h2 className="text-lg font-semibold text-[var(--color-text)] mb-4 px-3">Settings</h2>

        <div className="mb-5">
          <p className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider px-3 mb-1.5">Account</p>
          <div className="space-y-0.5">
            {USER_SETTINGS.map(renderNavItem)}
          </div>
        </div>

        <div>
          <p className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider px-3 mb-1.5">Dashboard</p>
          <div className="space-y-0.5">
            {APP_SETTINGS.map(renderNavItem)}
          </div>
        </div>
      </nav>
      <div className="flex-1 overflow-y-auto p-6 lg:p-8">
        <div className="max-w-3xl mx-auto">
          <div className="lg:hidden mb-6">
            <h2 className="text-lg font-semibold text-[var(--color-text)] mb-3">Settings</h2>
            <div className="flex flex-wrap gap-2">
              {[...USER_SETTINGS, ...APP_SETTINGS].map(item => {
                const active = pathname === item.href;
                const isManagedInAccounts = item.managedIn === 'accounts';
                if (isManagedInAccounts) {
                  const accountUrl = `${ACCOUNTS_URL}/account${item.href.replace('/dashboard/settings', '')}`;
                  return (
                    <a key={item.href} href={accountUrl} target="_blank" rel="noopener noreferrer"
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${active ? 'bg-[var(--color-primary)] text-white' : 'bg-[var(--color-surface-muted)] text-[var(--color-text-secondary)] hover:bg-[var(--color-border)]'}`}>
                      {item.label} <ExternalLink className="w-3 h-3" />
                    </a>
                  );
                }
                return (
                  <button key={item.href} onClick={() => router.push(item.href)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${active ? 'bg-[var(--color-primary)] text-white' : 'bg-[var(--color-surface-muted)] text-[var(--color-text-secondary)] hover:bg-[var(--color-border)]'}`}>
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
