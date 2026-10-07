import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ApiNotice, DemoBanner } from "@/components/ApiNotice";
import BookingSteps from "@/components/BookingSteps";
import FlightCard from "@/components/FlightCard";
import FlightFilters from "@/components/FlightFilters";
import FlightList from "@/components/FlightList";
import { findAirport } from "@/lib/flights/airports";
import { applyFlightFilters } from "@/lib/flights/filters";
import { formatDate } from "@/lib/flights/format";
import { findOutboundFlight, searchReturnFlights } from "@/lib/flights/queries";
import {
  bookingHref,
  flightsHref,
  parseFlightSearch,
  priceNote,
  readParam,
  toIsoDate,
  toQueryString,
  validateFlightSearch,
  type RawSearchParams,
} from "@/lib/flights/search-params";

export const metadata: Metadata = {
  title: "Choose your return flight",
  robots: { index: false },
};

interface Props {
  searchParams: Promise<RawSearchParams>;
}

const ReturnFlightsPage = async ({ searchParams }: Props) => {
  const raw = await searchParams;
  const today = toIsoDate(new Date());
  const search = parseFlightSearch(raw, today);
  const token = readParam(raw, "token");

  if (!token || search.trip !== "round" || validateFlightSearch(search, today).length > 0) {
    notFound();
  }

  const [outbound, result] = await Promise.all([
    findOutboundFlight(search, token),
    searchReturnFlights(search, token),
  ]);

  const fromCity = findAirport(search.from)?.city ?? search.from;
  const toCity = findAirport(search.to)?.city ?? search.to;
  const extra = { token };

  return (
    <div className="flex flex-col gap-8">
      <BookingSteps
        current={1}
        steps={[
          { label: "Departure", href: flightsHref(search) },
          { label: "Return" },
          { label: "Book" },
        ]}
      />

      <header className="flex flex-col gap-2">
        <p className="eyebrow">
          {toCity} ({search.to}) → {fromCity} ({search.from})
        </p>
        <h1>Choose your return flight</h1>
        {search.return && <p className="text-light-100">{formatDate(search.return)}</p>}
      </header>

      {result.status === "ok" && result.isDemo && <DemoBanner />}

      {outbound && (
        <section className="flex flex-col gap-3" aria-label="Selected departing flight">
          <FlightCard flight={outbound} label="Your departing flight" />
          <Link href={flightsHref(search)} className="text-link text-sm">
            Change departing flight
          </Link>
        </section>
      )}

      {result.status === "error" ? (
        <ApiNotice reason={result.reason} message={result.message} />
      ) : (
        <section className="results-main" aria-label="Return flights">
          <FlightFilters
            search={search}
            path="/flights/return"
            extra={extra}
            shown={applyFlightFilters(result.flights, search).length}
            total={result.flights.length}
          />
          <FlightList
            flights={applyFlightFilters(result.flights, search)}
            priceNote={priceNote(search)}
            resetHref={`/flights/return${toQueryString({ ...search, stops: "any" }, extra)}`}
            actionFor={(flight) =>
              flight.bookingToken
                ? {
                    href: bookingHref(search, flight.bookingToken, token),
                    label: "Select",
                    event: "return_flight_selected",
                  }
                : null
            }
          />
        </section>
      )}
    </div>
  );
};

export default ReturnFlightsPage;
