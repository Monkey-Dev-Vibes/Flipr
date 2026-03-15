import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-flipr-dark px-6 text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-flipr-card/5">
        <span className="font-mono text-3xl font-bold text-flipr-card/30">
          404
        </span>
      </div>

      <h1 className="font-serif text-3xl font-bold text-flipr-card">
        Page not found
      </h1>
      <p className="mt-3 max-w-xs font-sans text-sm text-flipr-card/50">
        This page doesn&apos;t exist. It may have been moved or removed.
      </p>

      <Link
        href="/"
        className="btn-primary mt-8 inline-block"
      >
        Back to Flipr
      </Link>
    </div>
  );
}
