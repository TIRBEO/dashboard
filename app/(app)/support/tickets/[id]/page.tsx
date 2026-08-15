"use client";
import { useEffect, useRef, useState } from "react";
import { api, getCurrentUser, type Profile } from "@/lib/api";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, LifeBuoy, Send } from "lucide-react";
import { Skeleton } from "@/components/ui/Skeleton";
import { useI18n } from "@/lib/i18n";

function TicketDetailSkeleton() {
  return (
    <div className="page-stack" style={{ maxWidth: 860 }}>
      <div><Skeleton width={100} height={14} style={{ marginBottom: 8 }} /><Skeleton width={300} height={24} style={{ marginBottom: 6 }} /><Skeleton width={180} height={14} /></div>
      <div className="dashboard-card" style={{ height: 'calc(100vh - 240px)', minHeight: 480 }}>
        <Skeleton width={160} height={14} style={{ marginBottom: 12 }} />
        <Skeleton width={`70%`} height={40} style={{ marginBottom: 8 }} />
        <Skeleton width={`45%`} height={40} style={{ marginBottom: 8, marginLeft: 'auto' }} />
        <Skeleton width={`55%`} height={40} />
      </div>
    </div>
  );
}

export default function TicketDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const { t, lang } = useI18n();

  const priorityLabel = (p?: string) => {
    if (p === "low") return t("tickets.prioLow");
    if (p === "high") return t("tickets.prioHigh");
    if (p === "urgent") return t("tickets.prioUrgent");
    return t("tickets.prioNormal");
  };
  const statusLabel = (s?: string) => s === "open" ? t("tickets.statusOpen") : s === "closed" ? t("tickets.statusClosed") : t("tickets.statusInProgress");

  const [ticket, setTicket] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const [user, setUser] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const scrollRef = useRef<HTMLDivElement>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    getCurrentUser().then(setUser).catch(() => {});
    if (!id) return;
    api.get<any>(`/api/support/tickets/${id}`).then(r => { setTicket(r.ticket || r); setMessages(r.messages || []); }).catch(() => {}).finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, loading]);

  const autoGrow = () => {
    const ta = taRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 160) + "px";
  };

  const sendReply = async () => {
    if (!reply.trim() || sending) return;
    setSending(true);
    try {
      const r = await api.post<any>(`/api/support/tickets/${id}/messages`, { message: reply.trim() });
      setMessages(prev => [...prev, r.message || r]);
      setReply("");
      if (taRef.current) taRef.current.style.height = "auto";
    } catch {}
    setSending(false);
  };

  if (loading) return <TicketDetailSkeleton />;
  if (!ticket) return <div className="empty-note">{t("ticketDetail.notFound")}</div>;

  const mine = (m: any) => user != null && (m.userId ?? m.authorId ?? m.author?.id) === user.id;
  const authorName = (m: any) => {
    const a = m.author;
    if (typeof a === "string") return a;
    if (a?.name) return a.name;
    return mine(m) ? t("ticketDetail.you") : t("ticketDetail.support");
  };

  const dayKey = (iso?: string) => iso ? new Date(iso).toDateString() : "";
  const fmtDay = (iso?: string) => iso
    ? new Intl.DateTimeFormat(lang === "en" ? "en-US" : lang, { day: "numeric", month: "long", year: "numeric" }).format(new Date(iso))
    : "";
  const fmtTime = (iso?: string) => iso
    ? new Intl.DateTimeFormat(lang === "en" ? "en-US" : lang, { hour: "numeric", minute: "2-digit" }).format(new Date(iso))
    : "";

  const initials = (name: any) => String(name || "").split(/\s+/).filter(Boolean).map(w => w[0]).slice(0, 2).join("").toUpperCase() || "?";

  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();
  const dayLabel = (d: string) => d === today ? t("calendar.today") : d === yesterday ? t("calendar.yesterday") : fmtDay(messages.find(m => dayKey(m.createdAt) === d)?.createdAt) || d;

  const grouped: { day: string; msgs: any[] }[] = [];
  for (const m of messages) {
    const d = dayKey(m.createdAt) || "unknown";
    const last = grouped[grouped.length - 1];
    if (last && last.day === d) last.msgs.push(m);
    else grouped.push({ day: d, msgs: [m] });
  }

  return (
    <div className="page-stack" style={{ maxWidth: 860 }}>
      <div className="page-header" style={{ flexWrap: 'wrap', gap: 12 }}>
        <div style={{ minWidth: 0 }}>
          <Link href="/support/tickets" style={{ fontSize: 13, color: 'var(--tb-text-muted)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4, marginBottom: 8 }}><ArrowLeft size={14} /> {t("ticketDetail.backToTickets")}</Link>
          <h1 className="page-header-title" style={{ wordBreak: 'break-word' }}>{ticket.subject}</h1>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
            <span className={`badge ${ticket.status === 'open' ? 'badge-success' : ticket.status === 'closed' ? 'badge-neutral' : 'badge-warning'}`}>{statusLabel(ticket.status)}</span>
            <span className={`badge ${ticket.priority === 'urgent' ? 'badge-error' : ticket.priority === 'high' ? 'badge-warning' : 'badge-neutral'}`}>{t("tickets.priorityLabel", { priority: priorityLabel(ticket.priority) })}</span>
            <span className="badge badge-neutral" style={{ fontVariantNumeric: 'tabular-nums' }}>{id}</span>
          </div>
        </div>
      </div>

      <div className="dashboard-card" style={{ padding: 0, display: 'flex', flexDirection: 'column', height: 'calc(100vh - 250px)', minHeight: 460, overflow: 'hidden' }}>
        {/* Chat header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 18px', borderBottom: '1px solid var(--tb-border)', background: 'var(--tb-surface-1)' }}>
          <div style={{ position: 'relative' }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--tb-brand-soft)', color: 'var(--tb-text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><LifeBuoy size={18} /></div>
            <span style={{ position: 'absolute', bottom: 0, right: 0, width: 10, height: 10, borderRadius: '50%', background: 'var(--tb-green)', border: '2px solid var(--tb-surface-1)' }} />
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--tb-text-primary)' }}>{t("ticketDetail.supportTeam")}</div>
            <div style={{ fontSize: 12, color: 'var(--tb-text-muted)' }}>{t("ticketDetail.support")} · <span style={{ color: 'var(--tb-green)' }}>●</span></div>
          </div>
          {ticket.category ? (
            <div style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--tb-text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span className="badge badge-neutral">{ticket.category}</span>
            </div>
          ) : null}
        </div>

        {/* Messages */}
        <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '18px 18px 8px' }}>
          {messages.length === 0 ? (
            <div className="empty-note" style={{ padding: '48px 24px' }}>{t("ticketDetail.noMessages")}</div>
          ) : grouped.map(g => (
            <div key={g.day}>
              <div style={{ display: 'flex', justifyContent: 'center', margin: '4px 0 16px' }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--tb-text-muted)', background: 'var(--tb-surface-2)', border: '1px solid var(--tb-border)', padding: '3px 12px', borderRadius: 999, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{dayLabel(g.day)}</span>
              </div>
              {g.msgs.map((m: any, i: number) => {
                const isMine = mine(m);
                const author = authorName(m);
                const showAvatar = !isMine;
                return (
                  <div key={m.id || i} style={{ display: 'flex', flexDirection: 'column', alignItems: isMine ? 'flex-end' : 'flex-start', marginBottom: 16 }}>
                    {!isMine && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4, paddingLeft: 2 }}>
                        <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'var(--tb-brand-soft)', color: 'var(--tb-text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 600 }}>{initials(author)}</div>
                        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--tb-text-primary)' }}>{author}</span>
                        <span style={{ fontSize: 11, color: 'var(--tb-text-muted)' }}>{fmtTime(m.createdAt)}</span>
                      </div>
                    )}
                    <div style={{ maxWidth: '78%', display: 'flex', flexDirection: 'column', alignItems: isMine ? 'flex-end' : 'flex-start' }}>
                      <div style={{
                        background: isMine ? 'var(--tb-brand)' : 'var(--tb-surface-2)',
                        color: isMine ? 'var(--tb-brand-text)' : 'var(--tb-text-primary)',
                        border: isMine ? '1px solid var(--tb-border-strong)' : '1px solid var(--tb-border)',
                        padding: '10px 14px',
                        borderRadius: isMine ? '14px 14px 4px 14px' : '4px 14px 14px 14px',
                        fontSize: 14,
                        lineHeight: 1.5,
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                      }}>{m.message || m.body || m.content}</div>
                      {isMine && <span style={{ fontSize: 11, color: 'var(--tb-text-muted)', marginTop: 3 }}>{fmtTime(m.createdAt)}</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
          {sending && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'var(--tb-brand-soft)', color: 'var(--tb-text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 600 }}>{initials(t("ticketDetail.support"))}</div>
              <div style={{ background: 'var(--tb-surface-2)', padding: '10px 14px', borderRadius: '4px 14px 14px 14px', display: 'flex', gap: 4 }}>
                <span className="chat-dot" /><span className="chat-dot" style={{ animationDelay: '120ms' }} /><span className="chat-dot" style={{ animationDelay: '240ms' }} />
              </div>
            </div>
          )}
        </div>

        {/* Composer */}
        <div style={{ padding: '12px 16px 14px', borderTop: '1px solid var(--tb-border)', background: 'var(--tb-surface-1)' }}>
          <div className="chat-composer" style={{ display: 'flex', alignItems: 'flex-end', gap: 8, background: 'var(--tb-input)', border: '1px solid var(--tb-border)', borderRadius: 8, padding: '8px 8px 8px 14px', transition: 'border-color 120ms' }}>
            <textarea
              ref={taRef}
              value={reply}
              onChange={e => { setReply(e.target.value); autoGrow(); }}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendReply(); } }}
              placeholder={t("ticketDetail.writeReply")}
              rows={1}
              style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', resize: 'none', fontSize: 14, lineHeight: 1.5, color: 'var(--tb-text-primary)', maxHeight: 160, padding: '4px 0' }}
            />
            <button className="btn btn-primary" onClick={sendReply} disabled={sending || !reply.trim()} style={{ height: 36, flexShrink: 0 }}>
              {sending ? <span className="btn-spinner" /> : <Send size={14} />}
              {t("ticketDetail.send")}
            </button>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 11, color: 'var(--tb-text-muted)' }}>
            <span>{t("ticketDetail.sendHint")}</span>
            <span style={{ fontVariantNumeric: 'tabular-nums' }}>{reply.length}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
