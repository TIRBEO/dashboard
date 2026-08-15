"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useI18n, type I18nT } from "@/lib/i18n";

function getProviders(t: I18nT) {
  return [
    { id: 'google', name: 'Google', desc: t('apps.googleDesc') },
    { id: 'github', name: 'GitHub', desc: t('apps.githubDesc') },
    { id: 'discord', name: 'Discord', desc: t('apps.discordDesc') },
  ];
}

export default function ConnectedAppsPage() {
  const { t } = useI18n();
  const [integrations, setIntegrations] = useState<any[]>([]);
  const load = () => api.get<any>("/api/integrations").then(r => setIntegrations(Array.isArray(r) ? r : r.data || [])).catch(() => {});
  useEffect(() => { load(); }, []);
  const connect = (provider: string) => { window.location.href = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/auth/${provider}?link=1`; };
  const disconnect = async (provider: string) => { try { await api.delete(`/api/integrations/${provider}`); load(); } catch {} };
  const PROVIDERS = getProviders(t);
  return (
    <div className="page-stack">
      <div className="page-header">
        <div className="page-header-row">
          <div className="page-header-left">
            <h1 className="page-header-title">{t("apps.title")}</h1>
            <p className="page-header-description">{t("apps.subtitle")}</p>
          </div>
        </div>
      </div>
      <div className="dashboard-card">
        <h3 className="section-title">{t("apps.available")}</h3>
        {PROVIDERS.map(p => {
          const connected = integrations.some((i: any) => i.provider === p.id && i.connected);
          return (
            <div key={p.id} className="consent-row">
              <div>
                <div className="row-title">{p.name}</div>
                <div className="row-desc">{p.desc}</div>
              </div>
              {connected ? (
                <button className="btn btn-danger btn-sm" onClick={() => disconnect(p.id)}>{t("apps.disconnect")}</button>
              ) : (
                <button className="btn btn-primary btn-sm" onClick={() => connect(p.id)}>{t("apps.connect")}</button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
