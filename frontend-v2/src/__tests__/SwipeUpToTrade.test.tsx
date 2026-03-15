import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { SwipeUpToTrade } from "@/components/SwipeUpToTrade";

describe("SwipeUpToTrade", () => {
  it("renders with YES intent label", () => {
    render(<SwipeUpToTrade intent="yes" onConfirm={vi.fn()} />);
    expect(screen.getByText("Swipe Up to Trade")).toBeInTheDocument();
  });

  it("renders with NO intent label", () => {
    render(<SwipeUpToTrade intent="no" onConfirm={vi.fn()} />);
    expect(screen.getByText("Swipe Up to Trade")).toBeInTheDocument();
  });

  it("has correct aria-label for YES", () => {
    render(<SwipeUpToTrade intent="yes" onConfirm={vi.fn()} />);
    expect(
      screen.getByRole("slider", { name: "Swipe up to confirm YES trade" }),
    ).toBeInTheDocument();
  });

  it("has correct aria-label for NO", () => {
    render(<SwipeUpToTrade intent="no" onConfirm={vi.fn()} />);
    expect(
      screen.getByRole("slider", { name: "Swipe up to confirm NO trade" }),
    ).toBeInTheDocument();
  });

  it("applies disabled styling when disabled", () => {
    const { container } = render(
      <SwipeUpToTrade intent="yes" onConfirm={vi.fn()} disabled />,
    );
    const slider = container.querySelector("[role=slider]");
    expect(slider?.className).toContain("opacity-40");
  });
});
