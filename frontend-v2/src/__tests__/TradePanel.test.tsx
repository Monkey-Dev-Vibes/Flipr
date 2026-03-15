import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TradePanel } from "@/components/TradePanel";
import type { Market } from "@/lib/types";

const mockMarket: Market = {
  id: "test-001",
  question: "Will it rain tomorrow?",
  category: "Weather",
  yesPrice: 72,
  noPrice: 28,
  volume: 45000,
  expiresAt: "2025-12-31T23:59:59Z",
};

describe("TradePanel", () => {
  it("renders market question and intent badge", () => {
    render(
      <TradePanel
        market={mockMarket}
        intent="yes"
        onClose={vi.fn()}
        onConfirm={vi.fn()}
      />,
    );
    expect(screen.getByText("Will it rain tomorrow?")).toBeInTheDocument();
    expect(screen.getByText("YES")).toBeInTheDocument();
  });

  it("renders NO intent correctly", () => {
    render(
      <TradePanel
        market={mockMarket}
        intent="no"
        onClose={vi.fn()}
        onConfirm={vi.fn()}
      />,
    );
    expect(screen.getByText("NO")).toBeInTheDocument();
  });

  it("shows locked odds as percentage", () => {
    render(
      <TradePanel
        market={mockMarket}
        intent="yes"
        onClose={vi.fn()}
        onConfirm={vi.fn()}
      />,
    );
    expect(screen.getByText("72%")).toBeInTheDocument();
  });

  it("shows bet amount slider", () => {
    render(
      <TradePanel
        market={mockMarket}
        intent="yes"
        onClose={vi.fn()}
        onConfirm={vi.fn()}
      />,
    );
    expect(screen.getByRole("slider", { name: "Bet amount" })).toBeInTheDocument();
  });

  it("shows fee disclosure", () => {
    render(
      <TradePanel
        market={mockMarket}
        intent="yes"
        onClose={vi.fn()}
        onConfirm={vi.fn()}
      />,
    );
    expect(screen.getByText(/platform fee/)).toBeInTheDocument();
  });

  it("calls onClose when close button is clicked", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(
      <TradePanel
        market={mockMarket}
        intent="yes"
        onClose={onClose}
        onConfirm={vi.fn()}
      />,
    );
    await user.click(screen.getByRole("button", { name: "Close trade panel" }));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("shows stale odds warning when isStale is true", () => {
    render(
      <TradePanel
        market={mockMarket}
        intent="yes"
        onClose={vi.fn()}
        onConfirm={vi.fn()}
        isStale
      />,
    );
    expect(screen.getByText(/Odds may be outdated/)).toBeInTheDocument();
  });

  it("shows submitting indicator when isSubmitting is true", () => {
    render(
      <TradePanel
        market={mockMarket}
        intent="yes"
        onClose={vi.fn()}
        onConfirm={vi.fn()}
        isSubmitting
      />,
    );
    expect(screen.getByText(/Executing trade/)).toBeInTheDocument();
  });

  it("renders the swipe-up-to-trade pill", () => {
    render(
      <TradePanel
        market={mockMarket}
        intent="yes"
        onClose={vi.fn()}
        onConfirm={vi.fn()}
      />,
    );
    expect(screen.getByText("Swipe Up to Trade")).toBeInTheDocument();
  });

  it("calculates potential payout correctly", () => {
    render(
      <TradePanel
        market={mockMarket}
        intent="yes"
        onClose={vi.fn()}
        onConfirm={vi.fn()}
      />,
    );
    // Default $10 bet at 72% = $10 / 0.72 = $13.89
    expect(screen.getByText("$13.89")).toBeInTheDocument();
  });
});
