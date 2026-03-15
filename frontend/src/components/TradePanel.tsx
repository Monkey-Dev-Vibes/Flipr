"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Market, TradeConfirmation } from "@/lib/types";
import { BetSizeSlider } from "./BetSizeSlider";
import { HoldToConfirm } from "./HoldToConfirm";
import { SlippageWarning } from "./SlippageWarning";

interface TradePanelProps {
  market: Market;
  intent: "yes" | "no";
  onClose: () => void;
  onConfirm: (trade: TradeConfirmation) => void;
  /** Set when odds have shifted >5% — placeholder for Sprint 8 polling */
  slippageDetected?: { originalOdds: number; currentOdds: number } | null;
}

const DEFAULT_BET = 10;

export function TradePanel({
  market,
  intent,
  onClose,
  onConfirm,
  slippageDetected = null,
}: TradePanelProps) {
  const [betAmount, setBetAmount] = useState(DEFAULT_BET);
  const [slippageAcknowledged, setSlippageAcknowledged] = useState(false);

  const isYes = intent === "yes";
  const lockedPrice = isYes ? market.yesPrice : market.noPrice;
  const accentColor = isYes ? "text-flipr-yes" : "text-flipr-no";
  const accentBg = isYes ? "bg-flipr-yes" : "bg-flipr-no";
  const intentLabel = isYes ? "YES" : "NO";

  const hasSlippage = slippageDetected && !slippageAcknowledged;

  const handleConfirm = useCallback(() => {
    onConfirm({
      marketId: market.id,
      intent,
      amount: betAmount,
      lockedPrice,
    });
  }, [market.id, intent, betAmount, lockedPrice, onConfirm]);

  // Guard division by zero (4A)
  const payout =
    lockedPrice > 0 ? (betAmount / (lockedPrice / 100)).toFixed(2) : "—";

  return (
    <>
      {/* Backdrop overlay — blocks card interaction + tap to dismiss (2B+3A) */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-40 bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed inset-x-0 bottom-0 z-50 rounded-t-3xl bg-flipr-card shadow-panel will-change-transform"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="h-1 w-10 rounded-full bg-flipr-ink/20" />
        </div>

        <div className="space-y-5 px-6 pt-2 pb-6">
          {/* Header: intent + close */}
          <div className="flex items-start justify-between">
            <div className="flex-1 pr-4">
              <div className="mb-1 flex items-center gap-2">
                <span
                  className={`rounded-full px-3 py-0.5 text-xs font-bold text-white ${accentBg}`}
                >
                  {intentLabel}
                </span>
                <span className="text-xs text-flipr-ink/40 uppercase tracking-wider">
                  {market.category}
                </span>
              </div>
              <h3 className="font-serif text-lg font-bold leading-tight text-flipr-ink">
                {market.question}
              </h3>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full p-2 text-flipr-ink/40 transition-colors hover:bg-flipr-ink/5 hover:text-flipr-ink"
              aria-label="Close trade panel"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path
                  d="M15 5L5 15M5 5l10 10"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>

          {/* Locked odds + potential payout */}
          <div className="flex items-center justify-between rounded-2xl bg-flipr-ink/5 px-4 py-3">
            <div>
              <p className="text-xs text-flipr-ink/40">Locked Odds</p>
              <p className={`font-mono text-2xl font-bold ${accentColor}`}>
                {lockedPrice}¢
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-flipr-ink/40">Potential Payout</p>
              <p className="font-mono text-2xl font-bold text-flipr-ink">
                ${payout}
              </p>
            </div>
          </div>

          {/* Bet size */}
          <BetSizeSlider
            value={betAmount}
            onChange={setBetAmount}
            intent={intent}
          />

          {/* Slippage warning (placeholder — wired in Sprint 8) */}
          <AnimatePresence>
            {hasSlippage && (
              <SlippageWarning
                originalOdds={slippageDetected.originalOdds}
                currentOdds={slippageDetected.currentOdds}
                onAcknowledge={() => setSlippageAcknowledged(true)}
              />
            )}
          </AnimatePresence>

          {/* Hold to confirm */}
          <HoldToConfirm
            intent={intent}
            onConfirm={handleConfirm}
            disabled={!!hasSlippage}
          />

          {/* Fee disclosure */}
          <p className="text-center text-xs text-flipr-ink/30">
            Total charge: ${(betAmount + 0.5).toFixed(2)} (includes $0.50
            platform fee)
          </p>
        </div>
      </motion.div>
    </>
  );
}
