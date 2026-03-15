"use client";

import { useCallback } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const handleReset = useCallback(() => {
    reset();
  }, [reset]);

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-flipr-dark px-6 text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-flipr-no/10">
        <svg
          width="36"
          height="36"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-flipr-no"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="15" y1="9" x2="9" y2="15" />
          <line x1="9" y1="9" x2="15" y2="15" />
        </svg>
      </div>

      <h1 className="font-display text-3xl font-bold text-flipr-card">
        Something went wrong
      </h1>
      <p className="mt-3 max-w-xs font-sans text-sm text-flipr-card/50">
        {error.message || "An unexpected error occurred. Please try again."}
      </p>

      <button
        type="button"
        onClick={handleReset}
        className="btn-primary mt-8"
      >
        Try again
      </button>
    </div>
  );
}
