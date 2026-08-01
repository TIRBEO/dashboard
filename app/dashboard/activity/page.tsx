'use client';

import { useEffect, useState } from 'react';
import { api } from '../../../lib/api-client';
import { Clock } from 'lucide-react';

export default function ActivityPage() {
  const [activities, setActivities] = useState<any[]>([]);

  useEffect(() => {
    api.get('/api/user/activity?limit=50').then((d: any) => setActivities((d as any[]) || [])).catch(() => {});
  }, []);

  const grouped: Record<string, any[]> = {};
  activities.forEach(a => {
    const date = a.createdAt ? new Date(a.createdAt).toLocaleDateString() : 'Unknown';
    if (!grouped[date]) grouped[date] = [];
    grouped[date].push(a);
  });

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-semibold text-[var(--color-text)] mb-1">Activity</h1>
      <p className="text-[var(--color-text-secondary)] mb-8">Your recent account activity</p>
      {Object.keys(grouped).length === 0 ? (
        <div className="p-12 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-center">
          <Clock className="w-10 h-10 mx-auto mb-3 text-[var(--color-text-secondary)]" />
          <p className="text-[var(--color-text-secondary)]">No activity yet.</p>
        </div>
      ) : Object.entries(grouped).map(([date, items]) => (
        <div key={date} className="mb-8">
          <h3 className="text-sm font-medium text-[var(--color-text-secondary)] uppercase tracking-wider mb-3">{date}</h3>
          <div className="space-y-1">
            {items.map(a => (
              <div key={a.id} className="flex items-start gap-4 p-3 rounded-lg hover:bg-[var(--color-surface-muted)] transition-colors">
                <div className="w-2 h-2 mt-2 rounded-full bg-[var(--color-primary)] flex-shrink-0" />
                <div>
                  <p className="text-sm text-[var(--color-text)]">{a.event_type || a.title}</p>
                  <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">{a.createdAt ? new Date(a.createdAt).toLocaleTimeString() : ''}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
