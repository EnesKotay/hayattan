"use client";
import Image from "next/image";
import { useState } from "react";
import { isExternalImageUrl, normalizeImageUrl } from "@/lib/image";

interface ArticleImageProps {
  src: string | null | undefined;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
}

export function ArticleImage({ src, alt, className, sizes, priority }: ArticleImageProps) {
  const [hasError, setHasError] = useState(false);
  const normalizedSrc = normalizeImageUrl(src);

  if (!normalizedSrc || hasError) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-primary/10 text-primary/30">
        <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
    );
  }

  return (
    <Image
      src={normalizedSrc}
      alt={alt}
      fill
      className={className ?? "object-cover"}
      sizes={sizes}
      priority={priority}
      unoptimized={isExternalImageUrl(src)}
      onError={() => setHasError(true)}
    />
  );
}
