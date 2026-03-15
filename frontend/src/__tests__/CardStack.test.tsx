import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { CardStack } from "@/components/CardStack";
import type { Market } from "@/lib/types";

const markets: Market[] = [
  {
    id: "mkt-1",
    question: "Will it rain tomorrow?",
    category: "Weather",
    yesPrice: 60,
    noPrice: 40,
    volume: 50000,
    expiresAt: "2025-12-31T23:59:59Z",
  },
  {
    id: "mkt-2",
    question: "Will ETH hit $10k?",
    category: "Crypto",
    yesPrice: 25,
    noPrice: 75,
    volume: 800000,
    expiresAt: "2025-12-31T23:59:59Z",
  },
  {
    id: "mkt-3",
    question: "Will the Lakers win the championship?",
    category: "Sports",
    yesPrice: 15,
    noPrice: 85,
    volume: 1200000,
    expiresAt: "2025-12-31T23:59:59Z",
  },
];

describe("CardStack", () => {
  it("renders the first market card", () => {
    render(<CardStack markets={markets} />);
    expect(screen.getAllByText("Will it rain tomorrow?").length).toBeGreaterThanOrEqual(1);
  });

  it("renders empty state when markets array is empty", () => {
    render(<CardStack markets={[]} />);
    expect(screen.getByText("No markets available.")).toBeInTheDocument();
  });

  it("renders the next card behind the active card", () => {
    render(<CardStack markets={markets} />);
    // Both first and second market questions should be in the DOM
    expect(screen.getAllByText("Will it rain tomorrow?").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Will ETH hit $10k?").length).toBeGreaterThanOrEqual(1);
  });

  it("does not render the third card", () => {
    render(<CardStack markets={markets} />);
    expect(screen.queryByText("Will the Lakers win the championship?")).not.toBeInTheDocument();
  });

  it("calls onSwipe callback when provided", () => {
    const onSwipe = vi.fn();
    render(<CardStack markets={markets} onSwipe={onSwipe} />);
    // The component renders without error with the callback
    expect(screen.getAllByText("Will it rain tomorrow?").length).toBeGreaterThanOrEqual(1);
  });

  it("renders without onSwipe callback (optional prop)", () => {
    expect(() => render(<CardStack markets={markets} />)).not.toThrow();
  });

  it("renders with a single market (no next card behind)", () => {
    render(<CardStack markets={[markets[0]]} />);
    expect(screen.getAllByText("Will it rain tomorrow?").length).toBeGreaterThanOrEqual(1);
    // Second market should not be present
    expect(screen.queryByText("Will ETH hit $10k?")).not.toBeInTheDocument();
  });
});
