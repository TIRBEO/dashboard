'use client';

import { useEffect, useState } from 'react';
import { api } from '../../../../lib/api-client';
import { Sun, Moon, Monitor, Contrast } from 'lucide-react';

export default function PreferencesPage() {
  const [theme, setTheme] = useState('system');
  const [language, setLanguage] = useState('en');
  const [timezone, setTimezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/api/preferences').then((d: any) => {
      if (d?.theme) setTheme(d.theme);
      if (d?.language) setLanguage(d.language);
      if (d?.timezone) setTimezone(d.timezone);
    }).catch(() => {});
  }, []);

  const save = async () => {
    setSaving(true);
    await api.patch('/api/preferences', { theme, language, timezone }).catch(() => {});
    setSaving(false);
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold text-[var(--color-text)] mb-1">Preferences</h1>
      <p className="text-[var(--color-text-secondary)] mb-8">Customize your experience</p>

      <section className="mb-8">
        <h2 className="text-lg font-medium text-[var(--color-text)] mb-4">Appearance</h2>
        <div className="flex gap-3">
          {[
            { value: 'light', label: 'Light', icon: Sun },
            { value: 'dark', label: 'Dark', icon: Moon },
            { value: 'system', label: 'System', icon: Monitor },
            { value: 'monochrome', label: 'Monochrome', icon: Contrast },
          ].map(opt => (
            <button key={opt.value} onClick={() => setTheme(opt.value)}
              className={`flex-1 flex flex-col items-center gap-2 p-4  border transition-all ${theme === opt.value ? 'border-[var(--color-primary)] bg-[var(--color-primary-surface)]' : 'border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-text-secondary)]'}`}>
              <opt.icon className={`w-6 h-6 ${theme === opt.value ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-secondary)]'}`} />
              <span className={`text-sm font-medium ${theme === opt.value ? 'text-[var(--color-primary)]' : 'text-[var(--color-text)]'}`}>{opt.label}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-medium text-[var(--color-text)] mb-4">Language & region</h2>
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-[var(--color-text)] mb-1.5">Language</label>
            <select value={language} onChange={e => setLanguage(e.target.value)}
              className="w-full p-3 rounded-lg bg-[var(--color-surface)] border-2 border-[var(--color-border)] text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)] transition-colors">
              <option value="en">English</option>
              <option value="ne">Nepali</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--color-text)] mb-1.5">Timezone</label>
            <input type="text" value={timezone} onChange={e => setTimezone(e.target.value)}
              className="w-full p-3 rounded-lg bg-[var(--color-surface)] border-2 border-[var(--color-border)] text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)] transition-colors" />
          </div>
        </div>
      </section>

      <button onClick={save} disabled={saving}
        className="px-4 py-2.5 rounded-lg bg-[var(--color-accent)] text-[var(--color-on-accent)] text-sm font-medium hover:bg-[var(--color-accent-hover)] disabled:opacity-50 transition-colors">
        {saving ? 'Saving...' : 'Save preferences'}
      </button>
    </div>
  );
}
