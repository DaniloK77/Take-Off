import Link from "next/link";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Step {
  label: string;
  href?: string;
}

/** Progress through departure → return → booking. `current` is zero-based. */
const BookingSteps = ({ steps, current }: { steps: Step[]; current: number }) => (
  <nav aria-label="Booking progress">
    <ol className="steps">
      {steps.map((step, index) => {
        const done = index < current;
        const content = (
          <>
            <span className="step-index">
              {done ? <Check aria-hidden className="size-3.5" /> : index + 1}
            </span>
            {step.label}
          </>
        );
        return (
          <li
            key={step.label}
            className={cn("step", done && "step-done", index === current && "step-current")}
            aria-current={index === current ? "step" : undefined}
          >
            {done && step.href ? <Link href={step.href}>{content}</Link> : content}
          </li>
        );
      })}
    </ol>
  </nav>
);

export default BookingSteps;
