"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { listTickets, createTicket, type Ticket } from "@/lib/api";
import {
  ArrowRight,
  Check,
  ChevronRight,
  LifeBuoy,
  Plus,
  X,
} from "lucide-react";
import { Skeleton } from "@/components/ui/Skeleton";
import { useI18n } from "@/lib/i18n";

function getCategories(t: (k: string) => string) {
  return [
    { value: "general", label: t("tickets.catGeneral") },
    { value: "bug", label: t("tickets.catBug") },
    { value: "feature", label: t("tickets.catFeature") },
    { value: "billing", label: t("tickets.catBilling") },
    { value: "other", label: t("tickets.catOther") },
  ];
}

function getPriorities(t: (k: string) => string) {
  return [
    { value: "low", label: t("tickets.prioLow") },
    { value: "normal", label: t("tickets.prioNormal") },
    { value: "high", label: t("tickets.prioHigh") },
    { value: "urgent", label: t("tickets.prioUrgent") },
  ];
}

function getStatusLabel(status: string, t: (k: string) => string) {
  if (status === "open") return t("tickets.statusOpen");
  if (status === "closed") return t("tickets.statusClosed");
  return t("tickets.statusInProgress");
}

export default function TicketsPage() {
  const router = useRouter();
  const { t, lang } = useI18n();
  const CATEGORIES = getCategories(t);
  const PRIORITIES = getPriorities(t);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    subject: "",
    message: "",
    category: "general",
    priority: "normal",
  });

  useEffect(() => {
    listTickets({ limit: 50 })
      .then((r) => {
        setTickets(r.data);
        setTotal(r.total);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleCreate = async () => {
    if (!form.subject.trim() || !form.message.trim()) return;
    setCreating(true);
    try {
      const result = await createTicket({
        title: form.subject,
        message: form.message,
        category: form.category,
        priority: form.priority,
      });
      setShowCreate(false);
      setForm({ subject: "", message: "", category: "general", priority: "normal" });
      if (result?.id) router.push(`/support/tickets/${result.id}`);
    } catch {}
    setCreating(false);
  };

  return (
    <div className="page-stack">
      <div className="page-header">
        <div className="page-header-row">
          <div className="page-header-left">
            <h1 className="page-header-title">{t("tickets.title")}</h1>
            <p className="page-header-description">
              {total === 1 ? t("tickets.countOne", { n: total }) : t("tickets.countMany", { n: total })}
            </p>
          </div>
          <div className="page-header-actions">
            <button
              className="btn btn-primary btn-sm"
              onClick={() => setShowCreate(true)}
            >
              <Plus size={14} /> {t("tickets.newTicket")}
            </button>
          </div>
        </div>
      </div>

      <div
        className="dashboard-card"
        style={{ padding: 0, overflow: "hidden" }}
      >
        {loading ? (
          <div>
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "12px 18px",
                  borderBottom:
                    i < 4 ? "1px solid var(--tb-border)" : "none",
                }}
              >
                <Skeleton width={60} height={12} />
                <div style={{ flex: 1 }}>
                  <Skeleton
                    width={`${40 + i * 8}%`}
                    height={13}
                    style={{ marginBottom: 4 }}
                  />
                  <Skeleton width="20%" height={10} />
                </div>
                <Skeleton width={50} height={18} borderRadius={10} />
              </div>
            ))}
          </div>
        ) : tickets.length === 0 ? (
          <div style={{ padding: 48, textAlign: "center" }}>
            <LifeBuoy
              size={32}
              style={{ color: "var(--tb-text-disabled)", marginBottom: 12 }}
            />
            <p
              style={{
                fontSize: 14,
                fontWeight: 500,
                color: "var(--tb-text-primary)",
                margin: "0 0 4px",
              }}
            >
              {t("tickets.noTickets")}
            </p>
            <p
              style={{
                fontSize: 13,
                color: "var(--tb-text-muted)",
                margin: "0 0 16px",
              }}
            >
              {t("tickets.noTicketsDesc")}
            </p>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => setShowCreate(true)}
            >
              <Plus size={14} /> {t("tickets.newTicket")}
            </button>
          </div>
        ) : (
          <div>
            {tickets.map((tk) => (
              <div
                key={tk.id}
                className="tb-row"
                onClick={() => router.push(`/support/tickets/${tk.id}`)}
              >
                <div
                  style={{
                    fontSize: 12,
                    fontVariantNumeric: "tabular-nums",
                    color: "var(--tb-text-muted)",
                    minWidth: 60,
                    flexShrink: 0,
                  }}
                >
                  {tk.id.slice(0, 8)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 500,
                      color: "var(--tb-text-primary)",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {tk.subject}
                  </div>
                </div>
                <span
                  className={`badge ${
                    tk.status === "open"
                      ? "badge-success"
                      : tk.status === "closed"
                        ? "badge-neutral"
                        : "badge-warning"
                  }`}
                  style={{ fontSize: 10, padding: "2px 7px" }}
                >
                  {getStatusLabel(tk.status, t)}
                </span>
                <span
                  style={{
                    fontSize: 12,
                    color: "var(--tb-text-muted)",
                    whiteSpace: "nowrap",
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {new Intl.DateTimeFormat(lang === "en" ? "en-US" : lang, {
                    month: "short",
                    day: "numeric",
                  }).format(new Date(tk.createdAt))}
                </span>
                <ChevronRight
                  size={14}
                  style={{ color: "var(--tb-text-disabled)", flexShrink: 0 }}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Ticket Popup */}
      {showCreate && (
        <div
          className="tb-dialog-overlay"
          onClick={() => setShowCreate(false)}
        >
          <div
            className="tb-dialog"
            style={{ maxWidth: 520 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="tb-dialog-header">
              <div>
                <h3 className="tb-dialog-title">{t("tickets.newTicket")}</h3>
                <p className="tb-dialog-desc">
                  {t("tickets.describeIssue")}
                </p>
              </div>
              <button
                className="header-control"
                onClick={() => setShowCreate(false)}
              >
                <X size={16} />
              </button>
            </div>
            <div className="tb-dialog-body">
              <div style={{ marginBottom: 14 }}>
                <label className="form-label">{t("tickets.subject")}</label>
                <input
                  className="form-input"
                  value={form.subject}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, subject: e.target.value }))
                  }
                  placeholder={t("tickets.subjectPh")}
                  autoFocus
                />
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 12,
                  marginBottom: 14,
                }}
              >
                <div>
                  <label className="form-label">{t("tickets.category")}</label>
                  <select
                    className="form-input"
                    value={form.category}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, category: e.target.value }))
                    }
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="form-label">{t("tickets.priority")}</label>
                  <select
                    className="form-input"
                    value={form.priority}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, priority: e.target.value }))
                    }
                  >
                    {PRIORITIES.map((p) => (
                      <option key={p.value} value={p.value}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="form-label">{t("tickets.message")}</label>
                <textarea
                  className="form-input"
                  value={form.message}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, message: e.target.value }))
                  }
                  placeholder={t("tickets.messagePh")}
                  rows={5}
                  style={{ lineHeight: 1.5, resize: "vertical" }}
                />
              </div>
            </div>
            <div className="tb-dialog-footer">
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setShowCreate(false)}
              >
                {t("tickets.cancel")}
              </button>
              <button
                className="btn btn-primary btn-sm"
                onClick={handleCreate}
                disabled={
                  creating ||
                  !form.subject.trim() ||
                  !form.message.trim()
                }
              >
                {creating ? (
                  <>
                    <span className="btn-spinner" /> {t("tickets.creating")}
                  </>
                ) : (
                  <>
                    <Plus size={14} /> {t("tickets.createTicket")}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
