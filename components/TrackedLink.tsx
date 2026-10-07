"use client";

import Link from "next/link";
import posthog from "posthog-js";

interface Props extends React.ComponentProps<typeof Link> {
  event: string;
  properties?: Record<string, string | number | boolean | null>;
}

/** A Link that reports a PostHog event when clicked. */
const TrackedLink = ({ event, properties, onClick, ...props }: Props) => (
  <Link
    {...props}
    onClick={(e) => {
      posthog.capture(event, properties);
      onClick?.(e);
    }}
  />
);

export default TrackedLink;
