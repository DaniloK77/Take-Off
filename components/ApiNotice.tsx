import { KeyRound, TriangleAlert } from "lucide-react";
import type { FlightsErrorReason } from "@/lib/flights/types";

const isDev = process.env.NODE_ENV !== "production";

const COPY: Record<
  Exclude<FlightsErrorReason, "invalid_request">,
  { title: string; visitor: string; developer: string }
> = {
  missing_api_key: {
    title: "Flight search is not configured yet",
    visitor: "We can't search flights right now. Please check back soon.",
    developer:
      "Add SERPAPI_API_KEY to .env.local (get one at serpapi.com/manage-api-key) and restart the server.",
  },
  invalid_api_key: {
    title: "Flight search is temporarily unavailable",
    visitor: "We can't search flights right now. Please check back soon.",
    developer: "SerpApi rejected the API key. Check SERPAPI_API_KEY in .env.local.",
  },
  quota_exceeded: {
    title: "Too many searches",
    visitor: "We've hit our search limit for now. Please try again a little later.",
    developer:
      "The SerpApi plan has no searches left. Cached searches still work; upgrade the plan or wait for the monthly reset.",
  },
  upstream: {
    title: "Couldn't load flights",
    visitor: "Something went wrong while searching. Please try again.",
    developer: "SerpApi request failed. See the server logs for details.",
  },
};

interface Props {
  reason: FlightsErrorReason;
  /** Upstream message: shown for invalid requests, otherwise only in development. */
  message?: string;
}

export const ApiNotice = ({ reason, message }: Props) => {
  // A rejected search is about the visitor's input, so Google's explanation is useful to them.
  const copy =
    reason === "invalid_request"
      ? {
          title: "Google Flights couldn't run this search",
          text: message ?? "Please check your airports and dates.",
        }
      : {
          title: COPY[reason].title,
          text: isDev ? COPY[reason].developer : COPY[reason].visitor,
        };

  return (
    <div className="notice notice-error" role="alert">
      <TriangleAlert aria-hidden className="size-5 shrink-0 text-amber-300" />
      <div>
        <p className="notice-title">{copy.title}</p>
        <p>{copy.text}</p>
        {isDev && message && reason !== "invalid_request" && (
          <p className="notice-detail">{message}</p>
        )}
      </div>
    </div>
  );
};

export const DemoBanner = () => (
  <div className="notice" role="status">
    <KeyRound aria-hidden className="size-5 shrink-0 text-primary" />
    <div>
      <p className="notice-title">Showing demo flights (Belgrade → Paris)</p>
      {process.env.SERPAPI_API_KEY ? (
        <p>
          <code>SERPAPI_USE_FIXTURES</code> is on. Remove it from{" "}
          <code>.env.local</code> to search live flights.
        </p>
      ) : (
        <p>
          Add <code>SERPAPI_API_KEY</code> to <code>.env.local</code> to search
          live flights. Demo data is only used in development.
        </p>
      )}
    </div>
  </div>
);
