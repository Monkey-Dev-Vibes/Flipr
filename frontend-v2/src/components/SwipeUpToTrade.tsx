"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { useHaptics } from "@/hooks/useHaptics";

interface SwipeUpToTradeProps {
  intent: "yes" | "no";
  onConfirm: () => void;
  disabled?: boolean;
  /** Total travel distance in px the pill must be dragged upward. */
  travelDistance?: number;
}

/**
 * Robinhood-style "Swipe Up to Trade" pill.
 * User drags the pill vertically from bottom to top of the container.
 * On completion (reaching the top), fires onConfirm and a heavy haptic.
 * On incomplete drag, springs back to the starting position.
 */
export function SwipeUpToTrade({
  intent,
  onConfirm,
  disabled = false,
  travelDistance = 180,
}: SwipeUpToTradeProps) {
  const [isDragging, setIsDragging] = useState(false);
  const confirmedRef = useRef(false);
  const haptics = useHaptics();
  const onConfirmRef = useRef(onConfirm);
  useEffect(() => {
    onConfirmRef.current = onConfirm;
  }, [onConfirm]);

  const y = useMotionValue(0);
  // Progress: 0 at bottom, 1 at top. y goes negative as user drags up.
  const progress = useTransform(y, [0, -travelDistance], [0, 1]);
  // Background fill opacity tied to progress
  const fillOpacity = useTransform(y, [0, -travelDistance], [0.15, 1]);

  const isYes = intent === "yes";
  const bgColor = isYes ? "bg-flipr-yes" : "bg-flipr-no";
  const bgColorMuted = isYes ? "bg-flipr-yes/15" : "bg-flipr-no/15";

  const handleDragStart = useCallback(() => {
    if (disabled) return;
    confirmedRef.current = false;
    setIsDragging(true);
    haptics.startRampingHold(2000);
  }, [disabled, haptics]);

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
    haptics.stopRampingHold();

    if (confirmedRef.current) return;

    // Check if the pill was dragged far enough
    const currentY = y.get();
    if (currentY <= -travelDistance * 0.85) {
      // Threshold met — confirm
      confirmedRef.current = true;
      haptics.heavyImpact();
      onConfirmRef.current();
    }
    // If not met, Framer Motion's dragConstraints springs it back automatically
  }, [haptics, y, travelDistance]);

  return (
    <div
      className={`relative w-full overflow-hidden rounded-2xl ${bgColorMuted}`}
      style={{ height: 56 }}
    >
      {/* Progress fill background */}
      <motion.div
        className={`absolute inset-0 origin-bottom ${bgColor}`}
        style={{ opacity: fillOpacity, scaleY: progress }}
      />

      {/* Draggable pill */}
      <motion.div
        drag={disabled ? false : "y"}
        dragConstraints={{ top: -travelDistance, bottom: 0 }}
        dragElastic={0.15}
        dragMomentum={false}
        style={{ y }}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        className={`relative z-10 flex h-14 cursor-grab items-center justify-center active:cursor-grabbing ${
          disabled ? "cursor-not-allowed opacity-40" : ""
        }`}
        aria-label={`Swipe up to confirm ${intent.toUpperCase()} trade`}
        role="slider"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={0}
      >
        {/* Arrow indicator */}
        <div className="mr-2 flex flex-col items-center">
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            className={`${isDragging ? "text-white" : isYes ? "text-flipr-yes" : "text-flipr-no"} transition-colors`}
          >
            <path
              d="M6 1L11 6.5M6 1L1 6.5M6 1V11"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {/* Label */}
        <span
          className={`text-sm font-semibold select-none ${
            isDragging ? "text-white" : isYes ? "text-flipr-yes" : "text-flipr-no"
          } transition-colors duration-150`}
        >
          {isDragging ? "Release to confirm" : "Swipe Up to Trade"}
        </span>
      </motion.div>
    </div>
  );
}
