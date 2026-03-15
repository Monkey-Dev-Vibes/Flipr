import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ErrorPage from "@/app/error";

describe("ErrorPage", () => {
  it("renders the error heading", () => {
    const reset = vi.fn();
    render(<ErrorPage error={new Error("test")} reset={reset} />);
    expect(screen.getByText("Something went wrong")).toBeDefined();
  });

  it("displays the error message", () => {
    const reset = vi.fn();
    render(<ErrorPage error={new Error("Oops, bad thing")} reset={reset} />);
    expect(screen.getByText("Oops, bad thing")).toBeDefined();
  });

  it("shows fallback message when error.message is empty", () => {
    const reset = vi.fn();
    render(<ErrorPage error={new Error("")} reset={reset} />);
    expect(
      screen.getByText("An unexpected error occurred. Please try again."),
    ).toBeDefined();
  });

  it("calls reset when Try again is clicked", async () => {
    const user = userEvent.setup();
    const reset = vi.fn();
    render(<ErrorPage error={new Error("fail")} reset={reset} />);

    await user.click(screen.getByRole("button", { name: /try again/i }));
    expect(reset).toHaveBeenCalledTimes(1);
  });
});
