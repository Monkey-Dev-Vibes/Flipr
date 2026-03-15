import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { BetSizeSlider } from "@/components/BetSizeSlider";

describe("BetSizeSlider", () => {
  it("displays the current bet amount", () => {
    render(<BetSizeSlider value={10} onChange={() => {}} intent="yes" />);
    expect(screen.getByText("$10.00")).toBeInTheDocument();
  });

  it("renders all preset buttons", () => {
    render(<BetSizeSlider value={10} onChange={() => {}} intent="yes" />);
    expect(screen.getByText("$1")).toBeInTheDocument();
    expect(screen.getByText("$5")).toBeInTheDocument();
    expect(screen.getByText("$10")).toBeInTheDocument();
    expect(screen.getByText("$25")).toBeInTheDocument();
    expect(screen.getByText("$50")).toBeInTheDocument();
  });

  it("calls onChange when a preset is clicked", () => {
    const onChange = vi.fn();
    render(<BetSizeSlider value={10} onChange={onChange} intent="yes" />);
    fireEvent.click(screen.getByText("$25"));
    expect(onChange).toHaveBeenCalledWith(25);
  });

  it("calls onChange when slider changes", () => {
    const onChange = vi.fn();
    render(<BetSizeSlider value={10} onChange={onChange} intent="yes" />);
    const slider = screen.getByRole("slider");
    fireEvent.change(slider, { target: { value: "42" } });
    expect(onChange).toHaveBeenCalledWith(42);
  });

  it("renders the bet amount label", () => {
    render(<BetSizeSlider value={10} onChange={() => {}} intent="yes" />);
    expect(screen.getByText("Bet Amount")).toBeInTheDocument();
  });

  it("has aria-label on slider", () => {
    render(<BetSizeSlider value={10} onChange={() => {}} intent="yes" />);
    expect(screen.getByLabelText("Bet amount")).toBeInTheDocument();
  });

  it("applies flipr-no styling for no intent (12A)", () => {
    const { container } = render(
      <BetSizeSlider value={10} onChange={() => {}} intent="no" />,
    );
    // Amount display should use text-flipr-no
    const amountSpan = container.querySelector(".text-flipr-no");
    expect(amountSpan).not.toBeNull();
    expect(amountSpan?.textContent).toBe("$10.00");
  });

  it("applies flipr-no to active preset for no intent (12A)", () => {
    const { container } = render(
      <BetSizeSlider value={10} onChange={() => {}} intent="no" />,
    );
    // Active preset ($10) should have bg-flipr-no
    const activePreset = container.querySelector(".bg-flipr-no");
    expect(activePreset).not.toBeNull();
    expect(activePreset?.textContent).toBe("$10");
  });
});
