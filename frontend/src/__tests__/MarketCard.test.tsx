import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MarketCard } from "@/components/MarketCard";
import type { Market } from "@/lib/types";

const mockMarket: Market = {
  id: "test-001",
  question: "Will Bitcoin hit $200k?",
  category: "Crypto",
  yesPrice: 42,
  noPrice: 58,
  volume: 1_500_000,
  expiresAt: "2025-12-31T23:59:59Z",
};

describe("MarketCard", () => {
  it("renders the market question", () => {
    render(<MarketCard market={mockMarket} />);
    expect(
      screen.getByText("Will Bitcoin hit $200k?"),
    ).toBeInTheDocument();
  });

  it("renders the category badge", () => {
    render(<MarketCard market={mockMarket} />);
    expect(screen.getByText("Crypto")).toBeInTheDocument();
  });

  it("renders formatted volume", () => {
    render(<MarketCard market={mockMarket} />);
    expect(screen.getByText(/1\.5M/)).toBeInTheDocument();
  });

  it("renders YES and NO prices", () => {
    render(<MarketCard market={mockMarket} />);
    expect(screen.getByText(/42/)).toBeInTheDocument();
    expect(screen.getByText(/58/)).toBeInTheDocument();
  });

  it("renders YES and NO labels", () => {
    render(<MarketCard market={mockMarket} />);
    expect(screen.getByText("Yes")).toBeInTheDocument();
    expect(screen.getByText("No")).toBeInTheDocument();
  });

  it("renders swipe hint text", () => {
    render(<MarketCard market={mockMarket} />);
    expect(
      screen.getByText(/Swipe right for YES/),
    ).toBeInTheDocument();
  });

  it("handles small volume numbers", () => {
    const smallVolumeMarket = { ...mockMarket, volume: 500 };
    render(<MarketCard market={smallVolumeMarket} />);
    expect(screen.getByText(/500/)).toBeInTheDocument();
  });

  it("handles K-range volumes", () => {
    const kMarket = { ...mockMarket, volume: 340_000 };
    render(<MarketCard market={kMarket} />);
    expect(screen.getByText(/340K/)).toBeInTheDocument();
  });
});
