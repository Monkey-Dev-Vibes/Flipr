"use client";

import { useCallback, useState } from "react";
import type { Market } from "@/lib/types";
import { mockMarkets } from "@/lib/mock-markets";
import { MarketCarousel } from "@/components/MarketCarousel";

export default function HomePage() {
  const [selected, setSelected] = useState<{
    market: Market;
    intent: "yes" | "no";
  } | null>(null);

  const handleSelect = useCallback(
    (market: Market, intent: "yes" | "no") => {
      setSelected({ market, intent });
      // Trade panel will be wired in Sprint 3/4
    },
    [],
  );

  return (
    <main className="flex min-h-dvh flex-col overflow-locked">
      {/* Header */}
      <header className="flex items-center justify-between px-5 pt-safe-top pb-2">
        <h1 className="font-serif text-2xl font-bold text-flipr-card">flipr</h1>
        <span className="font-mono text-xs text-flipr-yes">v2</span>
      </header>

      {/* Market carousel */}
      <div className="flex flex-1 flex-col justify-center py-4">
        <MarketCarousel markets={mockMarkets} onSelect={handleSelect} />
      </div>

      {/* Debug: selected market (temporary, replaced by TradePanel in Sprint 3) */}
      {selected && (
        <div className="mx-5 mb-4 rounded-xl bg-flipr-card/10 p-3 text-center text-sm text-flipr-card/60">
          Selected <span className="font-bold text-flipr-card">{selected.intent.toUpperCase()}</span> on &ldquo;{selected.market.question}&rdquo;
        </div>
      )}
    </main>
  );
}
