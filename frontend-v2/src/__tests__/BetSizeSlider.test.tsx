import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BetSizeSlider } from "@/components/BetSizeSlider";

describe("BetSizeSlider", () => {
  it("displays current bet amount", () => {
    render(<BetSizeSlider value={10} onChange={vi.fn()} intent="yes" />);
    expect(screen.getByText("$10.00")).toBeInTheDocument();
  });

  it("renders preset chips", () => {
    render(<BetSizeSlider value={10} onChange={vi.fn()} intent="yes" />);
    expect(screen.getByRole("button", { name: "$1" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "$5" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "$10" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "$25" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "$50" })).toBeInTheDocument();
  });

  it("calls onChange when preset chip is clicked", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<BetSizeSlider value={10} onChange={onChange} intent="yes" />);

    await user.click(screen.getByRole("button", { name: "$25" }));
    expect(onChange).toHaveBeenCalledWith(25);
  });

  it("has slider with correct range", () => {
    render(<BetSizeSlider value={10} onChange={vi.fn()} intent="yes" />);
    const slider = screen.getByRole("slider", { name: "Bet amount" });
    expect(slider).toHaveAttribute("min", "1");
    expect(slider).toHaveAttribute("max", "100");
  });

  it("highlights active preset chip", () => {
    const { container } = render(
      <BetSizeSlider value={10} onChange={vi.fn()} intent="yes" />,
    );
    const buttons = container.querySelectorAll("button");
    const tenButton = Array.from(buttons).find(
      (b) => b.textContent === "$10",
    );
    expect(tenButton?.className).toContain("bg-flipr-yes");
  });
});
