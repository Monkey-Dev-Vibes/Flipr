"use client";

import { useEffect, useState } from "react";

interface AnimatedOddsProps {
  value: number;
  className?: string;
}

/**
 * Displays a probability as a percentage with a flash animation on change.
 * Uses monospaced font (inherited) and tabular-nums to prevent layout shift.
 */
export function AnimatedOdds({ value, className = "" }: AnimatedOddsProps) {
  const [prevValue, setPrevValue] = useState(value);
  const [flash, setFlash] = useState<"up" | "down" | null>(null);

  if (value !== prevValue) {
    setFlash(value > prevValue ? "up" : "down");
    setPrevValue(value);
  }

  useEffect(() => {
    if (!flash) return;
    const timer = setTimeout(() => setFlash(null), 600);
    return () => clearTimeout(timer);
  }, [flash]);

  const flashClass =
    flash === "up"
      ? "animate-flash-green"
      : flash === "down"
        ? "animate-flash-red"
        : "";

  return (
    <span
      className={`inline-block tabular-nums transition-colors duration-300 ${flashClass} ${className}`}
    >
      {value}%
    </span>
  );
}
