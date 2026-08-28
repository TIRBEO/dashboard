"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { AlertCircle, Paperclip, X, File as FileIcon, ChevronRight, Check, Bug, Lightbulb, CreditCard, User, MessageSquare, Flag, Tag, Sparkles } from "lucide-react";
import { createTicket, uploadTicketAttachment } from "@/lib/api";
import { useI18n } from "@/lib/i18n";
import { useToast } from "@/lib/toast";
import { haptic } from "@/lib/haptics";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const MAX_FILES = 6;
const ACCEPT = "image/*,.pdf,.doc,.docx,.txt,.log,.json,.csv";

function getCategories(t: (k: string) => string) {
  return [
    { value: "general", label: t("newTicket.catGeneral"), desc: t("newTicket.catGeneralDesc"), icon: MessageSquare },
    { value: "bug", label: t("newTicket.catBug"), desc: t("newTicket.catBugDesc"), icon: Bug },
    { value: "feature", label: t("newTicket.catFeature"), desc: t("newTicket.catFeatureDesc"), icon: Lightbulb },
    { value: "account", label: t("newTicket.catAccount"), desc: t("newTicket.catAccountDesc"), icon: User },
    { value: "billing", label: t("newTicket.catBilling"), desc: t("newTicket.catBillingDesc"), icon: CreditCard },
    { value: "other", label: t("newTicket.catOther"), desc: t("newTicket.catOtherDesc"), icon: Tag },
  ];
}
function getPriorities(t: (k: string) => string) {
  return [
    { value: "low", label: t("newTicket.prioLow"), desc: t("newTicket.prioLowDesc") },
    { value: "normal", label: t("newTicket.prioNormal"), desc: t("newTicket.prioNormalDesc") },
    { value: "high", label: t("newTicket.prioHigh"), desc: t("newTicket.prioHighDesc") },
    { value: "urgent", label: t("newTicket.prioUrgent"), desc: t("newTicket.prioUrgentDesc") },
  ];
}
function fmtSize(n: number) { if (n < 1024) return `${n} B`; if (n < 1024*1024) return `${(n/1024).toFixed(0)} KB`; return `${(n/1024/1024).toFixed(1)} MB`; }

const prioBgMap: Record<string, string> = {
  low: "bg-[var(--tb-surface-2)]",
  normal: "bg-[var(--tb-surface-2)]",
  high: "bg-[var(--tb-surface-2)]",
  urgent: "bg-[var(--tb-surface-2)]",
};
const prioDotMap: Record<string, string> = {
  low: "bg-[var(--tb-text-muted)]",
  normal: "bg-[var(--tb-text-secondary)]",
  high: "bg-[var(--tb-text-primary)]",
  urgent: "bg-[var(--tb-text-primary)]",
};
const prioTextMap: Record<string, string> = {
  low: "text-[var(--tb-text-muted)]",
  normal: "text-[var(--tb-text-secondary)]",
  high: "text-[var(--tb-text-primary)]",
  urgent: "text-[var(--tb-text-primary)]",
};

export function TicketCreateForm({ onCreated, onCancel, compact = false }: { onCreated?: (id: string) => void; onCancel?: () => void; compact?: boolean }) {
  const router = useRouter();
  const { t } = useI18n();
  const toast = useToast();
  const CATS = getCategories(t);
  const PRIOS = getPriorities(t);

  const [step, setStep] = useState<1|2|3>(1);
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState("general");
  const [priority, setPriority] = useState("normal");
  const [message, setMessage] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [fileError, setFileError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const canStep1 = category && priority;
  const canStep2 = subject.trim().length >= 5 && message.trim().length >= 10;

  const addFiles = (incoming: FileList | null) => {
    if (!incoming) return;
    setFileError("");
    const next = [...files];
    let localError = "";
    for (const f of Array.from(incoming)) {
      if (next.length >= MAX_FILES) { localError = t("newTicket.maxFiles", { n: MAX_FILES }); break; }
      if (f.size > MAX_FILE_SIZE) { localError = `${f.name}: ${t("newTicket.fileTooBig")}`; continue; }
      if (next.some(x=>x.name===f.name && x.size===f.size)) continue;
      if (!f.type && !/\.(pdf|doc|docx|txt|log|json|csv|png|jpe?g|gif|webp)$/i.test(f.name)) { localError = `${f.name}: unsupported type`; continue; }
      next.push(f);
    }
    if (localError) setFileError(localError);
    setFiles(next);
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleSubmit = async () => {
    if (!subject.trim() || !message.trim()) { setError(t("newTicket.requiredError")); return; }
    setSubmitting(true); setError("");
    try {
      const res: unknown = await createTicket({ title: subject.trim(), message: message.trim(), category, priority });
      const r = res as { id?: string; data?: { id?: string }; ticket?: { id?: string } };
      const id = r?.id || r?.data?.id || r?.ticket?.id;
      if (!id) { toast.error("Ticket created — redirecting to list"); router.push("/support/tickets"); onCreated?.(""); return; }
      if (files.length>0) {
        let ok=0; let failed=0;
        for (const f of files) { try{ await uploadTicketAttachment(id,f); ok++; } catch{ failed++; } setUploadProgress(ok); }
        if (failed) toast.error(`${failed} attachment(s) failed`);
      }
      haptic.success(); toast.success("Ticket created");
      if (onCreated) onCreated(id); else router.push(`/support/tickets/${id}`);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg || t("newTicket.createFailed")); haptic.error(); setUploadProgress(0);
    }
    setSubmitting(false);
  };

  return (
    <div className={cn("flex flex-col", compact ? "gap-3.5" : "gap-[18px]")}>
      {/* Stepper */}
      <div className={cn("flex items-center gap-2", !compact && "px-0.5 pt-1.5")}>
        {[
          { n: 1, label: t("newTicket.category") },
          { n: 2, label: t("newTicket.message") },
          { n: 3, label: t("tickets.attachments") },
        ].map((s, idx) => (
          <div key={s.n} className={cn("flex items-center gap-2", idx === 1 && "flex-1")}>
            <div className={cn(
              "flex h-7 w-7 items-center justify-center rounded-full border text-xs font-bold",
              step === s.n ? "border-[var(--tb-text-primary)] bg-[var(--tb-text-primary)] text-[var(--tb-bg)]"
              : step > s.n ? "border-[var(--tb-text-primary)] bg-[var(--tb-surface-2)] text-[var(--tb-text-primary)]"
              : "border-[var(--tb-border)] bg-[var(--tb-surface-2)] text-[var(--tb-text-muted)]"
            )}>
              {step > s.n ? <Check size={14}/> : s.n}
            </div>
            <span className={cn("text-xs", step === s.n ? "font-semibold text-[var(--tb-text-primary)]" : "font-medium text-[var(--tb-text-muted)]", compact && "hidden")}>
              {s.label}
            </span>
            {idx < 2 && <div className={cn("mx-1.5 h-px flex-1", step > s.n ? "bg-[var(--tb-border-strong)]" : "bg-[var(--tb-border)]")} />}
          </div>
        ))}
      </div>

      {error && <div className="flex items-center gap-2 rounded-[10px] border border-[var(--tb-border-strong)] bg-[var(--tb-surface-2)] px-3.5 py-2.5 text-[13px] text-[var(--tb-text-primary)]"><AlertCircle size={14}/>{error}</div>}

      <div>
        {step===1 && (
          <div key="s1" className="flex flex-col gap-3">
            <div className="rounded-xl border border-[var(--tb-border)] bg-[var(--tb-surface-1)] p-3.5">
              <div className="mb-2.5 flex items-center gap-2 text-[13px] font-semibold text-[var(--tb-text-primary)]">
                <Tag size={14} className="text-[var(--tb-text-muted)]"/> {t("newTicket.category")}
              </div>
              <div className={cn("grid gap-2", compact ? "grid-cols-1" : "grid-cols-2")}>
                {CATS.map(c => {
                  const Icon = c.icon; const active = category===c.value;
                  return (
                    <button key={c.value} type="button" onClick={()=>setCategory(c.value)} className={cn(
                      "flex items-center gap-2.5 rounded-[10px] border px-3 py-2.5 text-left transition-all",
                      active ? "border-[var(--tb-text-primary)] bg-[var(--tb-surface-2)]" : "border-[var(--tb-border)] bg-transparent hover:border-[var(--tb-border-hover)]"
                    )}>
                      <div className={cn("flex h-[26px] w-[26px] items-center justify-center rounded-[7px]", active ? "bg-[var(--tb-text-primary)] text-[var(--tb-bg)]" : "bg-[var(--tb-surface-3)] text-[var(--tb-text-muted)]")}><Icon size={13}/></div>
                      <div className="min-w-0"><div className="text-[12.5px] font-semibold text-[var(--tb-text-primary)]">{c.label}</div><div className="text-[11px] leading-tight text-[var(--tb-text-muted)]">{c.desc}</div></div>
                      {active && <Check size={12} className="ml-auto text-[var(--tb-text-primary)]"/>}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="rounded-xl border border-[var(--tb-border)] bg-[var(--tb-surface-1)] p-3.5">
              <div className="mb-2.5 flex items-center gap-2 text-[13px] font-semibold text-[var(--tb-text-primary)]">
                <Flag size={14} className="text-[var(--tb-text-muted)]"/> {t("newTicket.priority")}
              </div>
              <div className={cn("grid gap-2", compact ? "grid-cols-2" : "grid-cols-4")}>
                {PRIOS.map(p => {
                  const active = priority===p.value;
                  return (
                    <button
                      key={p.value}
                      type="button"
                      onClick={()=>setPriority(p.value)}
                      className={cn(
                        "rounded-[10px] border px-2 py-2.5 text-center transition-all",
                        active ? cn("border-[var(--tb-border-strong)]", prioBgMap[p.value]) : "border-[var(--tb-border)] bg-transparent hover:border-[var(--tb-border-hover)]"
                      )}
                    >
                      <span className={cn("mx-auto mb-1.5 block h-2 w-2 rounded-full", prioDotMap[p.value])} />
                      <div className={cn("text-xs font-bold", active ? "text-[var(--tb-text-primary)]" : "text-[var(--tb-text-secondary)]")}>{p.label}</div>
                      <div className="mt-0.5 text-[10px] leading-tight text-[var(--tb-text-muted)]">{p.desc}</div>
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="flex justify-end">
              <Button size="sm" onClick={()=>setStep(2)} disabled={!canStep1}>Continue <ChevronRight size={14}/></Button>
            </div>
          </div>
        )}
        {step===2 && (
          <div key="s2" className="flex flex-col gap-3">
            <div className="rounded-xl border border-[var(--tb-border)] bg-[var(--tb-surface-1)] p-3.5">
              <Label className="mb-1.5 flex items-center gap-1.5 text-[13px]"><MessageSquare size={13}/> {t("newTicket.subject")} <span className="text-[var(--tb-text-primary)]">*</span></Label>
              <Input value={subject} onChange={e=>setSubject(e.target.value)} placeholder={t("newTicket.subjectPh")} maxLength={300} className="border-[var(--tb-border)] bg-[var(--tb-surface-2)] text-[var(--tb-text-primary)] placeholder:text-[var(--tb-text-muted)] focus-visible:border-[var(--tb-border-strong)]" />
              <div className="mt-1 text-right text-[11px] text-[var(--tb-text-muted)]">{subject.length}/300</div>
            </div>
            <div className="rounded-xl border border-[var(--tb-border)] bg-[var(--tb-surface-1)] p-3.5">
              <Label className="mb-1.5 flex items-center gap-1.5 text-[13px]"><Sparkles size={13}/> {t("newTicket.message")} <span className="text-[var(--tb-text-primary)]">*</span></Label>
              <textarea className="flex min-h-[140px] w-full resize-y rounded-lg border border-[var(--tb-border)] bg-[var(--tb-surface-2)] px-3 py-2 text-sm text-[var(--tb-text-primary)] placeholder:text-[var(--tb-text-muted)] outline-none focus:border-[var(--tb-border-strong)]" rows={7} value={message} onChange={e=>setMessage(e.target.value)} placeholder={t("newTicket.messagePh")} maxLength={20000} />
              <div className="mt-1.5 flex justify-between">
                <span className="text-[11px] text-[var(--tb-text-muted)]">{message.length} / 20,000 {message.length<10 && "· at least 10 chars"}</span>
                <span className="text-[11px] text-[var(--tb-text-muted)]">{t("newTicket.ctrlEnter")}</span>
              </div>
            </div>
            <div className="flex justify-between gap-2">
              <Button variant="ghost" size="sm" onClick={()=>setStep(1)}>Back</Button>
              <Button size="sm" onClick={()=>setStep(3)} disabled={!canStep2}>Continue <ChevronRight size={14}/></Button>
            </div>
          </div>
        )}
        {step===3 && (
          <div key="s3" className="flex flex-col gap-3">
            <div className="rounded-xl border border-[var(--tb-border)] bg-[var(--tb-surface-1)] p-3.5">
              <div className="mb-2.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-[13px] font-medium text-[var(--tb-text-primary)]"><Paperclip size={13}/> {t("tickets.attachments")} <span className="font-normal text-[var(--tb-text-muted)]">({files.length}/{MAX_FILES} · ≤10MB)</span></span>
                <button type="button" onClick={()=>fileRef.current?.click()} className="cursor-pointer border-none bg-transparent text-xs text-[var(--tb-text-muted)] underline">{t("tickets.attachFiles")}</button>
              </div>
              <div
                onDragOver={e=>{ e.preventDefault(); setDragOver(true); }}
                onDragLeave={()=>setDragOver(false)}
                onDrop={e=>{ e.preventDefault(); setDragOver(false); addFiles(e.dataTransfer.files); }}
                onClick={()=>fileRef.current?.click()}
                className={cn(
                  "cursor-pointer rounded-[10px] border border-dashed px-4 py-4 text-center transition-all",
                  dragOver ? "border-[var(--tb-text-primary)] bg-[var(--tb-surface-2)]" : "border-[var(--tb-border-hover)] bg-transparent hover:border-[var(--tb-border-strong)]"
                )}
              >
                <div className="mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-[9px] bg-[var(--tb-surface-3)] text-[var(--tb-text-muted)]"><Paperclip size={16}/></div>
                <div className="text-[12.5px] font-semibold text-[var(--tb-text-primary)]">Drop files here or click to browse</div>
                <div className="mt-0.5 text-[11px] text-[var(--tb-text-muted)]">{ACCEPT.replaceAll("image/*","Images")} · up to {MAX_FILES} files</div>
              </div>
              <input ref={fileRef} type="file" multiple accept={ACCEPT} className="hidden" onChange={e=>addFiles(e.target.files)} />
              {fileError && <div className="mt-2 text-[11px] text-[var(--tb-text-primary)]">{fileError}</div>}
              {files.length>0 && (
                <div className="mt-2.5 flex flex-col gap-1.5">
                  {files.map((f,i)=>(
                    <div key={`${f.name}-${i}`} className="flex items-center gap-2.5 rounded-lg border border-[var(--tb-border)] bg-[var(--tb-surface-2)] px-2.5 py-2">
                      <FileIcon size={13} className="text-[var(--tb-text-muted)]"/>
                      <span className="flex-1 truncate text-xs text-[var(--tb-text-primary)]">{f.name}</span>
                      <span className="text-[10px] text-[var(--tb-text-muted)]">{fmtSize(f.size)}</span>
                      <button type="button" onClick={()=>setFiles(prev=>prev.filter((_,j)=>j!==i))} className="cursor-pointer border-none bg-transparent p-0.5 text-[var(--tb-text-muted)] hover:text-[var(--tb-text-primary)]"><X size={12}/></button>
                    </div>
                  ))}
                </div>
              )}
              <div className="mt-3 rounded-lg border border-[var(--tb-border)] bg-[var(--tb-surface-2)] p-2.5">
                <div className="mb-1.5 text-[11px] font-bold uppercase tracking-widest text-[var(--tb-text-muted)]">Review</div>
                <div className="text-xs leading-relaxed text-[var(--tb-text-secondary)]">
                  <strong className="font-semibold text-[var(--tb-text-primary)]">{subject || "(no subject)"}</strong> · {CATS.find(c=>c.value===category)?.label} · <span className={cn("font-semibold", prioTextMap[priority])}>{PRIOS.find(p=>p.value===priority)?.label}</span><br/>
                  <span className="text-[var(--tb-text-muted)]">{message ? message.slice(0,160) + (message.length>160?"…":"") : "(no message)"}</span>
                </div>
              </div>
            </div>
            <div className="flex justify-between gap-2">
              <Button variant="ghost" size="sm" onClick={()=>setStep(2)}>Back</Button>
              <div className="flex gap-2">
                {onCancel && <Button variant="ghost" size="sm" onClick={onCancel}>{t("newTicket.cancel")}</Button>}
                <Button size="sm" onClick={handleSubmit} disabled={submitting || !canStep2}>
                  {submitting ? <><span className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent"/>{files.length>0 && uploadProgress>0 ? ` ${uploadProgress}/${files.length}` : ` ${t("newTicket.creating")}`}</> : t("newTicket.submitTicket")}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
