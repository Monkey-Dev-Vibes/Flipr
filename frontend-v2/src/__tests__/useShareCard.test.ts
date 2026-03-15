/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { useShareCard } from "@/hooks/useShareCard";

// Mock the canvas renderer
vi.mock("@/lib/shareCardRenderer", () => ({
  renderShareCard: vi.fn().mockResolvedValue(new Blob(["test"], { type: "image/png" })),
}));

describe("useShareCard", () => {
  it("returns share function and isSharing state", () => {
    const { result } = renderHook(() => useShareCard());
    expect(typeof result.current.share).toBe("function");
    expect(result.current.isSharing).toBe(false);
  });

  it("falls back to clipboard when Web Share API is unavailable", async () => {
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: writeTextMock },
      writable: true,
      configurable: true,
    });

    // Ensure navigator.share is not available
    Object.defineProperty(navigator, "share", {
      value: undefined,
      writable: true,
      configurable: true,
    });

    const { result } = renderHook(() => useShareCard());
    const shareResult = await result.current.share({
      type: "trade-win",
      question: "Test?",
      intent: "yes",
      percentGain: 10,
      amount: 25,
    });

    expect(shareResult.shared).toBe(true);
    expect(writeTextMock).toHaveBeenCalled();
  });
});
