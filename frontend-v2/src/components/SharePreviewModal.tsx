"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { SharePreview } from "@/hooks/useShareCard";

interface SharePreviewModalProps {
  preview: SharePreview | null;
  onShare: () => Promise<boolean>;
  onDismiss: () => void;
}

/**
 * Full-screen modal showing the share card preview.
 * User sees exactly what will be shared before confirming.
 */
export function SharePreviewModal({
  preview,
  onShare,
  onDismiss,
}: SharePreviewModalProps) {
  const [shareStatus, setShareStatus] = useState<
    "idle" | "sharing" | "copied"
  >("idle");

  const handleShare = async () => {
    setShareStatus("sharing");
    const success = await onShare();
    if (success) {
      setShareStatus("copied");
      setTimeout(() => {
        setShareStatus("idle");
        onDismiss();
      }, 1500);
    } else {
      setShareStatus("idle");
    }
  };

  return (
    <AnimatePresence>
      {preview && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[90] flex flex-col items-center justify-center bg-flipr-dark/95 px-6"
        >
          {/* Close button */}
          <button
            type="button"
            onClick={onDismiss}
            className="absolute right-4 top-4 pt-safe-top text-2xl text-flipr-card/50 transition-colors hover:text-flipr-card"
            aria-label="Close preview"
          >
            ✕
          </button>

          {/* Title */}
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 font-display text-sm font-semibold uppercase tracking-wider text-flipr-card/50"
          >
            Share Preview
          </motion.p>

          {/* Card image preview */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="w-full max-w-[340px] overflow-hidden rounded-2xl shadow-2xl"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={preview.imageUrl}
              alt="Share card preview"
              className="h-auto w-full"
            />
          </motion.div>

          {/* Share text preview */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-4 max-w-[340px] text-center text-xs text-flipr-card/40"
          >
            {preview.shareText}
          </motion.p>

          {/* Action buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-6 flex w-full max-w-[340px] gap-3"
          >
            <button
              type="button"
              onClick={onDismiss}
              className="flex-1 rounded-xl bg-flipr-card/10 py-3 text-sm font-semibold text-flipr-card transition-all active:scale-95"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleShare}
              disabled={shareStatus === "sharing"}
              className="flex-1 rounded-xl py-3 text-sm font-bold text-white transition-all active:scale-95 btn-gradient disabled:opacity-50"
            >
              {shareStatus === "copied"
                ? "Copied!"
                : shareStatus === "sharing"
                  ? "Sharing..."
                  : "Share"}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
