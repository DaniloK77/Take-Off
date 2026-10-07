// Shared by server and client code. Formatting is pinned to fixed locales so
// server and client render identical markup.

import { flightsConfig } from "@/lib/config";

const priceFormat = new Intl.NumberFormat("en-IE", {
  style: "currency",
  currency: flightsConfig.currency,
  maximumFractionDigits: 0,
});

export function formatPrice(amount: number | null): string {
  return amount === null ? "—" : priceFormat.format(amount);
}

/** 160 -> "2h 40m" */
export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

/** "2026-11-12 06:30" -> "06:30" (airport local time) */
export function formatTime(localDateTime: string): string {
  return localDateTime.split(" ")[1] ?? localDateTime;
}

function parseIsoDate(isoDate: string): Date {
  const [y, m, d] = isoDate.slice(0, 10).split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

const shortDate = new Intl.DateTimeFormat("en-GB", {
  weekday: "short",
  day: "numeric",
  month: "short",
  timeZone: "UTC",
});

/** "2026-11-12" -> "Thu 12 Nov" */
export function formatDate(isoDate: string): string {
  return shortDate.format(parseIsoDate(isoDate)).replace(",", "");
}

/** Whole days between two local date-times, e.g. 1 for an overnight arrival. */
export function dayDifference(fromLocal: string, toLocal: string): number {
  const ms = parseIsoDate(toLocal).getTime() - parseIsoDate(fromLocal).getTime();
  return Math.round(ms / 86_400_000);
}

export function formatStops(stops: number): string {
  if (stops === 0) return "Nonstop";
  return stops === 1 ? "1 stop" : `${stops} stops`;
}

const monthDay = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  timeZone: "UTC",
});

/** Unix milliseconds -> "12 Nov" */
export function formatHistoryDate(ms: number): string {
  return monthDay.format(new Date(ms));
}
