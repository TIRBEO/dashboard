'use client';

import { useRouter } from 'next/navigation';
import { UserCircle, Shield, Lock, SlidersHorizontal, Bell, Grid3X3, ChevronRight } from 'lucide-react';

const CATEGORIES = [
  { href: '/dashboard/settings/account', label: 'Account', desc: 'Email, username, phone', icon: UserCircle },
  { href: '/dashboard/settings/profile', label: 'Profile', desc: 'Name, photo, bio', icon: UserCircle },
  { href: '/dashboard/settings/security', label: 'Security', desc: 'Password, 2FA, sessions', icon: Shield },
  { href: '/dashboard/settings/privacy', label: 'Privacy', desc: 'Data, personalization, downloads', icon: Lock },
  { href: '/dashboard/settings/preferences', label: 'Preferences', desc: 'Appearance, language, timezone', icon: SlidersHorizontal },
  { href: '/dashboard/settings/notifications', label: 'Notifications', desc: 'Email, push, preferences', icon: Bell },
  { href: '/dashboard/settings/apps', label: 'Connected apps', desc: 'Manage connected applications', icon: Grid3X3 },
];

export default function SettingsHub() {
  const router = useRouter();
  return (
    <div>
      <h1 className="text-3xl font-semibold text-[var(--color-text)] mb-6">Settings</h1>
      <div className="grid sm:grid-cols-2 gap-4">
        {CATEGORIES.map(cat => (
          <a key={cat.href} href={cat.href} onClick={e => { e.preventDefault(); router.push(cat.href); }}
            className="flex items-start gap-4 p-5  bg-[var(--color-surface)] border-2 border-[var(--color-border)] hover:shadow-[var(--shadow-card)] transition-all group">
            <div className="w-10 h-10 rounded-lg bg-[var(--color-primary-surface)] flex items-center justify-center flex-shrink-0">
              <cat.icon className="w-5 h-5 text-[var(--color-primary)]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-[var(--color-text)]">{cat.label}</p>
              <p className="text-sm text-[var(--color-text-secondary)]">{cat.desc}</p>
            </div>
            <ChevronRight className="w-4 h-4 text-[var(--color-text-secondary)] mt-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
          </a>
        ))}
      </div>
    </div>
  );
}
