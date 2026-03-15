import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { WinStreakBadge } from "@/components/WinStreakBadge";

describe("WinStreakBadge", () => {
  it("renders nothing when streak < 2", () => {
    const { container } = render(
      <WinStreakBadge streak={1} glowClass="" />,
    );
    expect(container.textContent).toBe("");
  });

  it("renders fire badge with streak count when >= 2", () => {
    render(<WinStreakBadge streak={3} glowClass="streak-glow-2" />);
    expect(screen.getByText("x3")).toBeInTheDocument();
    expect(screen.getByLabelText("fire")).toBeInTheDocument();
  });

  it("applies glow class", () => {
    const { container } = render(
      <WinStreakBadge streak={5} glowClass="streak-glow-3" />,
    );
    const badge = container.querySelector(".streak-glow-3");
    expect(badge).toBeInTheDocument();
  });
});
