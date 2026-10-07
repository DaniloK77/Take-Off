import type { SerpApiErrorCode } from "@/lib/serpapi/client";

// ── Raw SerpApi Google Flights shapes ────────────────────────────────────────
// Reference: https://serpapi.com/google-flights-api. Everything is optional
// because Google omits whatever it doesn't know.

export interface RawAirportTime {
  name?: string;
  id?: string;
  /** Local time at the airport, "2026-11-12 06:30". */
  time?: string;
}

export interface RawSegment {
  departure_airport?: RawAirportTime;
  arrival_airport?: RawAirportTime;
  /** Minutes. */
  duration?: number;
  airplane?: string;
  airline?: string;
  airline_logo?: string;
  travel_class?: string;
  flight_number?: string;
  legroom?: string;
  extensions?: string[];
  overnight?: boolean;
  often_delayed_by_over_30_min?: boolean;
}

export interface RawLayover {
  duration?: number;
  name?: string;
  id?: string;
  overnight?: boolean;
}

export interface RawFlightOption {
  flights?: RawSegment[];
  layovers?: RawLayover[];
  total_duration?: number;
  carbon_emissions?: {
    /** Grams. */
    this_flight?: number;
    typical_for_this_route?: number;
    difference_percent?: number;
  };
  price?: number;
  type?: string;
  airline_logo?: string;
  extensions?: string[];
  /** Round trips: fetch the return options for this outbound flight. */
  departure_token?: string;
  /** One-way trips and return legs: fetch booking options. */
  booking_token?: string;
}

export interface RawPriceInsights {
  lowest_price?: number;
  price_level?: string;
  typical_price_range?: number[];
  /** [unix seconds, price] pairs. */
  price_history?: number[][];
}

export interface RawPlace {
  airport?: { id?: string; name?: string };
  city?: string;
  country?: string;
  country_code?: string;
  /** City photo, ~1080px wide. */
  image?: string;
  thumbnail?: string;
}

export interface RawFlightsResponse {
  search_metadata?: { google_flights_url?: string };
  best_flights?: RawFlightOption[];
  other_flights?: RawFlightOption[];
  price_insights?: RawPriceInsights;
  airports?: { departure?: RawPlace[]; arrival?: RawPlace[] }[];
}

export interface RawBookingDetails {
  book_with?: string;
  airline?: boolean;
  airline_logos?: string[];
  marketed_as?: string[];
  price?: number;
  baggage_prices?: string[];
  option_title?: string;
  extensions?: string[];
  booking_request?: { url?: string; post_data?: string };
}

export interface RawBookingOption {
  together?: RawBookingDetails;
  departing?: RawBookingDetails;
  returning?: RawBookingDetails;
}

export interface RawBookingResponse {
  search_metadata?: { google_flights_url?: string };
  selected_flights?: RawFlightOption[];
  booking_options?: RawBookingOption[];
  price_insights?: RawPriceInsights;
}

// ── Normalised shapes the UI consumes ────────────────────────────────────────

export interface FlightEndpoint {
  code: string;
  name: string;
  /** Local time, "2026-11-12 06:30". */
  time: string;
}

export interface FlightSegment {
  from: FlightEndpoint;
  to: FlightEndpoint;
  durationMinutes: number;
  airline: string;
  airlineLogo: string | null;
  flightNumber: string | null;
  airplane: string | null;
  travelClass: string | null;
  legroom: string | null;
  overnight: boolean;
  oftenDelayed: boolean;
}

export interface FlightLayover {
  code: string;
  name: string;
  durationMinutes: number;
  overnight: boolean;
}

export interface FlightOption {
  /** Stable key derived from flight numbers and times. */
  id: string;
  segments: FlightSegment[];
  layovers: FlightLayover[];
  stops: number;
  totalDurationMinutes: number;
  departure: FlightEndpoint;
  arrival: FlightEndpoint;
  airlines: string[];
  airlineLogo: string | null;
  /** Total trip price in the search currency. */
  price: number | null;
  emissions: { kg: number; differencePercent: number | null } | null;
  extensions: string[];
  departureToken: string | null;
  bookingToken: string | null;
  /** Google ranked it among the "best" flights. */
  isBest: boolean;
}

export type PriceLevel = "low" | "typical" | "high";

export interface PriceInsights {
  lowestPrice: number | null;
  level: PriceLevel | null;
  typicalRange: [number, number] | null;
  history: { date: number; price: number }[];
}

export interface Place {
  code: string;
  airportName: string;
  city: string;
  country: string;
  countryCode: string;
  image: string | null;
}

export interface BookingOffer {
  provider: string;
  isAirline: boolean;
  logos: string[];
  price: number | null;
  baggage: string[];
  flightNumbers: string[];
  /** Google's redirect is a form POST, so the fields are sent from a <form>. */
  request: { url: string; fields: [string, string][] };
}

export type BookingOption =
  | { kind: "single"; id: string; offer: BookingOffer }
  | {
      kind: "split";
      id: string;
      totalPrice: number | null;
      departing: BookingOffer;
      returning: BookingOffer;
    };

// ── Query results ────────────────────────────────────────────────────────────

export type FlightsErrorReason = SerpApiErrorCode;

type ErrorResult = {
  status: "error";
  reason: FlightsErrorReason;
  message: string;
};

export type FlightsResult =
  | {
      status: "ok";
      flights: FlightOption[];
      priceInsights: PriceInsights | null;
      origin: Place | null;
      destination: Place | null;
      googleFlightsUrl: string | null;
      isDemo: boolean;
    }
  | ErrorResult;

export type BookingResult =
  | {
      status: "ok";
      legs: FlightOption[];
      options: BookingOption[];
      googleFlightsUrl: string | null;
      isDemo: boolean;
    }
  | ErrorResult;
