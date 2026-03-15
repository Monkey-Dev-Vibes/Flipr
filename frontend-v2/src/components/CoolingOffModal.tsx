"use client";

import { motion, AnimatePresence } from "framer-motion";

interface CoolingOffModalProps {
  visible: boolean;
  consecutiveLosses: number;
  onDismiss: () => void;
  onTakeBreak: () => void;
}

/**
 * Full-screen calm-state modal shown after 5 consecutive losing trades.
 * Provides two options: continue trading or take a break.
 */
export function CoolingOffModal({
  visible,
  consecutiveLosses,
  onDismiss,
  onTakeBreak,
}: CoolingOffModalProps) {
  return (
    <AnimatePresence>
      {visible && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] bg-flipr-dark/90"
            aria-hidden="true"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed inset-x-4 top-1/2 z-[81] mx-auto max-w-sm -translate-y-1/2 rounded-3xl bg-flipr-card p-8 shadow-lg"
            role="alertdialog"
            aria-label="Take a break suggestion"
          >
            {/* Calm icon */}
            <div className="mb-6 flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-flipr-ink/5">
                <svg
                  className="h-8 w-8 text-flipr-ink/40"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>

            <h2 className="text-center font-display text-2xl font-bold text-flipr-ink">
              Take a break?
            </h2>

            <p className="mt-3 text-center text-sm text-flipr-ink/60">
              You&apos;ve had {consecutiveLosses} trades that didn&apos;t go your way.
              Markets are unpredictable — stepping back can help you make
              clearer decisions.
            </p>

            {/* Actions */}
            <div className="mt-8 flex flex-col gap-3">
              <button
                type="button"
                onClick={onTakeBreak}
                className="w-full rounded-xl bg-flipr-yes py-3.5 text-sm font-bold text-white transition-all active:scale-95"
              >
                Take a Break
              </button>
              <button
                type="button"
                onClick={onDismiss}
                className="w-full rounded-xl bg-flipr-ink/5 py-3.5 text-sm font-semibold text-flipr-ink/60 transition-all hover:bg-flipr-ink/10 active:scale-95"
              >
                Continue Trading
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
