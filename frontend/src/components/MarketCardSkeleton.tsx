"use client";

/**
 * Skeleton placeholder for a MarketCard — matches the real card's layout
 * so the transition from loading to loaded feels seamless.
 */
export function MarketCardSkeleton() {
  return (
    <div className="flex h-full w-full flex-col justify-between rounded-3xl bg-flipr-card p-6 shadow-card">
      {/* Header: category badge + volume */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <div className="h-6 w-20 animate-pulse rounded-full bg-flipr-ink/10" />
          <div className="h-5 w-16 animate-pulse rounded bg-flipr-ink/10" />
        </div>

        {/* Question lines */}
        <div className="space-y-3">
          <div className="h-7 w-full animate-pulse rounded bg-flipr-ink/10" />
          <div className="h-7 w-3/4 animate-pulse rounded bg-flipr-ink/10" />
        </div>
      </div>

      {/* Odds pills */}
      <div className="mt-6 flex justify-between gap-4">
        <div className="flex flex-1 flex-col items-center rounded-2xl bg-flipr-no/5 px-4 py-3">
          <div className="h-8 w-16 animate-pulse rounded bg-flipr-no/10" />
          <div className="mt-1 h-4 w-8 animate-pulse rounded bg-flipr-no/10" />
        </div>
        <div className="flex flex-1 flex-col items-center rounded-2xl bg-flipr-yes/5 px-4 py-3">
          <div className="h-8 w-16 animate-pulse rounded bg-flipr-yes/10" />
          <div className="mt-1 h-4 w-8 animate-pulse rounded bg-flipr-yes/10" />
        </div>
      </div>

      {/* Swipe hint */}
      <div className="mt-4 flex justify-center">
        <div className="h-4 w-48 animate-pulse rounded bg-flipr-ink/5" />
      </div>
    </div>
  );
}
