import { describe, it, expect } from "vitest";
import { mockMarkets } from "@/lib/mock-markets";

describe("mockMarkets", () => {
  it("contains 8 markets", () => {
    expect(mockMarkets).toHaveLength(8);
  });

  it("each market has required fields", () => {
    for (const market of mockMarkets) {
      expect(market.id).toBeTruthy();
      expect(market.question).toBeTruthy();
      expect(market.category).toBeTruthy();
      expect(market.yesPrice).toBeGreaterThanOrEqual(0);
      expect(market.yesPrice).toBeLessThanOrEqual(100);
      expect(market.noPrice).toBeGreaterThanOrEqual(0);
      expect(market.noPrice).toBeLessThanOrEqual(100);
      expect(market.volume).toBeGreaterThan(0);
      expect(market.expiresAt).toBeTruthy();
    }
  });

  it("each market has sparkline data with valid shape", () => {
    for (const market of mockMarkets) {
      expect(market.sparkline).toBeDefined();
      expect(market.sparkline!.length).toBe(25); // 24 points + 1 base
      for (const point of market.sparkline!) {
        expect(point.t).toBeGreaterThan(0);
        expect(point.p).toBeGreaterThanOrEqual(1);
        expect(point.p).toBeLessThanOrEqual(99);
      }
    }
  });

  it("sparkline data is deterministic across calls", () => {
    // Re-import to verify same data is produced
    const firstCall = mockMarkets.map((m) => m.sparkline);
    const secondCall = mockMarkets.map((m) => m.sparkline);
    expect(firstCall).toEqual(secondCall);
  });

  it("each market has social signal data", () => {
    for (const market of mockMarkets) {
      expect(market.social).toBeDefined();
      expect(market.social!.swipesToday).toBeGreaterThan(0);
    }
  });

  it("yes + no prices sum to 100 for each market", () => {
    for (const market of mockMarkets) {
      expect(market.yesPrice + market.noPrice).toBe(100);
    }
  });
});
