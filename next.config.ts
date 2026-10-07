import type { NextConfig } from "next";
import { remoteImagePatterns } from "./lib/images";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: remoteImagePatterns.map((pattern) => ({ ...pattern })),
    // 90 is used for destination photos, where compression artefacts show.
    qualities: [75, 90],
    formats: ["image/avif", "image/webp"],
  },

  async rewrites() {
    return [
      {
        source: "/ingest/static/:path*",
        destination: "https://us-assets.i.posthog.com/static/:path*",
      },
      {
        source: "/ingest/:path*",
        destination: "https://us.i.posthog.com/:path*",
      },
    ];
  },

  skipTrailingSlashRedirect: true,
};

export default nextConfig;
