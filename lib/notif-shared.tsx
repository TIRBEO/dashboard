"use client";

import {
  Inbox as InboxIcon,
  Key,
  LifeBuoy,
  Mail,
  MessageSquare,
  Rocket,
  Shield,
} from "lucide-react";
import type { I18nT } from "@/lib/i18n";
import { translateNotifText } from "@/lib/i18n";

export interface NotifMeta {
  icon: typeof Mail;
  color: string;
  label: string;
}

const TYPE_RULES: Array<{
  match: string;
  icon: typeof Mail;
  color: string;
  labelKey?: string;
  label?: string;
}> = [
  { match: "security", icon: Shield, color: "#ef4444", labelKey: "inbox.typeSecurity" },
  { match: "login", icon: Key, color: "#8b5cf6", labelKey: "inbox.typeLogin" },
  { match: "forms", icon: MessageSquare, color: "#3b82f6", labelKey: "inbox.typeForms" },
  { match: "product", icon: Rocket, color: "#f59e0b", labelKey: "inbox.typeProduct" },
  { match: "system", icon: Rocket, color: "#f59e0b", labelKey: "inbox.typeProduct" },
  { match: "digest", icon: Mail, color: "#f59e0b", labelKey: "inbox.typeProduct" },
  { match: "admin_alert", icon: Rocket, color: "#f59e0b", labelKey: "inbox.typeProduct" },
  { match: "support", icon: LifeBuoy, color: "#10b981", labelKey: "inbox.typeSupport" },
  { match: "ticket", icon: LifeBuoy, color: "#10b981", labelKey: "inbox.typeSupport" },
];

export function getTypeMeta(type?: string, t?: I18nT): NotifMeta {
  if (!type) {
    return {
      icon: InboxIcon,
      color: "var(--tb-text-muted)",
      label: t ? t("inbox.typeNotification") : "Notification",
    };
  }

  const key = type.toLowerCase();

  for (const rule of TYPE_RULES) {
    if (key.includes(rule.match)) {
      return {
        icon: rule.icon,
        color: rule.color,
        label:
          rule.labelKey && t
            ? t(rule.labelKey)
            : rule.label || type,
      };
    }
  }

  return {
    icon: Mail,
    color: "var(--tb-text-muted)",
    label: t ? t("inbox.typeNotification") : type,
  };
}

export function translateNotif(
  t: I18nT,
  text?: string | null,
  lang?: string,
): string {
  if (!text) return "";

  if (lang) return translateNotifText(text, lang);

  const translated = t(`notifTexts.${text}`);
  if (translated !== `notifTexts.${text}`) return translated;

  const match = text.match(
    /^Your recovery email \(([^)]+)\) has been confirmed\.$/,
  );

  if (match) {
    return t("notifTexts.recoveryEmailBody", { email: match[1] });
  }

  return text;
}

export function notifTimeAgo(iso: string, t: I18nT, lang: string): string {
  const date = new Date(iso);
  const diff = Math.max(0, Date.now() - date.getTime());

  if (diff < 60_000) return t("common.justNow");
  if (diff < 3_600_000) {
    return t("common.agoM", { n: Math.floor(diff / 60_000) });
  }
  if (diff < 86_400_000) {
    return t("common.agoH", { n: Math.floor(diff / 3_600_000) });
  }
  if (diff < 172_800_000) return t("common.yesterday");

  return date.toLocaleDateString(lang, {
    month: "short",
    day: "numeric",
  });
}

export function notifFullDate(iso: string, lang: string): string {
  return new Date(iso).toLocaleString(lang, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}
