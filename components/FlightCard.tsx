import { ChevronDown, Leaf, Moon, TriangleAlert } from "lucide-react";
import AirlineLogo from "@/components/AirlineLogo";
import TrackedLink from "@/components/TrackedLink";
import {
  dayDifference,
  formatDate,
  formatDuration,
  formatPrice,
  formatStops,
  formatTime,
} from "@/lib/flights/format";
import type { FlightOption } from "@/lib/flights/types";
import { cn } from "@/lib/utils";

interface Props {
  flight: FlightOption;
  /** "round trip", "one way"… shown under the price. Omit to hide the price. */
  priceNote?: string;
  action?: {
    href: string;
    label: string;
    event: string;
  };
  /** Optional label above the card, e.g. "Departing flight". */
  label?: string;
}

const DayOffset = ({ from, to }: { from: string; to: string }) => {
  const days = dayDifference(from, to);
  if (days === 0) return null;
  return (
    <sup className="day-offset" title={`Arrives ${formatDate(to)}`}>
      {days > 0 ? `+${days}` : days}
    </sup>
  );
};

const Emissions = ({ emissions }: { emissions: FlightOption["emissions"] }) => {
  if (!emissions) return null;
  const diff = emissions.differencePercent;
  const lower = diff !== null && diff < 0;

  return (
    <p
      className={cn("emissions", lower && "emissions-low")}
      title={`${emissions.kg} kg CO₂ per passenger`}
    >
      {lower && <Leaf aria-hidden className="size-3.5" />}
      {diff === null || diff === 0
        ? `${emissions.kg} kg CO₂`
        : `${diff > 0 ? "+" : "−"}${Math.abs(diff)}% CO₂`}
    </p>
  );
};

const FlightCard = ({ flight, priceNote, action, label }: Props) => {
  const { departure, arrival, layovers, segments } = flight;
  const airlines = flight.airlines.join(" · ");

  return (
    <article className="flight-card" aria-label={`${airlines}, ${formatTime(departure.time)} to ${formatTime(arrival.time)}`}>
      {(label || flight.isBest) && (
        <p className="flight-card-label">{label ?? "Best option"}</p>
      )}

      <div className="flight-summary">
        <AirlineLogo src={flight.airlineLogo} alt={airlines} size={35} />

        <div className="flight-col flight-col-wide">
          <p className="flight-times">
            {formatTime(departure.time)} – {formatTime(arrival.time)}
            <DayOffset from={departure.time} to={arrival.time} />
          </p>
          <p className="flight-sub">{airlines}</p>
        </div>

        <div className="flight-col">
          <p>{formatDuration(flight.totalDurationMinutes)}</p>
          <p className="flight-sub">
            {departure.code}–{arrival.code}
          </p>
        </div>

        <div className="flight-col">
          <p>{formatStops(flight.stops)}</p>
          {layovers.length > 0 && (
            <p className="flight-sub">
              {layovers
                .map((layover) => `${formatDuration(layover.durationMinutes)} ${layover.code}`)
                .join(", ")}
            </p>
          )}
        </div>

        <div className="flight-col max-md:hidden">
          <Emissions emissions={flight.emissions} />
        </div>

        {priceNote !== undefined && (
          <div className="flight-price">
            <p className="price">{formatPrice(flight.price)}</p>
            <p className="flight-sub">{priceNote}</p>
          </div>
        )}

        {action && (
          <TrackedLink
            href={action.href}
            event={action.event}
            properties={{ airline: airlines, price: flight.price, stops: flight.stops }}
            className="button-primary flight-action"
          >
            {action.label}
          </TrackedLink>
        )}
      </div>

      <details className="flight-details">
        <summary>
          Flight details
          <ChevronDown aria-hidden className="size-4 transition-transform" />
        </summary>

        <ol className="segments">
          {segments.map((segment, index) => (
            <li key={`${segment.flightNumber}-${segment.from.time}`}>
              <div className="segment">
                <div className="segment-timeline" aria-hidden>
                  <span />
                  <span />
                  <span />
                </div>
                <div className="segment-body">
                  <p>
                    <strong>{formatTime(segment.from.time)}</strong> · {segment.from.name} ({segment.from.code})
                  </p>
                  <p className="flight-sub">
                    Travel time {formatDuration(segment.durationMinutes)}
                  </p>
                  <p>
                    <strong>
                      {formatTime(segment.to.time)}
                      <DayOffset from={segment.from.time} to={segment.to.time} />
                    </strong>{" "}
                    · {segment.to.name} ({segment.to.code})
                  </p>
                  <p className="segment-meta">
                    {[
                      segment.airline,
                      segment.travelClass,
                      segment.airplane,
                      segment.flightNumber,
                      segment.legroom && `Legroom ${segment.legroom}`,
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                  {segment.oftenDelayed && (
                    <p className="warning">
                      <TriangleAlert aria-hidden className="size-3.5" /> Often delayed by 30+ min
                    </p>
                  )}
                </div>
              </div>

              {layovers[index] && (
                <p className="layover">
                  {formatDuration(layovers[index].durationMinutes)} layover · {layovers[index].name} ({layovers[index].code})
                  {layovers[index].overnight && (
                    <span className="warning">
                      <Moon aria-hidden className="size-3.5" /> Overnight
                    </span>
                  )}
                </p>
              )}
            </li>
          ))}
        </ol>

        {flight.extensions.length > 0 && (
          <ul className="extensions">
            {flight.extensions.map((extension) => (
              <li key={extension}>{extension}</li>
            ))}
          </ul>
        )}
      </details>
    </article>
  );
};

export default FlightCard;
