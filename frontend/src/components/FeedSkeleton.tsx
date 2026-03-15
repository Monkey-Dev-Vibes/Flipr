"use client";

import { MarketCardSkeleton } from "./MarketCardSkeleton";

/**
 * Loading skeleton for the main feed — shows a ghost card stack
 * so the layout doesn't jump when real cards arrive.
 */
export function FeedSkeleton() {
  return (
    <div className="relative h-[min(480px,65dvh)] w-full max-w-sm">
      {/* Background card (behind) */}
      <div className="absolute inset-0 scale-[0.95] opacity-40">
        <MarketCardSkeleton />
      </div>
      {/* Foreground card */}
      <div className="absolute inset-0">
        <MarketCardSkeleton />
      </div>
    </div>
  );
}
