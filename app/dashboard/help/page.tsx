'use client';

import { useEffect, useState } from 'react';
import { api } from '../../../lib/api-client';
import { Search, HelpCircle, MessageCircle, FileText } from 'lucide-react';

const POPULAR = [
  { title: 'Getting started with Tirbeo', icon: FileText },
  { title: 'Account security', icon: HelpCircle },
  { title: 'Managing your forms', icon: FileText },
  { title: 'Privacy settings', icon: HelpCircle },
  { title: 'Troubleshooting', icon: HelpCircle },
];

export default function HelpPage() {
  const [articles, setArticles] = useState<any[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get('/api/public/help-config').then((d: any) => setArticles(d?.articles || [])).catch(() => {});
  }, []);

  const filtered = articles.filter(a => a.title?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-semibold text-[var(--color-text)] mb-2">How can we help?</h1>
        <div className="relative max-w-md mx-auto mt-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-secondary)]" />
          <input type="text" placeholder="Search help..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3  bg-[var(--color-surface)] border-2 border-[var(--color-border)] text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)] transition-colors" />
        </div>
      </div>

      <section className="mb-10">
        <h2 className="text-sm font-medium text-[var(--color-text-secondary)] uppercase tracking-wider mb-4">Popular topics</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {POPULAR.map((item, i) => (
            <button key={i} className="flex items-center gap-4 p-4  bg-[var(--color-surface)] border-2 border-[var(--color-border)] hover:shadow-[var(--shadow-card)] transition-all text-left">
              <item.icon className="w-5 h-5 text-[var(--color-primary)] flex-shrink-0" />
              <span className="text-sm font-medium text-[var(--color-text)]">{item.title}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="p-6  bg-[var(--color-primary-surface)] border border-[var(--color-primary)]/20 text-center">
        <MessageCircle className="w-8 h-8 mx-auto mb-3 text-[var(--color-primary)]" />
        <h3 className="font-medium text-[var(--color-text)] mb-1">Still need help?</h3>
        <p className="text-sm text-[var(--color-text-secondary)] mb-4">Contact our support team for assistance.</p>
        <a href="/dashboard/support" className="inline-flex px-4 py-2.5 rounded-lg bg-[var(--color-accent)] text-[var(--color-on-accent)] text-sm font-medium hover:bg-[var(--color-accent-hover)] transition-colors">
          Contact support
        </a>
      </section>
    </div>
  );
}
