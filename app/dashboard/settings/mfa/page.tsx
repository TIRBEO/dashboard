'use client';

import { useState, useEffect, useCallback } from 'react';
import { api, ApiError } from '../../../../lib/api-client';
import { OTPInput } from '@tirbeo/ui';
import {
  ShieldCheck, ShieldOff, Smartphone, Key, CheckCircle, AlertCircle, Loader2, Copy, Check,
} from 'lucide-react';

interface TotpSetup {
  secret: string;
  uri: string;
}

interface BackupCode {
  code: string;
  used?: boolean;
  usedAt?: string;
}

export default function MFAPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [enabled, setEnabled] = useState(false);

  const [step, setStep] = useState<'idle' | 'setup' | 'verify' | 'codes'>('idle');
  const [setupData, setSetupData] = useState<TotpSetup | null>(null);
  const [otp, setOtp] = useState('');
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [verifyError, setVerifyError] = useState('');
  const [backupCodes, setBackupCodes] = useState<BackupCode[]>([]);
  const [codesLoading, setCodesLoading] = useState(false);
  const [codesRevealed, setCodesRevealed] = useState(false);
  const [copied, setCopied] = useState(false);

  const [disableConfirm, setDisableConfirm] = useState(false);
  const [disabling, setDisabling] = useState(false);
  const [disableCode, setDisableCode] = useState('');
  const [disableError, setDisableError] = useState('');
  const [regenerating, setRegenerating] = useState(false);

  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const codesData = await api.get<any>('/api/security/backup-codes/list').catch(() => null);
        const count = typeof codesData?.count === 'number' ? codesData.count : 0;
        if (count > 0) setEnabled(true);
      } catch {}
      setLoading(false);
    })();
  }, []);

  const handleSetup = useCallback(async () => {
    setError('');
    try {
      const data = await api.post<any>('/api/security/totp/setup');
      setSetupData(data);
      setStep('setup');
    } catch (err: unknown) {
      setError(err instanceof ApiError ? err.message : 'Failed to start setup.');
    }
  }, []);

  const handleVerify = useCallback(async () => {
    if (otp.length !== 6) return;
    setVerifyLoading(true);
    setVerifyError('');
    try {
      const data = await api.post<any>('/api/security/totp/verify', { code: otp });
      setEnabled(true);
      setStep('codes');
      setBackupCodes((data?.backupCodes || []).map((c: string | BackupCode) => (typeof c === 'string' ? { code: c } : c)));
      setCodesRevealed(true);
    } catch (err: unknown) {
      setVerifyError(err instanceof ApiError ? err.message : 'Invalid code. Try again.');
      setOtp('');
    } finally {
      setVerifyLoading(false);
    }
  }, [otp]);

  const handleRegenerate = useCallback(async () => {
    setRegenerating(true);
    setActionError('');
    try {
      const data = await api.post<any>('/api/security/backup-codes/regenerate');
      const codes = Array.isArray(data) ? data : data?.codes || [];
      setBackupCodes(codes.map((c: string | BackupCode) => (typeof c === 'string' ? { code: c } : c)));
      setCodesRevealed(true);
      setActionSuccess('Backup codes regenerated.');
      setTimeout(() => setActionSuccess(''), 4000);
    } catch (err: unknown) {
      setActionError(err instanceof ApiError ? err.message : 'Failed to regenerate codes.');
    } finally {
      setRegenerating(false);
    }
  }, []);

  const handleDisable = useCallback(async () => {
    if (disableCode.length !== 6) {
      setDisableError('Enter the 6-digit code from your authenticator app.');
      return;
    }
    setDisabling(true);
    setActionError('');
    setDisableError('');
    try {
      await api.request('/api/security/totp/disable', {
        method: 'DELETE',
        body: JSON.stringify({ totpCode: disableCode }),
      });
      setEnabled(false);
      setStep('idle');
      setSetupData(null);
      setBackupCodes([]);
      setCodesRevealed(false);
      setDisableConfirm(false);
      setDisableCode('');
      setActionSuccess('Two-step verification disabled.');
      setTimeout(() => setActionSuccess(''), 4000);
    } catch (err: unknown) {
      setDisableError(err instanceof ApiError ? err.message : 'Failed to disable.');
    } finally {
      setDisabling(false);
    }
  }, [disableCode]);

  const handleCopyCodes = useCallback(() => {
    const text = backupCodes.map((b) => b.code).join('\n');
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [backupCodes]);

  const availableCodes = backupCodes.filter((b) => !b.used);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin w-8 h-8 border-2 border-[var(--color-primary)] border-t-transparent rounded-full" />
      </div>
    );
  }

  if (step === 'setup' && setupData) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--color-text)] mb-1">2-Step Verification</h1>
          <p className="text-[var(--color-text-secondary)]">Scan the QR code or enter the secret key in your authenticator app.</p>
        </div>

        <div className=" border-2 border-[var(--color-border)] bg-[var(--color-surface)] p-6 sm:p-8">
          <div className="flex flex-col items-center text-center mb-6">
            <div className="flex h-16 w-16 items-center justify-center  bg-[var(--color-primary)]/10 mb-4">
              <Smartphone size={28} className="text-[var(--color-primary)]" />
            </div>
            <h2 className="text-lg font-medium text-[var(--color-text)]">Scan QR Code</h2>
            <p className="text-sm mt-1 text-[var(--color-text-secondary)]">Use your authenticator app to scan this code.</p>
          </div>

          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center justify-center w-48 h-48 border-2 border-[var(--color-border)] bg-[var(--color-surface-muted)] p-2 rounded-lg">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(setupData.uri)}`}
                alt="QR Code for TOTP setup"
                className="w-full h-full"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
            </div>

            <div className="flex items-center gap-2 rounded-lg border-2 border-[var(--color-border)] px-4 py-2.5 bg-[var(--color-surface-muted)]">
              <code className="text-sm font-mono select-all text-[var(--color-text)]">{setupData.secret}</code>
              <button
                onClick={() => { navigator.clipboard.writeText(setupData.secret); }}
                className="text-[var(--color-text-muted)] hover:opacity-70 transition-opacity"
                aria-label="Copy secret key"
              >
                <Copy size={16} />
              </button>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-[var(--color-border)]">
            <h3 className="text-sm font-medium mb-3 text-[var(--color-text)]">Enter the code from the app</h3>
            <OTPInput value={otp} onChange={setOtp} error={!!verifyError} />
            {verifyError && (
              <p className="text-sm text-center mt-3 text-[var(--color-error)]">{verifyError}</p>
            )}
            <div className="flex items-center justify-center gap-4 mt-5">
              <button
                onClick={() => { setStep('idle'); setSetupData(null); setOtp(''); setVerifyError(''); }}
                className="h-12 rounded-lg border-2 border-[var(--color-border)] bg-[var(--color-surface)] px-4 text-sm font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-muted)] transition-colors">
                Cancel
              </button>
              <button
                onClick={handleVerify}
                disabled={otp.length !== 6 || verifyLoading}
                className="inline-flex items-center justify-center gap-2 h-12 rounded-lg px-5 text-sm font-medium bg-[var(--color-accent)] text-[var(--color-on-accent)] hover:bg-[var(--color-accent-hover)] transition-colors disabled:opacity-50">
                {verifyLoading && <Loader2 size={16} className="animate-spin" />}
                {verifyLoading ? 'Verifying...' : 'Verify & enable'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'codes') {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--color-text)] mb-1">2-Step Verification</h1>
          <p className="text-[var(--color-text-secondary)]">Two-step verification is now enabled. Save your backup codes in a safe place.</p>
        </div>

        <div className=" border-2 border-[var(--color-border)] bg-[var(--color-surface)] p-6 sm:p-8">
          <div className="flex items-center gap-2 mb-4">
            <ShieldCheck size={18} className="text-[var(--color-success)]" />
            <h2 className="text-base font-medium text-[var(--color-text)]">Backup Codes</h2>
          </div>
          <p className="text-sm mb-4 text-[var(--color-text-secondary)]">
            Each code can be used once to sign in if you lose access to your authenticator app. Store them somewhere safe.
          </p>

          <div className="grid grid-cols-2 gap-2 mb-4">
            {backupCodes.map((bc, i) => (
              <div key={i} className="rounded-lg border-2 border-[var(--color-border)] px-3 py-2 font-mono text-sm text-center bg-[var(--color-surface-muted)] text-[var(--color-text)]">
                {bc.code}
              </div>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleCopyCodes}
              className="inline-flex items-center gap-1.5 h-10 rounded-lg border-2 border-[var(--color-border)] bg-[var(--color-surface)] px-4 text-sm font-medium text-[var(--color-text)] hover:bg-[var(--color-surface-muted)] transition-colors">
              {copied ? <Check size={14} className="text-[var(--color-success)]" /> : <Copy size={14} />}
              {copied ? 'Copied' : 'Copy codes'}
            </button>
          </div>

          <div className="mt-6 pt-6 border-t border-[var(--color-border)]">
            <p className="text-sm text-[var(--color-text-secondary)]">
              <CheckCircle size={16} className="inline mr-1 text-[var(--color-success)]" />
              2-Step verification is enabled
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-[var(--color-text)] mb-1">2-Step Verification</h1>
        <p className="text-[var(--color-text-secondary)]">Add an extra layer of security to your account.</p>
      </div>

      {error && (
        <div className="rounded-lg border border-[var(--color-error)]/30 bg-[var(--color-error)]/10 p-3">
          <p className="text-sm text-[var(--color-error)]">{error}</p>
        </div>
      )}
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

      <div className=" border-2 border-[var(--color-border)] bg-[var(--color-surface)] p-6 sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center  ${enabled ? 'bg-[var(--color-success)]/10' : 'bg-[var(--color-surface-muted)]'}`}>
              {enabled ? (
                <ShieldCheck size={24} className="text-[var(--color-success)]" />
              ) : (
                <ShieldOff size={24} className="text-[var(--color-text-muted)]" />
              )}
            </div>
            <div>
              <h2 className="text-base font-medium text-[var(--color-text)]">Authenticator App</h2>
              <p className="text-sm mt-1 text-[var(--color-text-secondary)]">
                {enabled
                  ? 'Two-step verification is active. Use your authenticator app to generate codes.'
                  : 'Use an authenticator app to generate one-time codes for sign-in.'}
              </p>
              {enabled && (
                <span className="inline-flex items-center gap-1 mt-2 rounded-full px-2.5 py-0.5 text-xs font-medium bg-[var(--color-success)]/10 text-[var(--color-success)]">
                  <CheckCircle size={12} /> Enabled
                </span>
              )}
            </div>
          </div>
          <div className="flex-shrink-0">
            {enabled ? (
              <button
                onClick={() => setDisableConfirm(true)}
                disabled={disabling}
                className="inline-flex items-center gap-2 h-10 rounded-lg border border-[var(--color-error)]/40 bg-[var(--color-surface)] px-4 text-sm font-medium text-[var(--color-error)] hover:bg-[var(--color-error)]/10 transition-colors disabled:opacity-50">
                {disabling ? <Loader2 size={16} className="animate-spin" /> : <ShieldOff size={16} />}
                Disable
              </button>
            ) : (
              <button
                onClick={handleSetup}
                className="inline-flex items-center gap-2 h-10 rounded-lg px-4 text-sm font-medium bg-[var(--color-accent)] text-[var(--color-on-accent)] hover:bg-[var(--color-accent-hover)] transition-colors">
                <Smartphone size={16} />
                Set up
              </button>
            )}
          </div>
        </div>
      </div>

      {enabled && (
        <div className=" border-2 border-[var(--color-border)] bg-[var(--color-surface)] p-6 sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-[var(--color-surface-muted)] text-[var(--color-text-muted)]">
                <Key size={18} />
              </div>
              <div>
                <h2 className="text-base font-medium text-[var(--color-text)]">Backup Codes</h2>
                <p className="text-sm mt-1 text-[var(--color-text-secondary)]">
                  {availableCodes.length} unused codes remaining.
                </p>
                {codesRevealed && (
                  <div className="mt-3 grid grid-cols-2 gap-2 max-w-xs">
                    {backupCodes.map((bc, i) => (
                      <div key={i} className="rounded border-2 border-[var(--color-border)] px-2.5 py-1.5 font-mono text-xs text-center bg-[var(--color-surface-muted)] text-[var(--color-text)]">
                        {bc.code}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => setCodesRevealed(!codesRevealed)}
                className="h-10 rounded-lg border-2 border-[var(--color-border)] bg-[var(--color-surface)] px-4 text-sm font-medium text-[var(--color-text)] hover:bg-[var(--color-surface-muted)] transition-colors">
                {codesRevealed ? 'Hide codes' : 'Show codes'}
              </button>
              <button
                onClick={handleRegenerate}
                disabled={regenerating}
                className="inline-flex items-center gap-2 h-10 rounded-lg border-2 border-[var(--color-border)] bg-[var(--color-surface)] px-4 text-sm font-medium text-[var(--color-text)] hover:bg-[var(--color-surface-muted)] transition-colors disabled:opacity-50">
                {regenerating ? <Loader2 size={16} className="animate-spin" /> : null}
                {regenerating ? 'Regenerating...' : 'Regenerate codes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {disableConfirm && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center" onClick={() => { setDisableConfirm(false); setDisableCode(''); setDisableError(''); }}>
          <div className=" border-2 border-[var(--color-border)] bg-[var(--color-surface)] p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-base font-semibold text-[var(--color-text)]">Disable 2-Step Verification?</h3>
            <p className="text-sm mt-2 text-[var(--color-text-secondary)]">
              Your account will lose the extra layer of security. Enter the current code from your authenticator app to confirm.
            </p>
            <div className="mt-4">
              <label htmlFor="disableCode" className="block text-sm font-medium text-[var(--color-text)] mb-1.5">Authenticator code</label>
              <OTPInput value={disableCode} onChange={setDisableCode} error={!!disableError} />
              {disableError && (
                <p className="text-sm mt-2 text-[var(--color-error)]">{disableError}</p>
              )}
            </div>
            <div className="flex justify-end gap-4 mt-6">
              <button
                onClick={() => { setDisableConfirm(false); setDisableCode(''); setDisableError(''); }}
                className="h-10 rounded-lg border-2 border-[var(--color-border)] bg-[var(--color-surface)] px-4 text-sm font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-muted)] transition-colors">
                Cancel
              </button>
              <button
                onClick={handleDisable}
                disabled={disabling || disableCode.length !== 6}
                className="inline-flex items-center gap-2 h-10 rounded-lg px-4 text-sm font-medium bg-[var(--color-error)] text-white hover:opacity-90 transition-colors disabled:opacity-50">
                {disabling && <Loader2 size={16} className="animate-spin" />}
                {disabling ? 'Disabling...' : 'Disable'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
