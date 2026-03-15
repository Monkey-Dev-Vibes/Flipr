"use client";

import type { SparklinePoint } from "@/lib/types";

interface SparklineChartProps {
  data: SparklinePoint[];
  id: string;
  width?: number;
  height?: number;
  color?: string;
}

/**
 * Minimal inline SVG sparkline showing probability trend over time.
 * No axes, labels, or interactions — pure visual indicator.
 */
export function SparklineChart({
  data,
  id,
  width = 200,
  height = 48,
  color = "#8AE600",
}: SparklineChartProps) {
  if (data.length < 2) return null;

  const prices = data.map((d) => d.p);
  const minP = Math.min(...prices);
  const maxP = Math.max(...prices);
  const range = maxP - minP || 1; // avoid division by zero

  // Padding so the line doesn't clip the edges
  const padY = 4;
  const innerH = height - padY * 2;

  const points = data
    .map((point, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = padY + innerH - ((point.p - minP) / range) * innerH;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  // Gradient fill beneath the line
  const firstX = 0;
  const lastX = width;
  const fillPoints = `${firstX},${height} ${points} ${lastX},${height}`;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="overflow-visible"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`sparkFill-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.2} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <polygon points={fillPoints} fill={`url(#sparkFill-${id})`} />
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
