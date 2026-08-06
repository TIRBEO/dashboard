'use client';

import { useState, useEffect, useCallback } from 'react';
import { api, ApiError } from '../../../../lib/api-client';
import { accountsUrl } from '../../../../lib/auth';
import {
  Eye, EyeOff, CheckCircle, AlertCircle, Loader2, Globe, Laptop, Smartphone, Shield, Trash2, AlertTriangle,
} from 'lucide-react';
import { PasswordStrength } from '@tirbeo/ui';

interface SecurityEvent {
  id: string;
  type?: string;
  event?: string;
  description?: string;
  details?: string;
  ip?: string;
  userAgent?: string;
  createdAt: string;
  date?: string;
}

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [passLoading, setPassLoading] = useState(false);
  const [passError, setPassError] = useState('');
  const [passSuccess, setPassSuccess] = useState(false);

  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [recoveryLoading, setRecoveryLoading] = useState(false);
  const [recoveryError, setRecoveryError] = useState('');
  const [recoverySuccess, setRecoverySuccess] = useState(false);

  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const [sessions, setSessions] = useState<Session[]>([]);
  const [passkeys, setPasskeys] = useState<Passkey[]>([]);
  const [totpEnabled, setTotpEnabled] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const eventsData = await api.get<any>('/api/security/events');
        const rawList = Array.isArray(eventsData) ? eventsData : eventsData?.events || [];
        const eventList: SecurityEvent[] = rawList.map((e: any) => ({
          id: e.id,
          event: e.description || e.event || e.type || 'Security event',
          details: e.details,
          ip: e.ip,
          userAgent: e.userAgent,
          createdAt: e.date || e.createdAt,
        }));
        setEvents(eventList.slice(0, 10));
      } catch {}
    })();
    api.get('/api/security/sessions').then((d: any) => setSessions(d?.data || d || [])).catch(() => {});
    api.get('/api/passkey/list').then((d: any) => setPasskeys(Array.isArray(d) ? d : d?.passkeys || [])).catch(() => {});
    api.get('/api/security/backup-codes/list').then((d: any) => setTotpEnabled(!!d?.enabled)).catch(() => {});
    setLoading(false);
    setEventsLoading(false);
  }, []);

  const handlePasswordChange = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setPassError('');
    setPassSuccess(false);
    if (!currentPassword) { setPassError('Current password is required.'); return; }
    if (newPassword.length < 8) { setPassError('New password must be at least 8 characters.'); return; }
    if (newPassword !== confirmPassword) { setPassError('Passwords do not match.'); return; }
    setPassLoading(true);
    try {
      await api.post('/api/security/password', { currentPassword, newPassword });
      setPassSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPassSuccess(false), 4000);
    } catch (err: unknown) {
      setPassError(err instanceof ApiError ? err.message : 'Failed to change password.');
    } finally {
      setPassLoading(false);
    }
  }, [currentPassword, newPassword, confirmPassword]);

  const handleRecoveryEmail = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setRecoveryError('');
    setRecoverySuccess(false);
    if (!recoveryEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recoveryEmail)) {
      setRecoveryError('Please enter a valid email address.');
      return;
    }
    setRecoveryLoading(true);
    try {
      await api.put('/api/security/recovery-email', { email: recoveryEmail });
      setRecoverySuccess(true);
      setTimeout(() => setRecoverySuccess(false), 4000);
    } catch (err: unknown) {
      setRecoveryError(err instanceof ApiError ? err.message : 'Failed to set recovery email.');
    } finally {
      setRecoveryLoading(false);
    }
  }, [recoveryEmail]);

  const handleDeleteAccount = useCallback(async () => {
    setDeleteError('');
    if (!deletePassword) { setDeleteError('Please enter your password to confirm.'); return; }
    if (deleteConfirmText !== 'DELETE') { setDeleteError('Please type DELETE to confirm.'); return; }
    setDeleteLoading(true);
    try {
      await api.post('/api/user/delete-account', { password: deletePassword });
      window.location.href = accountsUrl('/logout');
    } catch (err: unknown) {
      setDeleteError(err instanceof ApiError ? err.message : 'Failed to delete account.');
    } finally {
      setDeleteLoading(false);
    }
  }, [deletePassword, deleteConfirmText]);

  const getEventIcon = useCallback((event: string | undefined) => {
    const t = (event || '').toLowerCase();
    if (t.includes('login') || t.includes('signin')) return <Laptop size={16} />;
    if (t.includes('password')) return <Shield size={16} />;
    if (t.includes('mfa') || t.includes('2fa') || t.includes('totp')) return <Smartphone size={16} />;
    return <Globe size={16} />;
  }, []);

  const getEventColor = useCallback((event: string | undefined) => {
    const t = (event || '').toLowerCase();
    if (t.includes('login') || t.includes('signin')) return 'var(--color-primary)';
    if (t.includes('password')) return 'var(--color-warning)';
    if (t.includes('mfa') || t.includes('2fa') || t.includes('totp')) return 'var(--color-success)';
    return 'var(--color-text-muted)';
  }, []);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
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
      <div>
        <h1 className="text-2xl font-semibold text-[var(--color-text)] mb-1">Security</h1>
        <p className="text-[var(--color-text-secondary)]">Manage your password, recovery options, and security activity.</p>
      </div>

      {error && (
        <div className="rounded-lg border border-[var(--color-error)]/30 bg-[var(--color-error)]/10 p-3">
          <p className="text-sm text-[var(--color-error)]">{error}</p>
        </div>
      )}

      <div className=" border-2 border-[var(--color-border)] bg-[var(--color-surface)]">
        <div className="grid gap-6 p-6 sm:p-8 md:grid-cols-2 md:gap-10">
          <div>
            <h2 className="text-base font-medium text-[var(--color-text)]">Change Password</h2>
            <p className="mt-2 text-sm leading-relaxed text-[var(--color-text-secondary)]">
              Use a strong password that you don&apos;t use for any other account. It must be at least 8 characters long.
            </p>
          </div>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div className="relative">
              <label htmlFor="currentPassword" className="block text-sm font-medium text-[var(--color-text)] mb-1.5">Current password</label>
              <input
                id="currentPassword" type={showCurrent ? 'text' : 'password'} value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password" autoComplete="current-password"
                className="w-full h-12 rounded-lg border-2 border-[var(--color-border)] bg-[var(--color-surface-muted)] px-4 pr-11 text-base text-[var(--color-text)] outline-none transition-colors focus:border-[var(--color-primary)]"
              />
              <button type="button" onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 top-[34px] text-[var(--color-text-muted)] hover:opacity-70" tabIndex={-1} aria-label={showCurrent ? 'Hide password' : 'Show password'}>
                {showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <div className="relative">
              <label htmlFor="newPassword" className="block text-sm font-medium text-[var(--color-text)] mb-1.5">New password</label>
              <input
                id="newPassword" type={showNew ? 'text' : 'password'} value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password" autoComplete="new-password"
                className="w-full h-12 rounded-lg border-2 border-[var(--color-border)] bg-[var(--color-surface-muted)] px-4 pr-11 text-base text-[var(--color-text)] outline-none transition-colors focus:border-[var(--color-primary)]"
              />
              <button type="button" onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-[34px] text-[var(--color-text-muted)] hover:opacity-70" tabIndex={-1} aria-label={showNew ? 'Hide password' : 'Show password'}>
                {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <PasswordStrength password={newPassword} />
            <div className="relative">
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-[var(--color-text)] mb-1.5">Confirm new password</label>
              <input
                id="confirmPassword" type={showConfirm ? 'text' : 'password'} value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password" autoComplete="new-password"
                className="w-full h-12 rounded-lg border-2 border-[var(--color-border)] bg-[var(--color-surface-muted)] px-4 pr-11 text-base text-[var(--color-text)] outline-none transition-colors focus:border-[var(--color-primary)]"
              />
              <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-[34px] text-[var(--color-text-muted)] hover:opacity-70" tabIndex={-1} aria-label={showConfirm ? 'Hide password' : 'Show password'}>
                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {passError && (
              <div className="rounded-lg border border-[var(--color-error)]/30 bg-[var(--color-error)]/10 p-3">
                <p className="text-sm text-[var(--color-error)]">{passError}</p>
              </div>
            )}
            {passSuccess && (
              <div className="rounded-lg border border-[var(--color-success)]/30 bg-[var(--color-success)]/10 p-3">
                <p className="text-sm flex items-center gap-1.5 text-[var(--color-success)]"><CheckCircle size={16} /> Password changed successfully.</p>
              </div>
            )}
            <button type="submit" disabled={passLoading || !currentPassword || !newPassword || !confirmPassword}
              className="inline-flex items-center justify-center gap-2 h-12 rounded-lg px-5 text-sm font-medium bg-[var(--color-accent)] text-[var(--color-on-accent)] hover:bg-[var(--color-accent-hover)] transition-colors disabled:opacity-50">
              {passLoading && <Loader2 size={16} className="animate-spin" />}
              {passLoading ? 'Changing...' : 'Change password'}
            </button>
          </form>
        </div>
      </div>

      <div className=" border-2 border-[var(--color-border)] bg-[var(--color-surface)]">
        <div className="grid gap-6 p-6 sm:p-8 md:grid-cols-2 md:gap-10">
          <div>
            <h2 className="text-base font-medium text-[var(--color-text)]">Recovery Email</h2>
            <p className="mt-2 text-sm leading-relaxed text-[var(--color-text-secondary)]">
              A recovery email can be used to regain access to your account if you forget your password or lose access to your device.
            </p>
          </div>
          <form onSubmit={handleRecoveryEmail} className="space-y-4">
            <div>
              <label htmlFor="recoveryEmail" className="block text-sm font-medium text-[var(--color-text)] mb-1.5">Recovery email</label>
              <input
                id="recoveryEmail" type="email" value={recoveryEmail}
                onChange={(e) => { setRecoveryEmail(e.target.value); setRecoveryError(''); }}
                placeholder="recovery@example.com" autoComplete="email"
                className="w-full h-12 rounded-lg border-2 border-[var(--color-border)] bg-[var(--color-surface-muted)] px-4 text-base text-[var(--color-text)] outline-none transition-colors focus:border-[var(--color-primary)]"
              />
            </div>
            {recoveryError && (
              <div className="rounded-lg border border-[var(--color-error)]/30 bg-[var(--color-error)]/10 p-3">
                <p className="text-sm text-[var(--color-error)]">{recoveryError}</p>
              </div>
            )}
            {recoverySuccess && (
              <div className="rounded-lg border border-[var(--color-success)]/30 bg-[var(--color-success)]/10 p-3">
                <p className="text-sm flex items-center gap-1.5 text-[var(--color-success)]"><CheckCircle size={16} /> Recovery email updated.</p>
              </div>
            )}
            <button type="submit" disabled={recoveryLoading || !recoveryEmail}
              className="inline-flex items-center justify-center gap-2 h-12 rounded-lg px-5 text-sm font-medium bg-[var(--color-accent)] text-[var(--color-on-accent)] hover:bg-[var(--color-accent-hover)] transition-colors disabled:opacity-50">
              {recoveryLoading && <Loader2 size={16} className="animate-spin" />}
              {recoveryLoading ? 'Saving...' : 'Save recovery email'}
            </button>
          </form>
        </div>
      </div>

      <div className=" border-2 border-[var(--color-border)] bg-[var(--color-surface)]">
        <div className="grid gap-6 p-6 sm:p-8 md:grid-cols-2 md:gap-10">
          <div>
            <h2 className="text-base font-medium flex items-center gap-2 text-[var(--color-error)]">
              <Trash2 size={18} />
              Delete Account
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-[var(--color-text-secondary)]">
              Permanently delete your account and all associated data. This action cannot be undone.
            </p>
          </div>
          <div className="space-y-4">
            <div className="rounded-lg border border-[var(--color-error)]/30 bg-[var(--color-error)]/10 p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle size={18} className="flex-shrink-0 mt-0.5 text-[var(--color-error)]" />
                <div>
                  <p className="text-sm font-medium text-[var(--color-error)]">Warning: This is irreversible</p>
                  <ul className="mt-2 text-sm space-y-1 text-[var(--color-text-secondary)]">
                    <li>• All your data will be permanently deleted</li>
                    <li>• Active sessions will be terminated</li>
                    <li>• Connected apps will lose access</li>
                    <li>• This action cannot be undone</li>
                  </ul>
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="inline-flex items-center justify-center gap-2 h-12 rounded-lg border border-[var(--color-error)]/40 px-5 text-sm font-medium text-[var(--color-error)] hover:bg-[var(--color-error)]/10 transition-colors">
              <Trash2 size={16} />
              Delete my account
            </button>
          </div>
        </div>
      </div>

      <div className=" border-2 border-[var(--color-border)] bg-[var(--color-surface)]">
        <div className="p-6 sm:p-8 space-y-6">
          <div>
            <h2 className="text-base font-medium text-[var(--color-text)] mb-2">Two-step verification</h2>
            <p className="text-sm text-[var(--color-text-secondary)]">{totpEnabled ? 'Authenticator app enabled' : 'Authenticator app not configured'}</p>
          </div>
          <div>
            <h2 className="text-base font-medium text-[var(--color-text)] mb-2">Passkeys ({passkeys.length})</h2>
            <p className="text-sm text-[var(--color-text-secondary)]">{passkeys.length === 0 ? 'No passkeys registered' : `${passkeys.length} passkey${passkeys.length === 1 ? '' : 's'} registered`}</p>
          </div>
          <div>
            <h2 className="text-base font-medium text-[var(--color-text)] mb-2">Active sessions ({sessions.length})</h2>
            {sessions.length === 0 ? (
              <p className="text-sm text-[var(--color-text-secondary)]">No active sessions found.</p>
            ) : (
              <div className="space-y-2">
                {sessions.map(s => (
                  <div key={s.id} className="flex items-center justify-between p-3 rounded-lg bg-[var(--color-surface-muted)] border-2 border-[var(--color-border)]">
                    <p className="text-sm font-medium text-[var(--color-text)]">{s.device || s.userAgent || 'Unknown device'}</p>
                    {s.isCurrent && <span className="text-xs font-medium text-[var(--color-primary)] bg-[var(--color-primary)]/10 px-2 py-0.5 rounded-full">Current</span>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className=" border-2 border-[var(--color-border)] bg-[var(--color-surface)]">
        <div className="flex items-center gap-2 border-b border-[var(--color-border)] px-5 py-4">
          <Shield size={16} className="text-[var(--color-text-muted)]" />
          <h2 className="text-sm font-medium text-[var(--color-text)]">Recent Security Activity</h2>
        </div>
        {eventsLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin w-6 h-6 border-2 border-[var(--color-primary)] border-t-transparent rounded-full" />
          </div>
        ) : events.length === 0 ? (
          <div className="p-6 text-center text-sm text-[var(--color-text-muted)]">No security events recorded.</div>
        ) : (
          <div className="divide-y divide-[var(--color-border)]">
            {events.map((event) => (
              <div key={event.id} className="flex items-start gap-4 px-5 py-3.5">
                <div className={`mt-0.5 ${getEventColor(event.event)}`}>{getEventIcon(event.event)}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[var(--color-text)]">{event.event}</p>
                  {event.details && <p className="text-xs mt-0.5 text-[var(--color-text-secondary)]">{event.details}</p>}
                </div>
                <div className="flex-shrink-0 text-right">
                  <p className="text-xs text-[var(--color-text-muted)]">{formatDate(event.createdAt)}</p>
                  {event.ip && <p className="text-xs text-[var(--color-text-muted)]">{event.ip}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center" onClick={() => setShowDeleteConfirm(false)}>
          <div className=" border-2 border-[var(--color-border)] bg-[var(--color-surface)] p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-error)]/10">
                <Trash2 size={20} className="text-[var(--color-error)]" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-[var(--color-text)]">Delete your account?</h3>
                <p className="text-sm text-[var(--color-text-secondary)]">This action cannot be undone.</p>
              </div>
            </div>

            <p className="text-sm mb-4 text-[var(--color-text-secondary)]">
              Please enter your password and type <strong>DELETE</strong> to confirm:
            </p>

            <div className="space-y-3">
              <div>
                <label htmlFor="deletePassword" className="block text-sm font-medium text-[var(--color-text)] mb-1.5">Password</label>
                <input
                  id="deletePassword" type="password" value={deletePassword}
                  onChange={(e) => { setDeletePassword(e.target.value); setDeleteError(''); }}
                  placeholder="Enter your password"
                  className="w-full h-12 rounded-lg border-2 border-[var(--color-border)] bg-[var(--color-surface-muted)] px-4 text-base text-[var(--color-text)] outline-none transition-colors focus:border-[var(--color-primary)]"
                  autoFocus
                />
              </div>
              <div>
                <label htmlFor="deleteConfirm" className="block text-sm font-medium text-[var(--color-text)] mb-1.5">Type DELETE to confirm</label>
                <input
                  id="deleteConfirm" type="text" value={deleteConfirmText}
                  onChange={(e) => { setDeleteConfirmText(e.target.value); setDeleteError(''); }}
                  placeholder="DELETE"
                  className="w-full h-12 rounded-lg border-2 border-[var(--color-border)] bg-[var(--color-surface-muted)] px-4 text-base text-[var(--color-text)] outline-none transition-colors focus:border-[var(--color-primary)]"
                />
              </div>
            </div>

            {deleteError && (
              <div className="rounded-lg border border-[var(--color-error)]/30 bg-[var(--color-error)]/10 p-3 mt-3">
                <p className="text-sm text-[var(--color-error)]">{deleteError}</p>
              </div>
            )}

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => { setShowDeleteConfirm(false); setDeletePassword(''); setDeleteConfirmText(''); setDeleteError(''); }}
                className="h-10 rounded-lg px-4 text-sm font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-muted)] transition-colors">
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteLoading || !deletePassword || deleteConfirmText !== 'DELETE'}
                className="inline-flex items-center justify-center gap-2 h-10 rounded-lg px-4 text-sm font-medium bg-[var(--color-error)] text-white hover:opacity-90 transition-colors disabled:opacity-50">
                {deleteLoading && <Loader2 size={16} className="animate-spin" />}
                {deleteLoading ? 'Deleting...' : 'Delete account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
