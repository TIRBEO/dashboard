"use client";
import Link from "next/link";
import { ArrowLeft, Plus } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { TicketCreateForm } from "@/components/tickets/TicketCreateForm";

export default function NewTicketPage() {
  const { t } = useI18n();
  return (
    <div className="flex flex-col gap-6 max-w-[720px] mx-auto">
      <div>
        <Link
          href="/support/tickets"
          className="inline-flex items-center gap-1.5 text-[14px] text-tb-text-muted no-underline hover:text-tb-text-primary transition-colors"
        >
          <ArrowLeft size={14} /> {t("newTicket.backToTickets")}
        </Link>
        <h1 className="text-[24px] font-semibold text-tb-text-primary tracking-tight mt-2">
          {t("newTicket.title")}
        </h1>
        <p className="text-sm text-tb-text-muted mt-1">{t("newTicket.subtitle")}</p>
      </div>

      <div className="rounded-xl border border-tb-border bg-tb-surface-1 p-5">
        <TicketCreateForm />
      </div>
    </div>
  );
}
