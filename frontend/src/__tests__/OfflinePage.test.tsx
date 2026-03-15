import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import OfflinePage from "@/app/offline/page";

describe("OfflinePage", () => {
  beforeEach(() => {
    // Mock window.location since jsdom doesn't allow real navigation
    Object.defineProperty(window, "location", {
      value: { href: "" },
      writable: true,
      configurable: true,
    });
  });

  it("renders the offline heading", () => {
    render(<OfflinePage />);
    expect(screen.getByText("You're offline")).toBeDefined();
  });

  it("renders the explanation text", () => {
    render(<OfflinePage />);
    expect(
      screen.getByText(/flipr needs an internet connection/i),
    ).toBeDefined();
  });

  it("navigates to home when Retry is clicked", async () => {
    const user = userEvent.setup();
    render(<OfflinePage />);

    await user.click(screen.getByRole("button", { name: /retry/i }));
    expect(window.location.href).toBe("/");
  });
});
