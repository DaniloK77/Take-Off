import { connection } from "next/server";
import { BadgeCheck, LineChart, Plane } from "lucide-react";
import FlightSearchForm from "@/components/FlightSearchForm";
import PopularRoutes from "@/components/PopularRoutes";
import { flightsConfig } from "@/lib/config";
import { parseFlightSearch, toIsoDate } from "@/lib/flights/search-params";

const FEATURES = [
  {
    Icon: Plane,
    title: "Every airline, one search",
    text: "Live fares from Google Flights across hundreds of airlines and travel sites.",
  },
  {
    Icon: LineChart,
    title: "Know when to book",
    text: "Price insights show whether today's fares are low, typical or high.",
  },
  {
    Icon: BadgeCheck,
    title: "Book with the source",
    text: "Compare booking options and buy directly from the airline or agency.",
  },
];

const HomePage = async () => {
  // Default dates depend on today, so render per request.
  await connection();
  const today = toIsoDate(new Date());
  const initial = parseFlightSearch({ from: flightsConfig.defaultOrigin }, today);

  return (
    <>
      <section id="home">
        <p className="eyebrow text-center">Powered by Google Flights</p>
        <h1 className="text-center">
          Find your next <br className="sm:hidden" />
          flight
        </h1>
        <p className="subheading">
          Compare fares from hundreds of airlines and travel sites in one search.
        </p>
      </section>

      <FlightSearchForm initial={initial} today={today} />

      <PopularRoutes />

      <section className="section" aria-label="Why search with us">
        <ul className="features">
          {FEATURES.map(({ Icon, title, text }) => (
            <li key={title} className="panel">
              <Icon aria-hidden className="size-6 text-primary" />
              <h3>{title}</h3>
              <p className="text-light-200">{text}</p>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
};

export default HomePage;
