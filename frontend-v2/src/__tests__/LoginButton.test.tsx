import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LoginButton } from "@/components/LoginButton";
import { AuthContext } from "@/providers/AuthProvider";

function renderWithAuth(authValue: {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: () => void;
}) {
  const fullValue = {
    user: null,
    logout: async () => {},
    getAuthToken: async () => null,
    ...authValue,
  };
  return render(
    <AuthContext.Provider value={fullValue}>
      <LoginButton />
    </AuthContext.Provider>,
  );
}

describe("LoginButton", () => {
  it("renders Sign In button when not authenticated", () => {
    renderWithAuth({ isAuthenticated: false, isLoading: false, login: vi.fn() });
    expect(screen.getByRole("button", { name: "Sign In" })).toBeInTheDocument();
  });

  it("does not render when authenticated", () => {
    renderWithAuth({ isAuthenticated: true, isLoading: false, login: vi.fn() });
    expect(screen.queryByRole("button", { name: "Sign In" })).not.toBeInTheDocument();
  });

  it("does not render while loading", () => {
    renderWithAuth({ isAuthenticated: false, isLoading: true, login: vi.fn() });
    expect(screen.queryByRole("button", { name: "Sign In" })).not.toBeInTheDocument();
  });

  it("calls login when clicked", async () => {
    const user = userEvent.setup();
    const login = vi.fn();
    renderWithAuth({ isAuthenticated: false, isLoading: false, login });

    await user.click(screen.getByRole("button", { name: "Sign In" }));
    expect(login).toHaveBeenCalledOnce();
  });
});
