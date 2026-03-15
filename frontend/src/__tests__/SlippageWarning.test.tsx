import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import "@/__tests__/helpers/mock-framer-motion.js";
import { SlippageWarning } from "@/components/SlippageWarning";

describe("SlippageWarning", () => {
  it("renders the warning heading", () => {
    render(
      <SlippageWarning
        originalOdds={42}
        currentOdds={50}
        onAcknowledge={() => {}}
      />,
    );
    expect(screen.getByText("Odds Changed")).toBeInTheDocument();
  });

  it("displays the shift percentage", () => {
    render(
      <SlippageWarning
        originalOdds={42}
        currentOdds={50}
        onAcknowledge={() => {}}
      />,
    );
    expect(screen.getByText("8.0%")).toBeInTheDocument();
  });

  it("shows original and current odds", () => {
    render(
      <SlippageWarning
        originalOdds={42}
        currentOdds={50}
        onAcknowledge={() => {}}
      />,
    );
    expect(screen.getByText("42¢")).toBeInTheDocument();
    expect(screen.getByText("50¢")).toBeInTheDocument();
  });

  it("calls onAcknowledge when button clicked", () => {
    const onAcknowledge = vi.fn();
    render(
      <SlippageWarning
        originalOdds={42}
        currentOdds={50}
        onAcknowledge={onAcknowledge}
      />,
    );
    fireEvent.click(screen.getByText("I Understand, Continue"));
    expect(onAcknowledge).toHaveBeenCalledOnce();
  });
});
