/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useShareCard } from "@/hooks/useShareCard";

// Mock the canvas renderer
vi.mock("@/lib/shareCardRenderer", () => ({
  renderShareCard: vi.fn().mockResolvedValue(new Blob(["test"], { type: "image/png" })),
}));

describe("useShareCard", () => {
  it("returns expected API shape", () => {
    const { result } = renderHook(() => useShareCard());
    expect(typeof result.current.generatePreview).toBe("function");
    expect(typeof result.current.confirmShare).toBe("function");
    expect(typeof result.current.dismissPreview).toBe("function");
    expect(result.current.preview).toBeNull();
    expect(result.current.isGenerating).toBe(false);
  });

  it("generatePreview creates a preview with imageUrl", async () => {
    // Mock URL.createObjectURL
    const mockUrl = "blob:http://localhost/mock-image";
    vi.stubGlobal("URL", {
      ...URL,
      createObjectURL: vi.fn(() => mockUrl),
      revokeObjectURL: vi.fn(),
    });

    const { result } = renderHook(() => useShareCard());

    await act(async () => {
      await result.current.generatePreview({
        type: "trade-win",
        question: "Test?",
        intent: "yes",
        percentGain: 10,
        amount: 25,
      });
    });

    expect(result.current.preview).not.toBeNull();
    expect(result.current.preview?.imageUrl).toBe(mockUrl);
    expect(result.current.preview?.shareText).toContain("+10.0%");
  });

  it("dismissPreview clears the preview", async () => {
    vi.stubGlobal("URL", {
      ...URL,
      createObjectURL: vi.fn(() => "blob:mock"),
      revokeObjectURL: vi.fn(),
    });

    const { result } = renderHook(() => useShareCard());

    await act(async () => {
      await result.current.generatePreview({
        type: "trade-win",
        question: "Test?",
        intent: "yes",
        percentGain: 10,
        amount: 25,
      });
    });

    expect(result.current.preview).not.toBeNull();

    act(() => {
      result.current.dismissPreview();
    });

    expect(result.current.preview).toBeNull();
  });
});
