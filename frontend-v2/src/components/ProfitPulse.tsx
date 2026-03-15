"use client";

import { useCallback, useRef, useState } from "react";
import { motion } from "framer-motion";

interface ProfitPulseProps {
  value: number;
  className?: string;
}

/**
 * Animated balance display that:
 * 1. Scale-bounces when value increases (profit-pulse animation)
 * 2. Counts up like a slot machine from previous to new value
 *
 * Parent calls `triggerPulse(newValue)` to animate a change.
 */
export function ProfitPulse({ value, className = "" }: ProfitPulseProps) {
  return (
    <span className={`inline-block font-mono font-bold ${className}`}>
      ${value.toFixed(2)}
    </span>
  );
}

/**
 * Hook that manages the animated counting + pulse state.
 * Returns the current display value and a trigger function.
 */
export function useProfitPulse(initialValue: number) {
  const [displayValue, setDisplayValue] = useState(initialValue);
  const [shouldPulse, setShouldPulse] = useState(false);
  const animRef = useRef<number | null>(null);

  const triggerPulse = useCallback(
    (from: number, to: number) => {
      if (animRef.current) cancelAnimationFrame(animRef.current);

      const isProfit = to > from;
      if (isProfit) setShouldPulse(true);

      const duration = 600;
      const startTime = performance.now();

      const animate = (now: number) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = from + (to - from) * eased;
        setDisplayValue(current);

        if (progress < 1) {
          animRef.current = requestAnimationFrame(animate);
        } else {
          if (isProfit) {
            setTimeout(() => setShouldPulse(false), 200);
          }
        }
      };

      animRef.current = requestAnimationFrame(animate);
    },
    [],
  );

  return { displayValue, shouldPulse, triggerPulse };
}

/**
 * Animated profit display component with built-in pulse.
 */
export function AnimatedProfitPulse({
  value,
  shouldPulse,
  className = "",
}: {
  value: number;
  shouldPulse: boolean;
  className?: string;
}) {
  return (
    <motion.span
      animate={shouldPulse ? { scale: [1, 1.15, 1] } : {}}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={`inline-block font-mono font-bold ${className}`}
    >
      ${value.toFixed(2)}
    </motion.span>
  );
}
