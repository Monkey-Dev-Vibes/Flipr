"use client";

/**
 * Skeleton placeholder for a MarketCard v2 — matches the card's layout
 * including sparkline area and action buttons.
 */
export function MarketCardSkeleton() {
  return (
    <div className="flex h-full w-full flex-col justify-between rounded-3xl bg-flipr-card p-5 shadow-card">
      {/* Header: category + social badge */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <div className="h-6 w-20 animate-pulse rounded-full bg-flipr-ink/10" />
          <div className="h-6 w-28 animate-pulse rounded-full bg-flipr-ink/10" />
        </div>

        {/* Question lines */}
        <div className="space-y-2.5">
          <div className="h-6 w-full animate-pulse rounded bg-flipr-ink/10" />
          <div className="h-6 w-3/4 animate-pulse rounded bg-flipr-ink/10" />
        </div>

        {/* Volume */}
        <div className="mt-1.5 h-4 w-16 animate-pulse rounded bg-flipr-ink/5" />
      </div>

      {/* Sparkline area */}
      <div className="mt-3 h-12 w-full animate-pulse rounded bg-flipr-ink/5" />

      {/* Odds pills */}
      <div className="mt-3 flex justify-between gap-3">
        <div className="flex flex-1 flex-col items-center rounded-2xl bg-flipr-yes/5 px-3 py-2.5">
          <div className="h-6 w-12 animate-pulse rounded bg-flipr-yes/10" />
          <div className="mt-1 h-3 w-6 animate-pulse rounded bg-flipr-yes/10" />
        </div>
        <div className="flex flex-1 flex-col items-center rounded-2xl bg-flipr-no/5 px-3 py-2.5">
          <div className="h-6 w-12 animate-pulse rounded bg-flipr-no/10" />
          <div className="mt-1 h-3 w-6 animate-pulse rounded bg-flipr-no/10" />
        </div>
      </div>

      {/* Action buttons */}
      <div className="mt-3 flex gap-3">
        <div className="h-11 flex-1 animate-pulse rounded-xl bg-flipr-yes/20" />
        <div className="h-11 flex-1 animate-pulse rounded-xl bg-flipr-no/20" />
      </div>
    </div>
  );
}
