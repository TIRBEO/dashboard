'use client';

import { useEffect, useState } from 'react';
import { api } from '../../../../lib/api-client';
import { Shield, Smartphone, Fingerprint, Monitor, ExternalLink } from 'lucide-react';

interface Session {
  id: string;
  device?: string;
  userAgent?: string;
  lastSeenAt?: string;
  isCurrent?: boolean;
}

interface Passkey {
  id: string;
  name?: string;
  createdAt: string;
  lastUsedAt?: string;
}

export default function SecurityPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [passkeys, setPasskeys] = useState<Passkey[]>([]);
  const [totpEnabled, setTotpEnabled] = useState(false);

  useEffect(() => {
    api.get('/api/security/sessions').then((d: any) => setSessions(d?.data || d || [])).catch(() => {});
    api.get('/api/passkey/list').then((d: any) => setPasskeys(Array.isArray(d) ? d : d?.passkeys || [])).catch(() => {});
    api.get('/api/security/totp/status').then((d: any) => setTotpEnabled(d?.enabled || false)).catch(() => {});
  }, []);

  return (
    <div>
      <div className="flex items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--color-text)] mb-1">Security</h1>
          <p className="text-[var(--color-text-secondary)]">View your security settings</p>
        </div>
        <a href="https://accounts.tirbeo.app/account/security" target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--color-primary)] text-white text-sm font-medium hover:bg-[var(--color-primary-hover)] transition-colors">
          <ExternalLink className="w-4 h-4" /> Manage in Account Settings
        </a>
      </div>

      <section className="mb-8">
        <h2 className="text-lg font-medium text-[var(--color-text)] mb-4">Password</h2>
        <div className="p-4 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-[var(--color-text-secondary)]" />
              <div>
                <p className="text-sm font-medium text-[var(--color-text)]">Password</p>
                <p className="text-xs text-[var(--color-text-secondary)]">Managed via accounts.tirbeo.app</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-medium text-[var(--color-text)] mb-4">Two-step verification</h2>
        <div className="p-4 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)]">
          <div className="flex items-center gap-3">
            <Smartphone className="w-5 h-5 text-[var(--color-text-secondary)]" />
            <div>
              <p className="text-sm font-medium text-[var(--color-text)]">Authenticator app</p>
              <p className="text-xs text-[var(--color-text-secondary)]">{totpEnabled ? 'Enabled' : 'Not configured'}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-medium text-[var(--color-text)] mb-4">Passkeys ({passkeys.length})</h2>
        {passkeys.length === 0 ? (
          <div className="p-4 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)]">
            <div className="flex items-center gap-3">
              <Fingerprint className="w-5 h-5 text-[var(--color-text-secondary)]" />
              <div>
                <p className="text-sm font-medium text-[var(--color-text)]">No passkeys registered</p>
                <p className="text-xs text-[var(--color-text-secondary)]">Add passkeys via accounts.tirbeo.app</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {passkeys.map(pk => (
              <div key={pk.id} className="flex items-center justify-between p-4 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)]">
                <div className="flex items-center gap-3">
                  <Fingerprint className="w-5 h-5 text-[var(--color-text-secondary)]" />
                  <div>
                    <p className="text-sm font-medium text-[var(--color-text)]">{pk.name || 'Passkey'}</p>
                    <p className="text-xs text-[var(--color-text-secondary)]">Added {new Date(pk.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-medium text-[var(--color-text)] mb-4">Active sessions ({sessions.length})</h2>
        {sessions.length === 0 ? (
          <div className="p-4 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)]">
            <p className="text-sm text-[var(--color-text-secondary)]">No active sessions found.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {sessions.map(s => (
              <div key={s.id} className="flex items-center justify-between p-4 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)]">
                <div className="flex items-center gap-3">
                  <Monitor className="w-5 h-5 text-[var(--color-text-secondary)]" />
                  <div>
                    <p className="text-sm font-medium text-[var(--color-text)]">{s.device || s.userAgent || 'Unknown device'}</p>
                    <p className="text-xs text-[var(--color-text-secondary)]">Last active: {s.lastSeenAt ? new Date(s.lastSeenAt).toLocaleString() : 'Now'}</p>
                  </div>
                </div>
                {s.isCurrent && <span className="text-xs font-medium text-[var(--color-primary)] bg-[var(--color-primary-surface)] px-2 py-0.5 rounded-full">Current</span>}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
