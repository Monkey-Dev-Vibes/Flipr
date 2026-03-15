"use client";

import { useCallback, useState } from "react";

export type MilestoneType = "first-trade" | "ten-trades" | "hundred-profit";

interface MilestoneState {
  totalTrades: number;
  totalProfit: number;
  achieved: MilestoneType[];
}

const STORAGE_KEY = "flipr-milestones";

const MILESTONE_CONFIG: Record<
  MilestoneType,
  { label: string; emoji: string }
> = {
  "first-trade": { label: "First Trade!", emoji: "🚀" },
  "ten-trades": { label: "10 Trades!", emoji: "🎯" },
  "hundred-profit": { label: "$100 Profit!", emoji: "🏆" },
};

function loadState(): MilestoneState {
  if (typeof window === "undefined")
    return { totalTrades: 0, totalProfit: 0, achieved: [] };
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {
    // ignore
  }
  return { totalTrades: 0, totalProfit: 0, achieved: [] };
}

function saveState(state: MilestoneState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
}

/**
 * Tracks trade milestones and triggers celebrations.
 * Milestones: first trade, 10th trade, $100 cumulative profit.
 */
export function useMilestones() {
  const [state, setState] = useState<MilestoneState>(loadState);
  const [activeMilestone, setActiveMilestone] = useState<MilestoneType | null>(
    null,
  );

  const recordTrade = useCallback((profit: number) => {
    setState((prev) => {
      const next = {
        totalTrades: prev.totalTrades + 1,
        totalProfit: prev.totalProfit + profit,
        achieved: [...prev.achieved],
      };

      // Check for new milestones
      let newMilestone: MilestoneType | null = null;

      if (next.totalTrades === 1 && !prev.achieved.includes("first-trade")) {
        next.achieved.push("first-trade");
        newMilestone = "first-trade";
      } else if (
        next.totalTrades === 10 &&
        !prev.achieved.includes("ten-trades")
      ) {
        next.achieved.push("ten-trades");
        newMilestone = "ten-trades";
      }

      if (
        next.totalProfit >= 100 &&
        prev.totalProfit < 100 &&
        !prev.achieved.includes("hundred-profit")
      ) {
        next.achieved.push("hundred-profit");
        newMilestone = "hundred-profit";
      }

      saveState(next);

      if (newMilestone) {
        // Use setTimeout to avoid setState-during-render
        setTimeout(() => setActiveMilestone(newMilestone), 0);
      }

      return next;
    });
  }, []);

  const dismissMilestone = useCallback(() => {
    setActiveMilestone(null);
  }, []);

  const milestoneInfo = activeMilestone
    ? MILESTONE_CONFIG[activeMilestone]
    : null;

  return {
    totalTrades: state.totalTrades,
    totalProfit: state.totalProfit,
    activeMilestone,
    milestoneInfo,
    recordTrade,
    dismissMilestone,
  };
}
