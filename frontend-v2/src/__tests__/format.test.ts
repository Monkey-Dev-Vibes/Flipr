import { describe, it, expect } from "vitest";
import { formatVolume, formatBalance } from "@/lib/format";

describe("formatVolume", () => {
  it("formats millions with one decimal", () => {
    expect(formatVolume(2_100_000)).toBe("2.1M");
    expect(formatVolume(1_000_000)).toBe("1.0M");
  });

  it("formats thousands without decimals", () => {
    expect(formatVolume(124_000)).toBe("124K");
    expect(formatVolume(1_000)).toBe("1K");
  });

  it("returns raw number for values under 1000", () => {
    expect(formatVolume(999)).toBe("999");
    expect(formatVolume(0)).toBe("0");
  });
});

describe("formatBalance", () => {
  it("formats to two decimal places", () => {
    expect(formatBalance(100)).toBe("100.00");
    expect(formatBalance(10.5)).toBe("10.50");
    expect(formatBalance(0.1)).toBe("0.10");
  });
});
