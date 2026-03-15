"use client";

import { useCallback } from "react";

const PRESETS = [1, 5, 10, 25, 50];
const MIN_BET = 1;
const MAX_BET = 100;

interface BetSizeSliderProps {
  value: number;
  onChange: (value: number) => void;
  intent: "yes" | "no";
}

export function BetSizeSlider({ value, onChange, intent }: BetSizeSliderProps) {
  const isYes = intent === "yes";

  const handleSliderChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(Number(e.target.value));
    },
    [onChange],
  );

  return (
    <div className="space-y-3">
      {/* Amount display */}
      <div className="flex items-baseline justify-between">
        <span className="text-sm text-flipr-ink/50">Bet Amount</span>
        <span
          className={`font-mono text-2xl font-bold ${isYes ? "text-flipr-yes" : "text-flipr-no"}`}
        >
          ${value.toFixed(2)}
        </span>
      </div>

      {/* Slider */}
      <input
        type="range"
        min={MIN_BET}
        max={MAX_BET}
        step={1}
        value={value}
        onChange={handleSliderChange}
        className={`w-full ${isYes ? "accent-flipr-yes" : "accent-flipr-no"}`}
        aria-label="Bet amount"
      />

      {/* Preset chips */}
      <div className="flex gap-2">
        {PRESETS.map((preset) => (
          <button
            key={preset}
            type="button"
            onClick={() => onChange(preset)}
            className={`flex-1 rounded-lg py-1.5 font-mono text-sm font-medium transition-colors ${
              value === preset
                ? isYes
                  ? "bg-flipr-yes text-white"
                  : "bg-flipr-no text-white"
                : "bg-flipr-ink/5 text-flipr-ink/60 hover:bg-flipr-ink/10"
            }`}
          >
            ${preset}
          </button>
        ))}
      </div>
    </div>
  );
}
