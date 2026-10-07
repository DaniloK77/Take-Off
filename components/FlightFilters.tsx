import Link from "next/link";
import {
  SORT_OPTIONS,
  STOP_FILTERS,
  toQueryString,
  type FlightSearch,
} from "@/lib/flights/search-params";
import { cn } from "@/lib/utils";

interface Props {
  search: FlightSearch;
  /** Route the filter links point at, e.g. "/flights" or "/flights/return". */
  path: string;
  /** Extra query params to keep, e.g. the departure token. */
  extra?: Record<string, string>;
  shown: number;
  total: number;
}

const FlightFilters = ({ search, path, extra, shown, total }: Props) => {
  const href = (overrides: Partial<FlightSearch>) =>
    `${path}${toQueryString({ ...search, ...overrides }, extra)}`;

  return (
    <div className="flight-filters">
      <nav aria-label="Stops" className="chip-group">
        {STOP_FILTERS.map((option) => (
          <Link
            key={option.value}
            href={href({ stops: option.value })}
            scroll={false}
            aria-current={search.stops === option.value ? "true" : undefined}
            className={cn("chip", search.stops === option.value && "chip-active")}
          >
            {option.label}
          </Link>
        ))}
      </nav>

      <nav aria-label="Sort by" className="chip-group">
        <span className="text-sm text-light-200">Sort:</span>
        {SORT_OPTIONS.map((option) => (
          <Link
            key={option.value}
            href={href({ sort: option.value })}
            scroll={false}
            aria-current={search.sort === option.value ? "true" : undefined}
            className={cn("chip", search.sort === option.value && "chip-active")}
          >
            {option.label}
          </Link>
        ))}
      </nav>

      <p className="w-full text-sm text-light-200" aria-live="polite">
        {shown === total ? `${total} flights` : `${shown} of ${total} flights`}
      </p>
    </div>
  );
};

export default FlightFilters;
