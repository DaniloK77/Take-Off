"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import posthog from "posthog-js";
import {
  ArrowLeftRight,
  CalendarDays,
  LoaderCircle,
  PlaneLanding,
  PlaneTakeoff,
  Search,
} from "lucide-react";
import AirportCombobox from "@/components/AirportCombobox";
import {
  addDays,
  CABINS,
  flightsHref,
  MAX_PASSENGERS,
  validateFlightSearch,
  type Cabin,
  type FlightSearch,
  type TripType,
} from "@/lib/flights/search-params";
import { cn } from "@/lib/utils";

interface Props {
  initial: FlightSearch;
  /** YYYY-MM-DD from the server, so server and client agree on "today". */
  today: string;
  variant?: "hero" | "compact";
}

const range = (from: number, to: number) =>
  Array.from({ length: to - from + 1 }, (_, i) => from + i);

const FlightSearchForm = ({ initial, today, variant = "hero" }: Props) => {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [trip, setTrip] = useState<TripType>(initial.trip);
  const [from, setFrom] = useState(initial.from);
  const [to, setTo] = useState(initial.to);
  const [depart, setDepart] = useState(initial.depart);
  const [returnDate, setReturnDate] = useState(
    initial.return ?? addDays(initial.depart, 7),
  );
  const [adults, setAdults] = useState(initial.adults);
  const [children, setChildren] = useState(initial.children);
  const [cabin, setCabin] = useState<Cabin>(initial.cabin);
  const [errors, setErrors] = useState<string[]>([]);

  const search: FlightSearch = {
    ...initial,
    trip,
    from,
    to,
    depart,
    return: trip === "round" ? returnDate : null,
    adults,
    children,
    cabin,
  };

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const problems = validateFlightSearch(search, today);
    setErrors(problems);
    if (problems.length > 0) return;

    posthog.capture("flight_search_submitted", {
      from,
      to,
      trip,
      cabin,
      passengers: adults + children,
    });
    startTransition(() => router.push(flightsHref(search)));
  };

  const swap = () => {
    setFrom(to);
    setTo(from);
  };

  return (
    // action/method keep the form usable before JavaScript loads.
    <form
      action="/flights"
      method="get"
      onSubmit={onSubmit}
      noValidate
      className={cn("flight-search", variant === "compact" && "flight-search-compact")}
      aria-label="Search flights"
    >
      <div className="flight-search-options">
        <div role="radiogroup" aria-label="Trip type" className="segmented">
          {(["round", "oneway"] as const).map((value) => (
            <label key={value} className={cn(trip === value && "segmented-active")}>
              <input
                type="radio"
                name="trip"
                value={value}
                checked={trip === value}
                onChange={() => setTrip(value)}
                className="sr-only"
              />
              {value === "round" ? "Round trip" : "One way"}
            </label>
          ))}
        </div>

        <label className="select-pill">
          <span className="sr-only">Adults</span>
          <select name="adults" value={adults} onChange={(e) => {
            const next = Number(e.target.value);
            setAdults(next);
            setChildren((c) => Math.min(c, MAX_PASSENGERS - next));
          }}>
            {range(1, MAX_PASSENGERS).map((n) => (
              <option key={n} value={n}>
                {n} {n === 1 ? "adult" : "adults"}
              </option>
            ))}
          </select>
        </label>

        <label className="select-pill">
          <span className="sr-only">Children</span>
          <select name="children" value={children} onChange={(e) => setChildren(Number(e.target.value))}>
            {range(0, MAX_PASSENGERS - adults).map((n) => (
              <option key={n} value={n}>
                {n} {n === 1 ? "child" : "children"}
              </option>
            ))}
          </select>
        </label>

        <label className="select-pill">
          <span className="sr-only">Cabin class</span>
          <select name="cabin" value={cabin} onChange={(e) => setCabin(e.target.value as Cabin)}>
            {CABINS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="flight-search-fields">
        <div className="route-fields">
          <AirportCombobox
            name="from"
            label="From"
            icon={<PlaneTakeoff aria-hidden className="size-4 shrink-0 text-light-200" />}
            value={from}
            onChange={setFrom}
            placeholder="City or airport"
            invalid={errors.length > 0 && !from}
          />
          <button
            type="button"
            onClick={swap}
            className="swap-button"
            aria-label="Swap origin and destination"
          >
            <ArrowLeftRight aria-hidden className="size-4" />
          </button>
          <AirportCombobox
            name="to"
            label="To"
            icon={<PlaneLanding aria-hidden className="size-4 shrink-0 text-light-200" />}
            value={to}
            onChange={setTo}
            placeholder="City or airport"
            invalid={errors.length > 0 && (!to || to === from)}
          />
        </div>

        <div className="date-fields">
          <div className="field">
            <label htmlFor="depart" className="field-label">
              Departure
            </label>
            <div className="field-control">
              <CalendarDays aria-hidden className="size-4 shrink-0 text-light-200" />
              <input
                id="depart"
                type="date"
                name="depart"
                min={today}
                value={depart}
                required
                onChange={(e) => {
                  const next = e.target.value;
                  setDepart(next);
                  if (next && returnDate < next) setReturnDate(addDays(next, 7));
                }}
              />
            </div>
          </div>

          {trip === "round" && (
            <div className="field">
              <label htmlFor="return" className="field-label">
                Return
              </label>
              <div className="field-control">
                <CalendarDays aria-hidden className="size-4 shrink-0 text-light-200" />
                <input
                  id="return"
                  type="date"
                  name="return"
                  min={depart || today}
                  value={returnDate}
                  required
                  onChange={(e) => setReturnDate(e.target.value)}
                />
              </div>
            </div>
          )}
        </div>

        <button type="submit" className="search-button" disabled={pending}>
          {pending ? (
            <LoaderCircle aria-hidden className="size-5 animate-spin" />
          ) : (
            <Search aria-hidden className="size-5" />
          )}
          {pending ? "Searching…" : "Search"}
        </button>
      </div>

      {errors.length > 0 && (
        <ul role="alert" className="form-errors">
          {errors.map((error) => (
            <li key={error}>{error}</li>
          ))}
        </ul>
      )}
    </form>
  );
};

export default FlightSearchForm;
