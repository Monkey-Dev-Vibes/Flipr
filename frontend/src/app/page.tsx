"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import { CardStack } from "@/components/CardStack";
import { TradePanel } from "@/components/TradePanel";
import { TradeResultToast } from "@/components/TradeResultToast";
import { LoginButton } from "@/components/LoginButton";
import { UserMenu } from "@/components/UserMenu";
import { useAuth } from "@/providers/AuthProvider";
import { useOnboarding } from "@/hooks/useOnboarding";
import { useOddsPolling } from "@/hooks/useOddsPolling";
import { executeTrade } from "@/lib/api";
import { mockMarkets } from "@/lib/mock-markets";
import type {
  Market,
  SwipeDirection,
  TradeConfirmation,
  TradeResult,
} from "@/lib/types";

interface TradeState {
  market: Market;
  intent: "yes" | "no";
}

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, isLoading, getAuthToken } = useAuth();
  const { isOnboardingComplete } = useOnboarding();
  const [trade, setTrade] = useState<TradeState | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tradeResult, setTradeResult] = useState<TradeResult | null>(null);

  // Redirect authenticated but un-onboarded users to onboarding
  useEffect(() => {
    if (isAuthenticated && !isOnboardingComplete) {
      router.replace("/onboarding");
    }
  }, [isAuthenticated, isOnboardingComplete, router]);

  // Locked price at swipe time (used for slippage comparison)
  const lockedPrice = useMemo(() => {
    if (!trade) return 0;
    return trade.intent === "yes"
      ? trade.market.yesPrice
      : trade.market.noPrice;
  }, [trade]);

  // Poll live odds every 3 seconds while trade panel is open
  const { liveOdds, slippage, isStale } = useOddsPolling({
    marketId: trade?.market.id ?? null,
    intent: trade?.intent ?? null,
    lockedPrice,
    getToken: getAuthToken,
    enabled: !!trade && !isSubmitting,
  });

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
    if (!isSubmitting) setTrade(null);
  }, [isSubmitting]);

  const handleConfirmTrade = useCallback(
    async (tradeData: TradeConfirmation) => {
      setIsSubmitting(true);
      try {
        const token = await getAuthToken();
        if (!token) {
          setTradeResult({
            success: false,
            market_id: tradeData.marketId,
            intent: tradeData.intent,
            amount: tradeData.amount,
            executed_price: null,
            fee: null,
            error: "Session expired. Please sign in again.",
          });
          setTrade(null);
          return;
        }

        const response = await executeTrade(tradeData, token);

        if (response.error && !response.data) {
          setTradeResult({
            success: false,
            market_id: tradeData.marketId,
            intent: tradeData.intent,
            amount: tradeData.amount,
            executed_price: null,
            fee: null,
            error: response.error,
          });
        } else if (response.data) {
          setTradeResult(response.data);
        }
      } catch {
        setTradeResult({
          success: false,
          market_id: tradeData.marketId,
          intent: tradeData.intent,
          amount: tradeData.amount,
          executed_price: null,
          fee: null,
          error: "Network error. Please check your connection.",
        });
      } finally {
        setIsSubmitting(false);
        setTrade(null);
      }
    },
    [getAuthToken],
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
          <button
            type="button"
            onClick={() => router.push("/onboarding")}
            className="rounded-full bg-flipr-yes px-6 py-2.5 font-sans text-sm font-semibold text-white shadow-lg transition-all hover:opacity-90 active:scale-95"
          >
            Get Started
          </button>
          <LoginButton />
        </div>
      ) : !isOnboardingComplete ? (
        <div className="font-mono text-sm text-flipr-card/30">Loading…</div>
      ) : (
        <>
          <CardStack markets={mockMarkets} onSwipe={handleSwipe} liveOdds={liveOdds} />
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
            isSubmitting={isSubmitting}
            slippageDetected={slippage}
            liveOdds={liveOdds}
            isStale={isStale}
          />
        )}
      </AnimatePresence>

      {/* Trade result toast */}
      <AnimatePresence>
        {tradeResult && (
          <TradeResultToast
            key={tradeResult.market_id + tradeResult.intent}
            result={tradeResult}
            onDismiss={() => setTradeResult(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
