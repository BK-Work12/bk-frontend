'use client';

import React from 'react';

export interface SkeletonProps {
  className?: string;
}

/**
 * Skeleton placeholder for loading states. Use with animate-pulse for shimmer.
 */
export function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div
      className={`rounded-md bg-[#E5E5E5] dark:bg-[#3f3f42] animate-pulse ${className}`}
      aria-hidden
    />
  );
}
