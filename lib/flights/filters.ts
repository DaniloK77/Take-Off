import type { SortOption, StopFilter } from "./search-params";
import type { FlightOption } from "./types";

const byNumber =
  (value: (flight: FlightOption) => number | null) =>
  (a: FlightOption, b: FlightOption) =>
    (value(a) ?? Infinity) - (value(b) ?? Infinity);

const SORTERS: Record<Exclude<SortOption, "best">, (a: FlightOption, b: FlightOption) => number> = {
  price: byNumber((flight) => flight.price),
  duration: byNumber((flight) => flight.totalDurationMinutes),
  // Local "YYYY-MM-DD HH:MM" strings sort chronologically as text.
  departure: (a, b) => a.departure.time.localeCompare(b.departure.time),
};

/** Filters and sorts already fetched flights; "best" keeps Google's ranking. */
export function applyFlightFilters(
  flights: FlightOption[],
  { stops, sort }: { stops: StopFilter; sort: SortOption },
): FlightOption[] {
  const filtered =
    stops === "any" ? flights : flights.filter((flight) => flight.stops <= Number(stops));
  return sort === "best" ? filtered : [...filtered].sort(SORTERS[sort]);
}
