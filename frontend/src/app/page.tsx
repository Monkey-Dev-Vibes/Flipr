"use client";

import { useCallback } from "react";
import { CardStack } from "@/components/CardStack";
import { mockMarkets } from "@/lib/mock-markets";
import type { Market, SwipeDirection } from "@/lib/types";

export default function Home() {
  const handleSwipe = useCallback(
    (market: Market, direction: SwipeDirection) => {
      // In Sprint 3 this will open the Trade Panel for yes/no swipes
      console.log(`[Flipr] ${direction?.toUpperCase()} → ${market.question}`);
    },
    [],
  );

  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center overflow-locked bg-flipr-dark px-4">
      {/* Logo / wordmark */}
      <h1 className="mb-8 font-serif text-3xl font-bold text-flipr-card">
        flipr
      </h1>

      <CardStack markets={mockMarkets} onSwipe={handleSwipe} />

      <p className="mt-8 font-mono text-xs text-flipr-card/30">
        Swipe to predict
      </p>
    </div>
  );
}
