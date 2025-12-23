'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import { getBrandLogoUrl } from '@/lib/branding/logo';

type BrandLogoProps = {
  size?: number;
  className?: string;
  alt?: string;
};

export default function BrandLogo({ size = 32, className, alt = 'UXAudit logo' }: BrandLogoProps) {
  const [hasError, setHasError] = useState(false);
  const logoUrl = useMemo(() => getBrandLogoUrl(), []);

  if (!logoUrl || hasError) {
    return (
      <div
        className={`flex items-center justify-center rounded-lg bg-primary text-primary-foreground ${className ?? ''}`}
        style={{ width: size, height: size }}
        aria-label={alt}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-4 w-4"
        >
          <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
        </svg>
      </div>
    );
  }

  return (
    <Image
      src={logoUrl}
      alt={alt}
      width={size}
      height={size}
      className={className}
      onError={() => setHasError(true)}
    />
  );
}
