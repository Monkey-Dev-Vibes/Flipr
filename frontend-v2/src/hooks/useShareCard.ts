"use client";

import { useCallback, useState } from "react";
import {
  renderShareCard,
  type ShareCardData,
} from "@/lib/shareCardRenderer";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

interface ShareResult {
  shared: boolean;
  error?: string;
}

/**
 * Hook for generating and sharing branded Flipr cards.
 * Uses Web Share API where available, falls back to clipboard.
 */
export function useShareCard() {
  const [isSharing, setIsSharing] = useState(false);

  const share = useCallback(
    async (
      data: ShareCardData,
      getToken?: () => Promise<string | null>,
    ): Promise<ShareResult> => {
      setIsSharing(true);
      try {
        // 1. Create a shareable snapshot on the backend (if authenticated)
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

        // 2. Render the share card image
        const cardData = { ...data, shareUrl };
        const blob = await renderShareCard(cardData);
        const file = new File([blob], "flipr-share.png", { type: "image/png" });

        // 3. Share via Web Share API or fallback to clipboard
        const shareText = data.type === "trade-win"
          ? `${data.percentGain >= 0 ? "+" : ""}${data.percentGain.toFixed(1)}% on "${data.question}" 🎯 ${shareUrl}`
          : `My portfolio is up ${data.percentGain >= 0 ? "+" : ""}${data.percentGain.toFixed(1)}% on Flipr 🚀 ${shareUrl}`;

        if (
          typeof navigator.share === "function" &&
          navigator.canShare?.({ files: [file] })
        ) {
          await navigator.share({
            text: shareText,
            files: [file],
          });
          return { shared: true };
        }

        // Fallback: copy text to clipboard
        if (navigator.clipboard) {
          await navigator.clipboard.writeText(shareText);
          return { shared: true };
        }

        return { shared: false, error: "Sharing not supported on this device" };
      } catch (err) {
        // User cancelled the share sheet
        if (err instanceof Error && err.name === "AbortError") {
          return { shared: false };
        }
        return {
          shared: false,
          error: err instanceof Error ? err.message : "Share failed",
        };
      } finally {
        setIsSharing(false);
      }
    },
    [],
  );

  return { share, isSharing };
}
