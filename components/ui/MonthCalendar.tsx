"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Tooltip } from "@/components/ui/Tooltip";
import { useI18n } from "@/lib/i18n";
import { LOCALES } from "@/lib/locales";

function isSameDay(a: Date, b: Date) { return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate(); }

export function MonthCalendar({ onClose }: { onClose?: () => void }) {
  const { t, lang } = useI18n();
  const locale = LOCALES[lang] ?? LOCALES.en;

  const today = new Date();
  const [cursor, setCursor] = useState(new Date(today.getFullYear(), today.getMonth(), 1));

  const days = useMemo(() => {
    const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
    const startDay = first.getDay();
    const start = new Date(cursor.getFullYear(), cursor.getMonth(), 1 - startDay);
    return Array.from({ length: 42 }, (_, i) => new Date(start.getFullYear(), start.getMonth(), start.getDate() + i));
  }, [cursor]);

  const months = useMemo(
    () => Array.from({ length: 12 }, (_, i) => new Intl.DateTimeFormat(locale, { month: "long" }).format(new Date(2000, i, 1))),
    [locale],
  );

  const dow = useMemo(
    () => Array.from({ length: 7 }, (_, i) => new Intl.DateTimeFormat(locale, { weekday: "narrow" }).format(new Date(2024, 0, i + 1))),
    [locale],
  );

  const monthLabel = (d: Date) => `${months[d.getMonth()]} ${d.getFullYear()}`;

  const dayTooltip = (date: Date): string => {
    const a = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const b = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const diff = Math.round((a.getTime() - b.getTime()) / 86_400_000);
    const full = new Intl.DateTimeFormat(locale, {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    }).format(date);
    if (diff === 0) return `${t("calendar.today")} · ${full}`;
    if (diff === -1) return `${t("calendar.yesterday")} · ${full}`;
    if (diff === 1) return `${t("calendar.tomorrow")} · ${full}`;
    if (diff < 0) return `${t("calendar.daysAgo", { n: -diff })} · ${full}`;
    return `${t("calendar.inDays", { n: diff })} · ${full}`;
  };

  const goPreviousMonth = () => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1));
  const goNextMonth = () => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1));
  const goToday = () => { setCursor(new Date(today.getFullYear(), today.getMonth(), 1)); onClose?.(); };

  return (
    <div className="tb-calendar-pop" role="dialog" aria-label={t("header.calendar")}>
      <div className="tb-calendar-head">
        <Tooltip label={t("calendar.prevMonth")} side="bottom" delay={120}>
          <button type="button" className="tb-calendar-arrow" onClick={goPreviousMonth} aria-label={t("calendar.prevMonth")}>
            <ChevronLeft size={15} />
          </button>
        </Tooltip>
        <Tooltip label={t("calendar.backToToday")} side="bottom" delay={120}>
          <button type="button" className="tb-calendar-title" onClick={goToday} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
            {monthLabel(cursor)}
          </button>
        </Tooltip>
        <Tooltip label={t("calendar.nextMonth")} side="bottom" delay={120}>
          <button type="button" className="tb-calendar-arrow" onClick={goNextMonth} aria-label={t("calendar.nextMonth")}>
            <ChevronRight size={15} />
          </button>
        </Tooltip>
      </div>
      <div className="tb-calendar-grid">
        {dow.map((day, index) => (
          <div key={`${day}-${index}`} className={`tb-calendar-dow ${index === 6 ? "saturday" : ""}`}>{day}</div>
        ))}
        {days.map((date, index) => {
          const inMonth = date.getMonth() === cursor.getMonth();
          const isToday = isSameDay(date, today);
          return (
            <Tooltip key={`${date.getFullYear()}-${date.getMonth()}-${date.getDate()}-${index}`} label={dayTooltip(date)} side="top" delay={120}>
              <div
                className={`tb-calendar-day ${!inMonth ? "other" : ""} ${isToday ? "today" : ""}`}
              >
                <span className="tb-calendar-day-number">{date.getDate()}</span>
              </div>
            </Tooltip>
          );
        })}
      </div>
    </div>
  );
}
