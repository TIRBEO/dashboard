'use client';

import { useEffect, useState } from 'react';
import { api } from '../../../../lib/api-client';
import { User, ExternalLink } from 'lucide-react';

export default function ProfilePage() {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [bio, setBio] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');

  useEffect(() => {
    api.get('/api/profile').then((d: any) => {
      if (d) {
        setDisplayName(d.displayName || d.name || '');
        setEmail(d.email || '');
        setBio(d.bio || '');
        setPhotoUrl(d.photoUrl || '');
      }
    }).catch(() => {});
  }, []);

  return (
    <div>
      <div className="flex items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--color-text)] mb-1">Profile</h1>
          <p className="text-[var(--color-text-secondary)]">View your profile information</p>
        </div>
        <a href="https://accounts.tirbeo.app/account/profile" target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--color-primary)] text-white text-sm font-medium hover:bg-[var(--color-primary-hover)] transition-colors">
          <ExternalLink className="w-4 h-4" /> Edit in Account Settings
        </a>
      </div>

      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden">
        <div className="p-6 sm:p-8">
          <div className="flex items-center gap-5 pb-6 mb-6 border-b border-[var(--color-border)]">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-primary-surface)]">
              {photoUrl ? (
                <img src={photoUrl} alt="" className="h-full w-full rounded-full object-cover" />
              ) : (
                <User size={28} className="text-[var(--color-primary)]" />
              )}
            </div>
            <div>
              <p className="text-base font-medium text-[var(--color-text)]">{displayName || 'User'}</p>
              <p className="text-sm text-[var(--color-text-secondary)]">{email}</p>
            </div>
          </div>

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-[var(--color-text)] mb-1.5">Display name</label>
              <div className="p-3 rounded-lg bg-[var(--color-surface-muted)] border border-[var(--color-border)] text-sm text-[var(--color-text)]">
                {displayName || 'Not set'}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--color-text)] mb-1.5">Email</label>
              <div className="p-3 rounded-lg bg-[var(--color-surface-muted)] border border-[var(--color-border)] text-sm text-[var(--color-text)]">
                {email || 'Not set'}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--color-text)] mb-1.5">Bio</label>
              <div className="p-3 rounded-lg bg-[var(--color-surface-muted)] border border-[var(--color-border)] text-sm text-[var(--color-text)]">
                {bio || 'No bio'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
