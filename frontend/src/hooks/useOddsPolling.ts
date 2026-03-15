"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { fetchMarketOdds } from "@/lib/api";
import type { MarketOdds } from "@/lib/types";

export const POLL_INTERVAL_MS = 3000;
export const SLIPPAGE_THRESHOLD = 5; // cents (5% probability shift)

/** Check if price has shifted enough to trigger slippage warning */
export function checkSlippage(
  intent: "yes" | "no",
  liveYesPrice: number,
  liveNoPrice: number,
  lockedPrice: number,
): SlippageInfo | null {
  const currentPrice = intent === "yes" ? liveYesPrice : liveNoPrice;
  const shift = Math.abs(currentPrice - lockedPrice);
  if (shift >= SLIPPAGE_THRESHOLD) {
    return { originalOdds: lockedPrice, currentOdds: currentPrice };
  }
  return null;
}

/** Determine if odds should be marked stale based on consecutive failures */
export function shouldMarkStale(failCount: number): boolean {
  return failCount >= 3;
}

/** Determine if polling should stop based on the error type */
export function shouldStopPolling(error: string | null): boolean {
  return error === "auth_expired";
}

export interface SlippageInfo {
  originalOdds: number;
  currentOdds: number;
}

interface UseOddsPollingOptions {
  marketId: string | null;
  intent: "yes" | "no" | null;
  lockedPrice: number;
  getToken: () => Promise<string | null>;
  enabled?: boolean;
}

interface UseOddsPollingResult {
  liveOdds: MarketOdds | null;
  slippage: SlippageInfo | null;
  isStale: boolean;
}

/**
 * Polls live odds every 3 seconds for the active market.
 * Detects >5% probability shift and reports slippage.
 */
export function useOddsPolling({
  marketId,
  intent,
  lockedPrice,
  getToken,
  enabled = true,
}: UseOddsPollingOptions): UseOddsPollingResult {
  const [liveOdds, setLiveOdds] = useState<MarketOdds | null>(null);
  const [slippage, setSlippage] = useState<SlippageInfo | null>(null);
  const [isStale, setIsStale] = useState(false);
  const failCountRef = useRef(0);
  const activeRef = useRef(false);

  const poll = useCallback(async () => {
    if (!marketId || !intent) return;

    const token = await getToken();
    if (!token || !activeRef.current) return;

    const response = await fetchMarketOdds(marketId, token);
    if (!activeRef.current) return;

    if (response.error || !response.data) {
      if (shouldStopPolling(response.error)) {
        activeRef.current = false;
        setIsStale(true);
        return;
      }
      failCountRef.current += 1;
      if (shouldMarkStale(failCountRef.current)) {
        setIsStale(true);
      }
      return;
    }

    failCountRef.current = 0;
    setIsStale(false);
    setLiveOdds(response.data);

    const slippageResult = checkSlippage(
      intent,
      response.data.yes_price,
      response.data.no_price,
      lockedPrice,
    );
    setSlippage(slippageResult);
  }, [marketId, intent, lockedPrice, getToken]);

  useEffect(() => {
    if (!enabled || !marketId) {
      activeRef.current = false;
      return;
    }

    // Reset state for a new polling session
    activeRef.current = true;
    failCountRef.current = 0;

    // Recursive setTimeout: poll, wait for completion, then schedule next
    let timeoutId: ReturnType<typeof setTimeout>;
    const scheduleNext = async () => {
      await poll();
      if (activeRef.current) {
        timeoutId = setTimeout(scheduleNext, POLL_INTERVAL_MS);
      }
    };

    // Deferred first poll to avoid synchronous setState in effect
    timeoutId = setTimeout(scheduleNext, 0);

    return () => {
      activeRef.current = false;
      clearTimeout(timeoutId);
      // Reset on cleanup so next mount starts fresh
      setLiveOdds(null);
      setSlippage(null);
      setIsStale(false);
    };
  }, [enabled, marketId, poll]);

  return { liveOdds, slippage, isStale };
}
