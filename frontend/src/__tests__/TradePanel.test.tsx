import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import "@/__tests__/helpers/mock-framer-motion.js";
import { TradePanel } from "@/components/TradePanel";
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

describe("TradePanel", () => {
  it("renders market question", () => {
    render(
      <TradePanel
        market={mockMarket}
        intent="yes"
        onClose={() => {}}
        onConfirm={() => {}}
      />,
    );
    expect(screen.getByText("Will Bitcoin hit $200k?")).toBeInTheDocument();
  });

  it("shows YES badge for yes intent", () => {
    render(
      <TradePanel
        market={mockMarket}
        intent="yes"
        onClose={() => {}}
        onConfirm={() => {}}
      />,
    );
    expect(screen.getByText("YES")).toBeInTheDocument();
  });

  it("shows NO badge for no intent", () => {
    render(
      <TradePanel
        market={mockMarket}
        intent="no"
        onClose={() => {}}
        onConfirm={() => {}}
      />,
    );
    expect(screen.getByText("NO")).toBeInTheDocument();
  });

  it("displays locked odds for yes intent", () => {
    render(
      <TradePanel
        market={mockMarket}
        intent="yes"
        onClose={() => {}}
        onConfirm={() => {}}
      />,
    );
    expect(screen.getByText("42¢")).toBeInTheDocument();
  });

  it("displays locked odds for no intent", () => {
    render(
      <TradePanel
        market={mockMarket}
        intent="no"
        onClose={() => {}}
        onConfirm={() => {}}
      />,
    );
    expect(screen.getByText("58¢")).toBeInTheDocument();
  });

  it("shows the category", () => {
    render(
      <TradePanel
        market={mockMarket}
        intent="yes"
        onClose={() => {}}
        onConfirm={() => {}}
      />,
    );
    expect(screen.getByText("Crypto")).toBeInTheDocument();
  });

  it("shows the platform fee disclosure", () => {
    render(
      <TradePanel
        market={mockMarket}
        intent="yes"
        onClose={() => {}}
        onConfirm={() => {}}
      />,
    );
    expect(screen.getByText(/\$0\.50 platform fee/)).toBeInTheDocument();
  });

  it("shows default bet amount of $10", () => {
    render(
      <TradePanel
        market={mockMarket}
        intent="yes"
        onClose={() => {}}
        onConfirm={() => {}}
      />,
    );
    expect(screen.getByText("$10.00")).toBeInTheDocument();
  });

  it("calls onClose when close button clicked", () => {
    const onClose = vi.fn();
    render(
      <TradePanel
        market={mockMarket}
        intent="yes"
        onClose={onClose}
        onConfirm={() => {}}
      />,
    );
    fireEvent.click(screen.getByLabelText("Close trade panel"));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("calculates potential payout correctly", () => {
    render(
      <TradePanel
        market={mockMarket}
        intent="yes"
        onClose={() => {}}
        onConfirm={() => {}}
      />,
    );
    // $10 bet at 42¢ → $10 / 0.42 = $23.81
    expect(screen.getByText("$23.81")).toBeInTheDocument();
  });

  it("shows slippage warning when slippage detected", () => {
    render(
      <TradePanel
        market={mockMarket}
        intent="yes"
        onClose={() => {}}
        onConfirm={() => {}}
        slippageDetected={{ originalOdds: 42, currentOdds: 50 }}
      />,
    );
    expect(screen.getByText("Odds Changed")).toBeInTheDocument();
    expect(screen.getByText("I Understand, Continue")).toBeInTheDocument();
  });

  it("disables HoldToConfirm during slippage warning", () => {
    render(
      <TradePanel
        market={mockMarket}
        intent="yes"
        onClose={() => {}}
        onConfirm={() => {}}
        slippageDetected={{ originalOdds: 42, currentOdds: 50 }}
      />,
    );
    const confirmButton = screen.getByLabelText("Hold to Confirm YES");
    expect(confirmButton).toBeDisabled();
  });

  it("enables HoldToConfirm after acknowledging slippage (10A)", () => {
    render(
      <TradePanel
        market={mockMarket}
        intent="yes"
        onClose={() => {}}
        onConfirm={() => {}}
        slippageDetected={{ originalOdds: 42, currentOdds: 50 }}
      />,
    );
    // Button is disabled before acknowledgment
    const confirmButton = screen.getByLabelText("Hold to Confirm YES");
    expect(confirmButton).toBeDisabled();

    // Click acknowledge
    fireEvent.click(screen.getByText("I Understand, Continue"));

    // Button should now be enabled
    expect(confirmButton).not.toBeDisabled();
  });

  it("calculates potential payout correctly for NO intent (11A)", () => {
    render(
      <TradePanel
        market={mockMarket}
        intent="no"
        onClose={() => {}}
        onConfirm={() => {}}
      />,
    );
    // $10 bet at 58¢ → $10 / 0.58 = $17.24
    expect(screen.getByText("$17.24")).toBeInTheDocument();
  });

  it("shows dash for payout when locked price is zero (4A)", () => {
    const zeroPriceMarket = { ...mockMarket, yesPrice: 0, noPrice: 100 };
    render(
      <TradePanel
        market={zeroPriceMarket}
        intent="yes"
        onClose={() => {}}
        onConfirm={() => {}}
      />,
    );
    expect(screen.getByText("$—")).toBeInTheDocument();
  });

  it("calls onClose when backdrop is clicked", () => {
    const onClose = vi.fn();
    render(
      <TradePanel
        market={mockMarket}
        intent="yes"
        onClose={onClose}
        onConfirm={() => {}}
      />,
    );
    // The backdrop is the first aria-hidden div
    const backdrop = document.querySelector('[aria-hidden="true"]');
    expect(backdrop).not.toBeNull();
    fireEvent.click(backdrop!);
    expect(onClose).toHaveBeenCalledOnce();
  });
});
