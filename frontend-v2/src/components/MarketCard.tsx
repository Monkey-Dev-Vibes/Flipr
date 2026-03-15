"use client";

import type { Market } from "@/lib/types";
import { formatVolume } from "@/lib/format";
import { AnimatedOdds } from "./AnimatedOdds";
import { SparklineChart } from "./SparklineChart";
import { SocialBadge } from "./SocialBadge";

interface MarketCardProps {
  market: Market;
  liveYesPrice?: number;
  liveNoPrice?: number;
  onSelect?: (market: Market, intent: "yes" | "no") => void;
}

export function MarketCard({
  market,
  liveYesPrice,
  liveNoPrice,
  onSelect,
}: MarketCardProps) {
  const yesPrice = liveYesPrice ?? market.yesPrice;
  const noPrice = liveNoPrice ?? market.noPrice;

  return (
    <div className="flex h-full w-full flex-col justify-between rounded-3xl bg-flipr-card p-5 shadow-card">
      {/* Header: category + social badge */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <span className="rounded-full bg-flipr-ink/5 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-flipr-ink/50">
            {market.category}
          </span>
          {market.social && <SocialBadge social={market.social} />}
        </div>

        {/* Question */}
        <h2 className="font-serif text-2xl font-bold leading-tight text-flipr-ink">
          {market.question}
        </h2>

        {/* Volume */}
        <p className="mt-1.5 font-mono text-xs text-flipr-ink/40">
          {formatVolume(market.volume)} vol
        </p>
      </div>

      {/* Sparkline */}
      {market.sparkline && market.sparkline.length > 1 && (
        <div className="mt-3 w-full">
          <SparklineChart data={market.sparkline} id={market.id} width={280} height={48} />
        </div>
      )}

      {/* Odds display */}
      <div className="mt-3 flex justify-between gap-3">
        <div className="flex flex-1 flex-col items-center rounded-2xl bg-flipr-yes/10 px-3 py-2.5">
          <AnimatedOdds
            value={yesPrice}
            className="font-mono text-xl font-bold text-flipr-yes"
          />
          <span className="mt-0.5 text-xs font-semibold uppercase tracking-wider text-flipr-yes/80">
            Yes
          </span>
        </div>
        <div className="flex flex-1 flex-col items-center rounded-2xl bg-flipr-no/10 px-3 py-2.5">
          <AnimatedOdds
            value={noPrice}
            className="font-mono text-xl font-bold text-flipr-no"
          />
          <span className="mt-0.5 text-xs font-semibold uppercase tracking-wider text-flipr-no/80">
            No
          </span>
        </div>
      </div>

      {/* YES / NO action buttons */}
      <div className="mt-3 flex gap-3">
        <button
          type="button"
          onClick={() => onSelect?.(market, "yes")}
          className="btn-yes-gradient"
        >
          YES
        </button>
        <button
          type="button"
          onClick={() => onSelect?.(market, "no")}
          className="flex-1 rounded-xl bg-flipr-no py-3 text-sm font-bold text-white transition-all active:scale-95"
        >
          NO
        </button>
      </div>
    </div>
  );
}
