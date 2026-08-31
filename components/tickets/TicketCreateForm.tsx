"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  AlertCircle,
  Paperclip,
  X,
  File as FileIcon,
  ChevronRight,
  Check,
  Bug,
  Lightbulb,
  CreditCard,
  User,
  MessageSquare,
  Flag,
  Tag,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { createTicket, uploadTicketAttachment } from "@/lib/api";
import { useI18n } from "@/lib/i18n";
import { useToast } from "@/lib/toast";
import { haptic } from "@/lib/haptics";

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

function fmtSize(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}

const prioDotColors: Record<string, string> = {
  low: "var(--tb-text-muted)",
  normal: "var(--tb-text-secondary)",
  high: "var(--tb-text-primary)",
  urgent: "var(--tb-red)",
};

export function TicketCreateForm({
  onCreated,
  onCancel,
  compact = false,
}: {
  onCreated?: (id: string) => void;
  onCancel?: () => void;
  compact?: boolean;
}) {
  const router = useRouter();
  const { t } = useI18n();
  const toast = useToast();
  const CATS = getCategories(t);
  const PRIOS = getPriorities(t);

  const [step, setStep] = useState<1 | 2 | 3>(1);
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
      if (next.length >= MAX_FILES) {
        localError = t("newTicket.maxFiles", { n: MAX_FILES });
        break;
      }
      if (f.size > MAX_FILE_SIZE) {
        localError = `${f.name}: ${t("newTicket.fileTooBig")}`;
        continue;
      }
      if (next.some((x) => x.name === f.name && x.size === f.size)) continue;
      if (!f.type && !/\.(pdf|doc|docx|txt|log|json|csv|png|jpe?g|gif|webp)$/i.test(f.name)) {
        localError = `${f.name}: unsupported type`;
        continue;
      }
      next.push(f);
    }
    if (localError) setFileError(localError);
    setFiles(next);
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleSubmit = async () => {
    if (!subject.trim() || !message.trim()) {
      setError(t("newTicket.requiredError"));
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const res: unknown = await createTicket({
        title: subject.trim(),
        message: message.trim(),
        category,
        priority,
      });
      const r = res as { id?: string; data?: { id?: string }; ticket?: { id?: string } };
      const id = r?.id || r?.data?.id || r?.ticket?.id;
      if (!id) {
        toast.error("Ticket created — redirecting to list");
        router.push("/support/tickets");
        onCreated?.("");
        return;
      }
      if (files.length > 0) {
        let ok = 0;
        let failed = 0;
        for (const f of files) {
          try {
            await uploadTicketAttachment(id, f);
            ok++;
          } catch {
            failed++;
          }
          setUploadProgress(ok);
        }
        if (failed) toast.error(`${failed} attachment(s) failed`);
      }
      haptic.success();
      toast.success("Ticket created");
      if (onCreated) onCreated(id);
      else router.push(`/support/tickets/${id}`);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg || t("newTicket.createFailed"));
      haptic.error();
      setUploadProgress(0);
    }
    setSubmitting(false);
  };

  return (
    <div className={cn("flex flex-col", compact ? "gap-3.5" : "gap-4")}>
      {/* ── Stepper ── */}
      <div className={cn("flex items-center gap-2", !compact && "px-0.5 pt-1")}>
        {[
          { n: 1, label: t("newTicket.category") },
          { n: 2, label: t("newTicket.message") },
          { n: 3, label: t("tickets.attachments") },
        ].map((s, idx) => (
          <div key={s.n} className={cn("flex items-center gap-2", idx === 1 && "flex-1")}>
            <div
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-all duration-200",
                step === s.n
                  ? "border-2 border-tb-text-primary bg-tb-text-primary text-tb-bg"
                  : step > s.n
                  ? "border border-tb-text-primary bg-tb-surface-2 text-tb-text-primary"
                  : "border border-tb-border bg-tb-surface-2 text-tb-text-muted"
              )}
            >
              {step > s.n ? <Check size={14} /> : s.n}
            </div>
            <span
              className={cn(
                "text-xs transition-colors",
                step === s.n
                  ? "font-semibold text-tb-text-primary"
                  : "font-medium text-tb-text-muted",
                compact && "hidden"
              )}
            >
              {s.label}
            </span>
            {idx < 2 && (
              <div
                className={cn(
                  "mx-1.5 h-px flex-1 transition-colors",
                  step > s.n ? "bg-tb-border-strong" : "bg-tb-border"
                )}
              />
            )}
          </div>
        ))}
      </div>

      {/* ── Error ── */}
      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-tb-border-strong bg-tb-surface-2 px-3.5 py-2.5 text-[13px] text-tb-text-primary">
          <AlertCircle size={14} className="flex-shrink-0" />
          {error}
        </div>
      )}

      <div>
        {/* ═══ Step 1: Category + Priority ═══ */}
        {step === 1 && (
          <div key="s1" className="flex flex-col gap-3">
            {/* Category */}
            <div className="rounded-xl border border-tb-border bg-tb-surface-1 p-3.5">
              <div className="mb-2.5 flex items-center gap-2 text-[13px] font-semibold text-tb-text-primary">
                <Tag size={14} className="text-tb-text-muted" /> {t("newTicket.category")}
              </div>
              <div className={cn("grid gap-2", compact ? "grid-cols-1" : "grid-cols-2")}>
                {CATS.map((c) => {
                  const Icon = c.icon;
                  const active = category === c.value;
                  return (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => setCategory(c.value)}
                      className={cn(
                        "flex items-center gap-2.5 rounded-[10px] border px-3 py-2.5 text-left transition-all duration-150",
                        active
                          ? "border-tb-text-primary bg-tb-surface-2"
                          : "border-tb-border bg-transparent hover:border-tb-border-strong hover:bg-tb-surface-2"
                      )}
                    >
                      <div
                        className={cn(
                          "flex h-[26px] w-[26px] items-center justify-center rounded-[7px] transition-colors",
                          active
                            ? "bg-tb-text-primary text-tb-bg"
                            : "bg-tb-surface-3 text-tb-text-muted"
                        )}
                      >
                        <Icon size={13} />
                      </div>
                      <div className="min-w-0">
                        <div className="text-[12.5px] font-semibold text-tb-text-primary">{c.label}</div>
                        <div className="text-[11px] leading-tight text-tb-text-muted">{c.desc}</div>
                      </div>
                      {active && <Check size={12} className="ml-auto text-tb-text-primary" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Priority */}
            <div className="rounded-xl border border-tb-border bg-tb-surface-1 p-3.5">
              <div className="mb-2.5 flex items-center gap-2 text-[13px] font-semibold text-tb-text-primary">
                <Flag size={14} className="text-tb-text-muted" /> {t("newTicket.priority")}
              </div>
              <div className={cn("grid gap-2", compact ? "grid-cols-2" : "grid-cols-4")}>
                {PRIOS.map((p) => {
                  const active = priority === p.value;
                  return (
                    <button
                      key={p.value}
                      type="button"
                      onClick={() => setPriority(p.value)}
                      className={cn(
                        "rounded-[10px] border px-2 py-2.5 text-center transition-all duration-150",
                        active
                          ? "border-tb-border-strong bg-tb-surface-2"
                          : "border-tb-border bg-transparent hover:border-tb-border-strong hover:bg-tb-surface-2"
                      )}
                    >
                      <span
                        className="mx-auto mb-1.5 block h-2 w-2 rounded-full"
                        style={{ background: prioDotColors[p.value] || "var(--tb-text-muted)" }}
                      />
                      <div className={cn("text-xs font-bold", active ? "text-tb-text-primary" : "text-tb-text-secondary")}>
                        {p.label}
                      </div>
                      <div className="mt-0.5 text-[10px] leading-tight text-tb-text-muted">{p.desc}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setStep(2)}
                disabled={!canStep1}
                className="inline-flex items-center gap-1.5 px-4 h-8 rounded-lg text-[13px] font-medium transition-all duration-150 active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none"
                style={{ background: "var(--tb-text-primary)", color: "var(--tb-bg)" }}
              >
                Continue <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}

        {/* ═══ Step 2: Subject + Message ═══ */}
        {step === 2 && (
          <div key="s2" className="flex flex-col gap-3">
            {/* Subject */}
            <div className="rounded-xl border border-tb-border bg-tb-surface-1 p-3.5">
              <label className="mb-1.5 flex items-center gap-1.5 text-[13px] font-medium text-tb-text-primary">
                <MessageSquare size={13} className="text-tb-text-muted" />
                {t("newTicket.subject")} <span className="text-tb-red">*</span>
              </label>
              <input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder={t("newTicket.subjectPh")}
                maxLength={300}
                className="w-full h-9 px-3 rounded-lg text-sm border border-tb-border bg-tb-surface-2 text-tb-text-primary placeholder:text-tb-text-muted outline-none transition-all duration-150 hover:border-tb-border-strong focus:border-tb-border-strong focus:shadow-[0_0_0_2px_var(--tb-border)]"
              />
              <div className="mt-1 text-right text-[11px] text-tb-text-muted tabular-nums">{subject.length}/300</div>
            </div>

            {/* Message */}
            <div className="rounded-xl border border-tb-border bg-tb-surface-1 p-3.5">
              <label className="mb-1.5 flex items-center gap-1.5 text-[13px] font-medium text-tb-text-primary">
                <Sparkles size={13} className="text-tb-text-muted" />
                {t("newTicket.message")} <span className="text-tb-red">*</span>
              </label>
              <textarea
                className="flex min-h-[140px] w-full resize-y rounded-lg border border-tb-border bg-tb-surface-2 px-3 py-2 text-sm text-tb-text-primary placeholder:text-tb-text-muted outline-none transition-all duration-150 hover:border-tb-border-strong focus:border-tb-border-strong focus:shadow-[0_0_0_2px_var(--tb-border)]"
                rows={7}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={t("newTicket.messagePh")}
                maxLength={20000}
              />
              <div className="mt-1.5 flex justify-between">
                <span className="text-[11px] text-tb-text-muted tabular-nums">
                  {message.length} / 20,000
                  {message.length < 10 && <span className="text-tb-text-muted"> · at least 10 chars</span>}
                </span>
                <span className="text-[11px] text-tb-text-muted">{t("newTicket.ctrlEnter")}</span>
              </div>
            </div>

            <div className="flex justify-between gap-2">
              <button
                onClick={() => setStep(1)}
                className="inline-flex items-center gap-1.5 px-3 h-8 rounded-lg text-[13px] font-medium text-tb-text-secondary hover:bg-tb-surface-1 hover:text-tb-text-primary transition-all duration-150"
              >
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={!canStep2}
                className="inline-flex items-center gap-1.5 px-4 h-8 rounded-lg text-[13px] font-medium transition-all duration-150 active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none"
                style={{ background: "var(--tb-text-primary)", color: "var(--tb-bg)" }}
              >
                Continue <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}

        {/* ═══ Step 3: Attachments + Review ═══ */}
        {step === 3 && (
          <div key="s3" className="flex flex-col gap-3">
            <div className="rounded-xl border border-tb-border bg-tb-surface-1 p-3.5">
              <div className="mb-2.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-[13px] font-medium text-tb-text-primary">
                  <Paperclip size={13} className="text-tb-text-muted" />
                  {t("tickets.attachments")}{" "}
                  <span className="font-normal text-tb-text-muted">
                    ({files.length}/{MAX_FILES} · ≤10MB)
                  </span>
                </span>
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="cursor-pointer border-none bg-transparent text-xs text-tb-text-muted hover:text-tb-text-primary underline transition-colors"
                >
                  {t("tickets.attachFiles")}
                </button>
              </div>

              {/* Drop zone */}
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => { e.preventDefault(); setDragOver(false); addFiles(e.dataTransfer.files); }}
                onClick={() => fileRef.current?.click()}
                className={cn(
                  "cursor-pointer rounded-[10px] border border-dashed px-4 py-4 text-center transition-all duration-150",
                  dragOver
                    ? "border-tb-text-primary bg-tb-surface-2"
                    : "border-tb-border-hover bg-transparent hover:border-tb-border-strong hover:bg-tb-surface-2"
                )}
              >
                <div className="mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-[9px] bg-tb-surface-3 text-tb-text-muted">
                  <Paperclip size={16} />
                </div>
                <div className="text-[12.5px] font-semibold text-tb-text-primary">Drop files here or click to browse</div>
                <div className="mt-0.5 text-[11px] text-tb-text-muted">
                  {ACCEPT.replaceAll("image/*", "Images")} · up to {MAX_FILES} files
                </div>
              </div>

              <input ref={fileRef} type="file" multiple accept={ACCEPT} className="hidden" onChange={(e) => addFiles(e.target.files)} />

              {fileError && (
                <div className="mt-2 text-[11px] text-tb-red">{fileError}</div>
              )}

              {/* File list */}
              {files.length > 0 && (
                <div className="mt-2.5 flex flex-col gap-1.5">
                  {files.map((f, i) => (
                    <div
                      key={`${f.name}-${i}`}
                      className="flex items-center gap-2.5 rounded-lg border border-tb-border bg-tb-surface-2 px-2.5 py-2 transition-colors hover:border-tb-border-strong"
                    >
                      <FileIcon size={13} className="text-tb-text-muted flex-shrink-0" />
                      <span className="flex-1 truncate text-xs text-tb-text-primary">{f.name}</span>
                      <span className="text-[10px] text-tb-text-muted tabular-nums">{fmtSize(f.size)}</span>
                      <button
                        type="button"
                        onClick={() => setFiles((prev) => prev.filter((_, j) => j !== i))}
                        className="cursor-pointer border-none bg-transparent p-0.5 text-tb-text-muted hover:text-tb-text-primary transition-colors"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Review summary */}
              <div className="mt-3 rounded-lg border border-tb-border bg-tb-surface-2 p-2.5">
                <div className="mb-1.5 text-[11px] font-bold uppercase tracking-widest text-tb-text-muted">Review</div>
                <div className="text-xs leading-relaxed text-tb-text-secondary">
                  <strong className="font-semibold text-tb-text-primary">
                    {subject || "(no subject)"}
                  </strong>{" "}
                  · {CATS.find((c) => c.value === category)?.label} ·{" "}
                  <span className="font-semibold" style={{ color: prioDotColors[priority] || "var(--tb-text-secondary)" }}>
                    {PRIOS.find((p) => p.value === priority)?.label}
                  </span>
                  <br />
                  <span className="text-tb-text-muted">
                    {message ? message.slice(0, 160) + (message.length > 160 ? "…" : "") : "(no message)"}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-between gap-2">
              <button
                onClick={() => setStep(2)}
                className="inline-flex items-center gap-1.5 px-3 h-8 rounded-lg text-[13px] font-medium text-tb-text-secondary hover:bg-tb-surface-1 hover:text-tb-text-primary transition-all duration-150"
              >
                Back
              </button>
              <div className="flex gap-2">
                {onCancel && (
                  <button
                    onClick={onCancel}
                    className="inline-flex items-center gap-1.5 px-3 h-8 rounded-lg text-[13px] font-medium text-tb-text-secondary hover:bg-tb-surface-1 hover:text-tb-text-primary transition-all duration-150"
                  >
                    {t("newTicket.cancel")}
                  </button>
                )}
                <button
                  onClick={handleSubmit}
                  disabled={submitting || !canStep2}
                  className="inline-flex items-center gap-1.5 px-4 h-8 rounded-lg text-[13px] font-medium transition-all duration-150 active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none"
                  style={{ background: "var(--tb-text-primary)", color: "var(--tb-bg)" }}
                >
                  {submitting ? (
                    <>
                      <span className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      {files.length > 0 && uploadProgress > 0
                        ? ` ${uploadProgress}/${files.length}`
                        : ` ${t("newTicket.creating")}`}
                    </>
                  ) : (
                    <>
                      <ArrowRight size={13} />
                      {t("newTicket.submitTicket")}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
