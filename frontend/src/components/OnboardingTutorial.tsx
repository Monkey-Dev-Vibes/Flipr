"use client";

import { useState, useCallback, useRef } from "react";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
  type PanInfo,
} from "framer-motion";
import { MarketCard } from "./MarketCard";
import { SwipeOverlay } from "./CardStack";
import { useHaptics } from "@/hooks/useHaptics";
import { SWIPE_THRESHOLD, ROTATION_FACTOR, EXIT_DISTANCE } from "@/lib/constants";
import type { Market } from "@/lib/types";

/** The single dummy market used in the tutorial. */
const TUTORIAL_MARKET: Market = {
  id: "tutorial-001",
  question: "Will you enjoy using Flipr?",
  category: "Tutorial",
  yesPrice: 95,
  noPrice: 5,
  volume: 0,
  expiresAt: "2099-12-31T23:59:59Z",
};

type TutorialStep = "intro" | "swipe" | "complete";

interface OnboardingTutorialProps {
  onComplete: () => void;
}

export function OnboardingTutorial({ onComplete }: OnboardingTutorialProps) {
  const [step, setStep] = useState<TutorialStep>("intro");

  const handleSwipeComplete = useCallback(() => {
    setStep("complete");
    // Brief pause to show success, then finish onboarding
    setTimeout(onComplete, 1600);
  }, [onComplete]);

  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-flipr-dark px-6">
      <AnimatePresence mode="wait">
        {step === "intro" && (
          <motion.div
            key="intro"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex flex-col items-center gap-6"
          >
            <h2 className="font-serif text-3xl font-bold text-flipr-card">
              How it works
            </h2>
            <p className="max-w-xs text-center font-sans text-sm text-flipr-card/60">
              See a question. Swipe right if you think YES, left for NO.
              That&apos;s it.
            </p>
            <p className="max-w-xs text-center font-sans text-xs text-flipr-card/40">
              Try it now with a practice card — no real money involved.
            </p>
            <button
              type="button"
              onClick={() => setStep("swipe")}
              className="mt-4 rounded-full bg-flipr-yes px-8 py-3 font-sans text-sm font-semibold text-white shadow-lg transition-all active:scale-95"
            >
              Let&apos;s Go
            </button>
          </motion.div>
        )}

        {step === "swipe" && (
          <motion.div
            key="swipe"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex w-full max-w-sm flex-col items-center gap-6"
          >
            <p className="font-sans text-xs font-medium uppercase tracking-wider text-flipr-card/40">
              Practice card
            </p>
            <TutorialCard onSwipeComplete={handleSwipeComplete} />
            <motion.p
              className="font-mono text-xs text-flipr-card/30"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              ← Swipe right for YES →
            </motion.p>
          </motion.div>
        )}

        {step === "complete" && (
          <motion.div
            key="complete"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-4"
          >
            <motion.div
              className="flex h-16 w-16 items-center justify-center rounded-full bg-flipr-yes"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
            >
              <svg
                className="h-8 w-8 text-white"
                fill="none"
                stroke="currentColor"
                strokeWidth={3}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </motion.div>
            <h2 className="font-serif text-2xl font-bold text-flipr-card">
              You&apos;re ready!
            </h2>
            <p className="font-mono text-sm text-flipr-yes">
              +1.00 USDC credited
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/** The draggable tutorial card — only allows right swipe (YES). */
function TutorialCard({
  onSwipeComplete,
}: {
  onSwipeComplete: () => void;
}) {
  const x = useMotionValue(0);
  const haptics = useHaptics();
  const hasTriggered = useRef(false);
  const [swiped, setSwiped] = useState(false);

  const rotate = useTransform(
    x,
    [-300, 0, 300],
    [-ROTATION_FACTOR, 0, ROTATION_FACTOR],
  );
  const yesOpacity = useTransform(x, [0, SWIPE_THRESHOLD], [0, 0.35]);

  const handleDrag = useCallback(
    (_: unknown, info: PanInfo) => {
      if (info.offset.x > SWIPE_THRESHOLD && !hasTriggered.current) {
        hasTriggered.current = true;
        haptics.thresholdClick();
      } else if (info.offset.x <= SWIPE_THRESHOLD) {
        hasTriggered.current = false;
      }
      if (Math.abs(info.offset.x) > 10) haptics.tick();
    },
    [haptics],
  );

  const handleDragEnd = useCallback(
    (_: unknown, info: PanInfo) => {
      haptics.stopDragTick();
      hasTriggered.current = false;

      if (info.offset.x > SWIPE_THRESHOLD) {
        setSwiped(true);
        onSwipeComplete();
      }
      // Left swipe is intentionally not committed — tutorial only allows YES
    },
    [haptics, onSwipeComplete],
  );

  return (
    <AnimatePresence>
      {!swiped && (
        <motion.div
          className="relative h-[420px] w-full cursor-grab touch-none will-change-transform active:cursor-grabbing"
          style={{ x, rotate }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.9}
          onDrag={handleDrag}
          onDragEnd={handleDragEnd}
          exit={{ x: EXIT_DISTANCE, rotate: ROTATION_FACTOR, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <SwipeOverlay
            opacity={yesOpacity}
            color="bg-flipr-yes"
            label="YES"
            labelPosition="left-6 top-6"
          />
          <MarketCard market={TUTORIAL_MARKET} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
