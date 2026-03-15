import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MarketCard } from "@/components/MarketCard";
import type { Market } from "@/lib/types";

const mockMarket: Market = {
  id: "test-001",
  question: "Will it rain tomorrow?",
  category: "Weather",
  yesPrice: 72,
  noPrice: 28,
  volume: 45000,
  expiresAt: "2025-12-31T23:59:59Z",
  sparkline: [
    { t: 1000, p: 70 },
    { t: 2000, p: 72 },
    { t: 3000, p: 71 },
  ],
  social: { swipesToday: 5400 },
};

describe("MarketCard", () => {
  it("renders market question", () => {
    render(<MarketCard market={mockMarket} />);
    expect(screen.getByText("Will it rain tomorrow?")).toBeInTheDocument();
  });

  it("renders category badge", () => {
    render(<MarketCard market={mockMarket} />);
    expect(screen.getByText("Weather")).toBeInTheDocument();
  });

  it("renders formatted volume", () => {
    render(<MarketCard market={mockMarket} />);
    expect(screen.getByText("45K vol")).toBeInTheDocument();
  });

  it("renders YES and NO odds as percentages", () => {
    render(<MarketCard market={mockMarket} />);
    expect(screen.getByText("72%")).toBeInTheDocument();
    expect(screen.getByText("28%")).toBeInTheDocument();
  });

  it("renders social badge with swipe count", () => {
    render(<MarketCard market={mockMarket} />);
    expect(screen.getByText(/5K Swipes Today/)).toBeInTheDocument();
  });

  it("renders YES and NO action buttons", () => {
    render(<MarketCard market={mockMarket} />);
    expect(screen.getByRole("button", { name: "YES" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "NO" })).toBeInTheDocument();
  });

  it("calls onSelect with correct intent when YES is tapped", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<MarketCard market={mockMarket} onSelect={onSelect} />);

    await user.click(screen.getByRole("button", { name: "YES" }));
    expect(onSelect).toHaveBeenCalledWith(mockMarket, "yes");
  });

  it("calls onSelect with correct intent when NO is tapped", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<MarketCard market={mockMarket} onSelect={onSelect} />);

    await user.click(screen.getByRole("button", { name: "NO" }));
    expect(onSelect).toHaveBeenCalledWith(mockMarket, "no");
  });

  it("uses live prices when provided", () => {
    render(
      <MarketCard market={mockMarket} liveYesPrice={80} liveNoPrice={20} />,
    );
    expect(screen.getByText("80%")).toBeInTheDocument();
    expect(screen.getByText("20%")).toBeInTheDocument();
  });

  it("renders sparkline SVG when sparkline data exists", () => {
    const { container } = render(<MarketCard market={mockMarket} />);
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("handles missing social signal gracefully", () => {
    const marketNoSocial = { ...mockMarket, social: undefined };
    render(<MarketCard market={marketNoSocial} />);
    expect(screen.queryByText(/Swipes Today/)).not.toBeInTheDocument();
  });
});
