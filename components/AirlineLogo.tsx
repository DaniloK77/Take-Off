import Image from "next/image";
import { cn } from "@/lib/utils";

interface Props {
  src: string | null;
  alt: string;
  /** Display size in CSS pixels. Google serves 70px logos, so 35 or less stays sharp on retina screens. */
  size?: number;
  className?: string;
}

const AirlineLogo = ({ src, alt, size = 32, className }: Props) => {
  if (!src) {
    return (
      <span
        aria-hidden
        className={cn("airline-logo airline-logo-fallback", className)}
        style={{ width: size, height: size }}
      >
        {alt.slice(0, 2).toUpperCase()}
      </span>
    );
  }

  return (
    // Tiny PNGs: re-encoding would only blur them, so they're served as-is.
    <Image
      src={src}
      alt={alt}
      width={size}
      height={size}
      unoptimized
      className={cn("airline-logo", className)}
    />
  );
};

export default AirlineLogo;
