"use client";

import "./globals.css";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="bg-flipr-dark text-white font-sans flex items-center justify-center min-h-dvh m-0 text-center p-6">
        <div>
          <h1 className="text-2xl font-bold">
            Something went wrong
          </h1>
          <p className="mt-3 opacity-50 text-sm">
            A critical error occurred. Please refresh the page.
          </p>
          <button
            type="button"
            onClick={() => reset()}
            className="mt-8 bg-[#8AE600] text-white border-none rounded-full px-6 py-2.5 text-sm font-semibold cursor-pointer"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
