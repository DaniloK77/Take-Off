import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { flightsConfig } from "@/lib/config";
import { findAirport, flagEmoji } from "@/lib/flights/airports";

/** Links without dates: the results page fills in sensible defaults at request time. */
const PopularRoutes = () => {
  const origin = findAirport(flightsConfig.defaultOrigin);
  const destinations = flightsConfig.popularDestinations
    .map((code) => findAirport(code))
    .filter((airport) => airport !== undefined);

  return (
    <section className="section" aria-labelledby="popular-routes-title">
      <div className="section-header">
        <h2 id="popular-routes-title">Popular from {origin?.city ?? flightsConfig.defaultOrigin}</h2>
        <p className="text-sm text-light-200">Leaving in two weeks, back a week later</p>
      </div>
      <ul className="routes">
        {destinations.map((airport) => (
          <li key={airport.code}>
            <Link
              href={`/flights?from=${flightsConfig.defaultOrigin}&to=${airport.code}`}
              className="route-card"
            >
              <span aria-hidden className="route-flag">
                {flagEmoji(airport.countryCode)}
              </span>
              <span className="flex min-w-0 flex-col">
                <span className="route-city">{airport.city}</span>
                <span className="text-sm text-light-200">{airport.country}</span>
              </span>
              <span className="route-code">
                {flightsConfig.defaultOrigin} <ArrowRight aria-hidden className="size-3.5" /> {airport.code}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default PopularRoutes;
