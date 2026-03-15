"use client";

import { useCallback, useState } from "react";

interface WinStreakState {
  current: number;
  best: number;
}

const STORAGE_KEY = "flipr-win-streak";

function loadStreak(): WinStreakState {
  if (typeof window === "undefined") return { current: 0, best: 0 };
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {
    // ignore
  }
  return { current: 0, best: 0 };
}

function saveStreak(state: WinStreakState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
}

/**
 * Tracks consecutive wins for the fire badge dopamine system.
 * Persists to localStorage so streaks survive page reloads.
 */
export function useWinStreak() {
  const [streak, setStreak] = useState<WinStreakState>(loadStreak);

  const recordWin = useCallback(() => {
    setStreak((prev) => {
      const next = {
        current: prev.current + 1,
        best: Math.max(prev.best, prev.current + 1),
      };
      saveStreak(next);
      return next;
    });
  }, []);

  const recordLoss = useCallback(() => {
    setStreak((prev) => {
      const next = { ...prev, current: 0 };
      saveStreak(next);
      return next;
    });
  }, []);

  /** Returns the glow intensity class based on streak length */
  const glowClass =
    streak.current >= 5
      ? "streak-glow-3"
      : streak.current >= 3
        ? "streak-glow-2"
        : streak.current >= 2
          ? "streak-glow-1"
          : "";

  return {
    currentStreak: streak.current,
    bestStreak: streak.best,
    glowClass,
    recordWin,
    recordLoss,
  };
}
