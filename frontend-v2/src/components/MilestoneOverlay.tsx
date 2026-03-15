"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SuccessConfetti } from "./SuccessConfetti";

interface MilestoneOverlayProps {
  emoji: string;
  label: string;
  visible: boolean;
  onDismiss: () => void;
}

const AUTO_DISMISS_MS = 3000;

/**
 * Full-screen celebratory overlay for milestones.
 * Shows emoji + label with confetti, auto-dismisses after 3s.
 */
export function MilestoneOverlay({
  emoji,
  label,
  visible,
  onDismiss,
}: MilestoneOverlayProps) {
  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(onDismiss, AUTO_DISMISS_MS);
    return () => clearTimeout(timer);
  }, [visible, onDismiss]);

  return (
    <>
      <AnimatePresence>
        {visible && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[80] flex flex-col items-center justify-center bg-flipr-dark/90"
            onClick={onDismiss}
          >
            <motion.div
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
              className="text-8xl"
            >
              {emoji}
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="mt-4 font-display text-3xl font-bold text-flipr-card"
            >
              {label}
            </motion.h2>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-2 text-sm text-flipr-card/50"
            >
              Tap to continue
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
      <SuccessConfetti active={visible} />
    </>
  );
}
