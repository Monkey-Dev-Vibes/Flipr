import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CoolingOffModal } from "@/components/CoolingOffModal";

describe("CoolingOffModal", () => {
  it("renders when visible is true", () => {
    render(
      <CoolingOffModal
        visible
        consecutiveLosses={5}
        onDismiss={vi.fn()}
        onTakeBreak={vi.fn()}
      />,
    );
    expect(screen.getByText("Take a break?")).toBeInTheDocument();
  });

  it("does not render when visible is false", () => {
    render(
      <CoolingOffModal
        visible={false}
        consecutiveLosses={5}
        onDismiss={vi.fn()}
        onTakeBreak={vi.fn()}
      />,
    );
    expect(screen.queryByText("Take a break?")).not.toBeInTheDocument();
  });

  it("shows consecutive loss count in message", () => {
    render(
      <CoolingOffModal
        visible
        consecutiveLosses={7}
        onDismiss={vi.fn()}
        onTakeBreak={vi.fn()}
      />,
    );
    expect(screen.getByText(/7 trades/)).toBeInTheDocument();
  });

  it("calls onTakeBreak when Take a Break is clicked", async () => {
    const user = userEvent.setup();
    const onTakeBreak = vi.fn();
    render(
      <CoolingOffModal
        visible
        consecutiveLosses={5}
        onDismiss={vi.fn()}
        onTakeBreak={onTakeBreak}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Take a Break" }));
    expect(onTakeBreak).toHaveBeenCalledOnce();
  });

  it("calls onDismiss when Continue Trading is clicked", async () => {
    const user = userEvent.setup();
    const onDismiss = vi.fn();
    render(
      <CoolingOffModal
        visible
        consecutiveLosses={5}
        onDismiss={onDismiss}
        onTakeBreak={vi.fn()}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Continue Trading" }));
    expect(onDismiss).toHaveBeenCalledOnce();
  });

  it("has alertdialog role for accessibility", () => {
    render(
      <CoolingOffModal
        visible
        consecutiveLosses={5}
        onDismiss={vi.fn()}
        onTakeBreak={vi.fn()}
      />,
    );
    expect(screen.getByRole("alertdialog")).toBeInTheDocument();
  });
});
