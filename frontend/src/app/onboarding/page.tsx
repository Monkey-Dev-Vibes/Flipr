"use client";

import { useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/providers/AuthProvider";
import { useOnboarding } from "@/hooks/useOnboarding";
import { OnboardingTutorial } from "@/components/OnboardingTutorial";
import { LoginButton } from "@/components/LoginButton";
import { claimOnboardingGrant } from "@/lib/api";

export default function OnboardingPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, getAuthToken } = useAuth();
  const { isOnboardingComplete, completeOnboarding } = useOnboarding();

  // Derive phase from auth state — no effect needed
  const phase = isAuthenticated ? "tutorial" : "welcome";

  // If already onboarded, redirect to home
  useEffect(() => {
    if (isOnboardingComplete) {
      router.replace("/");
    }
  }, [isOnboardingComplete, router]);

  const handleTutorialComplete = useCallback(async () => {
    // Claim the 1 USDC grant in the background
    try {
      const token = await getAuthToken();
      if (token) {
        await claimOnboardingGrant(token);
      }
    } catch {
      // Grant claim failed — don't block onboarding completion
    }

    completeOnboarding();
    router.replace("/");
  }, [getAuthToken, completeOnboarding, router]);

  // Already onboarded — show nothing while redirecting
  if (isOnboardingComplete) return null;

  return (
    <div className="relative flex min-h-[100dvh] flex-col overflow-hidden bg-flipr-dark">
      {/* Animated background — looping gradient placeholder for video */}
      <div className="absolute inset-0 z-0">
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-flipr-yes/20 via-flipr-dark to-flipr-no/20"
          animate={{
            background: [
              "linear-gradient(135deg, rgba(2,86,86,0.2) 0%, #1A1A1A 50%, rgba(212,88,71,0.2) 100%)",
              "linear-gradient(225deg, rgba(2,86,86,0.2) 0%, #1A1A1A 50%, rgba(212,88,71,0.2) 100%)",
              "linear-gradient(315deg, rgba(2,86,86,0.2) 0%, #1A1A1A 50%, rgba(212,88,71,0.2) 100%)",
              "linear-gradient(135deg, rgba(2,86,86,0.2) 0%, #1A1A1A 50%, rgba(212,88,71,0.2) 100%)",
            ],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-1 flex-col">
        <AnimatePresence mode="wait">
          {phase === "welcome" && (
            <motion.div
              key="welcome"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -30 }}
              className="flex flex-1 flex-col items-center justify-center px-6"
            >
              {/* Logo */}
              <motion.h1
                className="mb-2 font-serif text-5xl font-black text-flipr-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                flipr
              </motion.h1>

              {/* Tagline */}
              <motion.p
                className="mb-12 font-sans text-sm text-flipr-card/50"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                Predict. Swipe. Profit.
              </motion.p>

              {/* Feature pills */}
              <motion.div
                className="mb-12 flex flex-col gap-3"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                {[
                  { icon: "→", text: "Swipe right for YES" },
                  { icon: "←", text: "Swipe left for NO" },
                  { icon: "↑", text: "Swipe up to skip" },
                ].map((item) => (
                  <div
                    key={item.text}
                    className="flex items-center gap-3 rounded-xl bg-flipr-card/5 px-5 py-3"
                  >
                    <span className="font-mono text-lg text-flipr-yes">
                      {item.icon}
                    </span>
                    <span className="font-sans text-sm text-flipr-card/70">
                      {item.text}
                    </span>
                  </div>
                ))}
              </motion.div>

              {/* Login */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="flex flex-col items-center gap-3"
              >
                {isLoading ? (
                  <span className="font-mono text-xs text-flipr-card/30">
                    Loading...
                  </span>
                ) : (
                  <>
                    <LoginButton />
                    <p className="font-sans text-xs text-flipr-card/30">
                      Sign in to start your practice trade
                    </p>
                  </>
                )}
              </motion.div>
            </motion.div>
          )}

          {phase === "tutorial" && (
            <motion.div
              key="tutorial"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-1"
            >
              <OnboardingTutorial onComplete={handleTutorialComplete} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
