import { describe, it, expect } from "vitest";
import { formatVolume } from "@/lib/format";

describe("formatVolume", () => {
  it("formats millions with one decimal", () => {
    expect(formatVolume(2_100_000)).toBe("2.1M");
    expect(formatVolume(1_000_000)).toBe("1.0M");
    expect(formatVolume(10_500_000)).toBe("10.5M");
  });

  it("formats thousands without decimals", () => {
    expect(formatVolume(124_000)).toBe("124K");
    expect(formatVolume(1_000)).toBe("1K");
    expect(formatVolume(999_999)).toBe("1000K");
  });

  it("returns raw number for values under 1000", () => {
    expect(formatVolume(999)).toBe("999");
    expect(formatVolume(0)).toBe("0");
    expect(formatVolume(1)).toBe("1");
  });
});
