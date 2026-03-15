"use client";

import { formatVolume } from "@/lib/format";
import type { SocialSignal } from "@/lib/types";

interface SocialBadgeProps {
  social: SocialSignal;
}

/**
 * Social proof badge showing engagement count.
 * Displays as a compact pill with fire emoji and formatted number.
 */
export function SocialBadge({ social }: SocialBadgeProps) {
  const label = social.label ?? `${formatVolume(social.swipesToday)} Swipes Today`;

  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-flipr-ink/5 px-2.5 py-1 text-xs font-semibold text-flipr-ink/60">
      <span aria-hidden="true">🔥</span>
      {label}
    </span>
  );
}
