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
  Clock,
  Inbox,
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

const CATEGORY_COLORS: Record<string, string> = {
  general: "var(--tb-text-muted)",
  bug: "var(--tb-red)",
  feature: "var(--tb-text-primary)",
  account: "var(--tb-text-secondary)",
  billing: "var(--tb-text-secondary)",
  other: "var(--tb-text-muted)",
};

function getStatusLabel(status: string, t: (k: string) => string) {
  if (status === "open") return t("tickets.statusOpen");
  if (status === "closed") return t("tickets.statusClosed");
  return t("tickets.statusInProgress");
}

function timeAgo(iso: string, t: (k: string, vars?: Record<string, string | number>) => string): string {
  const diff = Date.now() - new Date(iso).getTime();
  if (diff < 60_000) return t("common.justNow");
  if (diff < 3600_000) return t("common.agoM", { n: Math.floor(diff / 60_000) });
  if (diff < 86400_000) return t("common.agoH", { n: Math.floor(diff / 3600_000) });
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(new Date(iso));
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
    <div className="flex flex-col gap-6 max-w-[1200px] mx-auto">
      {/* ── Page Header ── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="min-w-0">
          <h1 className="text-[24px] font-semibold text-tb-text-primary tracking-tight leading-tight flex items-center gap-2.5">
            <LifeBuoy size={22} className="text-tb-text-muted" />
            {t("tickets.title")}
          </h1>
          <p className="text-sm text-tb-text-muted mt-1">
            {loading ? "Loading…" : total === 1 ? t("tickets.countOne", { n: total } as any) : t("tickets.countMany", { n: total } as any)}
            {!loading && total > 0 && <span className="text-tb-text-muted"> · {openCount} open</span>}
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="inline-flex items-center gap-2 px-4 h-9 rounded-lg text-[14px] font-medium transition-all duration-150 active:scale-[0.97] bg-tb-text-primary text-tb-bg border border-tb-border-strong"
        >
          <Plus size={14} />
          {t("tickets.newTicket")}
        </button>
      </div>

      {/* ── Stat Cards ── */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-tb-border bg-tb-surface-1 p-5">
              <div className="flex items-center gap-3">
                <Skeleton width={32} height={32} borderRadius={8} />
                <div>
                  <Skeleton width={70} height={10} className="mb-1" />
                  <Skeleton width={28} height={18} />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              icon: <Inbox size={15} />,
              label: "All tickets",
              value: total,
            },
            {
              icon: <LifeBuoy size={15} />,
              label: t("tickets.statusOpen"),
              value: openCount,
              accent: true,
            },
            {
              icon: <Clock size={15} />,
              label: t("tickets.statusClosed"),
              value: total - openCount,
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="flex items-center gap-3 rounded-xl border border-tb-border bg-tb-surface-1 p-5 transition-all duration-200 hover:border-tb-border-strong"
            >
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-tb-surface-3 ${stat.accent ? "text-tb-text-primary" : "text-tb-text-muted"}`}
              >
                {stat.icon}
              </div>
              <div>
                <div className="text-[12px] font-medium text-tb-text-muted tracking-wide uppercase">{stat.label}</div>
                <div className="text-[20px] font-bold text-tb-text-primary leading-tight mt-0.5">{stat.value}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Ticket List Card ── */}
      <div className="rounded-2xl border border-tb-border bg-tb-surface-1 overflow-hidden">
        {/* Search + Filters */}
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-tb-border bg-tb-surface-1">
          <div className="relative flex-1 min-w-[180px] max-w-[360px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-tb-text-muted" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search tickets…"
              className="w-full h-9 pl-9 pr-8 rounded-lg text-[14px] border border-tb-border bg-tb-surface-2 text-tb-text-primary placeholder:text-tb-text-muted outline-none transition-all duration-150 focus:border-tb-border-strong focus:shadow-[0_0_0_2px_var(--tb-border)]"
            />
            {q && (
              <button
                onClick={() => setQ("")}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-md border border-tb-border bg-tb-surface-1 flex items-center justify-center cursor-pointer text-tb-text-muted hover:text-tb-text-primary transition-colors"
              >
                <X size={12} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <SlidersHorizontal size={13} className="text-tb-text-muted mr-1" />
            {[
              { v: "all", l: "All" },
              { v: "open", l: t("tickets.statusOpen") },
              { v: "closed", l: t("tickets.statusClosed") },
            ].map((s) => (
              <button
                key={s.v}
                onClick={() => setStatus(s.v)}
className={`h-7 px-2.5 rounded-md text-[13px] font-medium transition-all duration-150 ${
                    status === s.v ? "bg-tb-text-primary text-tb-bg border border-tb-text-primary" : "border border-tb-border bg-transparent text-tb-text-secondary"
                  }`}
              >
                {s.l}
              </button>
            ))}
          </div>
        </div>

        {/* List */}
        {loading ? (
          <div>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3.5 px-5 py-3.5 border-b border-tb-border">
                <Skeleton width={32} height={32} borderRadius={8} />
                <div className="flex-1">
                  <Skeleton width={`${40 + i * 7}%`} height={12} className="mb-1.5" />
                  <Skeleton width="30%" height={10} />
                </div>
                <Skeleton width={52} height={20} borderRadius={10} />
              </div>
            ))}
          </div>
        ) : tickets.length === 0 ? (
          <div className="py-14 px-6 text-center">
            <div className="w-10 h-10 rounded-lg border border-tb-border bg-tb-surface-2 inline-flex items-center justify-center text-tb-text-muted mb-3">
              <LifeBuoy size={18} />
            </div>
            <div className="text-[14px] font-semibold text-tb-text-primary">
              {debouncedQ || status !== "all" ? "No matching tickets" : t("tickets.noTickets")}
            </div>
            <div className="text-[13px] text-tb-text-muted mt-1">
              {debouncedQ || status !== "all" ? "Try a different search or clear the filter." : t("tickets.noTicketsDesc")}
            </div>
            {(debouncedQ || status !== "all") ? (
              <button
                onClick={() => { setQ(""); setStatus("all"); }}
                className="mt-3 inline-flex items-center gap-1.5 px-3 h-8 rounded-lg text-[14px] font-medium border border-tb-border bg-tb-surface-1 text-tb-text-primary hover:border-tb-border-hover hover:bg-tb-surface-2 transition-all duration-150"
              >
                Clear filter
              </button>
            ) : (
              <button
                onClick={() => setShowCreate(true)}
                className="mt-3 inline-flex items-center gap-1.5 px-3 h-8 rounded-lg text-[14px] font-medium bg-tb-text-primary text-tb-bg"
              >
                <Plus size={14} /> {t("tickets.newTicket")}
              </button>
            )}
          </div>
        ) : (
          <div>
            {tickets.map((tk) => {
              const CatIcon = CATEGORY_ICON[tk.category || "general"] || MessageSquare;
              const catColor = CATEGORY_COLORS[tk.category || "general"] || "var(--tb-text-muted)";
              return (
                <div
                  key={tk.id}
                  onClick={() => router.push(`/support/tickets/${tk.id}`)}
                  className="flex items-center gap-3.5 px-5 py-3.5 cursor-pointer transition-all duration-100 hover:bg-tb-surface-2 border-b border-tb-border"
                >
                  {/* Category icon */}
<div
                     className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors duration-150 border border-tb-border bg-tb-surface-2 ${catColor}`}
                   >
                    <CatIcon size={14} />
                  </div>

                  {/* Ticket info */}
                  <div className="flex-1 min-w-0">
                    <div className="text-[14px] font-medium text-tb-text-primary truncate">
                      {tk.subject}
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5 text-[12px] text-tb-text-muted">
                      <span className="font-mono tabular-nums">{tk.id.slice(0, 8).toUpperCase()}</span>
                      <span className="text-tb-text-disabled">·</span>
                      <span>{tk.category || "general"}</span>
                      <span className="text-tb-text-disabled">·</span>
                      <span>{tk.priority || "normal"}</span>
                      <span className="text-tb-text-disabled">·</span>
                      <span>{timeAgo(tk.createdAt, t)}</span>
                    </div>
                  </div>

                  {/* Status badge */}
                  <span
                    className={`text-[12px] font-semibold px-2 py-0.5 rounded-[10px] flex-shrink-0 border border-tb-border ${tk.status === "open" ? "bg-tb-surface-2 text-tb-text-primary" : "bg-transparent text-tb-text-muted"}`}
                  >
                    {getStatusLabel(tk.status, t)}
                  </span>

                  <ChevronRightIcon size={14} className="text-tb-text-disabled flex-shrink-0" />
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {!loading && tickets.length > 0 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-tb-border bg-tb-surface-1">
            <span className="text-[13px] text-tb-text-muted tabular-nums">
              Page {page} of {totalPages} · {total} total
            </span>
            <div className="flex gap-1.5">
              <button
                className="inline-flex items-center gap-1 px-2.5 h-7 rounded-md text-[13px] font-medium border border-tb-border bg-tb-surface-1 text-tb-text-primary hover:border-tb-border-hover hover:bg-tb-surface-2 transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                <ChevronLeft size={14} /> Prev
              </button>
              <button
                className="inline-flex items-center gap-1 px-2.5 h-7 rounded-md text-[13px] font-medium border border-tb-border bg-tb-surface-1 text-tb-text-primary hover:border-tb-border-hover hover:bg-tb-surface-2 transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Next <ChevronRightIcon size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Create Ticket Dialog ── */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-3xl flex items-center justify-center p-4 z-[100] animate-in fade-in duration-150" onClick={() => setShowCreate(false)}>
          <div
            className="w-full max-w-[560px] max-h-[calc(100vh-32px)] overflow-y-auto rounded-[14px] border border-tb-border bg-tb-surface-1 shadow-[0_16px_48px_rgba(0,0,0,0.5)] animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3 px-5 pt-5 pb-4 border-b border-tb-border">
              <div>
                <h3 className="text-[16px] font-semibold text-tb-text-primary">New ticket</h3>
                <p className="text-[14px] text-tb-text-muted mt-0.5">Describe your issue — we reply quickly.</p>
              </div>
              <button
                onClick={() => setShowCreate(false)}
                className="w-9 h-9 rounded-lg flex items-center justify-center text-tb-text-secondary hover:bg-tb-surface-2 hover:text-tb-text-primary transition-all duration-150 border border-transparent hover:border-tb-border"
              >
                <X size={16} />
              </button>
            </div>
            <div className="px-5 pb-5 pt-4">
              <TicketCreateForm
                compact
                onCreated={(id) => {
                  setShowCreate(false);
                  if (id) router.push(`/support/tickets/${id}`);
                }}
                onCancel={() => setShowCreate(false)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
