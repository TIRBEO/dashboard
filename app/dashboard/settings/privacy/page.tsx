'use client';

import { Lock, Download, Trash2, ArrowRight } from 'lucide-react';
import { api } from '../../../../lib/api-client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function PrivacyPage() {
  const [exporting, setExporting] = useState(false);
  const router = useRouter();

  const requestExport = async () => {
    setExporting(true);
    await api.post('/api/user/export-data').catch(() => {});
    setExporting(false);
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-[var(--color-text)] mb-1">Privacy</h1>
        <p className="text-[var(--color-text-secondary)]">Manage your privacy and data</p>
      </div>

      <section className="mb-8">
        <h2 className="text-lg font-medium text-[var(--color-text)] mb-4">Data & personalization</h2>
        <div className="p-4  bg-[var(--color-surface)] border-2 border-[var(--color-border)]">
          <p className="text-sm text-[var(--color-text-secondary)]">Privacy settings let you control how your data is used. Configure these in your account settings.</p>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-medium text-[var(--color-text)] mb-4">Download your data</h2>
        <div className="p-4  bg-[var(--color-surface)] border-2 border-[var(--color-border)]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Download className="w-5 h-5 text-[var(--color-text-secondary)]" />
              <div>
                <p className="text-sm font-medium text-[var(--color-text)]">Export your Tirbeo data</p>
                <p className="text-xs text-[var(--color-text-secondary)]">Download a copy of your account data</p>
              </div>
            </div>
            <button onClick={requestExport} disabled={exporting}
              className="px-4 py-2 rounded-lg bg-[var(--color-accent)] text-[var(--color-on-accent)] text-sm font-medium hover:bg-[var(--color-accent-hover)] disabled:opacity-50 transition-colors">
              {exporting ? 'Requesting...' : 'Request export'}
            </button>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-medium text-[var(--color-text)] mb-4">Delete account</h2>
        <div className="border-2 border-[color-mix(in srgb, var(--color-error) 40%, var(--color-border))] bg-[var(--color-surface)] p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Trash2 className="w-5 h-5 text-[var(--color-error)]" />
              <div>
                <p className="text-sm font-medium text-[var(--color-text)]">Delete your Tirbeo account</p>
                <p className="text-xs text-[var(--color-text-secondary)]">Permanently remove your account and all data</p>
              </div>
            </div>
            <button onClick={() => router.push('/dashboard/settings/security')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--color-error)] text-white text-sm font-medium hover:opacity-90 transition-opacity">
              Manage deletion <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
