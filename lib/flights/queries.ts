import "server-only";

import { flightsConfig } from "@/lib/config";
import {
  SerpApiError,
  serpApiSearch,
  shouldUseFixtures,
} from "@/lib/serpapi/client";
import bookingFixture from "@/lib/serpapi/fixtures/booking.json";
import returnFixture from "@/lib/serpapi/fixtures/return.json";
import searchFixture from "@/lib/serpapi/fixtures/search.json";
import {
  toBookingOptions,
  toFlightOption,
  toFlightOptions,
  toPlaces,
  toPriceInsights,
} from "./mappers";
import { CABINS, type FlightSearch } from "./search-params";
import type {
  BookingResult,
  FlightOption,
  FlightsResult,
  RawBookingResponse,
  RawFlightsResponse,
} from "./types";

type SearchParams = Record<string, string | number | undefined>;

/** Parameters shared by every step of a search: results, return flights, booking. */
function baseParams(search: FlightSearch): SearchParams {
  return {
    engine: "google_flights",
    departure_id: search.from,
    arrival_id: search.to,
    outbound_date: search.depart,
    return_date: search.return ?? undefined,
    type: search.trip === "round" ? 1 : 2,
    travel_class: CABINS.find((cabin) => cabin.value === search.cabin)?.serpApi,
    adults: search.adults,
    children: search.children || undefined,
    currency: flightsConfig.currency,
    hl: "en",
  };
}

/** Demo responses are real SerpApi output for BEG → CDG, used regardless of the search. */
async function request<T extends object>(
  params: SearchParams,
  fixture: T,
): Promise<{ data: T | null; isDemo: boolean }> {
  if (shouldUseFixtures()) return { data: fixture, isDemo: true };
  return { data: await serpApiSearch<T>(params), isDemo: false };
}

function toErrorResult(error: unknown) {
  if (error instanceof SerpApiError) {
    console.error(`[flights] ${error.code}: ${error.message}`);
    return { status: "error" as const, reason: error.code, message: error.message };
  }
  throw error;
}

function googleFlightsUrl(data: { search_metadata?: { google_flights_url?: string } } | null) {
  const url = data?.search_metadata?.google_flights_url;
  return url?.startsWith("https://www.google.com/") ? url : null;
}

async function fetchFlights(params: SearchParams, fixture: RawFlightsResponse): Promise<FlightsResult> {
  try {
    const { data, isDemo } = await request<RawFlightsResponse>(params, fixture);
    return {
      status: "ok",
      flights: data ? toFlightOptions(data) : [],
      priceInsights: toPriceInsights(data?.price_insights),
      ...(data ? toPlaces(data) : { origin: null, destination: null }),
      googleFlightsUrl: googleFlightsUrl(data),
      isDemo,
    };
  } catch (error) {
    return toErrorResult(error);
  }
}

/** Outbound options (round trip) or complete itineraries (one way). */
export function searchFlights(search: FlightSearch): Promise<FlightsResult> {
  return fetchFlights(baseParams(search), searchFixture);
}

/** Return options for the outbound flight identified by `departureToken`. */
export function searchReturnFlights(
  search: FlightSearch,
  departureToken: string,
): Promise<FlightsResult> {
  return fetchFlights(
    { ...baseParams(search), departure_token: departureToken },
    returnFixture,
  );
}

/**
 * Finds the outbound flight a departure token belongs to. The search it came
 * from is served from cache, so this doesn't cost an extra request.
 */
export async function findOutboundFlight(
  search: FlightSearch,
  departureToken: string,
): Promise<FlightOption | null> {
  const result = await searchFlights(search);
  if (result.status !== "ok") return null;
  return result.flights.find((flight) => flight.departureToken === departureToken) ?? null;
}

export async function getBookingOptions(
  search: FlightSearch,
  bookingToken: string,
): Promise<BookingResult> {
  try {
    const { data, isDemo } = await request<RawBookingResponse>(
      { ...baseParams(search), booking_token: bookingToken },
      bookingFixture,
    );
    return {
      status: "ok",
      legs: (data?.selected_flights ?? [])
        .map((raw) => toFlightOption(raw, false))
        .filter((leg): leg is FlightOption => leg !== null),
      options: toBookingOptions(data?.booking_options ?? []),
      googleFlightsUrl: googleFlightsUrl(data),
      isDemo,
    };
  } catch (error) {
    return toErrorResult(error);
  }
}
