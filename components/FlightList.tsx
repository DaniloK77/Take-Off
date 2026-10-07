import Link from "next/link";
import { PlaneTakeoff } from "lucide-react";
import FlightCard from "@/components/FlightCard";
import type { FlightOption } from "@/lib/flights/types";

interface Props {
  flights: FlightOption[];
  priceNote: string;
  /** Builds the call to action for each flight; return null for none. */
  actionFor: (flight: FlightOption) => { href: string; label: string; event: string } | null;
  /** Link that clears the stop filter, shown when filtering left nothing. */
  resetHref?: string;
}

const FlightList = ({ flights, priceNote, actionFor, resetHref }: Props) => {
  if (flights.length === 0) {
    return (
      <div className="empty-state">
        <PlaneTakeoff aria-hidden className="size-10 text-light-200" />
        <p className="text-lg font-semibold">No flights match these filters</p>
        {resetHref && (
          <Link href={resetHref} className="button-secondary" scroll={false}>
            Show all flights
          </Link>
        )}
      </div>
    );
  }

  return (
    <ol className="flight-list">
      {flights.map((flight) => (
        <li key={flight.id}>
          <FlightCard
            flight={flight}
            priceNote={priceNote}
            action={actionFor(flight) ?? undefined}
          />
        </li>
      ))}
    </ol>
  );
};

export const FlightListSkeleton = ({ count = 5 }: { count?: number }) => (
  <div className="flex flex-col gap-6" aria-busy="true" aria-label="Searching flights">
    <div className="destination-hero">
      <div className="destination-copy">
        <div className="skeleton h-4 w-48" />
        <div className="skeleton h-12 w-80 max-w-full" />
        <div className="skeleton h-4 w-64" />
      </div>
      <div className="destination-image skeleton" />
    </div>
    <ol className="flight-list">
      {Array.from({ length: count }, (_, index) => (
        <li key={index} className="flight-card">
          <div className="flight-summary">
            <div className="skeleton size-[35px] rounded-md" />
            <div className="flex flex-1 flex-col gap-2">
              <div className="skeleton h-5 w-40" />
              <div className="skeleton h-3 w-24" />
            </div>
            <div className="skeleton h-8 w-20" />
          </div>
        </li>
      ))}
    </ol>
  </div>
);

export default FlightList;
