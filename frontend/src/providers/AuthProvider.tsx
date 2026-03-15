"use client";

import { createContext, lazy, Suspense, useContext } from "react";

interface UserSession {
  userId: string;
  walletAddress: string | null;
  balance: number | null;
}

interface AuthContextValue {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: UserSession | null;
  login: () => void;
  logout: () => Promise<void>;
  getAuthToken: () => Promise<string | null>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

const PRIVY_APP_ID = process.env.NEXT_PUBLIC_PRIVY_APP_ID ?? "";
const DEV_AUTH = process.env.NEXT_PUBLIC_DEV_AUTH === "true";

const noopAuth: AuthContextValue = {
  isAuthenticated: false,
  isLoading: false,
  user: null,
  login: () => {},
  logout: async () => {},
  getAuthToken: async () => null,
};

const devAuth: AuthContextValue = {
  isAuthenticated: true,
  isLoading: false,
  user: {
    userId: "dev-user-001",
    walletAddress: "0xDEV0000000000000000000000000000000000001",
    balance: 100.0,
  },
  login: () => {},
  logout: async () => { window.location.reload(); },
  getAuthToken: async () => "dev-token",
};

const loadingAuth: AuthContextValue = {
  isAuthenticated: false,
  isLoading: true,
  user: null,
  login: () => {},
  logout: async () => {},
  getAuthToken: async () => null,
};

// Lazy-load the Privy-dependent provider so @privy-io/react-auth
// is never imported in dev bypass or no-privy modes.
const LazyPrivyAuthProvider = lazy(() =>
  import("./PrivyAuthProvider").then((mod) => ({
    default: ({ children }: { children: React.ReactNode }) => (
      <mod.PrivyAuthProvider AuthContext={AuthContext}>
        {children}
      </mod.PrivyAuthProvider>
    ),
  }))
);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Dev bypass: auto-authenticate with a fake user (for HTTP mobile testing)
  if (DEV_AUTH) {
    return (
      <AuthContext.Provider value={devAuth}>{children}</AuthContext.Provider>
    );
  }

  // When Privy is not configured, provide a no-op auth context
  if (!PRIVY_APP_ID) {
    return (
      <AuthContext.Provider value={noopAuth}>{children}</AuthContext.Provider>
    );
  }

  return (
    <Suspense
      fallback={
        <AuthContext.Provider value={loadingAuth}>
          {children}
        </AuthContext.Provider>
      }
    >
      <LazyPrivyAuthProvider>{children}</LazyPrivyAuthProvider>
    </Suspense>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
