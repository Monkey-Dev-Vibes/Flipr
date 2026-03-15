"use client";

import { useCallback, useRef, useState, useEffect } from "react";
import type { Market } from "@/lib/types";
import { CAROUSEL_GAP } from "@/lib/constants";
import { MarketCard } from "./MarketCard";

interface MarketCarouselProps {
  markets: Market[];
  onSelect: (market: Market, intent: "yes" | "no") => void;
}

/**
 * Horizontal scroll-snap carousel of MarketCards.
 * Each card snaps to center. Pagination dots show the active index.
 */
export function MarketCarousel({ markets, onSelect }: MarketCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const handleScroll = useCallback(() => {
    const container = scrollRef.current;
    if (!container) return;

    const scrollLeft = container.scrollLeft;
    const cardWidth = container.firstElementChild
      ? (container.firstElementChild as HTMLElement).offsetWidth
      : 0;
    if (cardWidth < 1) return; // guard: layout not yet painted
    const index = Math.round(scrollLeft / (cardWidth + CAROUSEL_GAP));
    setActiveIndex(Math.min(index, markets.length - 1));
  }, [markets.length]);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => container.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  const scrollToIndex = useCallback((index: number) => {
    const container = scrollRef.current;
    if (!container || !container.children[index]) return;

    const child = container.children[index] as HTMLElement;
    container.scrollTo({
      left: child.offsetLeft - (container.offsetWidth - child.offsetWidth) / 2,
      behavior: "smooth",
    });
  }, []);

  return (
    <div className="w-full">
      {/* Scrollable card track */}
      <div
        ref={scrollRef}
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto px-[7.5vw] pb-4 scrollbar-none"
        style={{
          scrollBehavior: "smooth",
          WebkitOverflowScrolling: "touch",
          scrollbarWidth: "none",
        }}
      >
        {markets.map((market) => (
          <div
            key={market.id}
            className="w-[85vw] max-w-[360px] flex-shrink-0 snap-center"
            style={{ height: "min(520px, 68dvh)" }}
          >
            <MarketCard market={market} onSelect={onSelect} />
          </div>
        ))}
      </div>

      {/* Pagination dots */}
      <div className="mt-2 flex justify-center gap-1.5" role="tablist">
        {markets.map((market, i) => (
          <button
            key={market.id}
            type="button"
            role="tab"
            aria-selected={i === activeIndex}
            aria-label={`Market ${i + 1}`}
            onClick={() => scrollToIndex(i)}
            className={`h-1.5 rounded-full transition-all duration-200 ${
              i === activeIndex
                ? "w-6 bg-flipr-yes"
                : "w-1.5 bg-flipr-card/30"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
