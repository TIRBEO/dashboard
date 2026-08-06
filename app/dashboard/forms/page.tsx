'use client';

import { useEffect, useState } from 'react';
import { api } from '../../../lib/api-client';
import { formsUrl } from '../../../lib/auth';
import { FileText, ExternalLink, Plus, Clock, Archive } from 'lucide-react';

interface FormEntry {
  id: string;
  name: string;
  description?: string;
  url?: string;
  enabled: boolean;
}

export default function FormsPage() {
  const [forms, setForms] = useState<FormEntry[]>([]);

  useEffect(() => {
    api.get('/api/content/apps').then((d: any) => {
      const all = Array.isArray(d) ? d : d?.data || [];
      setForms(all.filter((a: FormEntry) => a.name?.toLowerCase().includes('form')));
    }).catch(() => {});
  }, []);

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-semibold text-[var(--color-text)] mb-1">My Forms</h1>
          <p className="text-[var(--color-text-secondary)]">View and manage your submitted forms</p>
        </div>
        <a href={formsUrl('/forms/new')} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[var(--color-accent)] text-[var(--color-on-accent)] text-sm font-medium hover:bg-[var(--color-accent-hover)] transition-colors">
          <Plus className="w-4 h-4" /> New form
        </a>
      </div>

      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        <a href={formsUrl('/forms')} className="p-5  bg-[var(--color-surface)] border-2 border-[var(--color-border)] hover:shadow-[var(--shadow-card)] transition-all">
          <FileText className="w-6 h-6 text-[var(--color-primary)] mb-3" />
          <p className="text-lg font-semibold text-[var(--color-text)]">My forms</p>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">Manage your created forms</p>
        </a>
        <a href={formsUrl('/forms')} className="p-5  bg-[var(--color-surface)] border-2 border-[var(--color-border)] hover:shadow-[var(--shadow-card)] transition-all">
          <Clock className="w-6 h-6 text-[var(--color-primary)] mb-3" />
          <p className="text-lg font-semibold text-[var(--color-text)]">Recent submissions</p>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">View latest form responses</p>
        </a>
        <a href={formsUrl('/forms')} className="p-5  bg-[var(--color-surface)] border-2 border-[var(--color-border)] hover:shadow-[var(--shadow-card)] transition-all">
          <Archive className="w-6 h-6 text-[var(--color-primary)] mb-3" />
          <p className="text-lg font-semibold text-[var(--color-text)]">Drafts</p>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">Continue editing drafts</p>
        </a>
      </div>

      {forms.length > 0 && (
        <section>
          <h2 className="text-lg font-medium text-[var(--color-text)] mb-4">Form applications</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {forms.map(f => (
              <div key={f.id} className="p-5  bg-[var(--color-surface)] border-2 border-[var(--color-border)] hover:shadow-[var(--shadow-card)] transition-shadow">
                <h3 className="font-medium text-[var(--color-text)] mb-1">{f.name}</h3>
                <p className="text-sm text-[var(--color-text-secondary)] mb-4">{f.description || 'Form application'}</p>
                <a href={f.url || '#'} className="inline-flex items-center gap-1 text-sm font-medium text-[var(--color-primary)] hover:underline">
                  Open <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            ))}
          </div>
        </section>
      )}

      {forms.length === 0 && (
        <div className="p-12  bg-[var(--color-surface)] border-2 border-[var(--color-border)] text-center">
          <FileText className="w-10 h-10 mx-auto mb-3 text-[var(--color-text-secondary)]" />
          <p className="text-[var(--color-text-secondary)] mb-1">No forms yet.</p>
          <p className="text-sm text-[var(--color-text-secondary)] mb-4">Create your first form to get started.</p>
          <a href={formsUrl('/forms/new')} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[var(--color-accent)] text-[var(--color-on-accent)] text-sm font-medium hover:bg-[var(--color-accent-hover)] transition-colors">
            <Plus className="w-4 h-4" /> Create form
          </a>
        </div>
      )}
    </div>
  );
}
