"use client";

import posthog from "posthog-js";
import { BadgeCheck, Briefcase, ExternalLink } from "lucide-react";
import AirlineLogo from "@/components/AirlineLogo";
import { formatPrice } from "@/lib/flights/format";
import type { BookingOffer, BookingOption } from "@/lib/flights/types";

/**
 * Google's booking redirect expects a POST, so every offer is a tiny form that
 * opens the airline or travel agency in a new tab.
 */
const OfferForm = ({ offer, label }: { offer: BookingOffer; label: string }) => (
  <form
    action={offer.request.url}
    method="post"
    target="_blank"
    rel="noopener noreferrer"
    onSubmit={() =>
      posthog.capture("booking_option_clicked", {
        provider: offer.provider,
        airline: offer.isAirline,
        price: offer.price,
      })
    }
  >
    {offer.request.fields.map(([name, value]) => (
      <input key={name} type="hidden" name={name} value={value} />
    ))}
    <button type="submit" className="button-primary">
      {label}
      <ExternalLink aria-hidden className="size-4" />
      <span className="sr-only">(opens {offer.provider} in a new tab)</span>
    </button>
  </form>
);

const OfferRow = ({
  offer,
  label,
  note,
}: {
  offer: BookingOffer;
  label: string;
  note?: string;
}) => (
  <div className="offer">
    <AirlineLogo src={offer.logos[0] ?? null} alt={offer.provider} size={32} />
    <div className="offer-info">
      <p className="offer-provider">
        {offer.provider}
        {offer.isAirline && (
          <span className="offer-badge">
            <BadgeCheck aria-hidden className="size-3.5" /> Airline
          </span>
        )}
      </p>
      <p className="flight-sub">
        {[note, offer.flightNumbers.join(", ")].filter(Boolean).join(" · ")}
      </p>
      {offer.baggage.length > 0 && (
        <p className="offer-baggage">
          <Briefcase aria-hidden className="size-3.5" /> {offer.baggage.join(", ")}
        </p>
      )}
    </div>
    <p className="price">{formatPrice(offer.price)}</p>
    <OfferForm offer={offer} label={label} />
  </div>
);

const BookingOptions = ({ options }: { options: BookingOption[] }) => (
  <ul className="booking-options">
    {options.map((option) =>
      option.kind === "single" ? (
        <li key={option.id} className="panel">
          <OfferRow offer={option.offer} label="Continue" />
        </li>
      ) : (
        <li key={option.id} className="panel">
          <p className="offer-split-title">
            Book as two separate tickets
            {option.totalPrice !== null && (
              <span className="price"> · {formatPrice(option.totalPrice)} total</span>
            )}
          </p>
          <OfferRow offer={option.departing} label="Book departure" note="Departing" />
          <OfferRow offer={option.returning} label="Book return" note="Returning" />
        </li>
      ),
    )}
  </ul>
);

export default BookingOptions;
