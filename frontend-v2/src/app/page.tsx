"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import { MarketCarousel } from "@/components/MarketCarousel";
import { TradePanel } from "@/components/TradePanel";
import { TradeResultToast } from "@/components/TradeResultToast";
import { SuccessConfetti } from "@/components/SuccessConfetti";
import { CoolingOffModal } from "@/components/CoolingOffModal";
import { WinStreakBadge } from "@/components/WinStreakBadge";
import { MilestoneOverlay } from "@/components/MilestoneOverlay";
import { SharePreviewModal } from "@/components/SharePreviewModal";
import { LoginButton } from "@/components/LoginButton";
import { UserMenu } from "@/components/UserMenu";
import { FeedSkeleton } from "@/components/FeedSkeleton";
import { useAuth } from "@/providers/AuthProvider";
import { useOnboarding } from "@/hooks/useOnboarding";
import { useCoolingOff } from "@/hooks/useCoolingOff";
import { useOddsWebSocket } from "@/hooks/useOddsWebSocket";
import { useMarketFeed } from "@/hooks/useMarketFeed";
import { useUserState } from "@/hooks/useUserState";
import { useWinStreak } from "@/hooks/useWinStreak";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import { useMilestones } from "@/hooks/useMilestones";
import { useShareCard } from "@/hooks/useShareCard";
import { executeTrade } from "@/lib/api";
import type { Market, TradeConfirmation, TradeResult } from "@/lib/types";

interface TradeState {
  market: Market;
  intent: "yes" | "no";
}

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, getAuthToken } = useAuth();
  const { isOnboardingComplete } = useOnboarding();
  const {
    consecutiveLosses,
    shouldShowCooling,
    recordTradeResult,
    dismissCooling,
  } = useCoolingOff();
  const { markets, isLoading: isFeedLoading } = useMarketFeed(getAuthToken);
  const { userState, refetch: refetchUserState } = useUserState(getAuthToken);
  const { currentStreak, glowClass, recordWin, recordLoss } = useWinStreak();
  const { playWin, playLoss } = useSoundEffects();
  const {
    activeMilestone,
    milestoneInfo,
    recordTrade: recordMilestone,
    dismissMilestone,
  } = useMilestones();
  const {
    generatePreview,
    confirmShare,
    dismissPreview,
    preview: sharePreview,
  } = useShareCard();
  const [trade, setTrade] = useState<TradeState | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tradeResult, setTradeResult] = useState<TradeResult | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  // Locked price at selection time for slippage detection
  const lockedPrice = useMemo(() => {
    if (!trade) return 0;
    return trade.intent === "yes"
      ? trade.market.yesPrice
      : trade.market.noPrice;
  }, [trade]);

  // Real-time odds via WebSocket (fallback to HTTP polling)
  const { liveOdds, slippage, isStale } = useOddsWebSocket({
    marketId: trade?.market.id ?? null,
    intent: trade?.intent ?? null,
    lockedPrice,
    getToken: getAuthToken,
    enabled: !!trade && !isSubmitting,
  });

  useEffect(() => {
    if (isAuthenticated && !isOnboardingComplete) {
      router.replace("/onboarding");
    }
  }, [isAuthenticated, isOnboardingComplete, router]);

  const handleSelect = useCallback(
    (market: Market, intent: "yes" | "no") => {
      setTrade({ market, intent });
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
          const failResult: TradeResult = {
            success: false,
            market_id: tradeData.marketId,
            intent: tradeData.intent,
            amount: tradeData.amount,
            executed_price: null,
            fee: null,
            error: response.error,
          };
          setTradeResult(failResult);
          recordTradeResult(false);
          recordLoss();
          playLoss();
        } else if (response.data) {
          setTradeResult(response.data);
          recordTradeResult(response.data.success);
          if (response.data.success) {
            setShowConfetti(true);
            recordWin();
            playWin();
            // Record milestone with estimated profit (simplified: amount * 0.1)
            recordMilestone(response.data.amount * 0.1);
          } else {
            recordLoss();
            playLoss();
          }
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
        recordTradeResult(false);
        recordLoss();
        playLoss();
      } finally {
        setIsSubmitting(false);
        setTrade(null);
        refetchUserState();
      }
    },
    [getAuthToken, recordTradeResult, refetchUserState, recordWin, recordLoss, playWin, playLoss, recordMilestone],
  );

  return (
    <div className="flex min-h-dvh w-full max-w-lg mx-auto flex-col overflow-locked bg-flipr-dark">
      {/* Header bar */}
      <header className="fixed left-0 right-0 top-0 z-40 mx-auto flex max-w-lg items-center justify-between border-b border-flipr-yes/10 px-5 pb-2 pt-safe-top">
        <div className="flex items-center gap-2">
          <h1 className="font-display text-xl font-bold text-flipr-card">flipr</h1>
          <WinStreakBadge streak={currentStreak} glowClass={glowClass} />
        </div>
        {isAuthenticated ? <UserMenu /> : <LoginButton />}
      </header>

      {/* Main content */}
      <main className="flex flex-1 flex-col items-center justify-center pt-16">
        {isLoading || isFeedLoading ? (
          <FeedSkeleton />
        ) : !isAuthenticated ? (
          <div className="flex flex-col items-center gap-6 px-6">
            <h2 className="font-display text-3xl font-bold text-flipr-card">
              flipr
            </h2>
            <p className="max-w-xs text-center font-sans text-sm text-flipr-card/50">
              Browse markets. Pick a side. Swipe up to trade.
            </p>
            <button
              type="button"
              onClick={() => router.push("/onboarding")}
              className="btn-gradient"
            >
              Get Started
            </button>
            <LoginButton />
          </div>
        ) : !isOnboardingComplete ? (
          <FeedSkeleton />
        ) : (
          <div className="w-full py-4">
            <MarketCarousel markets={markets} onSelect={handleSelect} />
          </div>
        )}
      </main>

      {/* Trade Panel */}
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
            onShare={() => {
              if (tradeResult.success) {
                const gain = tradeResult.executed_price
                  ? tradeResult.executed_price - 50
                  : 0;
                generatePreview(
                  {
                    type: "trade-win",
                    question: tradeResult.market_id,
                    intent: tradeResult.intent as "yes" | "no",
                    percentGain: gain,
                    amount: tradeResult.amount,
                    winStreak: currentStreak,
                  },
                  getAuthToken,
                );
              }
            }}
          />
        )}
      </AnimatePresence>

      {/* Share preview modal */}
      <SharePreviewModal
        preview={sharePreview}
        onShare={confirmShare}
        onDismiss={dismissPreview}
      />

      {/* Success confetti */}
      <SuccessConfetti
        active={showConfetti}
        onComplete={() => setShowConfetti(false)}
      />

      {/* Milestone celebration overlay */}
      {milestoneInfo && (
        <MilestoneOverlay
          emoji={milestoneInfo.emoji}
          label={milestoneInfo.label}
          visible={!!activeMilestone}
          onDismiss={dismissMilestone}
        />
      )}

      {/* Cooling-off modal */}
      <CoolingOffModal
        visible={shouldShowCooling || (userState?.consecutiveLosses ?? 0) >= 5}
        consecutiveLosses={userState?.consecutiveLosses ?? consecutiveLosses}
        onDismiss={dismissCooling}
        onTakeBreak={() => {
          dismissCooling();
          router.push("/");
        }}
      />
    </div>
  );
}
