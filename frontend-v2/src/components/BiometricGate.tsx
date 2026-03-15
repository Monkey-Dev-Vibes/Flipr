"use client";

import { useEffect, useRef, useState } from "react";
import { isBiometricSupported, requestBiometricVerification } from "@/lib/biometric";
import { BIOMETRIC_THRESHOLD } from "@/lib/constants";

interface BiometricGateProps {
  betAmount: number;
  onVerified: () => void;
  onSkip: () => void;
}

/**
 * Biometric step-up gate for high-value trades.
 * Triggers FaceID/TouchID when betAmount > BIOMETRIC_THRESHOLD ($100).
 * On unsupported devices, silently skips (graceful degradation).
 */
export function BiometricGate({ betAmount, onVerified, onSkip }: BiometricGateProps) {
  const [status, setStatus] = useState<"idle" | "prompting" | "failed">("idle");
  const needsBiometric = betAmount > BIOMETRIC_THRESHOLD;
  const hasStarted = useRef(false);

  useEffect(() => {
    if (!needsBiometric) {
      onSkip();
      return;
    }

    if (hasStarted.current) return;
    hasStarted.current = true;

    let cancelled = false;

    (async () => {
      const supported = await isBiometricSupported();
      if (cancelled) return;

      if (!supported) {
        onSkip();
        return;
      }

      setStatus("prompting");
      const success = await requestBiometricVerification();
      if (cancelled) return;

      if (success) {
        onVerified();
      } else {
        setStatus("failed");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [needsBiometric, onSkip, onVerified]);

  const handleRetry = () => {
    hasStarted.current = false;
    setStatus("idle");
  };

  if (!needsBiometric || status === "idle") return null;

  if (status === "failed") {
    return (
      <div className="rounded-xl border border-flipr-no/20 bg-flipr-no/5 p-4 text-center">
        <p className="text-sm font-semibold text-flipr-no">
          Biometric check failed
        </p>
        <p className="mt-1 text-xs text-flipr-ink/60">
          FaceID or TouchID is required for trades over ${BIOMETRIC_THRESHOLD}.
        </p>
        <button
          type="button"
          onClick={handleRetry}
          className="mt-3 rounded-lg bg-flipr-no/10 px-4 py-2 text-sm font-semibold text-flipr-no transition-colors hover:bg-flipr-no/20"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-4">
      <p className="text-sm text-flipr-ink/50">Verifying identity…</p>
    </div>
  );
}
