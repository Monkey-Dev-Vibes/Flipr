"use client";

export default function HomePage() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-6">
      <h1 className="font-serif text-4xl font-bold text-flipr-card">flipr</h1>
      <p className="mt-2 font-mono text-sm text-flipr-yes">v2 — prototype 2</p>
      <p className="mt-4 max-w-xs text-center text-sm text-flipr-card/60">
        Gamified prediction market. Browse, pick a side, swipe up to trade.
      </p>
    </main>
  );
}
