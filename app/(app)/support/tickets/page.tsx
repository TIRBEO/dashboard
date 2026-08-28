"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { listTickets, type Ticket } from "@/lib/api";
import {
  Bug,
  CreditCard,
  LifeBuoy,
  Lightbulb,
  MessageSquare,
  Plus,
  Search,
  Tag,
  User,
  X,
  ChevronLeft,
  ChevronRight as ChevronRightIcon,
  SlidersHorizontal,
} from "lucide-react";
import { Skeleton } from "@/components/ui/Skeleton";
import { useI18n } from "@/lib/i18n";
import { TicketCreateForm } from "@/components/tickets/TicketCreateForm";

const CATEGORY_ICON: Record<string, any> = {
  general: MessageSquare,
  bug: Bug,
  feature: Lightbulb,
  account: User,
  billing: CreditCard,
  other: Tag,
};

function getStatusLabel(status: string, t: (k: string) => string) {
  if (status === "open") return t("tickets.statusOpen");
  if (status === "closed") return t("tickets.statusClosed");
  return t("tickets.statusInProgress");
}

export default function TicketsPage() {
  const router = useRouter();
  const { t, lang } = useI18n();

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [status, setStatus] = useState<string>("all");
  const [page, setPage] = useState(1);
  const limit = 20;

  useEffect(() => {
    const id = setTimeout(() => setDebouncedQ(q.trim()), 300);
    return () => clearTimeout(id);
  }, [q]);

  useEffect(() => { setPage(1); }, [debouncedQ, status]);

  useEffect(() => {
    setLoading(true);
    listTickets({
      limit,
      page,
      status: status === "all" ? undefined : status,
      q: debouncedQ || undefined,
    })
      .then((r) => {
        setTickets(Array.isArray(r?.data) ? r.data : []);
        setTotal(typeof r?.total === "number" ? r.total : 0);
      })
      .catch(() => {
        setTickets([]);
        setTotal(0);
      })
      .finally(() => setLoading(false));
  }, [page, debouncedQ, status]);

  const totalPages = Math.max(1, Math.ceil(total / limit));
  const openCount = useMemo(() => (Array.isArray(tickets) ? tickets : []).filter((x) => x?.status === "open").length, [tickets]);

  return (
    <div className="page-stack" style={{ maxWidth: 900 }}>
      {/* header - simple */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div>
          <h1 className="page-header-title" style={{ fontSize: 20, display: "flex", alignItems: "center", gap: 8 }}>
            <LifeBuoy size={18} style={{ color: "var(--tb-text-muted)" }} /> {t("tickets.title")}
          </h1>
          <p className="page-header-description" style={{ marginTop: 4 }}>
            {loading ? "Loading…" : total === 1 ? t("tickets.countOne", { n: total } as any) : t("tickets.countMany", { n: total } as any)}
            {!loading && total > 0 && <span style={{ color: "var(--tb-text-muted)" }}> · {openCount} open</span>}
          </p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => setShowCreate(true)}>
          <Plus size={14} /> {t("tickets.newTicket")}
        </button>
      </div>

      {/* simple toolbar */}
      <div className="dashboard-card" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ display: "flex", gap: 8, padding: 12, borderBottom: "1px solid var(--tb-border)", flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ position: "relative", flex: "1 1 200px", minWidth: 180, maxWidth: 360 }}>
            <Search size={14} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--tb-text-muted)" }} />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search tickets…"
              className="form-input"
              style={{ paddingLeft: 32, height: 34, background: "var(--tb-surface-2)" }}
            />
            {q && (
              <button onClick={() => setQ("")} style={{ position: "absolute", right: 6, top: "50%", transform: "translateY(-50%)", width: 20, height: 20, borderRadius: 6, border: "1px solid var(--tb-border)", background: "var(--tb-surface-1)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--tb-text-muted)" }}>
                <X size={12} />
              </button>
            )}
          </div>

          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <SlidersHorizontal size={13} style={{ color: "var(--tb-text-muted)" }} />
            {[
              { v: "all", l: "All" },
              { v: "open", l: t("tickets.statusOpen") },
              { v: "closed", l: t("tickets.statusClosed") },
            ].map((s) => (
              <button
                key={s.v}
                onClick={() => setStatus(s.v)}
                style={{
                  height: 28, padding: "0 10px", borderRadius: 6, fontSize: 12, fontWeight: 500,
                  border: `1px solid ${status === s.v ? "var(--tb-text-primary)" : "var(--tb-border)"}`,
                  background: status === s.v ? "var(--tb-text-primary)" : "transparent",
                  color: status === s.v ? "var(--tb-bg)" : "var(--tb-text-secondary)",
                  cursor: "pointer",
                }}
              >
                {s.l}
              </button>
            ))}
          </div>
        </div>

        {/* list */}
        {loading ? (
          <div>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} style={{ display: "flex", gap: 12, padding: "12px 14px", borderBottom: i < 4 ? "1px solid var(--tb-border)" : "none", alignItems: "center" }}>
                <Skeleton width={32} height={32} />
                <div style={{ flex: 1 }}>
                  <Skeleton width={`${40 + i * 7}%`} height={12} style={{ marginBottom: 6 }} />
                  <Skeleton width="30%" height={10} />
                </div>
                <Skeleton width={60} height={16} />
              </div>
            ))}
          </div>
        ) : tickets.length === 0 ? (
          <div style={{ padding: 36, textAlign: "center" }}>
            <div style={{ width: 40, height: 40, borderRadius: 8, border: "1px solid var(--tb-border)", background: "var(--tb-surface-2)", display: "inline-flex", alignItems: "center", justifyContent: "center", color: "var(--tb-text-muted)", marginBottom: 10 }}>
              <LifeBuoy size={18} />
            </div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--tb-text-primary)" }}>{debouncedQ || status !== "all" ? "No matching tickets" : t("tickets.noTickets")}</div>
            <div style={{ fontSize: 12, color: "var(--tb-text-muted)", marginTop: 4 }}>{debouncedQ || status !== "all" ? "Try a different search or clear the filter." : t("tickets.noTicketsDesc")}</div>
            {(debouncedQ || status !== "all") ? (
              <button className="btn btn-secondary btn-sm" style={{ marginTop: 12 }} onClick={() => { setQ(""); setStatus("all"); }}>Clear filter</button>
            ) : (
              <button className="btn btn-primary btn-sm" style={{ marginTop: 12 }} onClick={() => setShowCreate(true)}><Plus size={14} /> {t("tickets.newTicket")}</button>
            )}
          </div>
        ) : (
          <div>
            {tickets.map((tk) => {
              const CatIcon = CATEGORY_ICON[tk.category || "general"] || MessageSquare;
              return (
                <div
                  key={tk.id}
                  onClick={() => router.push(`/support/tickets/${tk.id}`)}
                  className="tb-row"
                  style={{ cursor: "pointer", padding: "12px 14px", gap: 12 }}
                >
                  <div style={{ width: 32, height: 32, borderRadius: 6, border: "1px solid var(--tb-border)", background: "var(--tb-surface-2)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--tb-text-muted)", flexShrink: 0 }}>
                    <CatIcon size={14} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: "var(--tb-text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {tk.subject}
                    </div>
                    <div style={{ fontSize: 11, color: "var(--tb-text-muted)", marginTop: 2, display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
                      <span style={{ fontVariantNumeric: "tabular-nums" }}>#{tk.id.slice(0, 8).toUpperCase()}</span>
                      <span>·</span>
                      <span>{tk.category || "general"}</span>
                      <span>·</span>
                      <span>{tk.priority || "normal"}</span>
                      <span>·</span>
                      <span>{new Intl.DateTimeFormat(lang === "en" ? "en-US" : lang, { month: "short", day: "numeric" }).format(new Date(tk.createdAt))}</span>
                    </div>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 7px", borderRadius: 6, border: "1px solid var(--tb-border)", background: tk.status === "open" ? "var(--tb-surface-2)" : "transparent", color: tk.status === "open" ? "var(--tb-text-primary)" : "var(--tb-text-muted)", flexShrink: 0 }}>
                    {getStatusLabel(tk.status, t)}
                  </span>
                  <ChevronRightIcon size={14} style={{ color: "var(--tb-text-disabled)", flexShrink: 0 }} />
                </div>
              );
            })}
          </div>
        )}

        {!loading && tickets.length > 0 && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 12px", borderTop: "1px solid var(--tb-border)", flexWrap: "wrap", gap: 8 }}>
            <span style={{ fontSize: 12, color: "var(--tb-text-muted)" }}>Page {page} of {totalPages} · {total} total</span>
            <div style={{ display: "flex", gap: 6 }}>
              <button className="btn btn-secondary btn-sm" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}><ChevronLeft size={14} /> Prev</button>
              <button className="btn btn-secondary btn-sm" disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>Next <ChevronRightIcon size={14} /></button>
            </div>
          </div>
        )}
      </div>

      {showCreate && (
        <div className="tb-dialog-overlay" onClick={() => setShowCreate(false)}>
          <div className="tb-dialog" style={{ maxWidth: 560 }} onClick={(e) => e.stopPropagation()}>
            <div className="tb-dialog-header" style={{ borderBottom: "1px solid var(--tb-border)" }}>
              <div>
                <h3 className="tb-dialog-title">New ticket</h3>
                <p className="tb-dialog-desc">Describe your issue — we reply quickly.</p>
              </div>
              <button className="header-control" onClick={() => setShowCreate(false)}><X size={16} /></button>
            </div>
            <div className="tb-dialog-body" style={{ paddingTop: 14 }}>
              <TicketCreateForm compact onCreated={(id) => { setShowCreate(false); if (id) router.push(`/support/tickets/${id}`); }} onCancel={() => setShowCreate(false)} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
