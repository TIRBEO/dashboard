'use client';

import { useEffect, useState } from 'react';
import { api } from '../../../../lib/api-client';
import { Grid3X3, ExternalLink, Trash2, Plus, Link, Globe } from 'lucide-react';

interface UserApp {
  id: string;
  name: string;
  description?: string;
  url: string;
  icon?: string;
  color?: string;
}

interface Integration {
  id: string;
  provider: string;
  connected: boolean;
  createdAt: string;
}

export default function ConnectedAppsPage() {
  const [apps, setApps] = useState<UserApp[]>([]);
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newUrl, setNewUrl] = useState('');

  useEffect(() => {
    api.get('/api/user/apps').then((d: any) => setApps(d?.apps || [])).catch(() => {});
    api.get('/api/integrations').then((d: any) => setIntegrations(Array.isArray(d) ? d : [])).catch(() => {});
  }, []);

  const addApp = async () => {
    if (!newName.trim() || !newUrl.trim()) return;
    const d = await api.post('/api/user/apps', { name: newName.trim(), url: newUrl.trim() }).catch(() => null);
    if (d) {
      setApps(prev => [...prev, (d as any).app]);
      setNewName('');
      setNewUrl('');
    }
    setAdding(false);
  };

  const removeApp = async (id: string) => {
    await api.delete(`/api/user/apps/${id}`).catch(() => {});
    setApps(prev => prev.filter(a => a.id !== id));
  };

  const removeIntegration = async (provider: string) => {
    await api.delete(`/api/integrations/${provider}`).catch(() => {});
    setIntegrations(prev => prev.filter(i => i.provider !== provider));
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold text-[var(--color-text)] mb-1">Connected apps</h1>
      <p className="text-[var(--color-text-secondary)] mb-8">Manage applications connected to your account</p>

      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-[var(--color-text)]">Quick access apps</h2>
          <button onClick={() => setAdding(true)} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[var(--color-accent)] text-[var(--color-on-accent)] text-sm font-medium hover:bg-[var(--color-accent-hover)] transition-colors">
            <Plus className="w-4 h-4" /> Add app
          </button>
        </div>

        {adding && (
          <div className="p-4 mb-4  bg-[var(--color-surface)] border-2 border-[var(--color-border)]">
            <div className="grid sm:grid-cols-2 gap-4 mb-3">
              <input type="text" value={newName} onChange={e => setNewName(e.target.value)} placeholder="App name" className="p-3 rounded-lg bg-[var(--color-surface-muted)] border-2 border-[var(--color-border)] text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)]" />
              <input type="url" value={newUrl} onChange={e => setNewUrl(e.target.value)} placeholder="https://..." className="p-3 rounded-lg bg-[var(--color-surface-muted)] border-2 border-[var(--color-border)] text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)]" />
            </div>
            <div className="flex gap-2">
              <button onClick={addApp} className="px-4 py-2 rounded-lg bg-[var(--color-accent)] text-[var(--color-on-accent)] text-sm font-medium hover:bg-[var(--color-accent-hover)]">Save</button>
              <button onClick={() => setAdding(false)} className="px-4 py-2 rounded-lg border-2 border-[var(--color-border)] text-sm text-[var(--color-text)] hover:bg-[var(--color-surface-muted)]">Cancel</button>
            </div>
          </div>
        )}

        {apps.length === 0 && !adding && (
          <div className="p-12  bg-[var(--color-surface)] border-2 border-[var(--color-border)] text-center">
            <Globe className="w-10 h-10 mx-auto mb-3 text-[var(--color-text-secondary)]" />
            <p className="text-[var(--color-text-secondary)]">No quick access apps yet.</p>
            <p className="text-sm text-[var(--color-text-secondary)] mt-1">Add your frequently used apps for quick access.</p>
          </div>
        )}

        <div className="space-y-2">
          {apps.map(app => (
            <div key={app.id} className="flex items-center justify-between p-4  bg-[var(--color-surface)] border-2 border-[var(--color-border)]">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[var(--color-primary-surface)] flex items-center justify-center">
                  <span className="text-[var(--color-primary)] font-semibold text-sm">{app.name.charAt(0)}</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-[var(--color-text)]">{app.name}</p>
                  <p className="text-xs text-[var(--color-text-secondary)]">{app.description || app.url}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <a href={app.url} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg hover:bg-[var(--color-surface-muted)] text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors">
                  <ExternalLink className="w-4 h-4" />
                </a>
                <button onClick={() => removeApp(app.id)} className="p-2 rounded-lg hover:bg-[var(--color-surface-muted)] text-[var(--color-text-secondary)] hover:text-[var(--color-error)] transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-medium text-[var(--color-text)] mb-4">OAuth integrations</h2>
        {integrations.length === 0 ? (
          <div className="p-12  bg-[var(--color-surface)] border-2 border-[var(--color-border)] text-center">
            <Link className="w-10 h-10 mx-auto mb-3 text-[var(--color-text-secondary)]" />
            <p className="text-[var(--color-text-secondary)]">No connected applications yet.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {integrations.map(int => (
              <div key={int.id} className="flex items-center justify-between p-4  bg-[var(--color-surface)] border-2 border-[var(--color-border)]">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-[var(--color-primary-surface)] flex items-center justify-center">
                    <Link className="w-4 h-4 text-[var(--color-primary)]" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[var(--color-text)] capitalize">{int.provider}</p>
                    <p className="text-xs text-[var(--color-success)]">Connected</p>
                  </div>
                </div>
                <button onClick={() => removeIntegration(int.provider)} className="px-3 py-1.5 rounded-lg border-2 border-[var(--color-border)] text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-error)] hover:border-[var(--color-error)] transition-colors">
                  Disconnect
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
