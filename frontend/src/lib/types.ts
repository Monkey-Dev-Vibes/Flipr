export interface Market {
  id: string;
  question: string;
  category: string;
  yesPrice: number; // 0-100 cents
  noPrice: number; // 0-100 cents
  volume: number; // total volume in USD
  expiresAt: string; // ISO date
}

export type SwipeDirection = "yes" | "no" | "skip" | null;
