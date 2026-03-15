"use client";

import { motion, AnimatePresence } from "framer-motion";

interface WinStreakBadgeProps {
  streak: number;
  glowClass: string;
}

/**
 * Fire emoji badge that appears in the header during win streaks.
 * Glow intensity escalates with streak length.
 */
export function WinStreakBadge({ streak, glowClass }: WinStreakBadgeProps) {
  return (
    <AnimatePresence>
      {streak >= 2 && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ type: "spring", stiffness: 500, damping: 15 }}
          className={`flex items-center gap-1 rounded-full bg-flipr-yes/15 px-2.5 py-1 ${glowClass}`}
        >
          <span className="text-sm" role="img" aria-label="fire">
            🔥
          </span>
          <span className="font-mono text-xs font-bold text-flipr-yes">
            x{streak}
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
