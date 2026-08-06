'use client';

import { useEffect, useState } from 'react';
import { getCurrentUser } from '../../../../lib/auth';
import { CheckCircle } from 'lucide-react';

export default function AccountPage() {
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');

  useEffect(() => {
    getCurrentUser().then(u => {
      setEmail(u?.email || '');
      setDisplayName(u?.name || '');
    });
  }, []);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-[var(--color-text)] mb-1">Account</h1>
        <p className="text-[var(--color-text-secondary)]">Your Tirbeo account information</p>
      </div>

      <div className=" border-2 border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden">
        <div className="p-6 sm:p-8">
          <h2 className="text-lg font-medium text-[var(--color-text)] mb-4">Account information</h2>
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-[var(--color-text)] mb-1.5">Display name</label>
              <div className="p-3 rounded-lg bg-[var(--color-surface-muted)] border-2 border-[var(--color-border)] text-sm text-[var(--color-text)]">
                {displayName || 'Not set'}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--color-text)] mb-1.5">Email</label>
              <div className="flex items-center gap-2 p-3 rounded-lg bg-[var(--color-surface-muted)] border-2 border-[var(--color-border)]">
                <span className="text-sm text-[var(--color-text)]">{email}</span>
                <CheckCircle className="w-4 h-4 text-[var(--color-success)]" />
                <span className="text-xs text-[var(--color-success)]">Verified</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--color-text)] mb-1.5">Account type</label>
              <div className="p-3 rounded-lg bg-[var(--color-surface-muted)] border-2 border-[var(--color-border)] text-sm text-[var(--color-text)]">
                Tirbeo Account
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
