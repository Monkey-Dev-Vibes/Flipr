/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useMilestones } from "@/hooks/useMilestones";

describe("useMilestones", () => {
  beforeEach(() => {
    window.localStorage.removeItem("flipr-milestones");
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("starts with zero trades and profit", () => {
    const { result } = renderHook(() => useMilestones());
    expect(result.current.totalTrades).toBe(0);
    expect(result.current.totalProfit).toBe(0);
  });

  it("triggers first-trade milestone on first trade", () => {
    const { result } = renderHook(() => useMilestones());
    act(() => result.current.recordTrade(5));
    act(() => { vi.runAllTimers(); });
    expect(result.current.totalTrades).toBe(1);
    expect(result.current.activeMilestone).toBe("first-trade");
    expect(result.current.milestoneInfo?.emoji).toBe("🚀");
  });

  it("triggers ten-trades milestone at 10th trade", () => {
    const { result } = renderHook(() => useMilestones());
    for (let i = 0; i < 9; i++) {
      act(() => result.current.recordTrade(1));
      act(() => {
        vi.runAllTimers();
        result.current.dismissMilestone();
      });
    }
    act(() => result.current.recordTrade(1));
    act(() => { vi.runAllTimers(); });
    expect(result.current.totalTrades).toBe(10);
    expect(result.current.activeMilestone).toBe("ten-trades");
  });

  it("dismisses milestone", () => {
    const { result } = renderHook(() => useMilestones());
    act(() => result.current.recordTrade(5));
    act(() => { vi.runAllTimers(); });
    expect(result.current.activeMilestone).toBe("first-trade");
    act(() => result.current.dismissMilestone());
    expect(result.current.activeMilestone).toBeNull();
  });

  it("persists to localStorage", () => {
    const { result } = renderHook(() => useMilestones());
    act(() => result.current.recordTrade(50));

    const stored = JSON.parse(window.localStorage.getItem("flipr-milestones")!);
    expect(stored.totalTrades).toBe(1);
    expect(stored.totalProfit).toBe(50);
  });
});
