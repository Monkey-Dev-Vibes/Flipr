"use client";

import { useAuth } from "@/providers/AuthProvider";

export function LoginButton() {
  const { isAuthenticated, isLoading, login } = useAuth();

  if (isLoading || isAuthenticated) return null;

  return (
    <button
      onClick={login}
      className="btn-primary"
    >
      Sign In
    </button>
  );
}
