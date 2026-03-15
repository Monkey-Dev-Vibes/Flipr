"use client";

import { motion } from "framer-motion";

interface SlippageWarningProps {
  originalOdds: number;
  currentOdds: number;
  onAcknowledge: () => void;
}

export function SlippageWarning({
  originalOdds,
  currentOdds,
  onAcknowledge,
}: SlippageWarningProps) {
  const shift = Math.abs(currentOdds - originalOdds);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="rounded-2xl border border-flipr-no/30 bg-flipr-no/10 p-4"
    >
      <div className="mb-2 flex items-center gap-2">
        <span className="text-lg">⚠</span>
        <span className="font-semibold text-flipr-no">Odds Changed</span>
      </div>

      <p className="mb-3 text-sm text-flipr-ink/70">
        The odds have shifted by{" "}
        <span className="font-mono font-bold text-flipr-no">
          {shift.toFixed(1)}%
        </span>{" "}
        since you swiped. Review the new odds before confirming.
      </p>

      <div className="mb-3 flex items-center justify-between font-mono text-sm">
        <span className="text-flipr-ink/50">
          Was: <span className="font-bold">{originalOdds}¢</span>
        </span>
        <span className="text-flipr-no">→</span>
        <span className="font-bold text-flipr-no">{currentOdds}¢</span>
      </div>

      <button
        onClick={onAcknowledge}
        className="w-full rounded-xl bg-flipr-no/20 py-2.5 text-sm font-semibold text-flipr-no transition-colors hover:bg-flipr-no/30"
      >
        I Understand, Continue
      </button>
    </motion.div>
  );
}
