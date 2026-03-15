"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { fetchMarketOdds } from "@/lib/api";
import type { MarketOdds, SlippageInfo } from "@/lib/types";
import { SLIPPAGE_THRESHOLD } from "@/lib/constants";

const WS_BASE = process.env.NEXT_PUBLIC_WS_URL ?? "ws://localhost:8000";
const RECONNECT_DELAYS = [1000, 2000, 4000]; // exponential backoff
const POLL_INTERVAL_MS = 3000; // fallback polling interval

function checkSlippage(
  intent: "yes" | "no",
  odds: MarketOdds,
  lockedPrice: number,
): SlippageInfo | null {
  const currentPrice = intent === "yes" ? odds.yes_price : odds.no_price;
  const shift = Math.abs(currentPrice - lockedPrice);
  if (shift >= SLIPPAGE_THRESHOLD) {
    return { originalOdds: lockedPrice, currentOdds: currentPrice };
  }
  return null;
}

interface UseOddsWebSocketOptions {
  marketId: string | null;
  intent: "yes" | "no" | null;
  lockedPrice: number;
  getToken: () => Promise<string | null>;
  enabled?: boolean;
}

interface UseOddsWebSocketResult {
  liveOdds: MarketOdds | null;
  slippage: SlippageInfo | null;
  isStale: boolean;
  isConnected: boolean;
}

/**
 * WebSocket-first odds streaming with HTTP polling fallback.
 * Attempts WebSocket connection to /ws/odds/{marketId}.
 * Falls back to 3-second polling if WS fails after 3 reconnect attempts.
 */
export function useOddsWebSocket({
  marketId,
  intent,
  lockedPrice,
  getToken,
  enabled = true,
}: UseOddsWebSocketOptions): UseOddsWebSocketResult {
  const [liveOdds, setLiveOdds] = useState<MarketOdds | null>(null);
  const [slippage, setSlippage] = useState<SlippageInfo | null>(null);
  const [isStale, setIsStale] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttemptRef = useRef(0);
  const fallbackPollingRef = useRef(false);
  const activeRef = useRef(false);

  // Process incoming odds data (shared between WS and polling)
  const processOdds = useCallback(
    (odds: MarketOdds) => {
      setLiveOdds(odds);
      setIsStale(false);
      if (intent) {
        setSlippage(checkSlippage(intent, odds, lockedPrice));
      }
    },
    [intent, lockedPrice],
  );

  // HTTP polling fallback
  const startPollingFallback = useCallback(async () => {
    if (!marketId || !activeRef.current || fallbackPollingRef.current) return;
    fallbackPollingRef.current = true;

    const poll = async () => {
      if (!activeRef.current) return;
      const token = await getToken();
      if (!token || !activeRef.current) return;

      try {
        const response = await fetchMarketOdds(marketId, token);
        if (!activeRef.current) return;

        if (response.data) {
          processOdds(response.data);
        } else {
          setIsStale(true);
        }
      } catch {
        // Backend unavailable — mark stale, retry on next interval
        setIsStale(true);
      }

      if (activeRef.current) {
        setTimeout(poll, POLL_INTERVAL_MS);
      }
    };

    setTimeout(poll, 0);
  }, [marketId, getToken, processOdds]);

  // WebSocket connection
  useEffect(() => {
    if (!enabled || !marketId) {
      activeRef.current = false;
      return;
    }

    activeRef.current = true;
    reconnectAttemptRef.current = 0;
    fallbackPollingRef.current = false;

    const connect = async () => {
      const token = await getToken();
      if (!token || !activeRef.current) return;

      const url = `${WS_BASE}/ws/odds/${marketId}?token=${token}`;

      try {
        const ws = new WebSocket(url);
        wsRef.current = ws;

        ws.onopen = () => {
          setIsConnected(true);
          reconnectAttemptRef.current = 0;
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.error) {
              setIsStale(true);
              return;
            }
            processOdds(data as MarketOdds);
          } catch {
            // Ignore malformed messages
          }
        };

        ws.onclose = () => {
          setIsConnected(false);
          wsRef.current = null;

          if (!activeRef.current) return;

          // Attempt reconnect with backoff
          if (reconnectAttemptRef.current < RECONNECT_DELAYS.length) {
            const delay = RECONNECT_DELAYS[reconnectAttemptRef.current];
            reconnectAttemptRef.current += 1;
            setTimeout(connect, delay);
          } else {
            // Fall back to HTTP polling
            startPollingFallback();
          }
        };

        ws.onerror = () => {
          // onclose will fire after onerror, so reconnect logic is handled there
        };
      } catch {
        // WebSocket constructor failed — fall back to polling
        startPollingFallback();
      }
    };

    connect();

    return () => {
      activeRef.current = false;
      fallbackPollingRef.current = false;
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      setLiveOdds(null);
      setSlippage(null);
      setIsStale(false);
      setIsConnected(false);
    };
  }, [enabled, marketId, getToken, processOdds, startPollingFallback]);

  return { liveOdds, slippage, isStale, isConnected };
}
