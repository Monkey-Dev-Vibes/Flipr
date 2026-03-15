"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { usePrivy, useWallets } from "@privy-io/react-auth";

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

const AuthContext = createContext<AuthContextValue | null>(null);

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const PRIVY_APP_ID = process.env.NEXT_PUBLIC_PRIVY_APP_ID ?? "";

const noopAuth: AuthContextValue = {
  isAuthenticated: false,
  isLoading: false,
  user: null,
  login: () => {},
  logout: async () => {},
  getAuthToken: async () => null,
};

/**
 * Internal provider that uses Privy hooks.
 * Only rendered when Privy is available.
 */
function PrivyAuthProvider({ children }: { children: React.ReactNode }) {
  const { ready, authenticated, user, login, logout, getAccessToken } =
    usePrivy();
  const { wallets } = useWallets();
  const [balance, setBalance] = useState<number | null>(null);
  const [verified, setVerified] = useState(false);

  const embeddedWallet = wallets.find(
    (w) => w.walletClientType === "privy",
  );

  // Verify session with backend when user authenticates
  useEffect(() => {
    if (!authenticated || !user) return;

    const controller = new AbortController();

    getAccessToken()
      .then((token) => {
        if (!token || controller.signal.aborted) return;
        return fetch(`${API_BASE}/auth/verify`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          signal: controller.signal,
        });
      })
      .then((res) => {
        if (!res || controller.signal.aborted) return;
        if (res.ok) return res.json();
      })
      .then((data) => {
        if (controller.signal.aborted) return;
        if (data?.data?.balance !== undefined) {
          setBalance(data.data.balance);
        }
        setVerified(true);
      })
      .catch(() => {
        if (controller.signal.aborted) return;
        // Backend may be unavailable in dev — still allow frontend auth
        setVerified(true);
      });

    return () => controller.abort();
  }, [authenticated, user, getAccessToken]);

  const getAuthToken = useCallback(async (): Promise<string | null> => {
    if (!authenticated) return null;
    return getAccessToken();
  }, [authenticated, getAccessToken]);

  const handleLogout = useCallback(async () => {
    setVerified(false);
    setBalance(null);
    await logout();
  }, [logout]);

  const session: UserSession | null = useMemo(() => {
    if (!authenticated || !user || !verified) return null;
    return {
      userId: user.id,
      walletAddress: embeddedWallet?.address ?? null,
      balance,
    };
  }, [authenticated, user, verified, embeddedWallet?.address, balance]);

  const value: AuthContextValue = useMemo(
    () => ({
      isAuthenticated: authenticated && verified,
      isLoading: !ready,
      user: session,
      login,
      logout: handleLogout,
      getAuthToken,
    }),
    [authenticated, verified, ready, session, login, handleLogout, getAuthToken],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // When Privy is not configured, provide a no-op auth context
  if (!PRIVY_APP_ID) {
    return (
      <AuthContext.Provider value={noopAuth}>{children}</AuthContext.Provider>
    );
  }

  return <PrivyAuthProvider>{children}</PrivyAuthProvider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
