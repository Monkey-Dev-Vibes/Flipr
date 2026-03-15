"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useHaptics } from "@/hooks/useHaptics";

const HOLD_DURATION_MS = 1500;

interface HoldToConfirmProps {
  intent: "yes" | "no";
  onConfirm: () => void;
  disabled?: boolean;
}

export function HoldToConfirm({
  intent,
  onConfirm,
  disabled = false,
}: HoldToConfirmProps) {
  const [holding, setHolding] = useState(false);
  const [progress, setProgress] = useState(0);
  const startTimeRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);
  const confirmedRef = useRef(false);
  const haptics = useHaptics();
  const onConfirmRef = useRef(onConfirm);
  const animateRef = useRef<() => void>(undefined);

  useEffect(() => {
    onConfirmRef.current = onConfirm;
  }, [onConfirm]);

  useEffect(() => {
    animateRef.current = () => {
      if (!startTimeRef.current) return;

      const elapsed = Date.now() - startTimeRef.current;
      const p = Math.min(elapsed / HOLD_DURATION_MS, 1);
      setProgress(p);

      if (p >= 1 && !confirmedRef.current) {
        confirmedRef.current = true;
        haptics.stopRampingHold();
        haptics.heavyImpact();
        onConfirmRef.current();
        return;
      }

      rafRef.current = requestAnimationFrame(() => animateRef.current?.());
    };
  }, [haptics]);

  const startHold = useCallback(() => {
    if (disabled) return;
    confirmedRef.current = false;
    startTimeRef.current = Date.now();
    setHolding(true);
    setProgress(0);
    haptics.startRampingHold(HOLD_DURATION_MS);
    rafRef.current = requestAnimationFrame(() => animateRef.current?.());
  }, [disabled, haptics]);

  const endHold = useCallback(() => {
    // Guard against post-confirmation cleanup (8A)
    if (confirmedRef.current) return;

    setHolding(false);
    setProgress(0);
    startTimeRef.current = null;
    haptics.stopRampingHold();
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, [haptics]);

  useEffect(() => {
    return () => {
      haptics.stopRampingHold();
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [haptics]);

  const isYes = intent === "yes";
  const bgColor = isYes ? "bg-flipr-yes" : "bg-flipr-no";
  const bgColorMuted = isYes ? "bg-flipr-yes/20" : "bg-flipr-no/20";
  const label = isYes ? "Hold to Confirm YES" : "Hold to Confirm NO";

  return (
    <button
      type="button"
      onPointerDown={startHold}
      onPointerUp={endHold}
      onPointerLeave={endHold}
      onContextMenu={(e) => e.preventDefault()}
      disabled={disabled}
      className={`relative w-full overflow-hidden rounded-2xl py-4 text-lg font-semibold transition-opacity select-none ${
        disabled ? "cursor-not-allowed opacity-40" : "cursor-pointer"
      } ${bgColorMuted}`}
      aria-label={label}
    >
      {/* Progress fill */}
      <motion.div
        className={`absolute inset-0 origin-left ${bgColor}`}
        style={{ scaleX: progress }}
        transition={{ duration: 0 }}
      />

      {/* Label */}
      <span
        className={`relative z-10 ${
          progress > 0.5 ? "text-white" : isYes ? "text-flipr-yes" : "text-flipr-no"
        } transition-colors duration-150`}
      >
        {holding ? "Confirming..." : label}
      </span>
    </button>
  );
}
