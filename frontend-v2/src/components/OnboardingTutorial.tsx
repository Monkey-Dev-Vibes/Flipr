"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MarketCard } from "./MarketCard";
import type { Market } from "@/lib/types";

const TUTORIAL_MARKET: Market = {
  id: "tutorial-001",
  question: "Will you enjoy using Flipr?",
  category: "Tutorial",
  yesPrice: 95,
  noPrice: 5,
  volume: 0,
  expiresAt: "2099-12-31T23:59:59Z",
  social: { swipesToday: 42000 },
};

type TutorialStep = "intro" | "tap" | "complete";

interface OnboardingTutorialProps {
  onComplete: () => void;
}

/**
 * 3-step v2 onboarding tutorial:
 * 1. "How it works" intro explaining carousel + tap + swipe-up
 * 2. Interactive card — tap YES to proceed
 * 3. Success state with USDC credit
 */
export function OnboardingTutorial({ onComplete }: OnboardingTutorialProps) {
  const [step, setStep] = useState<TutorialStep>("intro");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleTapYes = useCallback(() => {
    setStep("complete");
    timerRef.current = setTimeout(onComplete, 1600);
  }, [onComplete]);

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-flipr-dark px-6">
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
              Browse markets. Tap YES or NO. Swipe up to trade.
            </p>

            {/* Feature pills — v2 mechanics */}
            <div className="flex flex-col gap-3">
              {[
                { icon: "→", text: "Scroll to browse markets" },
                { icon: "✓", text: "Tap YES or NO to pick a side" },
                { icon: "↑", text: "Swipe up to confirm your trade" },
              ].map((item) => (
                <div
                  key={item.text}
                  className="flex items-center gap-3 rounded-xl bg-flipr-card/5 px-5 py-3"
                >
                  <span className="font-mono text-lg text-flipr-yes">
                    {item.icon}
                  </span>
                  <span className="font-sans text-sm text-flipr-card/70">
                    {item.text}
                  </span>
                </div>
              ))}
            </div>

            <p className="max-w-xs text-center font-sans text-xs text-flipr-card/40">
              Try it now with a practice card — no real money involved.
            </p>
            <button
              type="button"
              onClick={() => setStep("tap")}
              className="btn-gradient mt-2"
            >
              Let&apos;s Go
            </button>
          </motion.div>
        )}

        {step === "tap" && (
          <motion.div
            key="tap"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex w-full max-w-sm flex-col items-center gap-6"
          >
            <p className="font-sans text-xs font-medium uppercase tracking-wider text-flipr-card/40">
              Practice card
            </p>
            <div style={{ height: "min(520px, 68dvh)" }} className="w-full">
              <MarketCard
                market={TUTORIAL_MARKET}
                onSelect={() => handleTapYes()}
              />
            </div>
            <motion.p
              className="font-mono text-xs text-flipr-card/30"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              Tap YES or NO to continue
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
