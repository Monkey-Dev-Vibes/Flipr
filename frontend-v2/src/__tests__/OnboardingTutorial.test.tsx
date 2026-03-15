import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { OnboardingTutorial } from "@/components/OnboardingTutorial";

describe("OnboardingTutorial", () => {
  it("renders intro step initially", () => {
    render(<OnboardingTutorial onComplete={vi.fn()} />);
    expect(screen.getByText("How it works")).toBeInTheDocument();
    expect(screen.getByText("Scroll to browse markets")).toBeInTheDocument();
    expect(screen.getByText("Tap YES or NO to pick a side")).toBeInTheDocument();
    expect(screen.getByText("Swipe up to confirm your trade")).toBeInTheDocument();
  });

  it("shows Let's Go button on intro step", () => {
    render(<OnboardingTutorial onComplete={vi.fn()} />);
    expect(screen.getByRole("button", { name: "Let's Go" })).toBeInTheDocument();
  });

  it("transitions to tap step when Let's Go is clicked", async () => {
    const user = userEvent.setup();
    render(<OnboardingTutorial onComplete={vi.fn()} />);

    await user.click(screen.getByRole("button", { name: "Let's Go" }));
    await waitFor(() => {
      expect(screen.getByText("Practice card")).toBeInTheDocument();
    });
    expect(screen.getByText("Will you enjoy using Flipr?")).toBeInTheDocument();
  });

  it("shows YES and NO buttons on practice card", async () => {
    const user = userEvent.setup();
    render(<OnboardingTutorial onComplete={vi.fn()} />);

    await user.click(screen.getByRole("button", { name: "Let's Go" }));
    await waitFor(() => {
      expect(screen.getByRole("button", { name: "YES" })).toBeInTheDocument();
    });
    expect(screen.getByRole("button", { name: "NO" })).toBeInTheDocument();
  });

  it("transitions to complete step when YES is tapped", async () => {
    const user = userEvent.setup();
    render(<OnboardingTutorial onComplete={vi.fn()} />);

    await user.click(screen.getByRole("button", { name: "Let's Go" }));
    await waitFor(() => {
      expect(screen.getByRole("button", { name: "YES" })).toBeInTheDocument();
    });
    await user.click(screen.getByRole("button", { name: "YES" }));
    await waitFor(() => {
      expect(screen.getByText("You're ready!")).toBeInTheDocument();
    });
    expect(screen.getByText("+1.00 USDC credited")).toBeInTheDocument();
  });

  it("transitions to complete step when NO is tapped too", async () => {
    const user = userEvent.setup();
    render(<OnboardingTutorial onComplete={vi.fn()} />);

    await user.click(screen.getByRole("button", { name: "Let's Go" }));
    await waitFor(() => {
      expect(screen.getByRole("button", { name: "NO" })).toBeInTheDocument();
    });
    await user.click(screen.getByRole("button", { name: "NO" }));
    await waitFor(() => {
      expect(screen.getByText("You're ready!")).toBeInTheDocument();
    });
  });
});
