"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Particle {
  id: number;
  x: number;
  color: string;
  delay: number;
  rotation: number;
}

const COLORS = ["#84B500", "#a3d400", "#FFD700", "#FFFFFF"];
const PARTICLE_COUNT = 12;
const DURATION_MS = 1200;

const PARTICLES: Particle[] = Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
  id: i,
  x: (i / PARTICLE_COUNT) * 100,
  color: COLORS[i % COLORS.length],
  delay: i * 0.03,
  rotation: i * 30 - 180,
}));

interface SuccessConfettiProps {
  active: boolean;
  onComplete?: () => void;
}

/**
 * Brief celebratory particle burst on successful trade execution.
 * Parent controls `active`; this component calls `onComplete` after DURATION_MS.
 */
export function SuccessConfetti({ active, onComplete }: SuccessConfettiProps) {
  // Auto-dismiss: when active becomes true, schedule onComplete
  const [, setTick] = useState(0);

  useEffect(() => {
    if (!active) return;
    const timer = setTimeout(() => {
      onComplete?.();
      setTick((t) => t + 1); // force re-render to clear AnimatePresence
    }, DURATION_MS);
    return () => clearTimeout(timer);
  }, [active, onComplete]);

  return (
    <AnimatePresence>
      {active && (
        <div
          className="pointer-events-none fixed inset-0 z-[70] overflow-hidden"
          aria-hidden="true"
        >
          {PARTICLES.map((p) => (
            <motion.div
              key={p.id}
              initial={{
                x: `${p.x}%`,
                y: "60%",
                opacity: 1,
                scale: 1,
                rotate: 0,
              }}
              animate={{
                y: "-20%",
                opacity: 0,
                scale: 0.5,
                rotate: p.rotation,
              }}
              exit={{ opacity: 0 }}
              transition={{
                duration: 0.8,
                delay: p.delay,
                ease: "easeOut",
              }}
              className="absolute h-2 w-2 rounded-full"
              style={{ backgroundColor: p.color }}
            />
          ))}
        </div>
      )}
    </AnimatePresence>
  );
}
