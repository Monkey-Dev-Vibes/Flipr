"use client";

import type { Market } from "@/lib/types";
import { formatVolume } from "@/lib/format";

interface MarketCardProps {
  market: Market;
}

export function MarketCard({ market }: MarketCardProps) {
  return (
    <div className="flex h-full w-full flex-col justify-between rounded-3xl bg-flipr-card p-6 shadow-card">
      {/* Header: category + volume */}
      <div>
        <div className="mb-4 flex items-center justify-between text-sm font-semibold text-flipr-ink/50">
          <span className="rounded-full bg-flipr-ink/5 px-3 py-1 uppercase tracking-wider">
            {market.category}
          </span>
          <span className="font-mono">{formatVolume(market.volume)} vol</span>
        </div>

        {/* Question */}
        <h2 className="font-serif text-3xl font-bold leading-tight text-flipr-ink">
          {market.question}
        </h2>
      </div>

      {/* Odds pills */}
      <div className="mt-6 flex justify-between gap-4">
        <div className="flex flex-1 flex-col items-center rounded-2xl bg-flipr-no/10 px-4 py-3">
          <span className="font-mono text-2xl font-bold text-flipr-no">
            {market.noPrice}¢
          </span>
          <span className="mt-1 text-xs font-semibold uppercase tracking-wider text-flipr-no/80">
            No
          </span>
        </div>
        <div className="flex flex-1 flex-col items-center rounded-2xl bg-flipr-yes/10 px-4 py-3">
          <span className="font-mono text-2xl font-bold text-flipr-yes">
            {market.yesPrice}¢
          </span>
          <span className="mt-1 text-xs font-semibold uppercase tracking-wider text-flipr-yes/80">
            Yes
          </span>
        </div>
      </div>

      {/* Swipe hint */}
      <p className="mt-4 text-center text-xs text-flipr-ink/30">
        Swipe right for YES · left for NO · up to skip
      </p>
    </div>
  );
}
