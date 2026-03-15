"use client";

import { useCallback, useSyncExternalStore } from "react";

const STORAGE_KEY = "flipr_onboarding_complete";

function subscribe(callback: () => void) {
  const handler = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) callback();
  };
  window.addEventListener("storage", handler);
  return () => window.removeEventListener("storage", handler);
}

function getSnapshot(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

function getServerSnapshot(): boolean {
  return false;
}

export function useOnboarding() {
  const isComplete = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const completeOnboarding = useCallback(() => {
    try {
      localStorage.setItem(STORAGE_KEY, "true");
      window.dispatchEvent(
        new StorageEvent("storage", { key: STORAGE_KEY, newValue: "true" }),
      );
    } catch {
      // localStorage unavailable
    }
  }, []);

  const resetOnboarding = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      window.dispatchEvent(
        new StorageEvent("storage", { key: STORAGE_KEY, newValue: null }),
      );
    } catch {
      // noop
    }
  }, []);

  return { isOnboardingComplete: isComplete, completeOnboarding, resetOnboarding };
}
