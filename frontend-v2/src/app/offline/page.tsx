"use client";

import { useCallback } from "react";

export default function OfflinePage() {
  const handleRetry = useCallback(() => {
    window.location.href = "/";
  }, []);

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-flipr-dark px-6 text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-flipr-card/5">
        <svg
          width="40"
          height="40"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-flipr-card/40"
        >
          <line x1="1" y1="1" x2="23" y2="23" />
          <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55" />
          <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39" />
          <path d="M10.71 5.05A16 16 0 0 1 22.56 9" />
          <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88" />
          <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
          <line x1="12" y1="20" x2="12.01" y2="20" />
        </svg>
      </div>

      <h1 className="font-serif text-3xl font-bold text-flipr-card">
        You&apos;re offline
      </h1>
      <p className="mt-3 max-w-xs font-sans text-sm text-flipr-card/50">
        Flipr needs an internet connection to fetch live market data. Check your
        connection and try again.
      </p>

      <button
        type="button"
        onClick={handleRetry}
        className="btn-primary mt-8"
      >
        Retry
      </button>
    </div>
  );
}
