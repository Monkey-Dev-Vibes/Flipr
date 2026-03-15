import { describe, it, expect } from "vitest";
import {
  SLIPPAGE_THRESHOLD,
  BIOMETRIC_THRESHOLD,
  COOLING_OFF_THRESHOLD,
  DEFAULT_BET_SIZE,
  MIN_BET_SIZE,
  MAX_BET_SIZE,
} from "@/lib/constants";

describe("constants match PRD-v2 spec", () => {
  it("slippage threshold is 5 percentage points", () => {
    expect(SLIPPAGE_THRESHOLD).toBe(5);
  });

  it("biometric step-up triggers at $100", () => {
    expect(BIOMETRIC_THRESHOLD).toBe(100);
  });

  it("cooling-off prompt triggers at 5 consecutive losses", () => {
    expect(COOLING_OFF_THRESHOLD).toBe(5);
  });

  it("bet size defaults and bounds are sensible", () => {
    expect(DEFAULT_BET_SIZE).toBe(10);
    expect(MIN_BET_SIZE).toBe(1);
    expect(MAX_BET_SIZE).toBe(100);
    expect(MIN_BET_SIZE).toBeLessThan(DEFAULT_BET_SIZE);
    expect(DEFAULT_BET_SIZE).toBeLessThanOrEqual(MAX_BET_SIZE);
  });
});
