"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import type { TradeResult } from "@/lib/types";

interface TradeResultToastProps {
  result: TradeResult;
  onDismiss: () => void;
}

const AUTO_DISMISS_MS = 4000;

export function TradeResultToast({ result, onDismiss }: TradeResultToastProps) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, AUTO_DISMISS_MS);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  const isSuccess = result.success;
  const bgColor = isSuccess ? "bg-flipr-yes" : "bg-flipr-no";
  const icon = isSuccess ? "✓" : "✕";

  return (
    <motion.div
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -80, opacity: 0 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className={`fixed left-4 right-4 top-safe-top z-[60] mt-2 rounded-2xl ${bgColor} px-5 py-4 shadow-lg`}
      onClick={onDismiss}
      role="alert"
    >
      <div className="flex items-start gap-3">
        <span className="mt-0.5 font-mono text-lg font-bold text-white">
          {icon}
        </span>
        <div className="flex-1">
          <p className="text-sm font-bold text-white">
            {isSuccess ? "Trade Executed" : "Trade Failed"}
          </p>
          {isSuccess ? (
            <p className="mt-0.5 text-xs text-white/80">
              {result.intent.toUpperCase()} ${result.amount.toFixed(2)} at{" "}
              {result.executed_price?.toFixed(1)}¢
              {result.fee ? ` · Fee: $${result.fee.toFixed(2)}` : ""}
            </p>
          ) : (
            <p className="mt-0.5 text-xs text-white/80">
              {result.error || "Unknown error"}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
