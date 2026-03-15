import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import NotFound from "@/app/not-found";

describe("NotFoundPage", () => {
  it("renders the 404 heading", () => {
    render(<NotFound />);
    expect(screen.getByText("Page not found")).toBeDefined();
  });

  it("renders a link back to home", () => {
    render(<NotFound />);
    const link = screen.getByRole("link", { name: /back to flipr/i });
    expect(link).toBeDefined();
    expect(link.getAttribute("href")).toBe("/");
  });
});
