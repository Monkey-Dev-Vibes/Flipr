import { describe, it, expect, vi } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { AnimatedOdds } from "@/components/AnimatedOdds";

describe("AnimatedOdds", () => {
  it("renders value as percentage", () => {
    render(<AnimatedOdds value={65} />);
    expect(screen.getByText("65%")).toBeInTheDocument();
  });

  it("does not flash on initial render", () => {
    const { container } = render(<AnimatedOdds value={65} />);
    const span = container.querySelector("span");
    expect(span?.className).not.toContain("animate-flash-green");
    expect(span?.className).not.toContain("animate-flash-red");
  });

  it("flashes green when value increases", () => {
    const { container, rerender } = render(<AnimatedOdds value={65} />);
    rerender(<AnimatedOdds value={70} />);

    const span = container.querySelector("span");
    expect(span?.className).toContain("animate-flash-green");
  });

  it("flashes red when value decreases", () => {
    const { container, rerender } = render(<AnimatedOdds value={65} />);
    rerender(<AnimatedOdds value={60} />);

    const span = container.querySelector("span");
    expect(span?.className).toContain("animate-flash-red");
  });

  it("clears flash class after 600ms", () => {
    vi.useFakeTimers();
    const { container, rerender } = render(<AnimatedOdds value={65} />);
    rerender(<AnimatedOdds value={70} />);

    const span = container.querySelector("span");
    expect(span?.className).toContain("animate-flash-green");

    act(() => {
      vi.advanceTimersByTime(600);
    });

    expect(span?.className).not.toContain("animate-flash-green");
    vi.useRealTimers();
  });

  it("updates displayed value when prop changes", () => {
    const { rerender } = render(<AnimatedOdds value={65} />);
    rerender(<AnimatedOdds value={72} />);
    expect(screen.getByText("72%")).toBeInTheDocument();
  });

  it("applies custom className", () => {
    const { container } = render(
      <AnimatedOdds value={50} className="font-mono text-xl" />,
    );
    const span = container.querySelector("span");
    expect(span?.className).toContain("font-mono");
    expect(span?.className).toContain("text-xl");
  });
});
