export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center overflow-locked bg-flipr-dark">
      {/* Placeholder card to demonstrate design system */}
      <div className="w-80 rounded-3xl bg-flipr-card p-6 shadow-card">
        <div className="mb-4 flex items-center justify-between text-sm font-semibold text-flipr-ink/50">
          <span className="uppercase tracking-wider">Pop Culture</span>
          <span>12,400</span>
        </div>

        <h2 className="font-serif text-3xl font-bold leading-tight text-flipr-ink">
          Will GTA VI be delayed to 2026?
        </h2>

        <div className="mt-6 flex justify-between">
          <div className="flex flex-col items-center rounded-xl bg-flipr-no/10 px-4 py-2">
            <span className="font-mono text-xl font-bold text-flipr-no">
              35¢
            </span>
            <span className="text-xs font-semibold tracking-wider text-flipr-no/80">
              NO
            </span>
          </div>
          <div className="flex flex-col items-center rounded-xl bg-flipr-yes/10 px-4 py-2">
            <span className="font-mono text-xl font-bold text-flipr-yes">
              65¢
            </span>
            <span className="text-xs font-semibold tracking-wider text-flipr-yes/80">
              YES
            </span>
          </div>
        </div>
      </div>

      <p className="mt-8 font-mono text-sm text-flipr-card/40">
        Flipr — Sprint 1 Design System
      </p>
    </div>
  );
}
