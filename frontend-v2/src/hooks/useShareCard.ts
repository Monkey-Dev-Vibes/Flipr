"use client";

import { useCallback, useState } from "react";
import {
  renderShareCard,
  type ShareCardData,
} from "@/lib/shareCardRenderer";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export interface SharePreview {
  imageUrl: string;
  shareText: string;
  file: File;
}

/**
 * Hook for generating and sharing branded Flipr cards.
 * Two-step flow: generatePreview() → confirmShare()
 */
export function useShareCard() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [preview, setPreview] = useState<SharePreview | null>(null);

  /** Step 1: Generate the card image and show preview */
  const generatePreview = useCallback(
    async (
      data: ShareCardData,
      getToken?: () => Promise<string | null>,
    ) => {
      setIsGenerating(true);
      try {
        // Create a shareable snapshot on the backend (if authenticated)
        let shareUrl = "https://flipr.app";
        if (getToken) {
          try {
            const token = await getToken();
            if (token) {
              const response = await fetch(`${API_BASE}/share`, {
                method: "POST",
                headers: {
                  Authorization: `Bearer ${token}`,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  type: data.type,
                  question: data.question,
                  intent: data.intent,
                  percentGain: data.percentGain,
                  amount: data.amount,
                  winStreak: data.winStreak,
                }),
              });
              if (response.ok) {
                const result = await response.json();
                if (result.data?.shareUrl) {
                  shareUrl = result.data.shareUrl;
                }
              }
            }
          } catch {
            // Backend unavailable — use default URL
          }
        }

        // Render the share card image
        const cardData = { ...data, shareUrl };
        const blob = await renderShareCard(cardData);
        const file = new File([blob], "flipr-share.png", { type: "image/png" });
        const imageUrl = URL.createObjectURL(blob);

        const shareText =
          data.type === "trade-win"
            ? `${data.percentGain >= 0 ? "+" : ""}${data.percentGain.toFixed(1)}% on "${data.question}" 🎯 ${shareUrl}`
            : `My portfolio is up ${data.percentGain >= 0 ? "+" : ""}${data.percentGain.toFixed(1)}% on Flipr 🚀 ${shareUrl}`;

        setPreview({ imageUrl, shareText, file });
      } finally {
        setIsGenerating(false);
      }
    },
    [],
  );

  /** Step 2: Actually share (called when user taps "Share" on the preview) */
  const confirmShare = useCallback(async (): Promise<boolean> => {
    if (!preview) return false;

    try {
      if (
        typeof navigator.share === "function" &&
        navigator.canShare?.({ files: [preview.file] })
      ) {
        await navigator.share({
          text: preview.shareText,
          files: [preview.file],
        });
        return true;
      }

      // Fallback: copy text to clipboard
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(preview.shareText);
        return true;
      }

      return false;
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") return false;
      return false;
    }
  }, [preview]);

  /** Dismiss the preview without sharing */
  const dismissPreview = useCallback(() => {
    if (preview?.imageUrl) {
      URL.revokeObjectURL(preview.imageUrl);
    }
    setPreview(null);
  }, [preview]);

  return { generatePreview, confirmShare, dismissPreview, preview, isGenerating };
}
