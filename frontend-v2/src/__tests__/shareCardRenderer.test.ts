/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import type { ShareCardData } from "@/lib/shareCardRenderer";

// Mock canvas context since jsdom doesn't support Canvas 2D
const mockCtx = {
  fillStyle: "",
  font: "",
  textAlign: "",
  fillRect: vi.fn(),
  fillText: vi.fn(),
  beginPath: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  quadraticCurveTo: vi.fn(),
  closePath: vi.fn(),
  fill: vi.fn(),
  measureText: vi.fn(() => ({ width: 50 })),
  createLinearGradient: vi.fn(() => ({
    addColorStop: vi.fn(),
  })),
};

beforeEach(() => {
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(
    mockCtx as unknown as CanvasRenderingContext2D,
  );
  vi.spyOn(HTMLCanvasElement.prototype, "toBlob").mockImplementation(
    function (this: HTMLCanvasElement, callback: BlobCallback) {
      callback(new Blob(["mock-png"], { type: "image/png" }));
    },
  );
});

describe("renderShareCard", () => {
  it("renders a trade-win card to a PNG blob", async () => {
    const { renderShareCard } = await import("@/lib/shareCardRenderer");
    const data: ShareCardData = {
      type: "trade-win",
      question: "Will BTC hit $100K?",
      intent: "yes",
      percentGain: 15.5,
      amount: 25.0,
      winStreak: 3,
      shareUrl: "https://flipr.app/s/abc123",
    };

    const blob = await renderShareCard(data);
    expect(blob).toBeInstanceOf(Blob);
    expect(blob.type).toBe("image/png");
  });

  it("renders a portfolio card", async () => {
    const { renderShareCard } = await import("@/lib/shareCardRenderer");
    const data: ShareCardData = {
      type: "portfolio",
      percentGain: 42.3,
      amount: 1250.0,
    };

    const blob = await renderShareCard(data);
    expect(blob).toBeInstanceOf(Blob);
  });

  it("calls fillText with gain percentage", async () => {
    const { renderShareCard } = await import("@/lib/shareCardRenderer");
    const data: ShareCardData = {
      type: "trade-win",
      question: "Test?",
      intent: "yes",
      percentGain: 15.5,
      amount: 10.0,
    };

    await renderShareCard(data);
    expect(mockCtx.fillText).toHaveBeenCalledWith(
      expect.stringContaining("+15.5%"),
      expect.any(Number),
      expect.any(Number),
    );
  });
});
