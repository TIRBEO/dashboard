'use client';

import { useState, useEffect, useCallback } from 'react';
import { api, ApiError } from '../../../../lib/api-client';
import { Monitor, Smartphone, Trash2, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

interface Session {
  id: string;
  device?: string;
  userAgent?: string;
  ipAddress?: string;
  isCurrent?: boolean;
  lastSeenAt?: string;
  createdAt: string;
}

export default function SessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [revokingAll, setRevokingAll] = useState(false);
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');
  const [confirmDialog, setConfirmDialog] = useState<{ type: 'single' | 'all'; id?: string } | null>(null);

  const loadSessions = useCallback(async () => {
    try {
      const data = await api.get<any>('/api/security/sessions');
      setSessions(Array.isArray(data) ? data : data?.sessions || []);
    } catch (err: unknown) {
      setError(err instanceof ApiError ? err.message : 'Failed to load sessions.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadSessions(); }, [loadSessions]);

  const handleRevokeSingle = useCallback(async () => {
    if (!confirmDialog || confirmDialog.type !== 'single' || !confirmDialog.id) return;
    const id = confirmDialog.id;
    setConfirmDialog(null);
    setRevokingId(id);
    setActionError('');
    setActionSuccess('');
    try {
      await api.delete(`/api/security/sessions/${id}`);
      setSessions((prev) => prev.filter((s) => s.id !== id));
      setActionSuccess('Session revoked.');
      setTimeout(() => setActionSuccess(''), 3000);
    } catch (err: unknown) {
      setActionError(err instanceof ApiError ? err.message : 'Failed to revoke session.');
    } finally {
      setRevokingId(null);
    }
  }, [confirmDialog]);

  const handleRevokeAll = useCallback(async () => {
    setConfirmDialog(null);
    setRevokingAll(true);
    setActionError('');
    setActionSuccess('');
    try {
      await api.delete('/api/security/sessions/revoke-all');
      await loadSessions();
      setActionSuccess('All other sessions signed out.');
      setTimeout(() => setActionSuccess(''), 3000);
    } catch (err: unknown) {
      setActionError(err instanceof ApiError ? err.message : 'Failed to revoke sessions.');
    } finally {
      setRevokingAll(false);
    }
  }, [loadSessions]);

  const getDeviceIcon = (session: Session) => {
    const device = (session.device || '').toLowerCase();
    const ua = (session.userAgent || '').toLowerCase();
    if (device.includes('mobile') || device.includes('iphone') || device.includes('android') || ua.includes('mobile')) {
      return <Smartphone size={18} />;
    }
    return <Monitor size={18} />;
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const timeAgo = (dateStr?: string) => {
    if (!dateStr) return 'Never';
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin w-8 h-8 border-2 border-[var(--color-primary)] border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--color-text)] mb-1">Sessions</h1>
          <p className="text-[var(--color-text-secondary)]">Manage your active sessions across devices.</p>
        </div>
        {sessions.length > 0 && (
          <button
            onClick={() => setConfirmDialog({ type: 'all' })}
            disabled={revokingAll}
            className="inline-flex items-center gap-2 h-10 rounded-lg border-2 border-[var(--color-border)] bg-[var(--color-surface)] px-4 text-sm font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-muted)] transition-colors disabled:opacity-50">
            {revokingAll ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
            Sign out all other sessions
          </button>
        )}
      </div>

      {actionError && (
        <div className="rounded-lg border border-[var(--color-error)]/30 bg-[var(--color-error)]/10 p-3">
          <p className="text-sm flex items-center gap-1.5 text-[var(--color-error)]"><AlertCircle size={16} /> {actionError}</p>
        </div>
      )}
      {actionSuccess && (
        <div className="rounded-lg border border-[var(--color-success)]/30 bg-[var(--color-success)]/10 p-3">
          <p className="text-sm flex items-center gap-1.5 text-[var(--color-success)]"><CheckCircle size={16} /> {actionSuccess}</p>
        </div>
      )}

      {sessions.length === 0 ? (
        <div className=" border-2 border-[var(--color-border)] bg-[var(--color-surface)] p-12 text-center">
          <Monitor size={32} className="mx-auto mb-3 text-[var(--color-text-muted)]" />
          <h3 className="text-base font-medium text-[var(--color-text)]">No active sessions</h3>
          <p className="text-sm mt-1 text-[var(--color-text-secondary)]">Sign in to create a session.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sessions.map((session) => (
            <div key={session.id} className=" border-2 border-[var(--color-border)] bg-[var(--color-surface)] p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 min-w-0">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-[var(--color-surface-muted)] text-[var(--color-text-muted)]">
                    {getDeviceIcon(session)}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-medium text-[var(--color-text)]">
                        {session.device || 'Unknown device'}
                      </p>
                      {session.isCurrent && (
                        <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
                          Current session
                        </span>
                      )}
                    </div>
                    <p className="text-xs mt-1 text-[var(--color-text-muted)]">
                      {session.userAgent && `${session.userAgent}`}
                      {session.ipAddress && ` · ${session.ipAddress}`}
                    </p>
                    <p className="text-xs mt-0.5 text-[var(--color-text-muted)]">
                      Active {timeAgo(session.lastSeenAt)} · Created {formatDate(session.createdAt)}
                    </p>
                  </div>
                </div>
                {!session.isCurrent && (
                  <button
                    onClick={() => setConfirmDialog({ type: 'single', id: session.id })}
                    disabled={revokingId === session.id}
                    className="inline-flex items-center gap-1.5 h-9 rounded-lg border-2 border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-xs font-medium text-[var(--color-text-muted)] hover:text-[var(--color-error)] hover:border-[var(--color-error)] transition-colors disabled:opacity-50 flex-shrink-0">
                    {revokingId === session.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                    Revoke
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {confirmDialog && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center" onClick={() => setConfirmDialog(null)}>
          <div className=" border-2 border-[var(--color-border)] bg-[var(--color-surface)] p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-base font-semibold text-[var(--color-text)]">
              {confirmDialog.type === 'all' ? 'Sign out all other sessions?' : 'Revoke session?'}
            </h3>
            <p className="text-sm mt-2 text-[var(--color-text-secondary)]">
              {confirmDialog.type === 'all'
                ? 'This will sign out all sessions except your current one. You may need to sign in again on other devices.'
                : 'This will sign this device out of your account.'}
            </p>
            <div className="flex justify-end gap-4 mt-6">
              <button
                onClick={() => setConfirmDialog(null)}
                className="h-10 rounded-lg border-2 border-[var(--color-border)] bg-[var(--color-surface)] px-4 text-sm font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-muted)] transition-colors">
                Cancel
              </button>
              <button
                onClick={confirmDialog.type === 'all' ? handleRevokeAll : handleRevokeSingle}
                className="h-10 rounded-lg px-4 text-sm font-medium bg-[var(--color-error)] text-white hover:opacity-90 transition-colors">
                {confirmDialog.type === 'all' ? 'Sign out' : 'Revoke'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
