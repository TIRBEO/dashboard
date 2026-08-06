'use client';

import { useEffect, useState } from 'react';
import { api } from '../../../../lib/api-client';
import { Bell, BellOff, Mail, Smartphone, Monitor, Shield, FileText, Package, LifeBuoy, TestTube } from 'lucide-react';

const CHANNELS = [
  { key: 'email', label: 'Email notifications', icon: Mail, desc: 'Receive notifications via email' },
  { key: 'push', label: 'Push notifications', icon: Smartphone, desc: 'Browser push notifications' },
  { key: 'inApp', label: 'In-app notifications', icon: Monitor, desc: 'Notifications within the app' },
];

const TOPICS = [
  { key: 'security', label: 'Security alerts', desc: 'Important security updates about your account', icon: Shield },
  { key: 'forms', label: 'Form activity', desc: 'Submission confirmations and form updates', icon: FileText },
  { key: 'product', label: 'Product updates', desc: 'New features and improvements', icon: Package },
  { key: 'support', label: 'Support updates', desc: 'Replies to your support tickets', icon: LifeBuoy },
];

export default function NotificationPrefsPage() {
  const [prefs, setPrefs] = useState<Record<string, boolean>>({});
  const [pushSupported, setPushSupported] = useState(false);
  const [pushSubscribed, setPushSubscribed] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  useEffect(() => {
    api.get('/api/notifications/prefs').then((d: any) => {
      if (d) setPrefs(d);
    }).catch(() => {});
    
    // Check push support
    setPushSupported('serviceWorker' in navigator && 'PushManager' in window);
    checkPushSubscription();
  }, []);

  const checkPushSubscription = async () => {
    if (!('serviceWorker' in navigator)) return;
    try {
      const reg = await navigator.serviceWorker.ready;
      const subscription = await reg.pushManager.getSubscription();
      setPushSubscribed(!!subscription);
    } catch {
      setPushSubscribed(false);
    }
  };

  const toggle = async (key: string) => {
    const next = { ...prefs, [key]: !prefs[key] };
    setPrefs(next);
    await api.put('/api/notifications/prefs', next).catch(() => {});
    
    // Handle push subscription
    if (key === 'push' && pushSupported) {
      if (next.push) {
        await subscribeToPush();
      } else {
        await unsubscribeFromPush();
      }
    }
  };

  const subscribeToPush = async () => {
    try {
      const reg = await navigator.serviceWorker.ready;
      const { publicKey } = await api.get('/api/notifications/push/subscribe') as any;
      if (!publicKey) return;
      
      const subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });
      
      const sub = subscription.toJSON() as any;
      await api.post('/api/notifications/push/subscribe', {
        endpoint: sub.endpoint,
        p256dh: sub.keys?.p256dh,
        auth: sub.keys?.auth,
      });
      
      setPushSubscribed(true);
    } catch (err) {
      console.error('Push subscribe error:', err);
    }
  };

  const unsubscribeFromPush = async () => {
    try {
      const reg = await navigator.serviceWorker.ready;
      const subscription = await reg.pushManager.getSubscription();
      if (subscription) {
        await api.request('/api/notifications/push/subscribe', {
          method: 'DELETE',
          body: JSON.stringify({ endpoint: subscription.endpoint }),
        });
        await subscription.unsubscribe();
      }
      setPushSubscribed(false);
    } catch (err) {
      console.error('Push unsubscribe error:', err);
    }
  };

  const sendTestPush = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await api.post('/api/notifications/push') as any;
      setTestResult(res.message || 'Test sent!');
    } catch (err: any) {
      setTestResult(err.message || 'Failed to send test');
    }
    setTesting(false);
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-semibold text-[var(--text)] mb-1">Notification preferences</h1>
      <p className="text-[var(--text-secondary)] mb-8">Choose how and when to receive notifications</p>

      {/* Channels */}
      <section className="mb-8">
        <h2 className="text-lg font-medium text-[var(--text)] mb-4">Channels</h2>
        <div className="space-y-2">
          {CHANNELS.map(ch => {
            const Icon = ch.icon;
            return (
              <div key={ch.key} className="flex items-center justify-between p-4  bg-[var(--bg-surface)] border border-[var(--border)]">
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5 text-[var(--text-secondary)]" />
                  <div>
                    <p className="text-sm font-medium text-[var(--text)]">{ch.label}</p>
                    <p className="text-xs text-[var(--text-muted)]">{ch.desc}</p>
                  </div>
                </div>
                <button onClick={() => toggle(ch.key)} className={`relative w-10 h-6 rounded-full transition-colors ${prefs[ch.key] !== false ? 'bg-[var(--primary)]' : 'bg-[var(--border)]'}`}>
                  <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-[var(--color-surface-default)] shadow-[var(--shadow-card)] transition-transform ${prefs[ch.key] !== false ? 'translate-x-[18px]' : 'translate-x-0.5'}`} />
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* Push Test */}
      {pushSupported && prefs.push !== false && (
        <section className="mb-8">
          <div className="p-4  bg-[var(--bg-surface)] border border-[var(--border)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[var(--text)]">Push notifications {pushSubscribed ? '(Active)' : '(Inactive)'}</p>
                <p className="text-xs text-[var(--text-muted)]">Test your push notification setup</p>
              </div>
              <button
                onClick={sendTestPush}
                disabled={testing || !pushSubscribed}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--color-accent)] text-[var(--color-on-accent)] text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                <TestTube className="w-4 h-4" />
                {testing ? 'Sending...' : 'Send Test'}
              </button>
            </div>
            {testResult && (
              <p className="mt-2 text-xs text-[var(--text-secondary)]">{testResult}</p>
            )}
          </div>
        </section>
      )}

      {!pushSupported && (
        <section className="mb-8">
          <div className="p-4  bg-[var(--warning-surface)] border border-[var(--warning)]">
            <p className="text-sm text-[var(--warning)]">Push notifications are not supported in this browser.</p>
          </div>
        </section>
      )}

      {/* Topics */}
      <section>
        <h2 className="text-lg font-medium text-[var(--text)] mb-4">Topics</h2>
        <div className="space-y-2">
          {TOPICS.map(t => {
            const Icon = t.icon;
            return (
              <div key={t.key} className="flex items-center justify-between p-4  bg-[var(--bg-surface)] border border-[var(--border)]">
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5 text-[var(--text-secondary)]" />
                  <div>
                    <p className="text-sm font-medium text-[var(--text)]">{t.label}</p>
                    <p className="text-xs text-[var(--text-muted)]">{t.desc}</p>
                  </div>
                </div>
                <button onClick={() => toggle(t.key)} className={`relative w-10 h-6 rounded-full transition-colors flex-shrink-0 ${prefs[t.key] !== false ? 'bg-[var(--primary)]' : 'bg-[var(--border)]'}`}>
                  <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-[var(--shadow-card)] transition-transform ${prefs[t.key] !== false ? 'translate-x-[18px]' : 'translate-x-0.5'}`} />
                </button>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

// Helper to convert VAPID key
function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
