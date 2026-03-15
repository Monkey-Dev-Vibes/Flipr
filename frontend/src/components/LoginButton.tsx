"use client";

import { useAuth } from "@/providers/AuthProvider";

export function LoginButton() {
  const { isAuthenticated, isLoading, login } = useAuth();

  if (isLoading || isAuthenticated) return null;

  return (
    <button
      onClick={login}
      className="rounded-full bg-flipr-yes px-6 py-2.5 font-sans text-sm font-semibold text-white shadow-lg transition-all hover:opacity-90 active:scale-95"
    >
      Sign In
    </button>
  );
}
