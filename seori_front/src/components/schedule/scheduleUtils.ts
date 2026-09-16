import type { ScheduleWeek } from "../../api/schedule";
import styles from "./SchedulePage.module.css";

export const DAY_KO = ["월", "화", "수", "목", "금", "토", "일"];
export const DEFAULT_BUSINESS_DAYS: boolean[] = [true, false, true, true, true, true, true];
export const PREFETCH_COUNT = 3;

export const BADGE_CLASS: Record<string, string> = {
  VOTING: styles.badgeVoting,
  CLOSED: styles.badgeClosed,
  CONFIRMED: styles.badgeConfirmed,
};

export const STATUS_LABEL: Record<string, string> = {
  VOTING: "투표중",
  CLOSED: "마감",
  CONFIRMED: "확정",
};

export function toLocalStr(d: Date): string {
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, "0"),
    String(d.getDate()).padStart(2, "0"),
  ].join("-");
}

export function getWeekDates(weekStart: string): string[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart + "T00:00:00");
    d.setDate(d.getDate() + i);
    return toLocalStr(d);
  });
}

export function getBusinessDates(week: ScheduleWeek): Array<{ date: string; dayIdx: number }> {
  return getWeekDates(week.weekStartDate)
    .map((date, i) => ({ date, dayIdx: i }))
    .filter((_, i) => week.businessDays[i]);
}

export function formatShort(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

export function formatDeadline(dl: string): string {
  const d = new Date(dl);
  const dow = DAY_KO[d.getDay() === 0 ? 6 : d.getDay() - 1];
  return `${d.getMonth() + 1}/${d.getDate()}(${dow}) ${d.getHours()}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export function defaultDeadlineStr(weekStart: string): string {
  if (!weekStart) return "";
  const d = new Date(weekStart + "T00:00:00");
  d.setDate(d.getDate() + 3);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}T21:00`;
}

export function formatWeekRange(weekStart: string): string {
  const s = new Date(weekStart + "T00:00:00");
  const e = new Date(weekStart + "T00:00:00");
  e.setDate(s.getDate() + 6);
  const sm = s.getMonth() + 1;
  const em = e.getMonth() + 1;
  const endStr = em !== sm ? `${em}/${e.getDate()}` : String(e.getDate());
  return `${s.getFullYear()}년 ${sm}월 · ${sm}/${s.getDate()}~${endStr}`;
}
