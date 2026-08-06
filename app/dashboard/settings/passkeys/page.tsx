'use client';

import { useState, useEffect, useCallback } from 'react';
import { api, ApiError } from '../../../../lib/api-client';
import { Key, Pencil, Trash2, Plus, AlertCircle, CheckCircle, Loader2, Fingerprint } from 'lucide-react';

interface Passkey {
  id: string;
  name: string;
  createdAt: string;
  lastUsedAt?: string;
}

export default function PasskeysPage() {
  const [passkeys, setPasskeys] = useState<Passkey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState('');

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [renamingLoading, setRenamingLoading] = useState(false);

  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  const loadPasskeys = useCallback(async () => {
    try {
      const data = await api.get<any>('/api/passkey/list');
      setPasskeys(Array.isArray(data) ? data : data?.passkeys || []);
    } catch (err: unknown) {
      setError(err instanceof ApiError ? err.message : 'Failed to load passkeys.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadPasskeys(); }, [loadPasskeys]);

  const handleAddPasskey = useCallback(async () => {
    setAdding(true);
    setAddError('');
    try {
      const options = await api.post<any>('/api/passkey/register/options');
      const { startRegistration } = await import('@simplewebauthn/browser');
      const cred = await startRegistration({ optionsJSON: options });
      await api.post('/api/passkey/register/verify', cred as any);
      await loadPasskeys();
      setActionSuccess('Passkey added successfully.');
      setTimeout(() => setActionSuccess(''), 3000);
    } catch (err: unknown) {
      if (err instanceof Error) {
        if (err.name === 'SecurityError' || err.message?.includes('cancel')) {
          setAddError('Registration was cancelled.');
        } else {
          setAddError(err instanceof ApiError ? err.message : 'Failed to add passkey.');
        }
      } else {
        setAddError('Failed to add passkey.');
      }
    } finally {
      setAdding(false);
    }
  }, [loadPasskeys]);

  const handleDelete = useCallback(async () => {
    if (!deleteConfirmId) return;
    const id = deleteConfirmId;
    setDeleteConfirmId(null);
    setDeletingId(id);
    setActionError('');
    try {
      await api.delete(`/api/passkey/${id}`);
      setPasskeys((prev) => prev.filter((p) => p.id !== id));
      setActionSuccess('Passkey deleted.');
      setTimeout(() => setActionSuccess(''), 3000);
    } catch (err: unknown) {
      setActionError(err instanceof ApiError ? err.message : 'Failed to delete passkey.');
    } finally {
      setDeletingId(null);
    }
  }, [deleteConfirmId]);

  const handleRename = useCallback(async (id: string) => {
    if (!renameValue.trim()) return;
    setRenamingLoading(true);
    setActionError('');
    try {
      await api.patch(`/api/passkey/${id}`, { name: renameValue.trim() });
      setPasskeys((prev) => prev.map((p) => (p.id === id ? { ...p, name: renameValue.trim() } : p)));
      setRenamingId(null);
      setRenameValue('');
      setActionSuccess('Passkey renamed.');
      setTimeout(() => setActionSuccess(''), 3000);
    } catch (err: unknown) {
      setActionError(err instanceof ApiError ? err.message : 'Failed to rename passkey.');
    } finally {
      setRenamingLoading(false);
    }
  }, [renameValue]);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
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
          <h1 className="text-2xl font-semibold text-[var(--color-text)] mb-1">Passkeys</h1>
          <p className="text-[var(--color-text-secondary)]">Add or remove passkeys for passwordless sign-in.</p>
        </div>
        <button
          onClick={handleAddPasskey}
          disabled={adding}
          className="inline-flex items-center gap-2 h-12 rounded-lg px-5 text-sm font-medium bg-[var(--color-accent)] text-[var(--color-on-accent)] hover:bg-[var(--color-accent-hover)] transition-colors disabled:opacity-50">
          {adding ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
          {adding ? 'Adding...' : 'Add passkey'}
        </button>
      </div>

      {addError && (
        <div className="rounded-lg border border-[var(--color-error)]/30 bg-[var(--color-error)]/10 p-3">
          <p className="text-sm flex items-center gap-1.5 text-[var(--color-error)]"><AlertCircle size={16} /> {addError}</p>
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

      {passkeys.length === 0 ? (
        <div className=" border-2 border-[var(--color-border)] bg-[var(--color-surface)] p-12 text-center">
          <Fingerprint size={32} className="mx-auto mb-3 text-[var(--color-text-secondary)]" />
          <h3 className="text-base font-medium text-[var(--color-text)]">No passkeys yet</h3>
          <p className="text-sm mt-1 text-[var(--color-text-secondary)]">Add a passkey for quick, secure sign-in.</p>
          <button
            onClick={handleAddPasskey}
            disabled={adding}
            className="mt-4 inline-flex items-center gap-2 h-10 rounded-lg px-4 text-sm font-medium bg-[var(--color-accent)] text-[var(--color-on-accent)] hover:bg-[var(--color-accent-hover)] transition-colors disabled:opacity-50">
            {adding ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
            {adding ? 'Adding...' : 'Add passkey'}
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {passkeys.map((passkey) => (
            <div key={passkey.id} className=" border-2 border-[var(--color-border)] bg-[var(--color-surface)] p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 min-w-0 flex-1">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
                    <Key size={18} />
                  </div>
                  <div className="min-w-0 flex-1">
                    {renamingId === passkey.id ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={renameValue}
                          onChange={(e) => setRenameValue(e.target.value)}
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleRename(passkey.id);
                            if (e.key === 'Escape') { setRenamingId(null); setRenameValue(''); }
                          }}
                          className="h-9 rounded-lg border-2 border-[var(--color-border)] bg-[var(--color-surface-muted)] px-3 text-sm text-[var(--color-text)] outline-none"
                        />
                        <button
                          onClick={() => handleRename(passkey.id)}
                          disabled={renamingLoading || !renameValue.trim()}
                          className="h-9 rounded-lg px-3 text-xs font-medium bg-[var(--color-accent)] text-[var(--color-on-accent)] transition-colors disabled:opacity-50">
                          {renamingLoading ? '...' : 'Save'}
                        </button>
                        <button
                          onClick={() => { setRenamingId(null); setRenameValue(''); }}
                          className="h-9 rounded-lg border-2 border-[var(--color-border)] px-3 text-xs font-medium text-[var(--color-text-secondary)] transition-colors">
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <p className="text-sm font-medium text-[var(--color-text)]">{passkey.name}</p>
                    )}
                    <p className="text-xs mt-1 text-[var(--color-text-secondary)]">
                      Created {formatDate(passkey.createdAt)} · Last used {timeAgo(passkey.lastUsedAt)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button
                    onClick={() => { setRenamingId(passkey.id); setRenameValue(passkey.name); }}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border-2 border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors"
                    aria-label="Rename passkey">
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => setDeleteConfirmId(passkey.id)}
                    disabled={deletingId === passkey.id}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border-2 border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-secondary)] hover:text-[var(--color-error)] transition-colors disabled:opacity-50"
                    aria-label="Delete passkey">
                    {deletingId === passkey.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center" onClick={() => setDeleteConfirmId(null)}>
          <div className=" border-2 border-[var(--color-border)] bg-[var(--color-surface)] p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-base font-semibold text-[var(--color-text)]">Delete passkey?</h3>
            <p className="text-sm mt-2 text-[var(--color-text-secondary)]">
              This passkey will be removed from your account and can no longer be used for sign-in.
            </p>
            <div className="flex justify-end gap-4 mt-6">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="h-10 rounded-lg border-2 border-[var(--color-border)] px-4 text-sm font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-muted)] transition-colors">
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="h-10 rounded-lg px-4 text-sm font-medium bg-[var(--color-error)] text-white hover:opacity-90 transition-colors">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
