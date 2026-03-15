import type { Market, SparklinePoint } from "./types";

/**
 * Simple seeded PRNG (mulberry32) for deterministic sparkline data.
 * Same seed always produces the same sequence.
 */
function seededRandom(seed: number): () => number {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function generateSparkline(basePrice: number, seed: number, points: number = 24): SparklinePoint[] {
  const random = seededRandom(seed);
  // Fixed base timestamp for determinism (2025-06-01T00:00:00Z)
  const baseTime = 1748736000000;
  const hourMs = 60 * 60 * 1000;
  const data: SparklinePoint[] = [];
  let price = basePrice;

  for (let i = points; i >= 0; i--) {
    data.push({ t: baseTime - i * hourMs, p: Math.round(price) });
    price = Math.max(1, Math.min(99, price + (random() - 0.5) * 8));
  }

  return data;
}

export const mockMarkets: Market[] = [
  {
    id: "mkt-001",
    question: "Will GTA VI be delayed to 2026?",
    category: "Pop Culture",
    yesPrice: 65,
    noPrice: 35,
    volume: 124000,
    expiresAt: "2025-12-31T23:59:59Z",
    sparkline: generateSparkline(65, 1001),
    social: { swipesToday: 12400 },
  },
  {
    id: "mkt-002",
    question: "Will the Fed cut rates in June?",
    category: "Finance",
    yesPrice: 42,
    noPrice: 58,
    volume: 892000,
    expiresAt: "2025-06-30T23:59:59Z",
    sparkline: generateSparkline(42, 1002),
    social: { swipesToday: 8700 },
  },
  {
    id: "mkt-003",
    question: "Will Bitcoin hit $150k this year?",
    category: "Crypto",
    yesPrice: 28,
    noPrice: 72,
    volume: 2100000,
    expiresAt: "2025-12-31T23:59:59Z",
    sparkline: generateSparkline(28, 1003),
    social: { swipesToday: 31200 },
  },
  {
    id: "mkt-004",
    question: "Will Apple announce AR glasses at WWDC?",
    category: "Tech",
    yesPrice: 19,
    noPrice: 81,
    volume: 340000,
    expiresAt: "2025-06-15T23:59:59Z",
    sparkline: generateSparkline(19, 1004),
    social: { swipesToday: 5400 },
  },
  {
    id: "mkt-005",
    question: "Will Taylor Swift announce a new album?",
    category: "Entertainment",
    yesPrice: 73,
    noPrice: 27,
    volume: 560000,
    expiresAt: "2025-09-01T23:59:59Z",
    sparkline: generateSparkline(73, 1005),
    social: { swipesToday: 19800 },
  },
  {
    id: "mkt-006",
    question: "Will Ethereum flip Bitcoin market cap?",
    category: "Crypto",
    yesPrice: 8,
    noPrice: 92,
    volume: 1450000,
    expiresAt: "2025-12-31T23:59:59Z",
    sparkline: generateSparkline(8, 1006),
    social: { swipesToday: 4200 },
  },
  {
    id: "mkt-007",
    question: "Will US unemployment exceed 5%?",
    category: "Finance",
    yesPrice: 15,
    noPrice: 85,
    volume: 678000,
    expiresAt: "2025-12-31T23:59:59Z",
    sparkline: generateSparkline(15, 1007),
    social: { swipesToday: 2100 },
  },
  {
    id: "mkt-008",
    question: "Will a Marvel film gross $2B in 2025?",
    category: "Entertainment",
    yesPrice: 34,
    noPrice: 66,
    volume: 230000,
    expiresAt: "2025-12-31T23:59:59Z",
    sparkline: generateSparkline(34, 1008),
    social: { swipesToday: 6800 },
  },
];
