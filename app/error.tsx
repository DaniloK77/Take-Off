"use client"; // Error boundaries must be Client Components

import { useEffect } from "react";
import Link from "next/link";
import posthog from "posthog-js";
import { RotateCcw } from "lucide-react";

export default function ErrorPage({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
    posthog.captureException(error);
  }, [error]);

  return (
    <section id="not-found">
      <p className="code" aria-hidden>
        Oops
      </p>
      <h1>Something went wrong</h1>
      <p className="description">
        We couldn&apos;t load this page. Please try again in a moment.
      </p>
      <div className="actions">
        <button type="button" className="button-primary" onClick={() => unstable_retry()}>
          <RotateCcw aria-hidden className="size-4" />
          Try again
        </button>
        <Link href="/" className="button-secondary">
          Back to home
        </Link>
      </div>
    </section>
  );
}
