'use client';

import { useState } from 'react';
import { api } from '../../../../../lib/api-client';
import { useRouter } from 'next/navigation';
import { ArrowLeft, AlertTriangle } from 'lucide-react';

export default function DeleteAccountPage() {
  const [confirm, setConfirm] = useState('');
  const [step, setStep] = useState<'confirm' | 'reauth' | 'done'>('confirm');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (confirm !== 'DELETE') return;
    setLoading(true);
    try {
      await api.post('/api/user/delete-account');
      setStep('done');
    } catch {}
    setLoading(false);
  };

  if (step === 'done') {
    return (
      <div className="p-6 lg:p-8 max-w-lg mx-auto text-center">
        <div className="p-8  bg-[var(--color-surface)] border-2 border-[var(--color-border)]">
          <h1 className="text-xl font-semibold text-[var(--color-text)] mb-2">Account deletion scheduled</h1>
          <p className="text-sm text-[var(--color-text-secondary)] mb-6">Your account deletion has been requested. You will receive a confirmation email.</p>
          <button onClick={() => router.push('/dashboard')} className="px-4 py-2.5 rounded-lg bg-[var(--color-accent)] text-[var(--color-on-accent)] text-sm font-medium">Return to dashboard</button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-lg mx-auto">
      <button onClick={() => router.back()} className="flex items-center gap-1 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text)] mb-6">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>
      <div className="p-8  bg-[var(--color-surface)] border border-[var(--color-error)]/20">
        <div className="w-12 h-12 rounded-full bg-[var(--color-error)]/10 flex items-center justify-center mb-4 mx-auto">
          <AlertTriangle className="w-6 h-6 text-[var(--color-error)]" />
        </div>
        <h1 className="text-xl font-semibold text-[var(--color-text)] text-center mb-2">Delete your Tirbeo account</h1>
        <p className="text-sm text-[var(--color-text-secondary)] text-center mb-6">This action is permanent and cannot be undone. All your data will be removed.</p>

        <div className="bg-[var(--color-surface-muted)] rounded-lg p-4 mb-6 text-sm text-[var(--color-text-secondary)] space-y-2">
          <p>Deleting your account will permanently remove:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Your profile and personal information</li>
            <li>All forms and submissions</li>
            <li>Notifications and preferences</li>
            <li>Connected account data</li>
          </ul>
        </div>

        <p className="text-sm font-medium text-[var(--color-text)] mb-2">Type <span className="font-bold">DELETE</span> to confirm</p>
        <input type="text" value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="DELETE"
          className="w-full p-3 rounded-lg bg-[var(--color-surface)] border-2 border-[var(--color-border)] text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-error)] transition-colors mb-4" />

        <button onClick={handleDelete} disabled={confirm !== 'DELETE' || loading}
          className="w-full py-3 rounded-lg bg-[var(--color-error)] text-white text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-all">
          {loading ? 'Processing...' : 'Delete my account'}
        </button>
      </div>
    </div>
  );
}
