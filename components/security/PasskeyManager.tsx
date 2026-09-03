'use client';
import { useState, useEffect } from 'react';
import { Fingerprint, Plus, Trash2, Laptop } from 'lucide-react';
import { api } from '@/lib/api';
import { startRegistration, browserSupportsWebAuthn } from '@simplewebauthn/browser';

interface Passkey {
  id: string;
  credentialId: string;
  transports: string | null;
  deviceName: string | null;
  createdAt: string;
  updatedAt: string;
}

export function PasskeyManager({ userEmail }: { userEmail: string }) {
  const [passkeys, setPasskeys] = useState<Passkey[]>([]);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [supported] = useState(() => browserSupportsWebAuthn());

  useEffect(() => {
    fetchPasskeys();
  }, []);

  const fetchPasskeys = async () => {
    setLoading(true);
    try {
      const data = await api.get<{ passkeys: Passkey[] }>('/api/auth/passkeys');
      setPasskeys(data.passkeys || []);
    } catch {} finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    setRegistering(true);
    try {
      const optionsRes = await fetch('/api/auth/passkey/register', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!optionsRes.ok) throw new Error('Failed to get registration options');
      const { options } = await optionsRes.json();

      const credential = await startRegistration(options);

      const verifyRes = await fetch('/api/auth/passkey/verify', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential, mode: 'register' }),
      });
      if (!verifyRes.ok) throw new Error('Failed to register passkey');

      fetchPasskeys();
    } catch (err: any) {
      console.error('[PASSKEY REGISTER]', err);
    }
    setRegistering(false);
  };

  const handleDelete = async (passkeyId: string) => {
    try {
      await api.request('/api/auth/passkeys', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passkeyId }),
      });
      setPasskeys(prev => prev.filter(p => p.id !== passkeyId));
    } catch {}
  };

  if (!supported) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-[34px] h-[34px] rounded-[10px] flex items-center justify-center shrink-0 border border-tb-border bg-tb-surface-2">
            <Fingerprint size={16} />
          </div>
          <div>
            <div className="text-[15px] font-semibold text-tb-text-primary">Passkeys</div>
            <div className="text-[12px] text-tb-text-muted mt-0.5">
              Sign in with biometrics or a security key instead of a password.
            </div>
          </div>
        </div>
        <button
          onClick={handleRegister}
          disabled={registering}
          className="inline-flex items-center gap-[5px] px-3 h-8 rounded-lg text-xs font-medium bg-tb-brand text-tb-brand-text border-none hover:opacity-90 transition disabled:opacity-50"
        >
          {registering ? (
            <span className="inline-block w-3 h-3 rounded-full border-2 border-current border-t-transparent animate-[spin_0.6s_linear_infinite]" />
          ) : (
            <Plus size={14} />
          )}
          {registering ? 'Registering...' : 'Add passkey'}
        </button>
      </div>

      {loading ? (
        <div className="py-8 text-center text-[13px] text-tb-text-muted">Loading...</div>
      ) : passkeys.length === 0 ? (
        <div className="py-8 text-center text-[13px] text-tb-text-muted">
          No passkeys registered yet.
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {passkeys.map((pk) => (
            <div
              key={pk.id}
              className="flex items-center justify-between p-3 rounded-xl border border-tb-border bg-tb-surface-2"
            >
              <div className="flex items-center gap-3">
                <Laptop size={14} className="text-tb-text-muted" />
                <div>
                  <p className="text-sm text-tb-text-primary">{pk.deviceName || 'Passkey'}</p>
                  <p className="text-xs text-tb-text-muted">
                    Created {new Date(pk.createdAt).toLocaleDateString()}
                    {pk.updatedAt && ` · Last used ${new Date(pk.updatedAt).toLocaleDateString()}`}
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleDelete(pk.id)}
                className="p-1.5 rounded-lg text-tb-red hover:bg-tb-red-soft/10 transition"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
