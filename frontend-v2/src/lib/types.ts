export interface SparklinePoint {
  t: number; // unix timestamp ms
  p: number; // probability 0-100
}

export interface SocialSignal {
  swipesToday: number;
  label?: string;
}

export interface Market {
  id: string;
  question: string;
  category: string;
  yesPrice: number; // 0-100 cents
  noPrice: number; // 0-100 cents
  volume: number; // total volume in USD
  expiresAt: string; // ISO date
  sparkline?: SparklinePoint[];
  social?: SocialSignal;
}

export type SwipeDirection = "yes" | "no" | "skip" | null;

export interface TradeConfirmation {
  marketId: string;
  intent: "yes" | "no";
  amount: number;
  lockedPrice: number;
}

export interface TradeResult {
  success: boolean;
  market_id: string;
  intent: string;
  amount: number;
  executed_price: number | null;
  fee: number | null;
  error: string | null;
}

export interface TradeExecuteResponse {
  data: TradeResult | null;
  error: string | null;
  meta: { fee: number; total_charge: number } | null;
}

export interface MarketOdds {
  market_id: string;
  yes_price: number;
  no_price: number;
  last_updated: string;
}

export interface MarketOddsResponse {
  data: MarketOdds | null;
  error: string | null;
}

export interface UserState {
  consecutiveLosses: number;
  totalTrades: number;
}

export interface SlippageInfo {
  originalOdds: number;
  currentOdds: number;
}
