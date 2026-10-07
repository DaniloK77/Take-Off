import { TrendingDown, TrendingUp, Minus } from "lucide-react";
import { formatHistoryDate, formatPrice } from "@/lib/flights/format";
import type { PriceInsights as Insights } from "@/lib/flights/types";
import { cn } from "@/lib/utils";

const LEVEL_COPY = {
  low: { label: "low", Icon: TrendingDown },
  typical: { label: "typical", Icon: Minus },
  high: { label: "high", Icon: TrendingUp },
} as const;

/** Where the cheapest price sits relative to Google's "typical" range. */
const RangeBar = ({ lowest, range }: { lowest: number; range: [number, number] }) => {
  const min = Math.min(range[0], lowest) * 0.85;
  const max = Math.max(range[1], lowest) * 1.15;
  const pct = (value: number) => ((value - min) / (max - min)) * 100;

  return (
    <div className="range-bar" aria-hidden>
      <span
        className="range-bar-typical"
        style={{ left: `${pct(range[0])}%`, width: `${pct(range[1]) - pct(range[0])}%` }}
      />
      <span className="range-bar-marker" style={{ left: `${pct(lowest)}%` }} />
    </div>
  );
};

const WIDTH = 320;
const HEIGHT = 88;
const PAD = 6;

const Sparkline = ({ history }: { history: Insights["history"] }) => {
  const prices = history.map((point) => point.price);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const spread = max - min || 1;
  const x = (i: number) => PAD + (i / (history.length - 1)) * (WIDTH - PAD * 2);
  const y = (price: number) => PAD + (1 - (price - min) / spread) * (HEIGHT - PAD * 2);

  const line = history.map((point, i) => `${x(i)},${y(point.price)}`).join(" ");
  const area = `${PAD},${HEIGHT} ${line} ${WIDTH - PAD},${HEIGHT}`;
  const last = history[history.length - 1];
  const first = history[0];

  return (
    <figure className="sparkline">
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        preserveAspectRatio="none"
        role="img"
        aria-label={`Lowest price from ${formatHistoryDate(first.date)} to ${formatHistoryDate(last.date)} ranged between ${formatPrice(min)} and ${formatPrice(max)}; now ${formatPrice(last.price)}.`}
      >
        <defs>
          <linearGradient id="sparkline-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.35" />
            <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon points={area} fill="url(#sparkline-fill)" />
        <polyline
          points={line}
          fill="none"
          stroke="var(--primary)"
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
          strokeLinejoin="round"
        />
      </svg>
      <figcaption>
        <span>{formatHistoryDate(first.date)}</span>
        <span>
          {formatPrice(min)} – {formatPrice(max)}
        </span>
        <span>Today</span>
      </figcaption>
    </figure>
  );
};

const PriceInsights = ({ insights }: { insights: Insights }) => {
  const { lowestPrice, level, typicalRange, history } = insights;
  const copy = level ? LEVEL_COPY[level] : null;

  return (
    <section className="panel price-insights" aria-labelledby="price-insights-title">
      <h2 id="price-insights-title" className="eyebrow">
        Price insights
      </h2>

      {copy && (
        <p className="price-insights-headline">
          Prices are{" "}
          <span className={cn("price-level", `price-level-${level}`)}>
            <copy.Icon aria-hidden className="size-4" />
            {copy.label}
          </span>{" "}
          for your search
        </p>
      )}

      {lowestPrice !== null && typicalRange && (
        <>
          <p className="text-sm text-light-200">
            Cheapest now {formatPrice(lowestPrice)}. Usually{" "}
            {formatPrice(typicalRange[0])}–{formatPrice(typicalRange[1])}.
          </p>
          <RangeBar lowest={lowestPrice} range={typicalRange} />
        </>
      )}

      {history.length > 1 && <Sparkline history={history} />}
    </section>
  );
};

export default PriceInsights;
