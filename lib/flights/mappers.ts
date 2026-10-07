import type {
  BookingOffer,
  BookingOption,
  FlightLayover,
  FlightOption,
  FlightSegment,
  Place,
  PriceInsights,
  RawBookingDetails,
  RawBookingOption,
  RawFlightOption,
  RawFlightsResponse,
  RawPlace,
  RawPriceInsights,
  RawSegment,
} from "./types";

/** Accepts only absolute https URLs, so third-party data can't inject `javascript:` links. */
function safeUrl(value: string | undefined): string | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" ? url.href : null;
  } catch {
    return null;
  }
}

/** 32-bit FNV-1a, used for stable React keys. */
function shortHash(input: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(36);
}

function toSegment(raw: RawSegment): FlightSegment | null {
  const from = raw.departure_airport;
  const to = raw.arrival_airport;
  if (!from?.id || !from.time || !to?.id || !to.time) return null;

  return {
    from: { code: from.id, name: from.name ?? from.id, time: from.time },
    to: { code: to.id, name: to.name ?? to.id, time: to.time },
    durationMinutes: raw.duration ?? 0,
    airline: raw.airline ?? "Unknown airline",
    airlineLogo: safeUrl(raw.airline_logo),
    flightNumber: raw.flight_number ?? null,
    airplane: raw.airplane ?? null,
    travelClass: raw.travel_class ?? null,
    legroom: raw.legroom ?? null,
    overnight: Boolean(raw.overnight),
    oftenDelayed: Boolean(raw.often_delayed_by_over_30_min),
  };
}

export function toFlightOption(
  raw: RawFlightOption,
  isBest: boolean,
): FlightOption | null {
  const segments = (raw.flights ?? []).map(toSegment);
  if (segments.length === 0 || segments.some((segment) => !segment)) return null;
  const legs = segments as FlightSegment[];

  const layovers: FlightLayover[] = (raw.layovers ?? []).map((layover) => ({
    code: layover.id ?? "",
    name: layover.name ?? layover.id ?? "",
    durationMinutes: layover.duration ?? 0,
    overnight: Boolean(layover.overnight),
  }));

  const grams = raw.carbon_emissions?.this_flight;

  return {
    id: shortHash(legs.map((leg) => `${leg.flightNumber}@${leg.from.time}`).join("|")),
    segments: legs,
    layovers,
    stops: legs.length - 1,
    totalDurationMinutes:
      raw.total_duration ??
      legs.reduce((sum, leg) => sum + leg.durationMinutes, 0) +
        layovers.reduce((sum, layover) => sum + layover.durationMinutes, 0),
    departure: legs[0].from,
    arrival: legs[legs.length - 1].to,
    airlines: [...new Set(legs.map((leg) => leg.airline))],
    airlineLogo: safeUrl(raw.airline_logo) ?? legs[0].airlineLogo,
    price: raw.price ?? null,
    emissions:
      grams === undefined
        ? null
        : {
            kg: Math.round(grams / 1000),
            differencePercent: raw.carbon_emissions?.difference_percent ?? null,
          },
    extensions: raw.extensions ?? [],
    departureToken: raw.departure_token ?? null,
    bookingToken: raw.booking_token ?? null,
    isBest,
  };
}

export function toFlightOptions(response: RawFlightsResponse): FlightOption[] {
  const options = [
    ...(response.best_flights ?? []).map((raw) => toFlightOption(raw, true)),
    ...(response.other_flights ?? []).map((raw) => toFlightOption(raw, false)),
  ];

  // Google sometimes lists the same itinerary in both groups.
  const byId = new Map<string, FlightOption>();
  for (const option of options) {
    if (option && !byId.has(option.id)) byId.set(option.id, option);
  }
  return [...byId.values()];
}

export function toPriceInsights(raw: RawPriceInsights | undefined): PriceInsights | null {
  if (!raw) return null;
  const level = raw.price_level?.toLowerCase();
  const range = raw.typical_price_range;

  return {
    lowestPrice: raw.lowest_price ?? null,
    level: level === "low" || level === "typical" || level === "high" ? level : null,
    typicalRange: range && range.length === 2 ? [range[0], range[1]] : null,
    history: (raw.price_history ?? [])
      .filter((point) => point.length === 2)
      .map(([seconds, price]) => ({ date: seconds * 1000, price })),
  };
}

function toPlace(raw: RawPlace | undefined): Place | null {
  const code = raw?.airport?.id;
  if (!raw || !code) return null;
  return {
    code,
    airportName: raw.airport?.name ?? code,
    city: raw.city ?? code,
    country: raw.country ?? "",
    countryCode: raw.country_code ?? "",
    // `image` is ~1080px wide; `thumbnail` is a small square only used as a fallback.
    image: safeUrl(raw.image) ?? safeUrl(raw.thumbnail),
  };
}

export function toPlaces(response: RawFlightsResponse) {
  const outbound = response.airports?.[0];
  return {
    origin: toPlace(outbound?.departure?.[0]),
    destination: toPlace(outbound?.arrival?.[0]),
  };
}

/** Google's booking redirect only works on google.com; anything else is dropped. */
function toBookingRequest(raw: RawBookingDetails["booking_request"]) {
  const url = safeUrl(raw?.url);
  if (!url || !raw?.post_data) return null;
  const host = new URL(url).hostname;
  if (host !== "google.com" && !host.endsWith(".google.com")) return null;
  return { url, fields: [...new URLSearchParams(raw.post_data).entries()] };
}

function toBookingOffer(raw: RawBookingDetails | undefined): BookingOffer | null {
  const request = toBookingRequest(raw?.booking_request);
  if (!raw?.book_with || !request) return null;
  return {
    provider: raw.book_with,
    isAirline: Boolean(raw.airline),
    logos: (raw.airline_logos ?? []).map(safeUrl).filter((url): url is string => !!url),
    price: raw.price ?? null,
    baggage: raw.baggage_prices ?? [],
    flightNumbers: raw.marketed_as ?? [],
    request,
  };
}

export function toBookingOptions(raw: RawBookingOption[]): BookingOption[] {
  const options: BookingOption[] = [];

  raw.forEach((option, index) => {
    const together = toBookingOffer(option.together);
    if (together) {
      options.push({ kind: "single", id: `single-${index}`, offer: together });
      return;
    }
    // Some fares are sold as two separate one-way tickets.
    const departing = toBookingOffer(option.departing);
    const returning = toBookingOffer(option.returning);
    if (departing && returning) {
      options.push({
        kind: "split",
        id: `split-${index}`,
        totalPrice: option.together?.price ?? null,
        departing,
        returning,
      });
    }
  });

  return options;
}
