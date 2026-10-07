// Shared by server and client code: keep this module free of server-only imports.

import { IATA_CODE } from "./airports";

export const CABINS = [
  { value: "economy", label: "Economy", serpApi: 1 },
  { value: "premium", label: "Premium economy", serpApi: 2 },
  { value: "business", label: "Business", serpApi: 3 },
  { value: "first", label: "First", serpApi: 4 },
] as const;
export type Cabin = (typeof CABINS)[number]["value"];

// Stops and sort are applied to the fetched results locally, so changing them
// is instant and doesn't spend SerpApi quota.
export const STOP_FILTERS = [
  { value: "any", label: "Any stops" },
  { value: "0", label: "Nonstop" },
  { value: "1", label: "1 stop or fewer" },
] as const;
export type StopFilter = (typeof STOP_FILTERS)[number]["value"];

export const SORT_OPTIONS = [
  { value: "best", label: "Best" },
  { value: "price", label: "Cheapest" },
  { value: "duration", label: "Fastest" },
  { value: "departure", label: "Earliest" },
] as const;
export type SortOption = (typeof SORT_OPTIONS)[number]["value"];

export type TripType = "round" | "oneway";

export const MAX_PASSENGERS = 9;

/** Days from today used when a link (e.g. a popular route) carries no dates. */
const DEFAULT_DEPART_IN_DAYS = 14;
const DEFAULT_TRIP_LENGTH_DAYS = 7;

export interface FlightSearch {
  from: string;
  to: string;
  trip: TripType;
  /** YYYY-MM-DD */
  depart: string;
  /** YYYY-MM-DD, only for round trips. */
  return: string | null;
  adults: number;
  children: number;
  cabin: Cabin;
  stops: StopFilter;
  sort: SortOption;
}

export type RawSearchParams = Record<string, string | string[] | undefined>;

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/** YYYY-MM-DD in the runtime's local time zone. */
export function toIsoDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function addDays(isoDate: string, days: number): string {
  const [y, m, d] = isoDate.split("-").map(Number);
  return toIsoDate(new Date(y, m - 1, d + days));
}

function first(value: string | string[] | undefined): string {
  return (Array.isArray(value) ? value[0] : value) ?? "";
}

/** Reads a single query param, e.g. a departure or booking token. */
export function readParam(raw: RawSearchParams, key: string): string {
  return first(raw[key]).trim();
}

function clampInt(value: string, min: number, max: number, fallback: number) {
  const n = Number.parseInt(value, 10);
  return Number.isFinite(n) ? Math.min(Math.max(n, min), max) : fallback;
}

function pick<T extends string>(
  options: readonly { value: T }[],
  value: string,
  fallback: T,
): T {
  return options.find((option) => option.value === value)?.value ?? fallback;
}

function isValidIsoDate(value: string): boolean {
  if (!ISO_DATE.test(value)) return false;
  const [y, m, d] = value.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return date.getMonth() === m - 1 && date.getDate() === d;
}

function defaultDates(today: string) {
  const depart = addDays(today, DEFAULT_DEPART_IN_DAYS);
  return { depart, return: addDays(depart, DEFAULT_TRIP_LENGTH_DAYS) };
}

/** Reads a search from the URL, filling in defaults for anything missing or malformed. */
export function parseFlightSearch(raw: RawSearchParams, today: string): FlightSearch {
  const defaults = defaultDates(today);
  const trip: TripType = first(raw.trip) === "oneway" ? "oneway" : "round";
  const departRaw = first(raw.depart);
  const depart = isValidIsoDate(departRaw) ? departRaw : defaults.depart;
  const returnRaw = first(raw.return);
  const returnDate = isValidIsoDate(returnRaw)
    ? returnRaw
    : addDays(depart, DEFAULT_TRIP_LENGTH_DAYS);

  const adults = clampInt(first(raw.adults), 1, MAX_PASSENGERS, 1);

  return {
    from: first(raw.from).trim().toUpperCase(),
    to: first(raw.to).trim().toUpperCase(),
    trip,
    depart,
    return: trip === "round" ? returnDate : null,
    adults,
    children: clampInt(first(raw.children), 0, MAX_PASSENGERS - adults, 0),
    cabin: pick(CABINS, first(raw.cabin), "economy"),
    stops: pick(STOP_FILTERS, first(raw.stops), "any"),
    sort: pick(SORT_OPTIONS, first(raw.sort), "best"),
  };
}

/** Returns human readable problems; an empty list means the search can run. */
export function validateFlightSearch(search: FlightSearch, today: string): string[] {
  const errors: string[] = [];
  if (!IATA_CODE.test(search.from)) errors.push("Choose where you're flying from.");
  if (!IATA_CODE.test(search.to)) errors.push("Choose where you're flying to.");
  if (search.from && search.from === search.to) {
    errors.push("Origin and destination must be different.");
  }
  if (search.depart < today) errors.push("The departure date is in the past.");
  if (search.return && search.return < search.depart) {
    errors.push("The return date must be on or after the departure date.");
  }
  return errors;
}

export function isSearchStarted(search: FlightSearch): boolean {
  return Boolean(search.from || search.to);
}

/** Serialises a search for the URL, leaving out defaults so links stay short. */
export function toQueryString(
  search: FlightSearch,
  extra: Record<string, string> = {},
): string {
  const params = new URLSearchParams({
    from: search.from,
    to: search.to,
    depart: search.depart,
  });
  if (search.trip === "oneway") params.set("trip", "oneway");
  if (search.return) params.set("return", search.return);
  if (search.adults !== 1) params.set("adults", String(search.adults));
  if (search.children > 0) params.set("children", String(search.children));
  if (search.cabin !== "economy") params.set("cabin", search.cabin);
  if (search.stops !== "any") params.set("stops", search.stops);
  if (search.sort !== "best") params.set("sort", search.sort);
  for (const [key, value] of Object.entries(extra)) params.set(key, value);
  return `?${params}`;
}

export function flightsHref(search: FlightSearch, overrides: Partial<FlightSearch> = {}) {
  return `/flights${toQueryString({ ...search, ...overrides })}`;
}

export function returnFlightsHref(search: FlightSearch, departureToken: string) {
  return `/flights/return${toQueryString(search, { token: departureToken })}`;
}

export function bookingHref(
  search: FlightSearch,
  bookingToken: string,
  departureToken?: string | null,
) {
  return `/flights/booking${toQueryString(search, {
    token: bookingToken,
    ...(departureToken ? { outbound: departureToken } : {}),
  })}`;
}

export function passengerCount(search: Pick<FlightSearch, "adults" | "children">) {
  return search.adults + search.children;
}

/** Label under prices: Google quotes the total for all travellers. */
export function priceNote(search: Pick<FlightSearch, "trip" | "adults" | "children">) {
  const trip = search.trip === "round" ? "round trip" : "one way";
  const travellers = passengerCount(search);
  return travellers > 1 ? `${trip}, ${travellers} travellers` : trip;
}
