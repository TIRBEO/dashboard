'use client';

import { usePathname, useRouter } from 'next/navigation';
import { UserCircle, Shield, Lock, SlidersHorizontal, Bell, Grid3X3, Key, Fingerprint, Monitor } from 'lucide-react';

type SettingItem = { href: string; label: string; icon: any };

const ACCOUNT_SETTINGS: SettingItem[] = [
  { href: '/dashboard/settings/profile', label: 'Profile', icon: UserCircle },
  { href: '/dashboard/settings/account', label: 'Account', icon: UserCircle },
  { href: '/dashboard/settings/security', label: 'Security', icon: Shield },
  { href: '/dashboard/settings/privacy', label: 'Privacy', icon: Lock },
];

const SECURITY_SETTINGS: SettingItem[] = [
  { href: '/dashboard/settings/sessions', label: 'Sessions', icon: Monitor },
  { href: '/dashboard/settings/passkeys', label: 'Passkeys', icon: Fingerprint },
  { href: '/dashboard/settings/mfa', label: '2-Step Verification', icon: Key },
];

const DASHBOARD_SETTINGS: SettingItem[] = [
  { href: '/dashboard/settings/preferences', label: 'Preferences', icon: SlidersHorizontal },
  { href: '/dashboard/settings/notifications', label: 'Notifications', icon: Bell },
  { href: '/dashboard/settings/apps', label: 'Connected apps', icon: Grid3X3 },
];

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const renderNavItem = (item: SettingItem) => {
    const active = pathname === item.href;
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
            {ACCOUNT_SETTINGS.map(renderNavItem)}
          </div>
        </div>

        <div className="mb-5">
          <p className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider px-3 mb-1.5">Security</p>
          <div className="space-y-0.5">
            {SECURITY_SETTINGS.map(renderNavItem)}
          </div>
        </div>

        <div>
          <p className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider px-3 mb-1.5">Dashboard</p>
          <div className="space-y-0.5">
            {DASHBOARD_SETTINGS.map(renderNavItem)}
          </div>
        </div>
      </nav>
      <div className="flex-1 overflow-y-auto p-6 lg:p-8">
        <div className="max-w-3xl mx-auto">
          <div className="lg:hidden mb-6">
            <h2 className="text-lg font-semibold text-[var(--color-text)] mb-3">Settings</h2>
            <div className="flex flex-wrap gap-2">
              {[...ACCOUNT_SETTINGS, ...SECURITY_SETTINGS, ...DASHBOARD_SETTINGS].map(item => {
                const active = pathname === item.href;
                return (
                  <button key={item.href} onClick={() => router.push(item.href)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${active ? 'bg-[var(--color-accent)] text-[var(--color-on-accent)]' : 'bg-[var(--color-surface-muted)] text-[var(--color-text-secondary)] hover:bg-[var(--color-border)]'}`}>
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
