"use client";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { TicketCreateForm } from "@/components/tickets/TicketCreateForm";

export default function NewTicketPage() {
  const { t } = useI18n();
  return (
    <div className="page-stack" style={{ maxWidth: 720 }}>
      <div>
        <Link href="/support/tickets" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--tb-text-muted)", textDecoration: "none" }}>
          <ArrowLeft size={14} /> {t("newTicket.backToTickets")}
        </Link>
        <h1 className="page-header-title" style={{ fontSize: 20, marginTop: 8 }}>{t("newTicket.title")}</h1>
        <p className="page-header-description" style={{ marginTop: 4 }}>{t("newTicket.subtitle")}</p>
      </div>

      <div className="dashboard-card" style={{ padding: 16 }}>
        <TicketCreateForm />
      </div>
    </div>
  );
}
