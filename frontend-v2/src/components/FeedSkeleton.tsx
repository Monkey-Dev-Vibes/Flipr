"use client";

import { MarketCardSkeleton } from "./MarketCardSkeleton";

/**
 * Loading skeleton for the horizontal carousel feed.
 * Shows two ghost cards side-by-side to hint at the scroll pattern.
 */
export function FeedSkeleton() {
  return (
    <div className="flex snap-x snap-mandatory gap-4 overflow-hidden px-[7.5vw]">
      <div
        className="w-[85vw] max-w-[360px] flex-shrink-0 snap-center"
        style={{ height: "min(520px, 68dvh)" }}
      >
        <MarketCardSkeleton />
      </div>
      <div
        className="w-[85vw] max-w-[360px] flex-shrink-0 snap-center opacity-40"
        style={{ height: "min(520px, 68dvh)" }}
      >
        <MarketCardSkeleton />
      </div>
    </div>
  );
}
