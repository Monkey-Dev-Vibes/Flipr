"use client";

import { useCallback, useEffect, useRef } from "react";

function canVibrate(): boolean {
  return typeof navigator !== "undefined" && "vibrate" in navigator;
}

const TICK_THROTTLE_MS = 16; // ~60fps cap

export function useHaptics() {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastTickRef = useRef(0);

  /** Light tick — used during card dragging (throttled to 60fps) */
  const tick = useCallback(() => {
    const now = Date.now();
    if (now - lastTickRef.current < TICK_THROTTLE_MS) return;
    lastTickRef.current = now;
    if (canVibrate()) navigator.vibrate(5);
  }, []);

  /** Medium click — fired when swipe crosses the commit threshold */
  const thresholdClick = useCallback(() => {
    if (canVibrate()) navigator.vibrate(15);
  }, []);

  /** Heavy impact — trade confirmed */
  const heavyImpact = useCallback(() => {
    if (canVibrate()) navigator.vibrate(40);
  }, []);

  /** Start continuous ticking for drag (every 60ms) */
  const startDragTick = useCallback(() => {
    if (!canVibrate()) return;
    if (intervalRef.current) return;
    intervalRef.current = setInterval(() => {
      navigator.vibrate(3);
    }, 60);
  }, []);

  /** Stop continuous drag ticking */
  const stopDragTick = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Clean up interval on unmount to prevent leaks
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, []);

  return { tick, thresholdClick, heavyImpact, startDragTick, stopDragTick };
}
