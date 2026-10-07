import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ExternalLink, Info } from "lucide-react";
import { ApiNotice, DemoBanner } from "@/components/ApiNotice";
import BookingOptions from "@/components/BookingOptions";
import BookingSteps from "@/components/BookingSteps";
import FlightCard from "@/components/FlightCard";
import { findAirport } from "@/lib/flights/airports";
import { getBookingOptions } from "@/lib/flights/queries";
import {
  flightsHref,
  parseFlightSearch,
  readParam,
  returnFlightsHref,
  toIsoDate,
  validateFlightSearch,
  type RawSearchParams,
} from "@/lib/flights/search-params";

export const metadata: Metadata = {
  title: "Book your flight",
  robots: { index: false },
};

interface Props {
  searchParams: Promise<RawSearchParams>;
}

const BookingPage = async ({ searchParams }: Props) => {
  const raw = await searchParams;
  const today = toIsoDate(new Date());
  const search = parseFlightSearch(raw, today);
  const token = readParam(raw, "token");
  const outboundToken = readParam(raw, "outbound");

  if (!token || validateFlightSearch(search, today).length > 0) notFound();

  const result = await getBookingOptions(search, token);
  const round = search.trip === "round";
  const toCity = findAirport(search.to)?.city ?? search.to;

  const steps = round
    ? [
        { label: "Departure", href: flightsHref(search) },
        {
          label: "Return",
          href: outboundToken ? returnFlightsHref(search, outboundToken) : undefined,
        },
        { label: "Book" },
      ]
    : [{ label: "Flight", href: flightsHref(search) }, { label: "Book" }];

  return (
    <div className="flex flex-col gap-8">
      <BookingSteps steps={steps} current={steps.length - 1} />

      <header className="flex flex-col gap-2">
        <p className="eyebrow">Almost there</p>
        <h1>Book your trip to {toCity}</h1>
      </header>

      {result.status === "error" ? (
        <ApiNotice reason={result.reason} message={result.message} />
      ) : (
        <>
          {result.isDemo && <DemoBanner />}

          <div className="results-layout">
            <section className="results-main" aria-labelledby="booking-options-title">
              <h2 id="booking-options-title" className="section-title">
                Booking options
              </h2>
              {result.options.length > 0 ? (
                <BookingOptions options={result.options} />
              ) : (
                <div className="empty-state">
                  <p className="text-lg font-semibold">No booking options right now</p>
                  <p className="text-light-200">
                    Fares change quickly. Try again or open the search in Google Flights.
                  </p>
                </div>
              )}
              <p className="flex items-start gap-2 text-sm text-light-200">
                <Info aria-hidden className="mt-0.5 size-4 shrink-0" />
                Prices come from Google Flights and are confirmed by the seller at checkout.
              </p>
            </section>

            <aside className="results-aside" aria-label="Your trip">
              <h2 className="section-title">Your trip</h2>
              {result.legs.map((leg, index) => (
                <FlightCard
                  key={leg.id}
                  flight={leg}
                  label={round ? (index === 0 ? "Departing" : "Returning") : "Flight"}
                />
              ))}
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
        </>
      )}
    </div>
  );
};

export default BookingPage;
