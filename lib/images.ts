// Imported by next.config.ts, so only relative imports are allowed here.

/** Hosts SerpApi serves Google Flights images from; allowed for next/image optimisation. */
export const remoteImagePatterns = [
  { protocol: "https", hostname: "**.gstatic.com" },
  { protocol: "https", hostname: "**.googleusercontent.com" },
] as const;

export const DESTINATION_PLACEHOLDER = "/images/destination-placeholder.svg";

function hostMatches(hostname: string, pattern: string): boolean {
  if (pattern.startsWith("**.")) return hostname.endsWith(pattern.slice(2));
  return hostname === pattern;
}

/** Only allow-listed hosts go through the optimiser; everything else is rendered as-is. */
export function isOptimizableImage(src: string): boolean {
  if (src.endsWith(".svg")) return false;
  if (src.startsWith("/")) return true;

  try {
    const url = new URL(src);
    return remoteImagePatterns.some(
      (pattern) =>
        url.protocol === `${pattern.protocol}:` &&
        hostMatches(url.hostname, pattern.hostname),
    );
  } catch {
    return false;
  }
}
