import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useHaptics } from "@/hooks/useHaptics";

describe("useHaptics", () => {
  const vibrateMock = vi.fn(() => true);

  beforeEach(() => {
    Object.defineProperty(navigator, "vibrate", {
      value: vibrateMock,
      writable: true,
      configurable: true,
    });
    vibrateMock.mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("tick triggers a short vibration", () => {
    const { result } = renderHook(() => useHaptics());
    act(() => result.current.tick());
    expect(vibrateMock).toHaveBeenCalledWith(5);
  });

  it("thresholdClick triggers a medium vibration", () => {
    const { result } = renderHook(() => useHaptics());
    act(() => result.current.thresholdClick());
    expect(vibrateMock).toHaveBeenCalledWith(15);
  });

  it("heavyImpact triggers a heavy vibration", () => {
    const { result } = renderHook(() => useHaptics());
    act(() => result.current.heavyImpact());
    expect(vibrateMock).toHaveBeenCalledWith([40, 60, 20]);
  });

  it("startDragTick begins interval, stopDragTick clears it", () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useHaptics());

    act(() => result.current.startDragTick());
    act(() => vi.advanceTimersByTime(180)); // 3 intervals at 60ms
    expect(vibrateMock).toHaveBeenCalledTimes(3);

    act(() => result.current.stopDragTick());
    act(() => vi.advanceTimersByTime(180));
    // Should not have been called again
    expect(vibrateMock).toHaveBeenCalledTimes(3);

    vi.useRealTimers();
  });

  it("cleans up interval on unmount", () => {
    vi.useFakeTimers();
    const { result, unmount } = renderHook(() => useHaptics());

    act(() => result.current.startDragTick());
    act(() => vi.advanceTimersByTime(60));
    expect(vibrateMock).toHaveBeenCalledTimes(1);

    unmount();
    act(() => vi.advanceTimersByTime(180));
    // No additional calls after unmount
    expect(vibrateMock).toHaveBeenCalledTimes(1);

    vi.useRealTimers();
  });

  it("startRampingHold triggers accelerating vibrations", () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useHaptics());

    act(() => result.current.startRampingHold(1500));
    // First interval is 120ms
    act(() => vi.advanceTimersByTime(120));
    expect(vibrateMock).toHaveBeenCalledWith(8);

    act(() => result.current.stopRampingHold());
    vibrateMock.mockClear();
    act(() => vi.advanceTimersByTime(500));
    // No additional calls after stop
    expect(vibrateMock).not.toHaveBeenCalled();

    vi.useRealTimers();
  });

  it("startRampingHold self-terminates after maxDuration", () => {
    vi.useFakeTimers();
    const now = Date.now();
    vi.spyOn(Date, "now").mockReturnValue(now);

    const { result } = renderHook(() => useHaptics());
    act(() => result.current.startRampingHold(200));

    // Jump past the max duration
    vi.spyOn(Date, "now").mockReturnValue(now + 250);
    act(() => vi.advanceTimersByTime(250));

    vibrateMock.mockClear();
    act(() => vi.advanceTimersByTime(500));
    // Should have self-terminated, no more vibrations
    expect(vibrateMock).not.toHaveBeenCalled();

    vi.useRealTimers();
  });

  it("cleans up ramping timeout on unmount", () => {
    vi.useFakeTimers();
    const { result, unmount } = renderHook(() => useHaptics());

    act(() => result.current.startRampingHold(1500));
    act(() => vi.advanceTimersByTime(120));
    expect(vibrateMock).toHaveBeenCalledTimes(1);

    unmount();
    vibrateMock.mockClear();
    act(() => vi.advanceTimersByTime(500));
    expect(vibrateMock).not.toHaveBeenCalled();

    vi.useRealTimers();
  });

  it("does not throw when vibrate is not available", () => {
    // Fully remove vibrate from navigator
    const descriptor = Object.getOwnPropertyDescriptor(navigator, "vibrate");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (navigator as any).vibrate;

    const { result } = renderHook(() => useHaptics());

    // None of these should throw
    act(() => {
      result.current.tick();
      result.current.thresholdClick();
      result.current.heavyImpact();
      result.current.startDragTick();
      result.current.stopDragTick();
      result.current.startRampingHold(1500);
      result.current.stopRampingHold();
    });

    // Restore for other tests
    if (descriptor) {
      Object.defineProperty(navigator, "vibrate", descriptor);
    }
  });
});
