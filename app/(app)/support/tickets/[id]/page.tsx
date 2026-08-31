"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { api, getCurrentUser, type Profile } from "@/lib/api";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCheck,
  Clock3,
  Copy,
  Hash,
  MessageSquare,
  Paperclip,
  Send,
  File as FileIcon,
  Shield,
  X,
  Calendar,
  Tag,
  Flag,
  ChevronDown,
} from "lucide-react";
import { Skeleton } from "@/components/ui/Skeleton";
import { useI18n } from "@/lib/i18n";
import { useToast } from "@/lib/toast";

function TicketDetailSkeleton() {
  return (
    <div className="flex flex-col gap-6 max-w-[1200px] mx-auto">
      {/* Back link */}
      <Skeleton width={120} height={14} className="rounded" />
      {/* Title */}
      <div>
        <Skeleton width="60%" height={24} className="mb-2" />
        <div className="flex gap-2">
          <Skeleton width={60} height={22} borderRadius={999} />
          <Skeleton width={100} height={22} borderRadius={999} />
          <Skeleton width={80} height={22} borderRadius={999} />
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-5">
        {/* Chat panel skeleton */}
        <div className="rounded-2xl border border-tb-border bg-tb-surface-1 overflow-hidden">
          {/* Chat header */}
          <div className="flex items-center gap-3 px-5 py-3.5 border-b border-tb-border bg-tb-surface-2/50">
            <Skeleton width={36} height={36} borderRadius={12} />
            <div className="flex-1"><Skeleton width={140} height={14} className="mb-1.5" /><Skeleton width={200} height={10} /></div>
          </div>
          {/* Messages area */}
          <div className="p-5 space-y-4">
            <Skeleton width="80%" height={100} borderRadius={12} />
            <Skeleton width="60%" height={60} borderRadius={12} className="ml-auto" />
            <Skeleton width="70%" height={70} borderRadius={12} />
            <Skeleton width="55%" height={50} borderRadius={12} className="ml-auto" />
          </div>
          {/* Composer skeleton */}
          <div className="px-5 py-3 border-t border-tb-border">
            <Skeleton width="100%" height={40} borderRadius={8} />
          </div>
        </div>
        {/* Sidebar skeleton */}
        <div className="flex flex-col gap-3">
          <div className="rounded-2xl border border-tb-border bg-tb-surface-1 p-4">
            <Skeleton width={80} height={12} className="mb-3" />
            <div className="space-y-2.5">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex justify-between"><Skeleton width={60} height={12} /><Skeleton width={80} height={12} /></div>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-tb-border bg-tb-surface-1 p-4">
            <Skeleton width={100} height={12} className="mb-3" />
            <div className="space-y-2">
              {[1, 2].map((i) => (
                <Skeleton key={i} width="100%" height={36} borderRadius={8} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TicketDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const { t, lang } = useI18n();
  const toast = useToast();

  const [ticket, setTicket] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [attachments, setAttachments] = useState<any[]>([]);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const [closing, setClosing] = useState(false);
  const [user, setUser] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [files, setFiles] = useState<File[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const locale = lang === "en" ? "en-US" : lang;

  const fetchAll = useCallback(async () => {
    if (!id) return;
    try {
      const r: any = await api.get(`/api/support/tickets/${id}`);
      const tk = r.ticket || r;
      setTicket(tk);
      setMessages(r.messages || tk.messages || []);
      setAttachments(r.attachments || tk.attachments || []);
    } catch (e: any) {
      toast.error(e?.message || "Failed to load ticket");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    getCurrentUser().then(setUser).catch(() => {});
    fetchAll();
  }, [fetchAll]);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, loading]);

  const autoGrow = () => {
    const ta = taRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 140) + "px";
  };

  const mine = (m: any) => user != null && (m.userId ?? m.authorId ?? m.author?.id) === user.id;
  const authorName = (m: any) => {
    if (typeof m.author === "string") return m.author;
    if (m.author?.name) return m.author.name;
    return mine(m) ? t("ticketDetail.you") : t("ticketDetail.support");
  };
  const initials = (name: any) => String(name || "").split(/\s+/).filter(Boolean).map((w: string) => w[0]).slice(0, 2).join("").toUpperCase() || "?";
  const fmtTime = (iso?: string) => iso ? new Intl.DateTimeFormat(locale, { hour: "numeric", minute: "2-digit" }).format(new Date(iso)) : "";
  const fmtDay = (iso?: string) => iso ? new Intl.DateTimeFormat(locale, { day: "numeric", month: "long", year: "numeric" }).format(new Date(iso)) : "";
  const fmtFull = (iso?: string) => iso ? new Intl.DateTimeFormat(locale, { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" }).format(new Date(iso)) : "";

  const grouped: { day: string; msgs: any[] }[] = [];
  for (const m of messages) {
    const d = m.createdAt ? new Date(m.createdAt).toDateString() : "unknown";
    const last = grouped[grouped.length - 1];
    if (last && last.day === d) last.msgs.push(m);
    else grouped.push({ day: d, msgs: [m] });
  }
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();
  const dayLabel = (d: string) => d === today ? t("calendar.today") : d === yesterday ? t("calendar.yesterday") : fmtDay(messages.find((m) => new Date(m.createdAt).toDateString() === d)?.createdAt) || d;

  const isClosed = ticket?.status === "closed" || ticket?.status === "resolved";

  const onPickFiles = (list: FileList | null) => {
    if (!list) return;
    const incoming = Array.from(list).slice(0, 6 - files.length);
    const valid = incoming.filter(f => f.size <= 10 * 1024 * 1024);
    if (incoming.length !== valid.length) toast.error("Some files >10MB skipped");
    setFiles(prev => [...prev, ...valid].slice(0, 6));
    if (fileRef.current) fileRef.current.value = "";
  };

  const sendReply = async () => {
    if ((!reply.trim() && files.length === 0) || sending) return;
    if (isClosed) { toast.error("Ticket is closed — reopen to reply"); return; }
    setSending(true);
    try {
      const r: any = await api.post(`/api/support/tickets/${id}/messages`, { message: reply.trim() || "(attachment)" } as any);
      const newMsg = r.message || r;
      if (files.length && newMsg?.id) {
        for (const f of files) {
          try {
            const fd = new FormData();
            fd.append("file", f);
            fd.append("messageId", newMsg.id);
            await api.request(`/api/support/tickets/${id}/attachments`, { method: "POST", body: fd } as any);
          } catch {}
        }
        try {
          const ra: any = await api.get(`/api/support/tickets/${id}/attachments`).catch(() => null);
          if (ra?.attachments) setAttachments(ra.attachments);
        } catch {}
      }
      setMessages((prev) => [...prev, newMsg]);
      setReply("");
      setFiles([]);
      if (taRef.current) taRef.current.style.height = "auto";
    } catch (e: any) {
      toast.error(e?.message || "Failed to send");
    } finally {
      setSending(false);
    }
  };

  const handleCloseReopen = async () => {
    if (!ticket) return;
    setClosing(true);
    try {
      if (isClosed) {
        await api.post(`/api/support/tickets/${id}/reopen`);
        setTicket((p: any) => ({ ...p, status: "open", closedAt: null }));
        toast.success("Ticket reopened");
      } else {
        await api.post(`/api/support/tickets/${id}/close`);
        setTicket((p: any) => ({ ...p, status: "closed", closedAt: new Date().toISOString() }));
        toast.success("Ticket closed");
      }
    } catch (e: any) {
      toast.error(e?.message || "Action failed");
    } finally {
      setClosing(false);
    }
  };

  const copyLink = async () => {
    try { await navigator.clipboard.writeText(window.location.href); toast.success("Link copied"); } catch { toast.error("Copy failed"); }
  };

  if (loading) return <TicketDetailSkeleton />;
  if (!ticket) return <div className="text-center py-10 text-[14px] text-tb-text-muted">{t("ticketDetail.notFound")}</div>;

  return (
    <div className="flex flex-col gap-6 max-w-[1200px] mx-auto">
      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="min-w-0">
          <Link
            href="/support/tickets"
            className="inline-flex items-center gap-1.5 text-[14px] text-tb-text-muted no-underline hover:text-tb-text-primary transition-colors"
          >
            <ArrowLeft size={14} /> {t("ticketDetail.backToTickets")}
          </Link>
          <h1 className="text-[20px] font-semibold text-tb-text-primary tracking-tight leading-snug mt-1.5 break-words">
            {ticket.subject}
          </h1>
          <div className="flex items-center gap-1.5 mt-2 flex-wrap">
            <span
              className={`text-[12px] font-semibold px-2 py-0.5 rounded-full border border-tb-border ${isClosed ? 'bg-tb-surface-2 text-tb-text-muted' : 'bg-tb-text-primary text-tb-bg'}`}
            >
              {isClosed ? t("tickets.statusClosed") : t("tickets.statusOpen")}
            </span>
            <span
              className="text-[12px] px-2 py-0.5 rounded-full inline-flex items-center gap-1 border border-tb-border text-tb-text-muted bg-tb-surface-1"
            >
              {ticket.priority || "normal"} · {ticket.category || "general"}
            </span>
            <span
              className="text-[12px] px-2 py-0.5 rounded-full inline-flex items-center gap-1 font-mono tabular-nums border border-tb-border text-tb-text-muted"
            >
              <Hash size={10} /> {String(id).slice(0, 8).toUpperCase()}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={copyLink}
            className="inline-flex items-center gap-1.5 px-3 h-8 rounded-lg text-[14px] font-medium border border-tb-border bg-tb-surface-1 text-tb-text-primary hover:border-tb-border-hover hover:bg-tb-surface-2 transition-all duration-150"
          >
            <Copy size={13} /> Copy link
          </button>
          <button
            disabled={closing}
            onClick={handleCloseReopen}
            className="inline-flex items-center gap-1.5 px-3 h-8 rounded-lg text-[14px] font-medium border border-tb-border bg-tb-surface-1 text-tb-text-primary hover:border-tb-border-hover hover:bg-tb-surface-2 transition-all duration-150 disabled:opacity-40"
          >
            {closing && <span className="w-3 h-3 animate-spin rounded-full border-2 border-current border-t-transparent" />}
            {isClosed ? "Reopen" : "Close"}
          </button>
        </div>
      </div>

      {/* ── Main Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-5 items-start">
        {/* ── Chat Panel ── */}
        <div className="rounded-2xl border border-tb-border bg-tb-surface-1 overflow-hidden flex flex-col min-h-[520px]">
          {/* Chat header */}
          <div className="flex items-center gap-3 px-5 py-3.5 border-b border-tb-border bg-gradient-to-r from-tb-surface-1 to-tb-surface-2">
            <div className="w-9 h-9 rounded-xl bg-tb-brand/10 flex items-center justify-center text-tb-brand">
              <Shield size={16} />
            </div>
            <div className="flex-1">
              <div className="text-[14px] font-semibold text-tb-text-primary">{t("ticketDetail.supportTeam")}</div>
              <div className="text-[11px] text-tb-text-muted flex items-center gap-1.5">
                <span className={`w-1.5 h-1.5 rounded-full ${isClosed ? "bg-tb-text-muted" : "bg-tb-green"}`} />
                {isClosed ? t("tickets.statusClosed") : t("tickets.statusOpen")} · {fmtFull(ticket.createdAt)}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-tb-text-muted tabular-nums">
                {messages.length} {messages.length === 1 ? "message" : "messages"}
              </span>
            </div>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 pb-3 min-h-[320px] bg-tb-bg/50">
            {/* Original request */}
            <div className="rounded-xl border border-tb-border p-4 mb-5 bg-tb-surface-1 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[11px] font-bold tracking-wider uppercase text-tb-brand">Original request</span>
                <span className="h-px flex-1 bg-tb-border" />
              </div>
              <div className="text-[15px] font-semibold text-tb-text-primary">{ticket.subject}</div>
              <div className="text-[13px] leading-relaxed text-tb-text-secondary whitespace-pre-wrap break-words mt-2">
                {ticket.description || (ticket as any).message || "No description."}
              </div>
              {attachments.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {attachments.filter((a: any) => !a.messageId).map((a: any) => (
                    <a
                      key={a.id}
                      href={a.fileUrl || a.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-[12px] px-2.5 py-1 rounded-lg no-underline transition-all duration-150 hover:bg-tb-surface-3 border border-tb-border bg-tb-surface-2 text-tb-text-secondary"
                    >
                      <FileIcon size={11} /> {a.fileName || a.file_name || "file"}
                      {a.fileSize ? ` · ${(a.fileSize / 1024).toFixed(0)}KB` : ""}
                    </a>
                  ))}
                </div>
              )}
              <div className="text-[11px] text-tb-text-muted mt-2.5">{fmtFull(ticket.createdAt)}</div>
            </div>

            {messages.length === 0 ? (
              <div className="border border-dashed border-tb-border rounded-xl p-8 text-center">
                <MessageSquare size={24} className="text-tb-text-muted mx-auto mb-2" />
                <div className="text-[13px] text-tb-text-muted">{t("ticketDetail.noMessages")}</div>
              </div>
            ) : grouped.map((g) => (
              <div key={g.day}>
                <div className="flex items-center gap-3 my-4">
                  <span className="h-px flex-1 bg-tb-border" />
                  <span className="text-[11px] font-semibold text-tb-text-muted px-3 py-1 rounded-full bg-tb-surface-2 border border-tb-border">
                    {dayLabel(g.day)}
                  </span>
                  <span className="h-px flex-1 bg-tb-border" />
                </div>
                {g.msgs.map((m: any, i: number) => {
                  const isMine = mine(m);
                  const author = authorName(m);
                  return (
                    <div key={m.id || i} className={`flex gap-2.5 mb-3 ${isMine ? "justify-end" : "justify-start"} transition-opacity duration-200`}>
                      {!isMine && (
                        <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5 bg-tb-brand/10 text-tb-brand border border-tb-brand/20">
                          {initials(author)}
                        </div>
                      )}
                      <div className={`max-w-[78%] flex flex-col gap-0.5 ${isMine ? "items-end" : "items-start"}`}>
                        {!isMine && (
                          <span className="text-[11px] text-tb-text-muted pl-0.5 flex items-center gap-1"><span className="font-medium text-tb-text-secondary">{author}</span> · {fmtTime(m.createdAt)}</span>
                        )}
                        <div
                          className="px-3.5 py-2.5 text-[13.5px] leading-relaxed whitespace-pre-wrap break-words shadow-sm"
                          style={{
                            background: isMine ? "var(--tb-brand)" : "var(--tb-surface-1)",
                            color: isMine ? "var(--tb-brand-text)" : "var(--tb-text-primary)",
                            border: `1px solid ${isMine ? "var(--tb-brand)" : "var(--tb-border)"}`,
                            borderRadius: isMine ? "16px 16px 4px 16px" : "4px 16px 16px 16px",
                          }}
                        >
                          {m.message || m.body || m.content}
                          {m.attachments?.length ? (
                            <div className="flex flex-wrap gap-1.5 mt-2">
                              {m.attachments.map((a: any) => (
                                <a
                                  key={a.id}
                                  href={a.fileUrl || a.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[12px] px-1.5 py-1 rounded-md no-underline inline-flex items-center gap-1"
                                  style={{
                                    border: "1px solid tb-border",
                                    background: isMine ? "var(--tb-surface-3)" : "var(--tb-surface-2)",
                                    color: isMine ? "var(--tb-text-primary)" : "var(--tb-text-secondary)",
                                  }}
                                >
                                  <FileIcon size={11} /> {a.fileName || a.file_name}
                                </a>
                              ))}
                            </div>
                          ) : null}
                        </div>
                        {isMine && (
                          <span className="text-[12px] text-tb-text-muted inline-flex items-center gap-1">
                            {fmtTime(m.createdAt)} <CheckCheck size={11} className={m.readAt ? "opacity-100" : "opacity-40"} />
                          </span>
                        )}
                      </div>
                      {isMine && (
                        <div
                          className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5 bg-tb-text-primary text-tb-bg"
                        >
                          {initials(author)}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}

            {isClosed && (
              <div className="text-[12px] text-tb-text-muted border border-tb-border rounded-lg py-2 px-2.5 text-center mt-1 bg-tb-surface-2">
                Ticket closed — reopen to continue.
              </div>
            )}
          </div>

          {/* Composer */}
          <div className="px-3.5 py-3 border-t border-tb-border bg-tb-surface-1/80 backdrop-blur-sm">
            {files.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-2">
                {files.map((f, i) => (
                  <span key={`${f.name}-${i}`} className="inline-flex items-center gap-1.5 text-[12px] px-2 py-1 rounded-md border border-tb-border bg-tb-surface-2 text-tb-text-secondary">
                    <FileIcon size={11} /> {f.name} <span className="text-tb-text-muted">{(f.size / 1024).toFixed(0)}KB</span>
                    <button onClick={() => setFiles(prev => prev.filter((_, idx) => idx !== i))} className="border-none bg-transparent cursor-pointer text-tb-text-muted hover:text-tb-text-primary p-0.5 transition-colors"><X size={10} /></button>
                  </span>
                ))}
              </div>
            )}
            <div className="flex items-end gap-2 p-1.5 rounded-lg border border-tb-border transition-all duration-150 focus-within:border-tb-border-strong focus-within:shadow-[0_0_0_2px_var(--tb-border)] bg-tb-surface-2">
              <button
                onClick={() => fileRef.current?.click()}
                disabled={isClosed}
                className="w-7 h-7 rounded-md flex items-center justify-center border border-tb-border bg-transparent text-tb-text-muted hover:text-tb-text-primary hover:bg-tb-surface-1 transition-all duration-150 flex-shrink-0 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Paperclip size={13} />
              </button>
              <input ref={fileRef} type="file" multiple hidden accept="image/*,.pdf,.doc,.docx,.txt,.log,.json,.csv" onChange={(e) => onPickFiles(e.target.files)} />
              <textarea
                ref={taRef}
                value={reply}
                onChange={(e) => { setReply(e.target.value); autoGrow(); }}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendReply(); } }}
                placeholder={isClosed ? "Closed — reopen to reply" : t("ticketDetail.writeReply")}
                disabled={isClosed}
                rows={1}
                className="flex-1 bg-transparent border-none outline-none resize-none text-[14px] leading-relaxed text-tb-text-primary max-h-[120px] py-1 placeholder:text-tb-text-muted disabled:cursor-not-allowed"
              />
              <button
                onClick={sendReply}
                disabled={sending || !reply.trim() || isClosed}
                className="h-7 px-3 rounded-lg text-[12px] font-semibold flex items-center gap-1 shrink-0 transition-all duration-150 disabled:opacity-40 bg-tb-brand text-tb-brand-text hover:opacity-90"
              >
                {sending ? <span className="w-3 h-3 animate-spin rounded-full border-2 border-current border-t-transparent" /> : <Send size={12} />} Send
              </button>
            </div>
            <div className="flex justify-between mt-1.5 text-[12px] text-tb-text-muted">
              <span>Enter to send · Shift+Enter new line</span>
              <span className="tabular-nums">{reply.length}</span>
            </div>
          </div>
        </div>

        {/* ── Sidebar Meta ── */}
        <div className="flex flex-col gap-3">
          {/* Details */}
          <div className="rounded-2xl border border-tb-border bg-tb-surface-1 p-4">
            <div className="text-[12px] font-bold tracking-widest uppercase text-tb-text-muted mb-3 flex items-center gap-1.5">
              <Tag size={11} /> Details
            </div>
            <div className="flex flex-col gap-2 text-[13px]">
              {[
                { label: "ID", value: <span className="font-mono tabular-nums font-semibold inline-flex items-center gap-1"><Hash size={11} />{String(id).slice(0, 10).toUpperCase()}</span> },
                { label: "Status", value: <span className="font-semibold">{isClosed ? t("tickets.statusClosed") : t("tickets.statusOpen")}</span> },
                { label: "Priority", value: ticket.priority || "normal" },
                { label: "Category", value: ticket.category || "general" },
              ].map((row) => (
                <div key={row.label} className="flex justify-between gap-2">
                  <span className="text-tb-text-muted">{row.label}</span>
                  <span className="text-tb-text-primary text-right">{row.value}</span>
                </div>
              ))}
              <div className="h-px my-1 bg-tb-border" />
              {[
                { label: "Created", value: fmtFull(ticket.createdAt) },
                { label: "Updated", value: fmtFull(ticket.updatedAt) },
                ...(ticket.closedAt ? [{ label: "Closed", value: fmtFull(ticket.closedAt) }] : []),
              ].map((row) => (
                <div key={row.label} className="flex justify-between gap-2">
                  <span className="text-tb-text-muted">{row.label}</span>
                  <span className="text-tb-text-secondary text-right">{row.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Attachments */}
          <div className="rounded-2xl border border-tb-border bg-tb-surface-1 p-4">
            <div className="text-[12px] font-bold tracking-widest uppercase text-tb-text-muted mb-3 flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5"><Paperclip size={11} /> Attachments</span>
              <span className="font-medium normal-case tracking-normal text-tb-text-muted text-[12px]">{attachments.length}</span>
            </div>
            {attachments.length === 0 ? (
              <div className="text-[12px] text-tb-text-muted border border-dashed border-tb-border rounded-md py-2.5 text-center">
                No files yet — attach via the composer
              </div>
            ) : (
              <div className="flex flex-col gap-1.5">
                {attachments.map((a: any) => (
                  <a
                    key={a.id}
                    href={a.fileUrl || a.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-2 py-1.5 rounded-md no-underline text-[13px] transition-all duration-150 hover:bg-tb-surface-3 border border-tb-border bg-tb-surface-2 text-tb-text-primary"
                  >
                    <FileIcon size={12} className="text-tb-text-muted flex-shrink-0" />
                    <span className="flex-1 truncate">{a.fileName || a.file_name || "attachment"}</span>
                    <span className="text-[10px] text-tb-text-muted flex-shrink-0">{a.fileSize ? `${(a.fileSize / 1024).toFixed(0)} KB` : ""}</span>
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="rounded-2xl border border-tb-border bg-tb-surface-1 p-4">
            <div className="text-[12px] font-bold tracking-widest uppercase text-tb-text-muted mb-3">Actions</div>
            <div className="flex gap-1.5">
              <button
                onClick={copyLink}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-2.5 h-8 rounded-lg text-[13px] font-medium border border-tb-border bg-tb-surface-1 text-tb-text-primary hover:border-tb-border-hover hover:bg-tb-surface-2 transition-all duration-150"
              >
                <Copy size={12} /> Share
              </button>
              <button
                onClick={handleCloseReopen}
                disabled={closing}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-2.5 h-8 rounded-lg text-[13px] font-medium border border-tb-border bg-tb-surface-1 text-tb-text-primary hover:border-tb-border-hover hover:bg-tb-surface-2 transition-all duration-150 disabled:opacity-40"
              >
                {closing && <span className="w-3 h-3 animate-spin rounded-full border-2 border-current border-t-transparent" />}
                {isClosed ? "Reopen" : "Close"}
              </button>
            </div>
            <div className="text-[12px] leading-relaxed text-tb-text-muted mt-2">
              Replies appear here and via email if notifications are enabled.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
