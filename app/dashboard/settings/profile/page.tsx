'use client';

import { useEffect, useState, useCallback } from 'react';
import { api, ApiError } from '../../../../lib/api-client';
import { User, CheckCircle, Camera, Loader2 } from 'lucide-react';

interface UserProfile {
  id: string;
  email: string;
  displayName?: string;
  avatar?: string;
  photoUrl?: string;
  locale?: string;
  timezone?: string;
  emailVerified?: boolean;
}

const timezones = (Intl as any).supportedValuesOf?.('timeZone') || [
  'UTC', 'America/New_York', 'America/Chicago', 'America/Denver',
  'America/Los_Angeles', 'Europe/London', 'Europe/Berlin',
  'Europe/Paris', 'Asia/Tokyo', 'Asia/Shanghai', 'Asia/Kolkata',
  'Australia/Sydney', 'Pacific/Auckland',
];

const locales = [
  { value: 'en-US', label: 'English (US)' },
  { value: 'en-GB', label: 'English (UK)' },
  { value: 'es', label: 'Spanish' },
  { value: 'fr', label: 'French' },
  { value: 'de', label: 'German' },
  { value: 'ja', label: 'Japanese' },
  { value: 'zh', label: 'Chinese' },
];

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [locale, setLocale] = useState('en-US');
  const [timezone, setTimezone] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get<UserProfile>('/api/users/me')
      .then((data) => {
        setProfile(data);
        setDisplayName(data.displayName || '');
        setLocale(data.locale || 'en-US');
        setTimezone(data.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC');
      })
      .catch((err: ApiError) => setError(err.message || 'Failed to load profile.'))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) {
      setError('Display name is required.');
      return;
    }
    setSaving(true);
    setError('');
    setSaved(false);
    try {
      await api.patch('/api/users/me', { displayName: displayName.trim(), locale, timezone });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: unknown) {
      setError(err instanceof ApiError ? err.message : 'Failed to save profile.');
    } finally {
      setSaving(false);
    }
  }, [displayName, locale, timezone]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin w-8 h-8 border-2 border-[var(--color-primary)] border-t-transparent rounded-full" />
      </div>
    );
  }

  const avatar = profile?.avatar || profile?.photoUrl || '';

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-[var(--color-text)] mb-1">Profile</h1>
        <p className="text-[var(--color-text-secondary)]">Manage your personal information and preferences.</p>
      </div>

      <div className=" border-2 border-[var(--color-border)] bg-[var(--color-surface)] p-6 sm:p-8">
        <div className="flex items-center gap-5 pb-6 mb-6 border-b border-[var(--color-border)]">
          <div className="relative group">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-primary-surface)] text-[var(--color-primary)] overflow-hidden">
              {avatar ? (
                <img src={avatar} alt="" className="h-full w-full object-cover" />
              ) : (
                <User size={28} />
              )}
            </div>
            <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera size={18} className="text-white" />
            </div>
          </div>
          <div>
            <p className="text-base font-medium text-[var(--color-text)]">{profile?.displayName || 'User'}</p>
            <p className="text-sm text-[var(--color-text-secondary)]">{profile?.email}</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-5">
          <div>
            <label htmlFor="displayName" className="block text-sm font-medium text-[var(--color-text)] mb-1.5">Display name</label>
            <input
              id="displayName" type="text" value={displayName}
              onChange={(e) => { setDisplayName(e.target.value); setError(''); }}
              placeholder="Your name" autoComplete="name"
              className="w-full h-12 rounded-lg border-2 border-[var(--color-border)] bg-[var(--color-surface-muted)] px-4 text-base text-[var(--color-text)] outline-none transition-colors focus:border-[var(--color-primary)]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--color-text)] mb-1.5">Email</label>
            <div className="flex items-center gap-2.5 h-12 rounded-lg border-2 border-[var(--color-border)] px-4 bg-[var(--color-surface-muted)]">
              <span className="text-base text-[var(--color-text-secondary)]">{profile?.email || ''}</span>
              <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium bg-[var(--color-success)]/10 text-[var(--color-success)]">
                <CheckCircle size={12} /> Verified
              </span>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="locale" className="block text-sm font-medium text-[var(--color-text)] mb-1.5">Language</label>
              <select
                id="locale" value={locale} onChange={(e) => setLocale(e.target.value)}
                className="w-full h-12 rounded-lg border-2 border-[var(--color-border)] bg-[var(--color-surface-muted)] px-4 text-base text-[var(--color-text)] outline-none transition-colors focus:border-[var(--color-primary)] appearance-none"
              >
                {locales.map((l) => (
                  <option key={l.value} value={l.value}>{l.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="timezone" className="block text-sm font-medium text-[var(--color-text)] mb-1.5">Timezone</label>
              <select
                id="timezone" value={timezone} onChange={(e) => setTimezone(e.target.value)}
                className="w-full h-12 rounded-lg border-2 border-[var(--color-border)] bg-[var(--color-surface-muted)] px-4 text-base text-[var(--color-text)] outline-none transition-colors focus:border-[var(--color-primary)] appearance-none"
              >
                {timezones.map((tz) => (
                  <option key={tz} value={tz}>{tz}</option>
                ))}
              </select>
            </div>
          </div>

          {error && (
            <div className="rounded-lg border border-[var(--color-error)]/30 bg-[var(--color-error)]/10 p-3">
              <p className="text-sm text-[var(--color-error)]">{error}</p>
            </div>
          )}

          <div className="flex items-center gap-3">
            <button
              type="submit" disabled={saving}
              className="inline-flex items-center justify-center gap-2 h-12 rounded-lg px-5 text-sm font-medium bg-[var(--color-accent)] text-[var(--color-on-accent)] hover:bg-[var(--color-accent-hover)] transition-colors disabled:opacity-50"
            >
              {saving && <Loader2 size={16} className="animate-spin" />}
              {saving ? 'Saving...' : 'Save changes'}
            </button>
            {saved && (
              <span className="flex items-center gap-1.5 text-sm text-[var(--color-success)]">
                <CheckCircle size={16} /> Changes saved
              </span>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
