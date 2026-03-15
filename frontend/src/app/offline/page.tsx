export default function OfflinePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-flipr-dark px-6 text-center">
      <h1 className="font-serif text-4xl font-bold text-flipr-card">
        You&apos;re offline
      </h1>
      <p className="mt-4 max-w-sm font-sans text-lg text-flipr-card/60">
        Flipr needs an internet connection to fetch live market data. Please
        reconnect and try again.
      </p>
    </div>
  );
}
