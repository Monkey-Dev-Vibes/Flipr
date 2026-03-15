/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useWinStreak } from "@/hooks/useWinStreak";

describe("useWinStreak", () => {
  beforeEach(() => {
    // Clear the specific key rather than calling .clear()
    window.localStorage.removeItem("flipr-win-streak");
  });

  it("starts at 0 streak", () => {
    const { result } = renderHook(() => useWinStreak());
    expect(result.current.currentStreak).toBe(0);
    expect(result.current.bestStreak).toBe(0);
  });

  it("increments streak on consecutive wins", () => {
    const { result } = renderHook(() => useWinStreak());
    act(() => result.current.recordWin());
    act(() => result.current.recordWin());
    act(() => result.current.recordWin());
    expect(result.current.currentStreak).toBe(3);
    expect(result.current.bestStreak).toBe(3);
  });

  it("resets current streak on loss but preserves best", () => {
    const { result } = renderHook(() => useWinStreak());
    act(() => result.current.recordWin());
    act(() => result.current.recordWin());
    act(() => result.current.recordWin());
    act(() => result.current.recordLoss());
    expect(result.current.currentStreak).toBe(0);
    expect(result.current.bestStreak).toBe(3);
  });

  it("returns correct glow class based on streak", () => {
    const { result } = renderHook(() => useWinStreak());
    expect(result.current.glowClass).toBe("");

    act(() => result.current.recordWin());
    act(() => result.current.recordWin());
    expect(result.current.glowClass).toBe("streak-glow-1");

    act(() => result.current.recordWin());
    expect(result.current.glowClass).toBe("streak-glow-2");

    act(() => result.current.recordWin());
    act(() => result.current.recordWin());
    expect(result.current.glowClass).toBe("streak-glow-3");
  });

  it("persists to localStorage", () => {
    const { result } = renderHook(() => useWinStreak());
    act(() => result.current.recordWin());
    act(() => result.current.recordWin());

    const stored = JSON.parse(window.localStorage.getItem("flipr-win-streak")!);
    expect(stored.current).toBe(2);
    expect(stored.best).toBe(2);
  });
});
