'use client';

import { useEffect, useState } from 'react';
import { ShieldOff, Clock, Mail, RefreshCw } from 'lucide-react';

export type BlockStatus = {
  banned?: boolean;
  suspended?: boolean;
  reason?: string;
  until?: string | null;
  message?: string;
};

function useCountdown(until?: string | null) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    if (!until) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [until]);
  if (!until) return null;
  const diff = new Date(until).getTime() - now;
  if (diff <= 0) return 'restored';
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  return d > 0 ? `${d}d ${h}h ${m}m` : h > 0 ? `${h}h ${m}m ${s}s` : `${m}m ${s}s`;
}

export function BlockedScreen({ status, onRetry }: { status: BlockStatus; onRetry?: () => void }) {
  const countdown = useCountdown(status.until);
  const suspended = status.suspended && !status.banned;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div className="dashboard-card" style={{ maxWidth: 520, width: '100%', textAlign: 'center', padding: 40 }}>
        <div style={{ width: 56, height: 56, borderRadius: 16, background: 'var(--tb-red-soft, rgba(220,38,38,.12))', color: 'var(--tb-red)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
          <ShieldOff size={26} />
        </div>
        <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>
          {status.banned ? 'Account banned' : 'Account suspended'}
        </h1>
        {status.reason && (
          <p style={{ fontSize: 14.5, lineHeight: '24px', color: 'var(--tb-text-secondary)', marginBottom: 6 }}>
            <strong>Reason:</strong> {status.reason}
          </p>
        )}
        {suspended && status.until && (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '7px 14px', borderRadius: 999, background: 'var(--tb-surface-3)', fontSize: 13, fontWeight: 600, marginBottom: 18 }}>
            <Clock size={13} /> Restores in {countdown === 'restored' ? 'a moment — try signing in again' : countdown}
          </div>
        )}
        <p style={{ fontSize: 13.5, lineHeight: '23px', color: 'var(--tb-text-muted)', margin: suspended ? '10px 0 0' : '12px 0 0' }}>
          {status.banned
            ? 'This ban is permanent. While banned you cannot sign in, access your data, or use any Tirbeo service.'
            : 'While suspended you cannot sign in or use Tirbeo services. Your data is untouched and everything returns to normal when the suspension ends.'}
        </p>

        <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center' }}>
          {onRetry && (
            <button className="btn btn-primary btn-sm" onClick={onRetry} style={{ gap: 7 }}>
              <RefreshCw size={13} /> I&apos;ve signed in again — retry
            </button>
          )}
          <a href="mailto:support@tirbeo.app" style={{ fontSize: 13, color: 'var(--tb-blue)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <Mail size={13} /> Contact support@tirbeo.app
          </a>
        </div>
      </div>
    </div>
  );
}

export function DeletionBanner({
  scheduledFor,
  reason,
  onCancel,
}: {
  scheduledFor: string;
  reason?: string | null;
  onCancel: () => Promise<void> | void;
}) {
  const countdown = useCountdown(scheduledFor);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  if (done || countdown === 'restored') return null;

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap',
      padding: '12px 18px', borderRadius: 12,
      border: '1px solid var(--tb-red)', background: 'var(--tb-red-soft, rgba(220,38,38,.08))',
      marginBottom: 20,
    }}>
      <div style={{ flex: 1, minWidth: 240 }}>
        <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--tb-red)' }}>
          Your account will be permanently deleted on {new Date(scheduledFor).toLocaleString()}
        </div>
        <div style={{ fontSize: 12.5, color: 'var(--tb-text-secondary)', marginTop: 2 }}>
          {countdown ? `Time remaining: ${countdown}. ` : ''}
          {reason ? `Reason given: ${reason}. ` : ''}
          Cancel anytime before then to keep your account.
        </div>
      </div>
      <button
        className="btn btn-secondary btn-sm"
        disabled={busy}
        onClick={async () => { setBusy(true); try { await onCancel(); setDone(true); } finally { setBusy(false); } }}
      >
        Cancel deletion
      </button>
    </div>
  );
}
