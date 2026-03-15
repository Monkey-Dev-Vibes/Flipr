"use client";

import { useCallback, useState } from "react";
import { fetchUserState } from "@/lib/api";
import type { UserState } from "@/lib/types";

interface UseUserStateResult {
  userState: UserState | null;
  isLoading: boolean;
  refetch: () => Promise<void>;
}

/**
 * Fetches the user's trade state from GET /users/me/state.
 * Used to drive the cooling-off prompt with backend-tracked data.
 */
export function useUserState(
  getToken: () => Promise<string | null>,
): UseUserStateResult {
  const [userState, setUserState] = useState<UserState | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    try {
      const token = await getToken();
      if (!token) return;

      const response = await fetchUserState(token);
      if (response.data) {
        setUserState({
          consecutiveLosses: response.data.consecutiveLosses,
          totalTrades: response.data.totalTrades,
        });
      }
    } catch {
      // Silently fail — cooling-off will rely on local state
    } finally {
      setIsLoading(false);
    }
  }, [getToken]);

  return { userState, isLoading, refetch };
}
