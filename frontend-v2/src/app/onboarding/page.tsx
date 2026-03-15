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

  const phase = isAuthenticated ? "tutorial" : "welcome";

  useEffect(() => {
    if (isOnboardingComplete) {
      router.replace("/");
    }
  }, [isOnboardingComplete, router]);

  const handleTutorialComplete = useCallback(async () => {
    try {
      const token = await getAuthToken();
      if (token) {
        await claimOnboardingGrant(token);
      }
    } catch {
      // Grant claim failed — don't block onboarding
    }

    completeOnboarding();
    router.replace("/");
  }, [getAuthToken, completeOnboarding, router]);

  if (isOnboardingComplete) return null;

  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden bg-flipr-dark">
      {/* Animated background — v2 uses FanDuel green gradient */}
      <div className="absolute inset-0 z-0">
        <motion.div
          className="absolute inset-0"
          animate={{
            background: [
              "linear-gradient(135deg, rgba(132,181,0,0.15) 0%, #1A1A1A 50%, rgba(212,88,71,0.15) 100%)",
              "linear-gradient(225deg, rgba(132,181,0,0.15) 0%, #1A1A1A 50%, rgba(212,88,71,0.15) 100%)",
              "linear-gradient(315deg, rgba(132,181,0,0.15) 0%, #1A1A1A 50%, rgba(212,88,71,0.15) 100%)",
              "linear-gradient(135deg, rgba(132,181,0,0.15) 0%, #1A1A1A 50%, rgba(212,88,71,0.15) 100%)",
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
              <motion.h1
                className="mb-2 font-serif text-5xl font-black text-flipr-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                flipr
              </motion.h1>

              <motion.p
                className="mb-12 font-sans text-sm text-flipr-card/50"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                Predict. Trade. Win.
              </motion.p>

              <motion.div
                className="mb-12 flex flex-col gap-3"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                {[
                  { icon: "→", text: "Browse markets" },
                  { icon: "✓", text: "Pick YES or NO" },
                  { icon: "↑", text: "Swipe up to trade" },
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

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="flex flex-col items-center gap-3"
              >
                {isLoading ? (
                  <div className="flex flex-col items-center gap-2">
                    <div className="h-10 w-32 animate-pulse rounded-full bg-flipr-card/10" />
                    <div className="h-4 w-40 animate-pulse rounded bg-flipr-card/5" />
                  </div>
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
