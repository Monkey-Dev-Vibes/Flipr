"use client";

import { useCallback, useMemo, useState } from "react";
import { COOLING_OFF_THRESHOLD } from "@/lib/constants";

const DISMISS_COOLDOWN_MS = 60 * 60 * 1000; // 1 hour
const STORAGE_KEY = "flipr_cooling_dismissed_at";

function getDismissedAt(): number {
  try {
    const val = localStorage.getItem(STORAGE_KEY);
    return val ? Number(val) : 0;
  } catch {
    return 0;
  }
}

function setDismissedAt(timestamp: number) {
  try {
    localStorage.setItem(STORAGE_KEY, String(timestamp));
  } catch {
    // localStorage unavailable
  }
}

function isCooldownActive(): boolean {
  const dismissedAt = getDismissedAt();
  if (dismissedAt === 0) return false;
  return Date.now() - dismissedAt <= DISMISS_COOLDOWN_MS;
}

/**
 * Hook to manage the cooling-off prompt logic.
 * Tracks consecutive losses locally (replaced by backend state in Sprint 8).
 * Shows the modal when threshold is reached, respects 1-hour dismiss cooldown.
 */
export function useCoolingOff() {
  const [consecutiveLosses, setConsecutiveLosses] = useState(0);
  const [dismissed, setDismissed] = useState(() => isCooldownActive());

  const shouldShow = useMemo(
    () => consecutiveLosses >= COOLING_OFF_THRESHOLD && !dismissed,
    [consecutiveLosses, dismissed],
  );

  const recordTradeResult = useCallback((success: boolean) => {
    if (success) {
      setConsecutiveLosses(0);
      setDismissed(false);
    } else {
      setConsecutiveLosses((prev) => prev + 1);
    }
  }, []);

  const dismissCooling = useCallback(() => {
    setDismissed(true);
    setDismissedAt(Date.now());
  }, []);

  const resetStreak = useCallback(() => {
    setConsecutiveLosses(0);
    setDismissed(false);
  }, []);

  return {
    consecutiveLosses,
    shouldShowCooling: shouldShow,
    recordTradeResult,
    dismissCooling,
    resetStreak,
  };
}
