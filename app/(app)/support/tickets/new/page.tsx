"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Send, AlertCircle, Tag, MessageSquare, Flag } from "lucide-react";
import { api } from "@/lib/api";
import Link from "next/link";
import { useI18n } from "@/lib/i18n";

function getCategories(t: (k: string) => string) {
  return [
    { value: "general", label: t("newTicket.catGeneral"), desc: t("newTicket.catGeneralDesc") },
    { value: "bug", label: t("newTicket.catBug"), desc: t("newTicket.catBugDesc") },
    { value: "feature", label: t("newTicket.catFeature"), desc: t("newTicket.catFeatureDesc") },
    { value: "account", label: t("newTicket.catAccount"), desc: t("newTicket.catAccountDesc") },
    { value: "billing", label: t("newTicket.catBilling"), desc: t("newTicket.catBillingDesc") },
    { value: "other", label: t("newTicket.catOther"), desc: t("newTicket.catOtherDesc") },
  ];
}

function getPriorities(t: (k: string) => string) {
  return [
    { value: "low", label: t("newTicket.prioLow"), color: "var(--tb-text-muted)", desc: t("newTicket.prioLowDesc") },
    { value: "normal", label: t("newTicket.prioNormal"), color: "var(--tb-blue)", desc: t("newTicket.prioNormalDesc") },
    { value: "high", label: t("newTicket.prioHigh"), color: "var(--tb-yellow)", desc: t("newTicket.prioHighDesc") },
    { value: "urgent", label: t("newTicket.prioUrgent"), color: "var(--tb-red)", desc: t("newTicket.prioUrgentDesc") },
  ];
}

export default function NewTicketPage() {
  const router = useRouter();
  const { t } = useI18n();
  const CATEGORIES = getCategories(t);
  const PRIORITIES = getPriorities(t);
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState("general");
  const [priority, setPriority] = useState("normal");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) {
      setError(t("newTicket.requiredError"));
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const res = await api.post<any>("/api/support/tickets", {
        subject: subject.trim(),
        message: message.trim(),
        category,
        priority,
      });
      router.push(`/support/tickets/${res.id}`);
    } catch (err: any) {
      setError(err?.message || t("newTicket.createFailed"));
    } finally {
      setSubmitting(false);
    }
  };

  const selectedPriority = PRIORITIES.find(p => p.value === priority);

  return (
    <div className="page-stack" style={{ maxWidth: 720 }}>
      {/* Header */}
      <div className="page-header">
        <div className="page-header-row">
          <div className="page-header-left">
            <Link href="/support/tickets" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 13, color: 'var(--tb-text-muted)', textDecoration: 'none', marginBottom: 8, transition: 'color 120ms' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--tb-text-primary)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--tb-text-muted)'}>
              <ArrowLeft size={14} /> {t("newTicket.backToTickets")}
            </Link>
            <h1 className="page-header-title">{t("newTicket.title")}</h1>
            <p className="page-header-description">{t("newTicket.subtitle")}</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="dashboard-card" style={{ border: '1px solid var(--tb-red)', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <AlertCircle size={16} style={{ color: 'var(--tb-red)', flexShrink: 0 }} />
          <span style={{ fontSize: 13, color: 'var(--tb-red)' }}>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Subject */}
        <div className="dashboard-card" style={{ marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <MessageSquare size={15} style={{ color: 'var(--tb-text-muted)' }} />
            <label className="form-label" style={{ margin: 0 }}>{t("newTicket.subject")}</label>
          </div>
          <input
            type="text"
            className="form-input"
            placeholder={t("newTicket.subjectPh")}
            value={subject}
            onChange={e => setSubject(e.target.value)}
            required
            style={{ fontSize: 14 }}
          />
        </div>

        {/* Category + Priority side by side */}
        <div className="tb-grid-2" style={{ gap: 12, marginBottom: 12 }}>
          {/* Category */}
          <div className="dashboard-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <Tag size={15} style={{ color: 'var(--tb-text-muted)' }} />
              <span className="form-label" style={{ margin: 0 }}>{t("newTicket.category")}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {CATEGORIES.map(c => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setCategory(c.value)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px',
                    borderRadius: 8, border: `1px solid ${category === c.value ? 'var(--tb-border-strong)' : 'var(--tb-border)'}`,
                    background: category === c.value ? 'var(--tb-surface-2)' : 'transparent',
                    cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit', transition: 'all 120ms', width: '100%',
                  }}
                  onMouseEnter={e => { if (category !== c.value) e.currentTarget.style.borderColor = 'var(--tb-border-hover)'; }}
                  onMouseLeave={e => { if (category !== c.value) e.currentTarget.style.borderColor = 'var(--tb-border)'; }}
                >
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: category === c.value ? 'var(--tb-text-primary)' : 'var(--tb-surface-3)', flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--tb-text-primary)' }}>{c.label}</div>
                    <div style={{ fontSize: 11, color: 'var(--tb-text-muted)' }}>{c.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Priority */}
          <div className="dashboard-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <Flag size={15} style={{ color: 'var(--tb-text-muted)' }} />
              <span className="form-label" style={{ margin: 0 }}>{t("newTicket.priority")}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {PRIORITIES.map(p => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => setPriority(p.value)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px',
                    borderRadius: 8, border: `1px solid ${priority === p.value ? 'var(--tb-border-strong)' : 'var(--tb-border)'}`,
                    background: priority === p.value ? 'var(--tb-surface-2)' : 'transparent',
                    cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit', transition: 'all 120ms', width: '100%',
                  }}
                  onMouseEnter={e => { if (priority !== p.value) e.currentTarget.style.borderColor = 'var(--tb-border-hover)'; }}
                  onMouseLeave={e => { if (priority !== p.value) e.currentTarget.style.borderColor = 'var(--tb-border)'; }}
                >
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: p.color, flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--tb-text-primary)' }}>{p.label}</div>
                    <div style={{ fontSize: 11, color: 'var(--tb-text-muted)' }}>{p.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Message */}
        <div className="dashboard-card" style={{ marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <MessageSquare size={15} style={{ color: 'var(--tb-text-muted)' }} />
            <label className="form-label" style={{ margin: 0 }}>{t("newTicket.message")}</label>
          </div>
          <textarea
            className="form-input"
            rows={8}
            placeholder={t("newTicket.messagePh")}
            value={message}
            onChange={e => setMessage(e.target.value)}
            required
            style={{ fontSize: 14, lineHeight: 1.6, resize: 'vertical' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
            <span style={{ fontSize: 12, color: 'var(--tb-text-muted)' }}>{t("newTicket.countLabel", { n: message.length })}</span>
            <span style={{ fontSize: 12, color: 'var(--tb-text-muted)' }}>{t("newTicket.ctrlEnter")}</span>
          </div>
        </div>

        {/* Submit */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8 }}>
          <Link href="/support/tickets" className="btn btn-secondary" style={{ textDecoration: 'none' }}>{t("newTicket.cancel")}</Link>
          <button type="submit" className="btn btn-primary" disabled={submitting || !subject.trim() || !message.trim()}>
            {submitting ? <><span className="btn-spinner" /> {t("newTicket.creating")}</> : <><Send size={14} /> {t("newTicket.submitTicket")}</>}
          </button>
        </div>
      </form>
    </div>
  );
}
