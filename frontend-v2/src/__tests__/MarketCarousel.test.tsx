import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MarketCarousel } from "@/components/MarketCarousel";
import type { Market } from "@/lib/types";

const mockMarkets: Market[] = [
  {
    id: "test-001",
    question: "Market question 1?",
    category: "Finance",
    yesPrice: 60,
    noPrice: 40,
    volume: 100000,
    expiresAt: "2025-12-31T23:59:59Z",
  },
  {
    id: "test-002",
    question: "Market question 2?",
    category: "Tech",
    yesPrice: 45,
    noPrice: 55,
    volume: 200000,
    expiresAt: "2025-12-31T23:59:59Z",
  },
  {
    id: "test-003",
    question: "Market question 3?",
    category: "Sports",
    yesPrice: 80,
    noPrice: 20,
    volume: 50000,
    expiresAt: "2025-12-31T23:59:59Z",
  },
];

describe("MarketCarousel", () => {
  it("renders all market cards", () => {
    render(<MarketCarousel markets={mockMarkets} onSelect={vi.fn()} />);
    expect(screen.getByText("Market question 1?")).toBeInTheDocument();
    expect(screen.getByText("Market question 2?")).toBeInTheDocument();
    expect(screen.getByText("Market question 3?")).toBeInTheDocument();
  });

  it("renders pagination dots matching market count", () => {
    render(<MarketCarousel markets={mockMarkets} onSelect={vi.fn()} />);
    const dots = screen.getAllByRole("tab");
    expect(dots).toHaveLength(3);
  });

  it("first dot is active by default", () => {
    render(<MarketCarousel markets={mockMarkets} onSelect={vi.fn()} />);
    const dots = screen.getAllByRole("tab");
    expect(dots[0]).toHaveAttribute("aria-selected", "true");
    expect(dots[1]).toHaveAttribute("aria-selected", "false");
  });

  it("fires onSelect when YES button is clicked on a card", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<MarketCarousel markets={mockMarkets} onSelect={onSelect} />);

    const yesButtons = screen.getAllByRole("button", { name: "YES" });
    await user.click(yesButtons[0]);
    expect(onSelect).toHaveBeenCalledWith(mockMarkets[0], "yes");
  });

  it("handles empty markets array", () => {
    render(<MarketCarousel markets={[]} onSelect={vi.fn()} />);
    expect(screen.queryAllByRole("tab")).toHaveLength(0);
  });
});
