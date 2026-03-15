"use client";

import { useCallback, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { CardStack } from "@/components/CardStack";
import { TradePanel } from "@/components/TradePanel";
import { LoginButton } from "@/components/LoginButton";
import { UserMenu } from "@/components/UserMenu";
import { useAuth } from "@/providers/AuthProvider";
import { mockMarkets } from "@/lib/mock-markets";
import type { Market, SwipeDirection, TradeConfirmation } from "@/lib/types";

interface TradeState {
  market: Market;
  intent: "yes" | "no";
}

export default function Home() {
  const { isAuthenticated, isLoading } = useAuth();
  const [trade, setTrade] = useState<TradeState | null>(null);

  const handleSwipe = useCallback(
    (market: Market, direction: SwipeDirection) => {
      if (direction === "yes" || direction === "no") {
        setTrade({ market, intent: direction });
      }
      // skip direction — no panel
    },
    [],
  );

  const handleClosePanel = useCallback(() => {
    setTrade(null);
  }, []);

  const handleConfirmTrade = useCallback(
    (tradeData: TradeConfirmation) => {
      // Sprint 7 will wire this to POST /trade/execute
      console.log("[Flipr] Trade confirmed:", tradeData);
      setTrade(null);
    },
    [],
  );

  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center overflow-locked bg-flipr-dark px-4">
      {/* Header bar */}
      <div className="fixed left-0 right-0 top-0 z-40 flex items-center justify-between px-4 pb-2 pt-safe-top">
        <h1 className="font-serif text-xl font-bold text-flipr-card">flipr</h1>
        {isAuthenticated ? <UserMenu /> : <LoginButton />}
      </div>

      {/* Main content */}
      {isLoading ? (
        <div className="font-mono text-sm text-flipr-card/30">Loading…</div>
      ) : !isAuthenticated ? (
        <div className="flex flex-col items-center gap-6">
          <h2 className="font-serif text-3xl font-bold text-flipr-card">
            flipr
          </h2>
          <p className="max-w-xs text-center font-sans text-sm text-flipr-card/50">
            Predict. Swipe. Profit. Sign in to start trading.
          </p>
          <LoginButton />
        </div>
      ) : (
        <>
          <CardStack markets={mockMarkets} onSwipe={handleSwipe} />
          <p className="mt-8 font-mono text-xs text-flipr-card/30">
            Swipe to predict
          </p>
        </>
      )}

      {/* Trade Panel — slides up after YES/NO swipe */}
      <AnimatePresence>
        {trade && (
          <TradePanel
            key={trade.market.id + trade.intent}
            market={trade.market}
            intent={trade.intent}
            onClose={handleClosePanel}
            onConfirm={handleConfirmTrade}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
