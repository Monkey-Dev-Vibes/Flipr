import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { UserMenu } from "@/components/UserMenu";
import { AuthContext } from "@/providers/AuthProvider";

const baseAuth = {
  isLoading: false,
  login: vi.fn(),
  getAuthToken: async () => "token",
};

function renderWithAuth(overrides: Record<string, unknown> = {}) {
  const value = {
    ...baseAuth,
    isAuthenticated: true,
    user: {
      userId: "user-1",
      walletAddress: "0x1234567890abcdef1234567890abcdef12345678",
      balance: 42.5,
    },
    logout: vi.fn(),
    ...overrides,
  };
  return { ...render(
    <AuthContext.Provider value={value}>
      <UserMenu />
    </AuthContext.Provider>,
  ), logout: value.logout };
}

describe("UserMenu", () => {
  it("renders balance formatted to 2 decimals", () => {
    renderWithAuth();
    expect(screen.getByText("$42.50")).toBeInTheDocument();
  });

  it("renders truncated wallet address", () => {
    renderWithAuth();
    expect(screen.getByText("0x1234…5678")).toBeInTheDocument();
  });

  it("renders Sign Out button", () => {
    renderWithAuth();
    expect(screen.getByRole("button", { name: "Sign Out" })).toBeInTheDocument();
  });

  it("calls logout when Sign Out is clicked", async () => {
    const user = userEvent.setup();
    const { logout } = renderWithAuth();

    await user.click(screen.getByRole("button", { name: "Sign Out" }));
    expect(logout).toHaveBeenCalledOnce();
  });

  it("does not render when not authenticated", () => {
    renderWithAuth({ isAuthenticated: false, user: null });
    expect(screen.queryByText("Sign Out")).not.toBeInTheDocument();
  });

  it("does not render while loading", () => {
    renderWithAuth({ isLoading: true });
    expect(screen.queryByText("Sign Out")).not.toBeInTheDocument();
  });

  it("shows dash when balance is null", () => {
    renderWithAuth({
      user: { userId: "user-1", walletAddress: null, balance: null },
    });
    expect(screen.getByText("—")).toBeInTheDocument();
  });
});
