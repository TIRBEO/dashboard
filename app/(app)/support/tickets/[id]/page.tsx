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
} from "lucide-react";
import { Skeleton } from "@/components/ui/Skeleton";
import { useI18n } from "@/lib/i18n";
import { useToast } from "@/lib/toast";

function TicketDetailSkeleton() {
  return (
    <div className="page-stack" style={{ maxWidth: 1100 }}>
      <Skeleton width={140} height={14} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 16 }}>
        <Skeleton height={480} />
        <Skeleton height={280} />
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

  // No auto-polling — load once on open only. Use Refresh button to reload.

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
  const initials = (name: any) => String(name || "").split(/\s+/).filter(Boolean).map((w:string)=>w[0]).slice(0,2).join("").toUpperCase() || "?";
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
    const valid = incoming.filter(f => f.size <= 10*1024*1024);
    if (incoming.length !== valid.length) toast.error("Some files >10MB skipped");
    setFiles(prev => [...prev, ...valid].slice(0,6));
    if (fileRef.current) fileRef.current.value = "";
  };

  const sendReply = async () => {
    if ((!reply.trim() && files.length===0) || sending) return;
    if (isClosed) { toast.error("Ticket is closed — reopen to reply"); return; }
    setSending(true);
    try {
      const r: any = await api.post(`/api/support/tickets/${id}/messages`, { message: reply.trim() || "(attachment)" } as any);
      const newMsg = r.message || r;
      // upload files sequentially if any
      if (files.length && newMsg?.id) {
        for (const f of files) {
          try {
            const fd = new FormData();
            fd.append("file", f);
            fd.append("messageId", newMsg.id);
            await api.request(`/api/support/tickets/${id}/attachments`, { method: "POST", body: fd } as any);
          } catch {}
        }
        // refresh attachments
        try {
          const ra: any = await api.get(`/api/support/tickets/${id}/attachments`).catch(()=>null);
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
  if (!ticket) return <div className="empty-note">{t("ticketDetail.notFound")}</div>;

  return (
    <div className="page-stack" style={{ maxWidth: 1100 }}>
      {/* header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div style={{ minWidth: 0 }}>
          <Link href="/support/tickets" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--tb-text-muted)", textDecoration: "none" }}>
            <ArrowLeft size={14} /> {t("ticketDetail.backToTickets")}
          </Link>
          <h1 className="page-header-title" style={{ fontSize: 19, marginTop: 6, lineHeight: 1.3, wordBreak: "break-word" }}>{ticket.subject}</h1>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 8, alignItems: "center" }}>
            <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 8px", borderRadius: 999, border: "1px solid var(--tb-border)", background: isClosed ? "var(--tb-surface-2)" : "var(--tb-text-primary)", color: isClosed ? "var(--tb-text-muted)" : "var(--tb-bg)" }}>
              {isClosed ? t("tickets.statusClosed") : t("tickets.statusOpen")}
            </span>
            <span style={{ fontSize: 11, padding: "3px 8px", borderRadius: 999, border: "1px solid var(--tb-border)", color: "var(--tb-text-muted)", background: "var(--tb-surface-1)" }}>
              {ticket.priority || "normal"} · {ticket.category || "general"}
            </span>
            <span style={{ fontSize: 11, padding: "3px 8px", borderRadius: 999, border: "1px solid var(--tb-border)", color: "var(--tb-text-muted)", display: "inline-flex", gap: 4, alignItems: "center" }}>
              <Hash size={10} /> {String(id).slice(0, 8).toUpperCase()}
            </span>
          </div>
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          <button className="btn btn-secondary btn-sm" onClick={copyLink}><Copy size={13} /> Copy link</button>
          <button className="btn btn-secondary btn-sm" disabled={closing} onClick={handleCloseReopen}>
            {closing ? <span className="btn-spinner" style={{ width: 12, height: 12 }} /> : null} {isClosed ? "Reopen" : "Close"}
          </button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 16, alignItems: "start" }}>
        {/* chat */}
        <div className="dashboard-card" style={{ padding: 0, overflow: "hidden", display: "flex", flexDirection: "column", minHeight: 520 }}>
          {/* chat header - B/W only */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 14px", borderBottom: "1px solid var(--tb-border)", background: "var(--tb-surface-1)" }}>
            <div style={{ width: 32, height: 32, borderRadius: "50%", border: "1px solid var(--tb-border)", background: "var(--tb-surface-2)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--tb-text-secondary)" }}>
              <Shield size={15} />
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--tb-text-primary)" }}>{t("ticketDetail.supportTeam")}</div>
              <div style={{ fontSize: 11, color: "var(--tb-text-muted)" }}>{isClosed ? "Closed" : "Support"} · {fmtFull(ticket.createdAt)}</div>
            </div>
            <span style={{ marginLeft: "auto", fontSize: 11, color: "var(--tb-text-muted)", border: "1px solid var(--tb-border)", padding: "3px 7px", borderRadius: 999, background: "var(--tb-surface-2)" }}>
              {messages.length} messages
            </span>
          </div>

          {/* messages - bubble chat B/W, all visible */}
          <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", padding: "14px 14px 8px", background: "var(--tb-bg)", minHeight: 320 }}>
            {/* original request */}
            <div style={{ border: "1px solid var(--tb-border)", borderRadius: 10, background: "var(--tb-surface-1)", padding: 12, marginBottom: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: ".04em", textTransform: "uppercase", color: "var(--tb-text-muted)", marginBottom: 6 }}>Original request</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--tb-text-primary)" }}>{ticket.subject}</div>
              <div style={{ fontSize: 12.5, lineHeight: 1.6, color: "var(--tb-text-secondary)", whiteSpace: "pre-wrap", wordBreak: "break-word", marginTop: 6 }}>
                {ticket.description || (ticket as any).message || "No description."}
              </div>
              {attachments.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
                  {attachments.filter((a:any)=>!a.messageId).map((a:any)=>(
                    <a key={a.id} href={a.fileUrl || a.url} target="_blank" rel="noopener noreferrer" style={{ display:"inline-flex", alignItems:"center", gap:6, fontSize:11, padding:"5px 8px", borderRadius:6, border:"1px solid var(--tb-border)", background:"var(--tb-surface-2)", color:"var(--tb-text-secondary)", textDecoration:"none" }}>
                      <FileIcon size={11}/> {a.fileName || a.file_name || "file"} · {a.fileSize ? `${(a.fileSize/1024).toFixed(0)}KB` : ""}
                    </a>
                  ))}
                </div>
              )}
              <div style={{ fontSize: 11, color: "var(--tb-text-muted)", marginTop: 8 }}>{fmtFull(ticket.createdAt)}</div>
            </div>

            {messages.length === 0 ? (
              <div className="empty-note" style={{ border: "1px dashed var(--tb-border)", borderRadius: 8, padding: 18, textAlign: "center" }}>{t("ticketDetail.noMessages")}</div>
            ) : grouped.map(g => (
              <div key={g.day}>
                <div style={{ display: "flex", justifyContent: "center", margin: "10px 0 12px" }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: "var(--tb-text-muted)", background: "var(--tb-surface-2)", border: "1px solid var(--tb-border)", padding: "3px 9px", borderRadius: 999 }}>{dayLabel(g.day)}</span>
                </div>
                {g.msgs.map((m:any, i:number)=>{
                  const isMine = mine(m);
                  const author = authorName(m);
                  return (
                    <div key={m.id || i} style={{ display: "flex", gap: 8, marginBottom: 12, justifyContent: isMine ? "flex-end" : "flex-start" }}>
                      {!isMine && (
                        <div style={{ width: 26, height: 26, borderRadius: "50%", background: "var(--tb-surface-2)", border: "1px solid var(--tb-border)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: "var(--tb-text-secondary)", flexShrink: 0, marginTop: 2 }}>{initials(author)}</div>
                      )}
                      <div style={{ maxWidth: "78%", display: "flex", flexDirection: "column", alignItems: isMine ? "flex-end" : "flex-start", gap: 3 }}>
                        {!isMine && <span style={{ fontSize: 11, color: "var(--tb-text-muted)", paddingLeft: 2 }}>{author} · {fmtTime(m.createdAt)}</span>}
                        <div style={{
                          background: isMine ? "var(--tb-text-primary)" : "var(--tb-surface-1)",
                          color: isMine ? "var(--tb-bg)" : "var(--tb-text-primary)",
                          border: `1px solid ${isMine ? "var(--tb-border-strong)" : "var(--tb-border)"}`,
                          padding: "9px 12px",
                          borderRadius: isMine ? "14px 14px 4px 14px" : "4px 14px 14px 14px",
                          fontSize: 13, lineHeight: 1.5, whiteSpace: "pre-wrap", wordBreak: "break-word",
                        }}>
                          {m.message || m.body || m.content}
                          {m.attachments?.length ? (
                            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 8 }}>
                              {m.attachments.map((a:any)=>(
                                <a key={a.id} href={a.fileUrl || a.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, padding: "4px 7px", borderRadius: 6, border: "1px solid var(--tb-border)", background: isMine ? "rgba(255,255,255,0.12)" : "var(--tb-surface-2)", color: isMine ? "var(--tb-bg)" : "var(--tb-text-secondary)", textDecoration: "none", display: "inline-flex", gap: 4, alignItems: "center" }}><FileIcon size={11}/> {a.fileName || a.file_name}</a>
                              ))}
                            </div>
                          ):null}
                        </div>
                        {isMine && <span style={{ fontSize: 11, color: "var(--tb-text-muted)", display: "inline-flex", gap: 4, alignItems: "center" }}>{fmtTime(m.createdAt)} <CheckCheck size={11} style={{ opacity: m.readAt ? 1 : 0.4 }}/></span>}
                      </div>
                      {isMine && (
                        <div style={{ width: 26, height: 26, borderRadius: "50%", background: "var(--tb-text-primary)", color: "var(--tb-bg)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, flexShrink: 0, marginTop: 2 }}>{initials(author)}</div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}

            {isClosed && (
              <div style={{ fontSize: 11, color: "var(--tb-text-muted)", border: "1px solid var(--tb-border)", borderRadius: 8, padding: "7px 10px", background: "var(--tb-surface-2)", textAlign: "center", marginTop: 4 }}>
                Ticket closed — reopen to continue.
              </div>
            )}
          </div>

          {/* composer - B/W, no typing indicator, with attachments */}
          <div style={{ padding: 10, borderTop: "1px solid var(--tb-border)", background: "var(--tb-surface-1)" }}>
            {files.length > 0 && (
              <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:8 }}>
                {files.map((f,i)=>(
                  <span key={`${f.name}-${i}`} style={{ display:"inline-flex", alignItems:"center", gap:6, fontSize:11, padding:"4px 7px", borderRadius:6, border:"1px solid var(--tb-border)", background:"var(--tb-surface-2)", color:"var(--tb-text-secondary)" }}>
                    <FileIcon size={11}/> {f.name} <span style={{ color:"var(--tb-text-muted)" }}>{(f.size/1024).toFixed(0)}KB</span>
                    <button onClick={()=>setFiles(prev=>prev.filter((_,idx)=>idx!==i))} style={{ border:"none", background:"transparent", cursor:"pointer", color:"var(--tb-text-muted)", display:"flex", padding:2 }}><X size={10}/></button>
                  </span>
                ))}
              </div>
            )}
            <div style={{ display: "flex", gap: 8, alignItems: "flex-end", border: "1px solid var(--tb-border)", borderRadius: 8, background: "var(--tb-surface-2)", padding: 7 }}>
              <button onClick={()=>fileRef.current?.click()} disabled={isClosed} style={{ width: 28, height: 28, borderRadius: 6, border: "1px solid var(--tb-border)", background: "transparent", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--tb-text-muted)", cursor: isClosed ? "not-allowed" : "pointer", flexShrink: 0 }}>
                <Paperclip size={13}/>
              </button>
              <input ref={fileRef} type="file" multiple hidden accept="image/*,.pdf,.doc,.docx,.txt,.log,.json,.csv" onChange={(e)=>onPickFiles(e.target.files)} />
              <textarea
                ref={taRef}
                value={reply}
                onChange={(e)=>{ setReply(e.target.value); autoGrow(); }}
                onKeyDown={(e)=>{ if(e.key==="Enter" && !e.shiftKey){ e.preventDefault(); sendReply(); } }}
                placeholder={isClosed ? "Closed — reopen to reply" : t("ticketDetail.writeReply")}
                disabled={isClosed}
                rows={1}
                style={{ flex: 1, background: "transparent", border: "none", outline: "none", resize: "none", fontSize: 13, lineHeight: 1.5, color: "var(--tb-text-primary)", maxHeight: 120, padding: "4px 0" }}
              />
              <button className="btn btn-primary btn-sm" onClick={sendReply} disabled={sending || !reply.trim() || isClosed} style={{ height: 28, flexShrink: 0 }}>
                {sending ? <span className="btn-spinner" style={{ width: 12, height: 12 }}/> : <Send size={12}/>} Send
              </button>
            </div>
            <div style={{ fontSize: 11, color: "var(--tb-text-muted)", marginTop: 6, display: "flex", justifyContent: "space-between" }}>
              <span>Enter to send · Shift+Enter new line</span>
              <span>{reply.length}</span>
            </div>
          </div>
        </div>

        {/* right meta - B/W only */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div className="dashboard-card" style={{ padding: 12 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase", color: "var(--tb-text-muted)", marginBottom: 10 }}>Details</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}><span style={{ color: "var(--tb-text-muted)" }}>ID</span><span style={{ color: "var(--tb-text-primary)", fontVariantNumeric: "tabular-nums", fontWeight: 600, display: "inline-flex", gap: 4, alignItems:"center" }}><Hash size={11}/>{String(id).slice(0,10).toUpperCase()}</span></div>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}><span style={{ color: "var(--tb-text-muted)" }}>Status</span><span style={{ color: "var(--tb-text-primary)", fontWeight: 600 }}>{isClosed ? t("tickets.statusClosed") : t("tickets.statusOpen")}</span></div>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}><span style={{ color: "var(--tb-text-muted)" }}>Priority</span><span style={{ color: "var(--tb-text-primary)" }}>{ticket.priority || "normal"}</span></div>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}><span style={{ color: "var(--tb-text-muted)" }}>Category</span><span style={{ color: "var(--tb-text-primary)" }}>{ticket.category || "general"}</span></div>
              <div style={{ height: 1, background: "var(--tb-border)", margin: "2px 0" }} />
              <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}><span style={{ color: "var(--tb-text-muted)" }}>Created</span><span style={{ color: "var(--tb-text-secondary)" }}>{fmtFull(ticket.createdAt)}</span></div>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}><span style={{ color: "var(--tb-text-muted)" }}>Updated</span><span style={{ color: "var(--tb-text-secondary)" }}>{fmtFull(ticket.updatedAt)}</span></div>
              {ticket.closedAt && <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}><span style={{ color: "var(--tb-text-muted)" }}>Closed</span><span style={{ color: "var(--tb-text-secondary)" }}>{fmtFull(ticket.closedAt)}</span></div>}
            </div>
          </div>
          {/* Attachments - B/W */}
          <div className="dashboard-card" style={{ padding: 12 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase", color: "var(--tb-text-muted)", marginBottom: 8, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
              <span style={{ display:"inline-flex", gap:6, alignItems:"center" }}><Paperclip size={11}/> Attachments</span>
              <span style={{ fontWeight:500, textTransform:"none", letterSpacing:0, color:"var(--tb-text-muted)", fontSize:11 }}>{attachments.length}</span>
            </div>
            {attachments.length === 0 ? (
              <div style={{ fontSize: 11, color:"var(--tb-text-muted)", border:"1px dashed var(--tb-border)", borderRadius:6, padding:10, textAlign:"center" }}>
                No files yet — attach via the composer
              </div>
            ) : (
              <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                {attachments.map((a:any)=>(
                  <a key={a.id} href={a.fileUrl || a.url} target="_blank" rel="noopener noreferrer" style={{ display:"flex", alignItems:"center", gap:8, padding:"7px 8px", borderRadius:6, border:"1px solid var(--tb-border)", background:"var(--tb-surface-2)", textDecoration:"none", color:"var(--tb-text-primary)", fontSize:12 }}>
                    <FileIcon size={12} style={{ color:"var(--tb-text-muted)", flexShrink:0 }}/>
                    <span style={{ flex:1, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{a.fileName || a.file_name || "attachment"}</span>
                    <span style={{ fontSize:10, color:"var(--tb-text-muted)", flexShrink:0 }}>{a.fileSize ? `${(a.fileSize/1024).toFixed(0)} KB` : ""}</span>
                  </a>
                ))}
              </div>
            )}
          </div>

          <div className="dashboard-card" style={{ padding: 12 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase", color: "var(--tb-text-muted)", marginBottom: 8 }}>Actions</div>
            <div style={{ display: "flex", gap: 6 }}>
              <button className="btn btn-secondary btn-sm" style={{ flex:1 }} onClick={copyLink}><Copy size={12}/> Share</button>
              <button className="btn btn-secondary btn-sm" style={{ flex:1 }} onClick={handleCloseReopen} disabled={closing}>{isClosed ? "Reopen" : "Close"}</button>
            </div>
            <div style={{ fontSize: 11, lineHeight: 1.5, color: "var(--tb-text-muted)", marginTop: 8 }}>
              Replies appear here and via email if notifications are enabled.
            </div>
          </div>
        </div>
      </div>

      <style>{`@media(max-width: 900px){ div[style*="grid-template-columns: 1fr 280px"]{grid-template-columns:1fr !important} }`}</style>
    </div>
  );
}
