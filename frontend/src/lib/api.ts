import type { TradeConfirmation, TradeExecuteResponse } from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

/**
 * Execute a trade on the backend.
 * Sends the trade confirmation to POST /trade/execute with the user's auth token.
 */
export async function executeTrade(
  trade: TradeConfirmation,
  token: string,
): Promise<TradeExecuteResponse> {
  const response = await fetch(`${API_BASE}/trade/execute`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      market_id: trade.marketId,
      intent: trade.intent,
      amount: trade.amount,
      locked_price: trade.lockedPrice,
    }),
  });

  if (!response.ok) {
    if (response.status === 429) {
      return {
        data: null,
        error: "Too many trades. Please wait a moment.",
        meta: null,
      };
    }
    if (response.status === 401) {
      return {
        data: null,
        error: "Session expired. Please sign in again.",
        meta: null,
      };
    }
    return {
      data: null,
      error: "Something went wrong. Please try again.",
      meta: null,
    };
  }

  return response.json();
}
