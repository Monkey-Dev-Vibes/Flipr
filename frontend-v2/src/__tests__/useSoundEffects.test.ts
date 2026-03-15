/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useSoundEffects } from "@/hooks/useSoundEffects";

const mockGain = {
  gain: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
  connect: vi.fn().mockReturnThis(),
};

const mockOscillator = {
  type: "sine",
  frequency: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
  connect: vi.fn(() => mockGain),
  start: vi.fn(),
  stop: vi.fn(),
};

class MockAudioContext {
  currentTime = 0;
  destination = {};
  createOscillator() {
    return { ...mockOscillator, connect: vi.fn(() => mockGain) };
  }
  createGain() {
    return { ...mockGain };
  }
}

beforeEach(() => {
  vi.stubGlobal("AudioContext", MockAudioContext);
});

describe("useSoundEffects", () => {
  it("returns playWin, playLoss, and playTick functions", () => {
    const { result } = renderHook(() => useSoundEffects());
    expect(typeof result.current.playWin).toBe("function");
    expect(typeof result.current.playLoss).toBe("function");
    expect(typeof result.current.playTick).toBe("function");
  });

  it("playWin does not throw", () => {
    const { result } = renderHook(() => useSoundEffects());
    expect(() => result.current.playWin()).not.toThrow();
  });

  it("playLoss does not throw", () => {
    const { result } = renderHook(() => useSoundEffects());
    expect(() => result.current.playLoss()).not.toThrow();
  });

  it("playTick does not throw", () => {
    const { result } = renderHook(() => useSoundEffects());
    expect(() => result.current.playTick()).not.toThrow();
  });
});
