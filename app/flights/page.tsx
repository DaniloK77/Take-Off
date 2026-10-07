import { Suspense } from "react";
import type { Metadata } from "next";
import { ExternalLink, PlaneTakeoff } from "lucide-react";
import { ApiNotice, DemoBanner } from "@/components/ApiNotice";
import DestinationHero from "@/components/DestinationHero";
import FlightFilters from "@/components/FlightFilters";
import FlightList, { FlightListSkeleton } from "@/components/FlightList";
import FlightSearchForm from "@/components/FlightSearchForm";
import PriceInsights from "@/components/PriceInsights";
import { flightsConfig } from "@/lib/config";
import { findAirport } from "@/lib/flights/airports";
import { applyFlightFilters } from "@/lib/flights/filters";
import { searchFlights } from "@/lib/flights/queries";
import {
  bookingHref,
  flightsHref,
  isSearchStarted,
  parseFlightSearch,
  priceNote,
  returnFlightsHref,
  toIsoDate,
  toQueryString,
  validateFlightSearch,
  type FlightSearch,
  type RawSearchParams,
} from "@/lib/flights/search-params";

interface Props {
  searchParams: Promise<RawSearchParams>;
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const search = parseFlightSearch(await searchParams, toIsoDate(new Date()));
  const from = findAirport(search.from)?.city ?? search.from;
  const to = findAirport(search.to)?.city ?? search.to;

  return {
    title: from && to ? `Flights from ${from} to ${to}` : "Search flights",
    // Every search is a different URL; only the bare page should be indexed.
    robots: isSearchStarted(search) ? { index: false } : undefined,
  };
}

const FlightResults = async ({ search }: { search: FlightSearch }) => {
  const result = await searchFlights(search);

  if (result.status === "error") {
    return <ApiNotice reason={result.reason} message={result.message} />;
  }

  const flights = applyFlightFilters(result.flights, search);

  return (
    <div className="flex flex-col gap-8">
      {result.isDemo && <DemoBanner />}

      <DestinationHero
        search={search}
        origin={result.origin}
        destination={result.destination}
      />

      {result.flights.length === 0 ? (
        <div className="empty-state">
          <PlaneTakeoff aria-hidden className="size-10 text-light-200" />
          <p className="text-lg font-semibold">No flights found for these dates</p>
          <p className="text-light-200">Try nearby dates or another airport in the same city.</p>
        </div>
      ) : (
        <div className="results-layout">
          <div className="results-main">
            <FlightFilters
              search={search}
              path="/flights"
              shown={flights.length}
              total={result.flights.length}
            />
            <FlightList
              flights={flights}
              priceNote={priceNote(search)}
              resetHref={flightsHref(search, { stops: "any" })}
              actionFor={(flight) => {
                if (search.trip === "round" && flight.departureToken) {
                  return {
                    href: returnFlightsHref(search, flight.departureToken),
                    label: "Select",
                    event: "outbound_flight_selected",
                  };
                }
                if (flight.bookingToken) {
                  return {
                    href: bookingHref(search, flight.bookingToken),
                    label: "Select",
                    event: "flight_selected",
                  };
                }
                return null;
              }}
            />
          </div>

          <aside className="results-aside">
            {result.priceInsights && <PriceInsights insights={result.priceInsights} />}
            {result.googleFlightsUrl && (
              <a
                href={result.googleFlightsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="button-secondary w-full"
              >
                Open in Google Flights <ExternalLink aria-hidden className="size-4" />
              </a>
            )}
          </aside>
        </div>
      )}
    </div>
  );
};

const FlightsPage = async ({ searchParams }: Props) => {
  const today = toIsoDate(new Date());
  const search = parseFlightSearch(await searchParams, today);
  const started = isSearchStarted(search);
  const errors = started ? validateFlightSearch(search, today) : [];

  // Stops and sort are applied locally; keep them out of the key so changing
  // them doesn't flash the loading skeleton.
  const resultsKey = `results${toQueryString({ ...search, stops: "any", sort: "best" })}`;

  return (
    <div className="flex flex-col gap-8">
      {!started && (
        <div className="flex flex-col gap-3">
          <h1>Search flights</h1>
          <p className="text-light-100">
            Compare fares from hundreds of airlines and travel sites.
          </p>
        </div>
      )}

      <FlightSearchForm
        key={`form${toQueryString(search)}`}
        initial={started ? search : { ...search, from: flightsConfig.defaultOrigin }}
        today={today}
        variant="compact"
      />

      {started && errors.length > 0 && (
        <div className="notice notice-error" role="alert">
          <ul className="list-none">
            {errors.map((error) => (
              <li key={error}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      {started && errors.length === 0 && (
        <Suspense key={resultsKey} fallback={<FlightListSkeleton />}>
          <FlightResults search={search} />
        </Suspense>
      )}
    </div>
  );
};

export default FlightsPage;
