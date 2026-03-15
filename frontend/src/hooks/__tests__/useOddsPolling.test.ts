import { describe, it, expect } from "vitest";
import {
  checkSlippage,
  shouldMarkStale,
  shouldStopPolling,
  SLIPPAGE_THRESHOLD,
} from "../useOddsPolling";

describe("checkSlippage", () => {
  it("returns null when shift is below threshold", () => {
    // Locked YES at 50, live YES at 53 => 3-cent shift < 5
    const result = checkSlippage("yes", 53, 47, 50);
    expect(result).toBeNull();
  });

  it("returns slippage info when shift equals threshold", () => {
    // Locked YES at 50, live YES at 55 => exactly 5 cents
    const result = checkSlippage("yes", 55, 45, 50);
    expect(result).toEqual({ originalOdds: 50, currentOdds: 55 });
  });

  it("returns slippage info when shift exceeds threshold", () => {
    // Locked YES at 50, live YES at 60 => 10-cent shift
    const result = checkSlippage("yes", 60, 40, 50);
    expect(result).toEqual({ originalOdds: 50, currentOdds: 60 });
  });

  it("detects downward shift for YES intent", () => {
    // Locked YES at 50, live YES at 44 => 6-cent drop
    const result = checkSlippage("yes", 44, 56, 50);
    expect(result).toEqual({ originalOdds: 50, currentOdds: 44 });
  });

  it("uses noPrice for NO intent", () => {
    // Locked NO at 60, live NO at 66 => 6-cent shift
    const result = checkSlippage("no", 34, 66, 60);
    expect(result).toEqual({ originalOdds: 60, currentOdds: 66 });
  });

  it("returns null for NO intent when shift is small", () => {
    // Locked NO at 60, live NO at 62 => 2-cent shift
    const result = checkSlippage("no", 38, 62, 60);
    expect(result).toBeNull();
  });

  it("handles zero prices correctly", () => {
    // Edge case: locked at 0, live at 0 => 0-cent shift
    const result = checkSlippage("yes", 0, 100, 0);
    expect(result).toBeNull();
  });

  it("handles boundary at exactly threshold - 1", () => {
    const result = checkSlippage("yes", 50 + SLIPPAGE_THRESHOLD - 1, 50 - SLIPPAGE_THRESHOLD + 1, 50);
    expect(result).toBeNull();
  });
});

describe("shouldMarkStale", () => {
  it("returns false for 0 failures", () => {
    expect(shouldMarkStale(0)).toBe(false);
  });

  it("returns false for 1 failure", () => {
    expect(shouldMarkStale(1)).toBe(false);
  });

  it("returns false for 2 failures", () => {
    expect(shouldMarkStale(2)).toBe(false);
  });

  it("returns true for 3 failures", () => {
    expect(shouldMarkStale(3)).toBe(true);
  });

  it("returns true for more than 3 failures", () => {
    expect(shouldMarkStale(10)).toBe(true);
  });
});

describe("shouldStopPolling", () => {
  it("returns true for auth_expired", () => {
    expect(shouldStopPolling("auth_expired")).toBe(true);
  });

  it("returns false for rate_limited", () => {
    expect(shouldStopPolling("rate_limited")).toBe(false);
  });

  it("returns false for generic errors", () => {
    expect(shouldStopPolling("Network error")).toBe(false);
  });

  it("returns false for null", () => {
    expect(shouldStopPolling(null)).toBe(false);
  });
});
