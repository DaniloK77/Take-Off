import RemoteImage from "@/components/RemoteImage";
import { findAirport, flagEmoji } from "@/lib/flights/airports";
import { formatDate } from "@/lib/flights/format";
import {
  CABINS,
  passengerCount,
  type FlightSearch,
} from "@/lib/flights/search-params";
import type { Place } from "@/lib/flights/types";

interface Props {
  search: FlightSearch;
  origin: Place | null;
  destination: Place | null;
  title?: string;
}

function cityOf(place: Place | null, code: string) {
  return place?.city ?? findAirport(code)?.city ?? code;
}

const DestinationHero = ({ search, origin, destination, title }: Props) => {
  const toCity = cityOf(destination, search.to);
  const flag = (place: Place | null, code: string) =>
    flagEmoji(place?.countryCode ?? findAirport(code)?.countryCode ?? "");
  const travellers = passengerCount(search);
  const cabin = CABINS.find((option) => option.value === search.cabin)?.label;

  return (
    <section className="destination-hero">
      <div className="destination-copy">
        {/* Flags live outside the h1: its gradient text would clip emoji to a blank shape. */}
        <p className="eyebrow">
          <span aria-hidden>{flag(origin, search.from)} </span>
          {cityOf(origin, search.from)} ({search.from}) →{" "}
          <span aria-hidden>{flag(destination, search.to)} </span>
          {toCity} ({search.to})
        </p>
        <h1>{title ?? `Flights to ${toCity}`}</h1>
        <p className="text-light-100">
          {formatDate(search.depart)}
          {search.return && ` – ${formatDate(search.return)}`} · {travellers}{" "}
          {travellers === 1 ? "traveller" : "travellers"} · {cabin}
        </p>
      </div>

      {destination?.image && (
        // Google's city photos are ~1080px wide; capping the frame at 560px keeps them sharp on 2x screens.
        <div className="destination-image">
          <RemoteImage
            src={destination.image}
            alt={`${destination.city}, ${destination.country}`}
            sizes="(min-width: 1024px) 560px, 100vw"
            quality={90}
            priority
            className="object-cover"
          />
        </div>
      )}
    </section>
  );
};

export default DestinationHero;
