'use client';

import { useEffect, useState } from 'react';
import { api } from '../../../lib/api-client';
import { Bell, CheckCheck } from 'lucide-react';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);

  const fetch = () => {
    api.get('/api/notifications?limit=50').then((d: any) => setNotifications(d?.notifications || [])).catch(() => {});
  };

  useEffect(fetch, []);

  const markRead = async (id: string) => {
    await api.patch('/api/notifications', { notificationIds: [id] }).catch(() => {});
    fetch();
  };

  const groups: Record<string, any[]> = {};
  const today = new Date().toLocaleDateString();
  const yesterday = new Date(Date.now() - 86400000).toLocaleDateString();
  notifications.forEach(n => {
    const date = n.createdAt ? new Date(n.createdAt).toLocaleDateString() : 'Earlier';
    const label = date === today ? 'Today' : date === yesterday ? 'Yesterday' : 'Earlier';
    if (!groups[label]) groups[label] = [];
    groups[label].push(n);
  });

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-semibold text-[var(--color-text)] mb-6">Notifications</h1>
      {Object.keys(groups).length === 0 ? (
        <div className="p-12  bg-[var(--color-surface)] border-2 border-[var(--color-border)] text-center">
          <Bell className="w-10 h-10 mx-auto mb-3 text-[var(--color-text-secondary)]" />
          <p className="text-[var(--color-text-secondary)]">No notifications yet.</p>
        </div>
      ) : Object.entries(groups).map(([group, items]) => (
        <div key={group} className="mb-6">
          <h3 className="text-sm font-medium text-[var(--color-text-secondary)] uppercase tracking-wider mb-3">{group}</h3>
          <div className="space-y-1">
            {items.map(n => (
              <div key={n.id} className={`flex items-start gap-4 p-4 rounded-lg border transition-colors cursor-pointer ${n.read ? 'border-transparent hover:bg-[var(--color-surface-muted)]' : 'border-[var(--color-primary-surface)] bg-[var(--color-primary-surface)]'}`} onClick={() => !n.read && markRead(n.id)}>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-[var(--color-text)]">{n.title || n.message}</p>
                  <p className="text-xs text-[var(--color-text-secondary)] mt-1">{n.createdAt ? new Date(n.createdAt).toLocaleString() : ''}</p>
                </div>
                {!n.read && <div className="w-2 h-2 mt-2 rounded-full bg-[var(--color-primary)] flex-shrink-0" />}
                {n.read && <CheckCheck className="w-4 h-4 mt-1.5 text-[var(--color-text-secondary)] flex-shrink-0" />}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
