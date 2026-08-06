'use client';

import { useEffect, useState } from 'react';
import { api } from '../../../lib/api-client';
import { Search, ExternalLink } from 'lucide-react';

export default function AppsPage() {
  const [apps, setApps] = useState<any[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get('/api/content/apps').then((d: any) => setApps(Array.isArray(d) ? d : d?.data || [])).catch(() => {});
  }, []);

  const filtered = apps.filter(a => a.name?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto">
      <h1 className="text-3xl font-semibold text-[var(--color-text)] mb-1">Apps</h1>
      <p className="text-[var(--color-text-secondary)] mb-6">Your Tirbeo applications</p>
      <div className="relative max-w-md mb-8">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-secondary)]" />
        <input type="text" placeholder="Search apps..." value={search} onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-[var(--color-surface-muted)] border-2 border-[var(--color-border)] text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)] transition-colors" />
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.length === 0 ? (
          <div className="col-span-full p-12  bg-[var(--color-surface)] border-2 border-[var(--color-border)] text-center">
            <p className="text-[var(--color-text-secondary)]">No apps available yet.</p>
          </div>
        ) : filtered.map(app => (
          <div key={app.id} className="p-5  bg-[var(--color-surface)] border-2 border-[var(--color-border)] hover:shadow-[var(--shadow-card)] transition-shadow">
            <div className="w-10 h-10 rounded-lg bg-[var(--color-primary-surface)] flex items-center justify-center mb-3">
              <span className="text-[var(--color-primary)] font-semibold">{app.name?.charAt(0)}</span>
            </div>
            <h3 className="font-medium text-[var(--color-text)] mb-1">{app.name}</h3>
            <p className="text-sm text-[var(--color-text-secondary)] mb-4">{app.description || app.name}</p>
            <a href={app.url || '#'} className="inline-flex items-center gap-1 text-sm font-medium text-[var(--color-primary)] hover:underline">
              Open <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
