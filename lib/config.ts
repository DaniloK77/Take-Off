export const siteConfig = {
  name: "Takeoff",
  title: "Takeoff · Flight search",
  description:
    "Search and compare flights from hundreds of airlines and travel sites, powered by Google Flights.",
  url: process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000",
} as const;

export const flightsConfig = {
  /** Prices are requested and shown in this currency. */
  currency: "EUR",
  /** Pre-filled origin on the home page. */
  defaultOrigin: "BEG",
  /** Destinations linked from the home page, as IATA codes. */
  popularDestinations: ["CDG", "LHR", "FCO", "BCN", "AMS", "IST", "DXB", "JFK"],
} as const;
