import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import "@/__tests__/helpers/mock-framer-motion.js";

// Mock useHaptics to no-ops so haptic side effects don't interfere
vi.mock("@/hooks/useHaptics", () => ({
  useHaptics: () => ({
    tick: vi.fn(),
    thresholdClick: vi.fn(),
    heavyImpact: vi.fn(),
    startDragTick: vi.fn(),
    stopDragTick: vi.fn(),
    startRampingHold: vi.fn(),
    stopRampingHold: vi.fn(),
  }),
}));

import { HoldToConfirm } from "@/components/HoldToConfirm";

describe("HoldToConfirm", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders YES label for yes intent", () => {
    render(<HoldToConfirm intent="yes" onConfirm={() => {}} />);
    expect(screen.getByText("Hold to Confirm YES")).toBeInTheDocument();
  });

  it("renders NO label for no intent", () => {
    render(<HoldToConfirm intent="no" onConfirm={() => {}} />);
    expect(screen.getByText("Hold to Confirm NO")).toBeInTheDocument();
  });

  it("shows 'Confirming...' while holding", () => {
    render(<HoldToConfirm intent="yes" onConfirm={() => {}} />);
    const button = screen.getByRole("button");
    fireEvent.pointerDown(button);
    expect(screen.getByText("Confirming...")).toBeInTheDocument();
    fireEvent.pointerUp(button);
  });

  it("resets on pointer up before completion", () => {
    render(<HoldToConfirm intent="yes" onConfirm={() => {}} />);
    const button = screen.getByRole("button");
    fireEvent.pointerDown(button);
    fireEvent.pointerUp(button);
    expect(screen.getByText("Hold to Confirm YES")).toBeInTheDocument();
  });

  it("is disabled when disabled prop is true", () => {
    render(<HoldToConfirm intent="yes" onConfirm={() => {}} disabled />);
    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
  });

  it("does not start hold when disabled", () => {
    render(<HoldToConfirm intent="yes" onConfirm={() => {}} disabled />);
    const button = screen.getByRole("button");
    fireEvent.pointerDown(button);
    expect(screen.getByText("Hold to Confirm YES")).toBeInTheDocument();
  });

  it("has correct aria-label for yes", () => {
    render(<HoldToConfirm intent="yes" onConfirm={() => {}} />);
    expect(
      screen.getByLabelText("Hold to Confirm YES"),
    ).toBeInTheDocument();
  });

  it("has correct aria-label for no", () => {
    render(<HoldToConfirm intent="no" onConfirm={() => {}} />);
    expect(
      screen.getByLabelText("Hold to Confirm NO"),
    ).toBeInTheDocument();
  });

  it("resets on pointer leave", () => {
    render(<HoldToConfirm intent="yes" onConfirm={() => {}} />);
    const button = screen.getByRole("button");
    fireEvent.pointerDown(button);
    expect(screen.getByText("Confirming...")).toBeInTheDocument();
    fireEvent.pointerLeave(button);
    expect(screen.getByText("Hold to Confirm YES")).toBeInTheDocument();
  });

  it("calls onConfirm after holding for 1.5 seconds (9A)", () => {
    const onConfirm = vi.fn();
    const startTime = 1000;

    // Mock Date.now and rAF manually for full control over the animation loop
    const dateNowSpy = vi.spyOn(Date, "now").mockReturnValue(startTime);
    const rafCallbacks: FrameRequestCallback[] = [];
    const rafSpy = vi
      .spyOn(window, "requestAnimationFrame")
      .mockImplementation((cb) => {
        rafCallbacks.push(cb);
        return rafCallbacks.length;
      });
    vi.spyOn(window, "cancelAnimationFrame").mockImplementation(() => {});

    render(<HoldToConfirm intent="yes" onConfirm={onConfirm} />);
    const button = screen.getByRole("button");

    // Start the hold — this sets startTimeRef and schedules first rAF
    act(() => {
      fireEvent.pointerDown(button);
    });

    // Advance Date.now past 1500ms, then pump the rAF callback
    dateNowSpy.mockReturnValue(startTime + 1600);
    act(() => {
      // Fire the queued rAF callback — animate() checks Date.now() and completes
      const cb = rafCallbacks.shift();
      cb?.(performance.now());
    });

    expect(onConfirm).toHaveBeenCalledOnce();

    dateNowSpy.mockRestore();
    rafSpy.mockRestore();
  });

  it("does not call onConfirm if released before 1.5s", () => {
    const onConfirm = vi.fn();
    const startTime = 1000;

    const dateNowSpy = vi.spyOn(Date, "now").mockReturnValue(startTime);
    const rafCallbacks: FrameRequestCallback[] = [];
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((cb) => {
      rafCallbacks.push(cb);
      return rafCallbacks.length;
    });
    vi.spyOn(window, "cancelAnimationFrame").mockImplementation(() => {});

    render(<HoldToConfirm intent="yes" onConfirm={onConfirm} />);
    const button = screen.getByRole("button");

    act(() => {
      fireEvent.pointerDown(button);
    });

    // Only advance 500ms — pump rAF, should NOT trigger confirm
    dateNowSpy.mockReturnValue(startTime + 500);
    act(() => {
      const cb = rafCallbacks.shift();
      cb?.(performance.now());
    });

    act(() => {
      fireEvent.pointerUp(button);
    });

    expect(onConfirm).not.toHaveBeenCalled();

    vi.restoreAllMocks();
  });
});
