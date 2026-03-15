"use client";

import { useState, useCallback, useRef } from "react";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
  type MotionValue,
  type PanInfo,
} from "framer-motion";
import { MarketCard } from "./MarketCard";
import { useHaptics } from "@/hooks/useHaptics";
import {
  SWIPE_THRESHOLD,
  SKIP_THRESHOLD,
  ROTATION_FACTOR,
  EXIT_DISTANCE,
} from "@/lib/constants";
import type { Market, MarketOdds, SwipeDirection } from "@/lib/types";

function getExitVariant(direction: SwipeDirection) {
  switch (direction) {
    case "yes":
      return { x: EXIT_DISTANCE, rotate: ROTATION_FACTOR, opacity: 0 };
    case "no":
      return { x: -EXIT_DISTANCE, rotate: -ROTATION_FACTOR, opacity: 0 };
    case "skip":
      return { y: -EXIT_DISTANCE, opacity: 0 };
    default:
      return { opacity: 0 };
  }
}

// --- SwipeOverlay: DRY component for directional overlays ---

export interface SwipeOverlayProps {
  opacity: MotionValue<number>;
  color: string;
  label: string;
  labelPosition: string;
}

export function SwipeOverlay({
  opacity,
  color,
  label,
  labelPosition,
}: SwipeOverlayProps) {
  return (
    <>
      <motion.div
        className={`pointer-events-none absolute inset-0 z-10 rounded-3xl ${color}`}
        style={{ opacity }}
      />
      <motion.div
        className={`pointer-events-none absolute z-20 rounded-lg border-3 px-3 py-1 ${labelPosition} ${color.replace("bg-", "border-")}`}
        style={{ opacity }}
      >
        <span
          className={`font-mono text-lg font-bold ${color.replace("bg-", "text-")}`}
        >
          {label}
        </span>
      </motion.div>
    </>
  );
}

// --- CardStack ---

interface CardStackProps {
  markets: Market[];
  onSwipe?: (market: Market, direction: SwipeDirection) => void;
  liveOdds?: MarketOdds | null;
}

export function CardStack({ markets, onSwipe, liveOdds }: CardStackProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [exitDirection, setExitDirection] = useState<SwipeDirection>(null);

  // Explicit empty check (8A)
  if (markets.length === 0) {
    return (
      <div className="flex h-full items-center justify-center px-8">
        <p className="text-center font-serif text-2xl text-flipr-card/40">
          No markets available.
        </p>
      </div>
    );
  }

  const activeMarket = markets[currentIndex];
  const nextMarket = markets[currentIndex + 1];

  if (currentIndex >= markets.length) {
    return (
      <div className="flex h-full items-center justify-center px-8">
        <p className="text-center font-serif text-2xl text-flipr-card/40">
          No more markets right now. Check back soon.
        </p>
      </div>
    );
  }

  // Only apply live odds to the active card if market IDs match
  const activeOdds =
    liveOdds && liveOdds.market_id === activeMarket.id ? liveOdds : null;

  return (
    <CardStackInner
      activeMarket={activeMarket}
      nextMarket={nextMarket}
      exitDirection={exitDirection}
      setExitDirection={setExitDirection}
      setCurrentIndex={setCurrentIndex}
      onSwipe={onSwipe}
      liveOdds={activeOdds}
    />
  );
}

interface CardStackInnerProps {
  activeMarket: Market;
  nextMarket: Market | undefined;
  exitDirection: SwipeDirection;
  setExitDirection: (d: SwipeDirection) => void;
  setCurrentIndex: React.Dispatch<React.SetStateAction<number>>;
  onSwipe?: (market: Market, direction: SwipeDirection) => void;
  liveOdds?: MarketOdds | null;
}

function CardStackInner({
  activeMarket,
  nextMarket,
  exitDirection,
  setExitDirection,
  setCurrentIndex,
  onSwipe,
  liveOdds,
}: CardStackInnerProps) {
  const handleSwipeCommit = useCallback(
    (direction: SwipeDirection) => {
      if (activeMarket && direction) {
        onSwipe?.(activeMarket, direction);
      }
      setExitDirection(direction);
    },
    [activeMarket, onSwipe, setExitDirection],
  );

  // Single handler for exit completion (7A — only on the exiting card)
  const handleExitComplete = useCallback(() => {
    setExitDirection(null);
    setCurrentIndex((i) => i + 1);
  }, [setExitDirection, setCurrentIndex]);

  return (
    <div className="relative h-[480px] w-full max-w-sm">
      {/* Next card (behind, static) */}
      {nextMarket && (
        <div className="absolute inset-0 scale-[0.95] opacity-60">
          <MarketCard market={nextMarket} />
        </div>
      )}

      {/* Active card (draggable) — no onExitComplete here (7A fix) */}
      <AnimatePresence>
        {!exitDirection && (
          <SwipeableCard
            key={activeMarket.id}
            market={activeMarket}
            onSwipeCommit={handleSwipeCommit}
            liveOdds={liveOdds}
          />
        )}
      </AnimatePresence>

      {/* Exiting card (animating out) — sole owner of advance logic */}
      <AnimatePresence>
        {exitDirection && (
          <motion.div
            key={`${activeMarket.id}-exit`}
            className="pointer-events-none absolute inset-0"
            initial={{ x: 0, y: 0, rotate: 0, opacity: 1 }}
            animate={getExitVariant(exitDirection)}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            onAnimationComplete={handleExitComplete}
          >
            <MarketCard market={activeMarket} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// --- SwipeableCard ---

interface SwipeableCardProps {
  market: Market;
  onSwipeCommit: (direction: SwipeDirection) => void;
  liveOdds?: MarketOdds | null;
}

function SwipeableCard({ market, onSwipeCommit, liveOdds }: SwipeableCardProps) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const haptics = useHaptics();
  const hasTriggeredThreshold = useRef(false);

  // Rotate card based on horizontal drag
  const rotate = useTransform(
    x,
    [-300, 0, 300],
    [-ROTATION_FACTOR, 0, ROTATION_FACTOR],
  );

  // Swipe indicator opacities
  const yesOpacity = useTransform(x, [0, SWIPE_THRESHOLD], [0, 0.35]);
  const noOpacity = useTransform(x, [-SWIPE_THRESHOLD, 0], [0.35, 0]);
  const skipOpacity = useTransform(
    y,
    [-SKIP_THRESHOLD * 1.5, 0],
    [0.35, 0],
  );

  const handleDrag = useCallback(
    (_: unknown, info: PanInfo) => {
      const absX = Math.abs(info.offset.x);
      const absY = Math.abs(info.offset.y);

      // Haptic threshold feedback
      const pastThreshold =
        absX > SWIPE_THRESHOLD || info.offset.y < SKIP_THRESHOLD;
      if (pastThreshold && !hasTriggeredThreshold.current) {
        hasTriggeredThreshold.current = true;
        haptics.thresholdClick();
      } else if (!pastThreshold && hasTriggeredThreshold.current) {
        hasTriggeredThreshold.current = false;
      }

      // Continuous drag tick
      if (absX > 10 || absY > 10) {
        haptics.tick();
      }
    },
    [haptics],
  );

  const handleDragEnd = useCallback(
    (_: unknown, info: PanInfo) => {
      haptics.stopDragTick();

      if (info.offset.x > SWIPE_THRESHOLD) {
        onSwipeCommit("yes");
      } else if (info.offset.x < -SWIPE_THRESHOLD) {
        onSwipeCommit("no");
      } else if (info.offset.y < SKIP_THRESHOLD) {
        onSwipeCommit("skip");
      }
      // If no threshold reached, card snaps back via dragConstraints
      hasTriggeredThreshold.current = false;
    },
    [haptics, onSwipeCommit],
  );

  return (
    <motion.div
      className="absolute inset-0 cursor-grab touch-none will-change-transform active:cursor-grabbing"
      style={{ x, y, rotate }}
      drag
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={0.9}
      onDrag={handleDrag}
      onDragEnd={handleDragEnd}
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
    >
      <SwipeOverlay
        opacity={yesOpacity}
        color="bg-flipr-yes"
        label="YES"
        labelPosition="left-6 top-6"
      />
      <SwipeOverlay
        opacity={noOpacity}
        color="bg-flipr-no"
        label="NO"
        labelPosition="right-6 top-6"
      />
      <SwipeOverlay
        opacity={skipOpacity}
        color="bg-flipr-ink"
        label="SKIP"
        labelPosition="bottom-6 left-1/2 -translate-x-1/2"
      />

      {/* Actual card content */}
      <MarketCard
        market={market}
        liveYesPrice={liveOdds?.yes_price}
        liveNoPrice={liveOdds?.no_price}
      />
    </motion.div>
  );
}
