import "server-only";

const ENDPOINT = "https://serpapi.com/search.json";

/** SerpApi bills every uncached search, so successful responses are cached for an hour. */
const SERPAPI_REVALIDATE_SECONDS = 60 * 60;

export type SerpApiErrorCode =
  | "missing_api_key"
  | "invalid_api_key"
  | "invalid_request"
  | "quota_exceeded"
  | "upstream";

export class SerpApiError extends Error {
  constructor(
    readonly code: SerpApiErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "SerpApiError";
  }
}

/**
 * Bundled demo data is served in development when no API key is configured,
 * or when SERPAPI_USE_FIXTURES=true (handy for offline work and to save quota).
 * Production always talks to SerpApi.
 */
export function shouldUseFixtures(): boolean {
  if (process.env.NODE_ENV === "production") return false;
  return (
    process.env.SERPAPI_USE_FIXTURES === "true" || !process.env.SERPAPI_API_KEY
  );
}

function toErrorCode(status: number, message: string): SerpApiErrorCode {
  if (status === 401 || /invalid api key/i.test(message)) {
    return "invalid_api_key";
  }
  if (status === 429 || /run out of searches|rate limit/i.test(message)) {
    return "quota_exceeded";
  }
  // 400s describe a problem with the search itself, e.g. a date in the past.
  if (status === 400) return "invalid_request";
  return "upstream";
}

/** An empty result set is reported as an "error" with a 200 status. */
const NO_RESULTS = /hasn't returned any results/i;

/**
 * Calls a SerpApi engine. Returns `null` when the search found nothing.
 * Identical requests within SERPAPI_REVALIDATE_SECONDS are served from the
 * Next.js data cache and don't consume quota.
 */
export async function serpApiSearch<T extends object>(
  params: Record<string, string | number | undefined>,
): Promise<T | null> {
  const apiKey = process.env.SERPAPI_API_KEY;
  if (!apiKey) {
    throw new SerpApiError(
      "missing_api_key",
      "SERPAPI_API_KEY is not set in .env.local",
    );
  }

  const query = new URLSearchParams({ api_key: apiKey });
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") query.set(key, String(value));
  }

  let res: Response;
  try {
    res = await fetch(`${ENDPOINT}?${query}`, {
      next: { revalidate: SERPAPI_REVALIDATE_SECONDS },
    });
  } catch (error) {
    console.error("[serpapi] request failed", error);
    throw new SerpApiError("upstream", "Could not reach SerpApi");
  }

  const data = (await res.json().catch(() => null)) as
    | (T & { error?: string })
    | null;

  if (data?.error) {
    if (NO_RESULTS.test(data.error)) return null;
    throw new SerpApiError(toErrorCode(res.status, data.error), data.error);
  }

  if (!res.ok || !data) {
    throw new SerpApiError(
      toErrorCode(res.status, ""),
      `SerpApi responded with ${res.status} ${res.statusText}`,
    );
  }

  return data;
}
