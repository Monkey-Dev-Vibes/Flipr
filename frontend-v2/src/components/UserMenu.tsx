"use client";

import { useAuth } from "@/providers/AuthProvider";
import { formatBalance } from "@/lib/format";

export function UserMenu() {
  const { isAuthenticated, isLoading, user, logout } = useAuth();

  if (isLoading || !isAuthenticated || !user) return null;

  return (
    <div className="flex items-center gap-3">
      {/* Balance display */}
      <span className="font-mono text-sm font-bold text-flipr-yes">
        {user.balance !== null ? `$${formatBalance(user.balance)}` : "—"}
      </span>

      {/* Wallet address chip */}
      {user.walletAddress && (
        <span className="rounded-full bg-flipr-card/10 px-3 py-1 font-mono text-xs text-flipr-card/50">
          {user.walletAddress.slice(0, 6)}…{user.walletAddress.slice(-4)}
        </span>
      )}

      {/* Sign out */}
      <button
        type="button"
        onClick={logout}
        className="rounded-full bg-flipr-card/10 px-3 py-1 text-xs text-flipr-card/50 transition-colors hover:bg-flipr-no/20 hover:text-flipr-no"
      >
        Sign Out
      </button>
    </div>
  );
}
