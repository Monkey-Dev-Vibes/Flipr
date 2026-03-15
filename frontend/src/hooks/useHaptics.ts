"use client";

import { useCallback, useEffect, useRef } from "react";

function canVibrate(): boolean {
  return typeof navigator !== "undefined" && "vibrate" in navigator;
}

const TICK_THROTTLE_MS = 32; // ~30fps cap — smoother feel than 60fps
const RAMP_INTERVALS = [120, 90, 65, 45, 30, 18]; // accelerating haptic pattern (slightly smoother ramp)

export function useHaptics() {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const rampTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastTickRef = useRef(0);

  /** Light tick — used during card dragging (throttled to ~30fps) */
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

  /** Heavy impact — trade confirmed (double-pulse for satisfying finality) */
  const heavyImpact = useCallback(() => {
    if (canVibrate()) navigator.vibrate([40, 60, 20]);
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

  /** Start ramping haptics for hold-to-confirm (accelerating vibration) */
  const startRampingHold = useCallback((maxDurationMs: number) => {
    if (!canVibrate()) return;
    const startTime = Date.now();
    let stage = 0;

    const scheduleNext = () => {
      // Cap recursion at the hold duration (16A)
      if (Date.now() - startTime > maxDurationMs) return;

      const interval =
        RAMP_INTERVALS[Math.min(stage, RAMP_INTERVALS.length - 1)];
      rampTimeoutRef.current = setTimeout(() => {
        navigator.vibrate(8);
        stage++;
        scheduleNext();
      }, interval);
    };

    scheduleNext();
  }, []);

  /** Stop ramping haptics */
  const stopRampingHold = useCallback(() => {
    if (rampTimeoutRef.current) {
      clearTimeout(rampTimeoutRef.current);
      rampTimeoutRef.current = null;
    }
  }, []);

  // Clean up on unmount to prevent leaks
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (rampTimeoutRef.current) {
        clearTimeout(rampTimeoutRef.current);
        rampTimeoutRef.current = null;
      }
    };
  }, []);

  return {
    tick,
    thresholdClick,
    heavyImpact,
    startDragTick,
    stopDragTick,
    startRampingHold,
    stopRampingHold,
  };
}
