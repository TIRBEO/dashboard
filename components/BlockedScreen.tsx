'use client';

import { useEffect, useState } from 'react';
import { ShieldOff, Clock, Mail, RefreshCw, AlertTriangle, Shield, X } from 'lucide-react';

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

/* ═══ Blocked Screen ═══ */
export function BlockedScreen({ status, onRetry }: { status: BlockStatus; onRetry?: () => void }) {
  const countdown = useCountdown(status.until);
  const suspended = status.suspended && !status.banned;

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-tb-bg">
      <div className="dashboard-card max-w-[480px] w-full text-center p-10">
        <div className="w-12 h-12 rounded-xl bg-tb-red-soft text-tb-red flex items-center justify-center mx-auto mb-4">
          <ShieldOff size={24} />
        </div>
        <h1 className="text-xl font-semibold mb-2 text-tb-text-primary">
          {status.banned ? 'Account banned' : 'Account suspended'}
        </h1>
        {status.reason && (
          <p className="text-sm leading-[22px] text-tb-text-secondary mb-1.5">
            <strong>Reason:</strong> {status.reason}
          </p>
        )}
        {suspended && status.until && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-tb-surface-2 border border-tb-border text-xs font-medium mb-4 text-tb-text-secondary">
            <Clock size={12} /> Restores in {countdown === 'restored' ? 'a moment — try signing in again' : countdown}
          </div>
        )}
        <p className="text-[13px] leading-5 text-tb-text-muted mt-2">
          {status.banned
            ? 'This ban is permanent. While banned you cannot sign in, access your data, or use any Tirbeo service.'
            : 'While suspended you cannot sign in or use Tirbeo services. Your data is untouched and everything returns to normal when the suspension ends.'}
        </p>
        <div className="mt-5 flex flex-col gap-2 items-center">
          {onRetry && (
            <button className="btn btn-primary btn-sm" onClick={onRetry}>
              <RefreshCw size={13} /> I&apos;ve signed in again — retry
            </button>
          )}
          <a href="mailto:support@tirbeo.app" className="text-xs text-tb-text-muted no-underline inline-flex items-center gap-1.5">
            <Mail size={12} /> Contact support@tirbeo.app
          </a>
        </div>
      </div>
    </div>
  );
}

/* ═══ Deletion Banner — Simple one-liner ═══ */
export function DeletionBanner({
  scheduledFor,
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
    <div className="w-full flex items-center justify-center gap-3 px-4 h-10 bg-tb-surface-2 border-b border-tb-border">
      <AlertTriangle size={13} className="flex-shrink-0 text-tb-red" />
      <span className="text-[13px] text-tb-text-secondary">
        Your account is scheduled for deletion in <span className="font-semibold text-tb-red font-mono">{countdown}</span>
      </span>
      <button
        disabled={busy}
        onClick={async () => { setBusy(true); try { await onCancel(); setDone(true); try { window.dispatchEvent(new CustomEvent("tb:deletion-cancelled")); } catch {} } finally { setBusy(false); } }}
        className="inline-flex items-center gap-1.5 px-3 h-7 rounded-md text-[12px] font-medium shrink-0 transition-all duration-150 active:scale-[0.96] disabled:opacity-40 bg-tb-surface-3 text-tb-text-primary border border-tb-border"
      >
        {busy ? <span className="w-3 h-3 animate-spin rounded-full border-2 border-current border-t-transparent" /> : <Shield size={12} />}
        Cancel
      </button>
    </div>
  );
}
