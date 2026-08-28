/**
 * Shared helper utilities for the Tirbeo dashboard.
 *
 * These functions are used across multiple pages and components.
 * Keep them here to avoid duplication.
 */

/** Extract 1-2 letter initials from a name string. */
export function initialsOf(name: string | null | undefined): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  return parts.length === 1
    ? parts[0].slice(0, 2).toUpperCase()
    : (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/** Relative time string (e.g. "5m ago", "2h ago", "yesterday"). */
export function timeAgo(
  iso: string,
  t: (key: string, vars?: Record<string, string | number>) => string,
): string {
  const diff = Date.now() - new Date(iso).getTime();
  if (diff < 60_000) return t("common.justNow");
  if (diff < 3_600_000) return t("common.agoM", { n: Math.floor(diff / 60_000) });
  if (diff < 86_400_000) return t("common.agoH", { n: Math.floor(diff / 3_600_000) });
  if (diff < 172_800_000) return t("common.yesterday");
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(iso));
}

/** Full date string for tooltips (e.g. "Mon, Jan 5, 2026, 3:42 PM"). */
export function fullDate(iso: string, lang?: string): string {
  return new Intl.DateTimeFormat(lang || undefined, {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(iso));
}

/** Parse a user-agent string into browser + OS labels. */
export function parseUserAgent(
  ua: string | null | undefined,
  t: (key: string) => string,
): { browser: string; os: string } {
  if (!ua) return { browser: t("sessions.unknownBrowser"), os: t("sessions.unknownOS") };

  let browser = t("sessions.unknownBrowser");
  if (ua.includes("Firefox")) browser = "Firefox";
  else if (ua.includes("Edg")) browser = "Edge";
  else if (ua.includes("Chrome") && !ua.includes("Edg")) browser = "Chrome";
  else if (ua.includes("Safari") && !ua.includes("Chrome")) browser = "Safari";
  else if (ua.includes("Opera") || ua.includes("OPR")) browser = "Opera";

  let os = t("sessions.unknownOS");
  if (ua.includes("Windows NT 10") || ua.includes("Windows")) os = "Windows";
  else if (ua.includes("Mac OS X")) os = "macOS";
  else if (ua.includes("Linux") && !ua.includes("Android")) os = "Linux";
  else if (ua.includes("Android")) os = "Android";
  else if (ua.includes("iPhone") || ua.includes("iPad")) os = "iOS";

  return { browser, os };
}

/** Format a date as a short label (e.g. "Jan 5"). */
export function shortDate(iso: string, lang?: string): string {
  return new Intl.DateTimeFormat(lang || undefined, {
    month: "short",
    day: "numeric",
  }).format(new Date(iso));
}

/** Format today's date as a long label (e.g. "Monday, January 5, 2026"). */
export function todayLabel(lang?: string): string {
  return new Intl.DateTimeFormat(lang || undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date());
}

/** Day label for grouping (Today, Yesterday, or full date). */
export function dayLabel(
  iso: string,
  lang: string,
  t: (key: string) => string,
): string {
  const d = new Date(iso);
  const now = new Date();
  const yesterday = new Date(Date.now() - 86_400_000);

  const sameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  if (sameDay(d, now)) return t("history.today");
  if (sameDay(d, yesterday)) return t("common.yesterday");
  return d.toLocaleDateString(lang, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}
