"use client";

import { useCallback, useEffect, useState } from "react";
import type { Market } from "@/lib/types";
import { mockMarkets } from "@/lib/mock-markets";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const DEV_AUTH = process.env.NEXT_PUBLIC_DEV_AUTH === "true";

interface UseMarketFeedResult {
  markets: Market[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Fetches the market feed from GET /markets/feed.
 * Falls back to mock data in dev mode or when API is unavailable.
 */
export function useMarketFeed(
  getToken: () => Promise<string | null>,
): UseMarketFeedResult {
  const [markets, setMarkets] = useState<Market[]>(mockMarkets);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFeed = useCallback(async () => {
    // In dev auth mode, use mock data directly
    if (DEV_AUTH) {
      setMarkets(mockMarkets);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const token = await getToken();
      if (!token) {
        setMarkets(mockMarkets);
        setIsLoading(false);
        return;
      }

      const response = await fetch(`${API_BASE}/markets/feed`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      if (data.data && Array.isArray(data.data) && data.data.length > 0) {
        // Map backend CuratedMarket to frontend Market shape
        const mapped: Market[] = data.data.map(
          (m: Record<string, unknown>) => ({
            id: m.id as string,
            question: (m.headline as string) || (m.question as string),
            category: m.category as string,
            yesPrice: m.yes_price as number,
            noPrice: m.no_price as number,
            volume: (m.volume as number) || 0,
            expiresAt: (m.expires_at as string) || "",
          }),
        );
        setMarkets(mapped);
      } else {
        // Empty feed — keep mock data
        setMarkets(mockMarkets);
      }
    } catch {
      setError("Failed to load markets");
      // Fall back to mock data
      setMarkets(mockMarkets);
    } finally {
      setIsLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    fetchFeed();
  }, [fetchFeed]);

  return { markets, isLoading, error, refetch: fetchFeed };
}
