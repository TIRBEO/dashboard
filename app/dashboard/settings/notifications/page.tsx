'use client';

import { useEffect, useState } from 'react';
import { api } from '../../../../lib/api-client';

const CHANNELS = [
  { key: 'email', label: 'Email notifications' },
  { key: 'push', label: 'Push notifications' },
  { key: 'inApp', label: 'In-app notifications' },
];

const TOPICS = [
  { key: 'security', label: 'Security alerts', desc: 'Important security updates about your account' },
  { key: 'forms', label: 'Form activity', desc: 'Submission confirmations and form updates' },
  { key: 'product', label: 'Product updates', desc: 'New features and improvements' },
  { key: 'support', label: 'Support updates', desc: 'Replies to your support tickets' },
];

export default function NotificationPrefsPage() {
  const [prefs, setPrefs] = useState<Record<string, boolean>>({});

  useEffect(() => {
    api.get('/api/notifications/prefs').then((d: any) => {
      if (d) setPrefs(d);
    }).catch(() => {});
  }, []);

  const toggle = async (key: string) => {
    const next = { ...prefs, [key]: !prefs[key] };
    setPrefs(next);
    await api.put('/api/notifications/prefs', next).catch(() => {});
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold text-[var(--color-text)] mb-1">Notification preferences</h1>
      <p className="text-[var(--color-text-secondary)] mb-8">Choose how and when to receive notifications</p>

      <section className="mb-8">
        <h2 className="text-lg font-medium text-[var(--color-text)] mb-4">Channels</h2>
        <div className="space-y-2">
          {CHANNELS.map(ch => (
            <div key={ch.key} className="flex items-center justify-between p-4 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)]">
              <span className="text-sm text-[var(--color-text)]">{ch.label}</span>
              <button onClick={() => toggle(ch.key)} className={`relative w-10 h-6 rounded-full transition-colors ${prefs[ch.key] !== false ? 'bg-[var(--color-primary)]' : 'bg-[var(--color-border)]'}`}>
                <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${prefs[ch.key] !== false ? 'translate-x-[18px]' : 'translate-x-0.5'}`} />
              </button>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-medium text-[var(--color-text)] mb-4">Topics</h2>
        <div className="space-y-2">
          {TOPICS.map(t => (
            <div key={t.key} className="flex items-center justify-between p-4 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)]">
              <div>
                <p className="text-sm font-medium text-[var(--color-text)]">{t.label}</p>
                <p className="text-xs text-[var(--color-text-secondary)]">{t.desc}</p>
              </div>
              <button onClick={() => toggle(t.key)} className={`relative w-10 h-6 rounded-full transition-colors flex-shrink-0 ${prefs[t.key] !== false ? 'bg-[var(--color-primary)]' : 'bg-[var(--color-border)]'}`}>
                <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${prefs[t.key] !== false ? 'translate-x-[18px]' : 'translate-x-0.5'}`} />
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
