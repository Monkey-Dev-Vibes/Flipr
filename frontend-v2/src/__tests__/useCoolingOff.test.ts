import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useCoolingOff } from "@/hooks/useCoolingOff";

beforeEach(() => {
  try {
    localStorage.removeItem("flipr_cooling_dismissed_at");
  } catch {
    // localStorage may not support clear in jsdom
  }
});

describe("useCoolingOff", () => {
  it("starts with 0 consecutive losses", () => {
    const { result } = renderHook(() => useCoolingOff());
    expect(result.current.consecutiveLosses).toBe(0);
    expect(result.current.shouldShowCooling).toBe(false);
  });

  it("increments losses on failed trades", () => {
    const { result } = renderHook(() => useCoolingOff());
    act(() => result.current.recordTradeResult(false));
    act(() => result.current.recordTradeResult(false));
    expect(result.current.consecutiveLosses).toBe(2);
  });

  it("resets losses on successful trade", () => {
    const { result } = renderHook(() => useCoolingOff());
    act(() => result.current.recordTradeResult(false));
    act(() => result.current.recordTradeResult(false));
    act(() => result.current.recordTradeResult(true));
    expect(result.current.consecutiveLosses).toBe(0);
  });

  it("shows cooling modal at 5 consecutive losses", () => {
    const { result } = renderHook(() => useCoolingOff());
    for (let i = 0; i < 5; i++) {
      act(() => result.current.recordTradeResult(false));
    }
    expect(result.current.shouldShowCooling).toBe(true);
  });

  it("does not show at 4 consecutive losses", () => {
    const { result } = renderHook(() => useCoolingOff());
    for (let i = 0; i < 4; i++) {
      act(() => result.current.recordTradeResult(false));
    }
    expect(result.current.shouldShowCooling).toBe(false);
  });

  it("hides cooling modal after dismiss", () => {
    const { result } = renderHook(() => useCoolingOff());
    for (let i = 0; i < 5; i++) {
      act(() => result.current.recordTradeResult(false));
    }
    expect(result.current.shouldShowCooling).toBe(true);

    act(() => result.current.dismissCooling());
    expect(result.current.shouldShowCooling).toBe(false);
  });

  it("respects dismiss cooldown (does not re-show after dismiss)", () => {
    const { result } = renderHook(() => useCoolingOff());
    // Trigger cooling
    for (let i = 0; i < 5; i++) {
      act(() => result.current.recordTradeResult(false));
    }
    act(() => result.current.dismissCooling());
    // Add more losses
    act(() => result.current.recordTradeResult(false));
    // Should NOT re-show because dismiss cooldown is active
    expect(result.current.shouldShowCooling).toBe(false);
  });

  it("resets streak clears everything", () => {
    const { result } = renderHook(() => useCoolingOff());
    for (let i = 0; i < 5; i++) {
      act(() => result.current.recordTradeResult(false));
    }
    act(() => result.current.resetStreak());
    expect(result.current.consecutiveLosses).toBe(0);
    expect(result.current.shouldShowCooling).toBe(false);
  });
});
