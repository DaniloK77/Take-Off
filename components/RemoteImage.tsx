"use client";

import Image from "next/image";
import { useState } from "react";
import { DESTINATION_PLACEHOLDER, isOptimizableImage } from "@/lib/images";

interface Props {
  src: string | null;
  alt: string;
  sizes: string;
  className?: string;
  priority?: boolean;
  /** Must be listed in images.qualities in next.config.ts. */
  quality?: 75 | 90;
}

/** Fills its (relatively positioned) parent; falls back to a placeholder if the image fails. */
const RemoteImage = ({ src, alt, sizes, className, priority, quality = 75 }: Props) => {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const resolved = src && src !== failedSrc ? src : DESTINATION_PLACEHOLDER;

  return (
    <Image
      src={resolved}
      alt={alt}
      fill
      sizes={sizes}
      quality={quality}
      priority={priority}
      unoptimized={!isOptimizableImage(resolved)}
      className={className}
      onError={() => setFailedSrc(resolved)}
    />
  );
};

export default RemoteImage;
