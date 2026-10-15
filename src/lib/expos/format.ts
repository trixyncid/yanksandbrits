import type { Expo } from "./schema";

// Shared by the Expo page and the home page. Always in Medan time (WIB), whoever renders it.
const dayFormat = new Intl.DateTimeFormat("en-GB", { weekday: "short", day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Jakarta" });
const timeFormat = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Jakarta" });
const weekday = new Intl.DateTimeFormat("en-GB", { weekday: "short", timeZone: "Asia/Jakarta" });
const dayMonth = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", timeZone: "Asia/Jakarta" });
// "Sat, 5 Dec": en-GB drops the comma after a short weekday, so it is added here to match dayFormat.
const shortDay = { format: (date: Date) => `${weekday.format(date)}, ${dayMonth.format(date)}` };

/** "Sat, 14 November 2026 · 10:00 WIB", or a range across days. `null` when the date is not set. */
export function expoDateLabel(expo: Pick<Expo, "startsAt" | "endsAt">) {
  if (!expo.startsAt) return null;
  const start = new Date(expo.startsAt);
  const end = expo.endsAt ? new Date(expo.endsAt) : null;
  if (end && dayFormat.format(end) !== dayFormat.format(start)) return `${shortDay.format(start)} – ${dayFormat.format(end)}`;
  return `${dayFormat.format(start)} · ${timeFormat.format(start)}${end ? `–${timeFormat.format(end)}` : ""} WIB`;
}
