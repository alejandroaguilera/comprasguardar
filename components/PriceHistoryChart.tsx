"use client";

import { useMemo, useState, type MouseEvent } from "react";
import { formatDate, formatPrice } from "@/lib/format";

type PriceHistoryChartProps = {
  entries: { price: number; checkedAt: string }[];
  currency: string;
};

const WIDTH = 640;
const HEIGHT = 220;
const PADDING = { top: 20, right: 16, bottom: 28, left: 16 };

export function PriceHistoryChart({ entries, currency }: PriceHistoryChartProps) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const { points, minPrice, maxPrice } = useMemo(() => {
    const prices = entries.map((e) => e.price);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const range = max - min || 1;
    const innerWidth = WIDTH - PADDING.left - PADDING.right;
    const innerHeight = HEIGHT - PADDING.top - PADDING.bottom;

    const pts = entries.map((entry, i) => {
      const x =
        entries.length === 1
          ? PADDING.left + innerWidth / 2
          : PADDING.left + (i / (entries.length - 1)) * innerWidth;
      const y = PADDING.top + innerHeight - ((entry.price - min) / range) * innerHeight;
      return { x, y, ...entry };
    });

    return { points: pts, minPrice: min, maxPrice: max };
  }, [entries]);

  if (entries.length === 0) return null;

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
  const areaPath = `${linePath} L${points[points.length - 1].x},${HEIGHT - PADDING.bottom} L${points[0].x},${HEIGHT - PADDING.bottom} Z`;
  const last = points[points.length - 1];
  const hovered = hoverIndex !== null ? points[hoverIndex] : null;

  function handleMouseMove(event: MouseEvent<SVGSVGElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const relativeX = ((event.clientX - rect.left) / rect.width) * WIDTH;
    let closest = 0;
    let closestDist = Infinity;
    points.forEach((p, i) => {
      const dist = Math.abs(p.x - relativeX);
      if (dist < closestDist) {
        closestDist = dist;
        closest = i;
      }
    });
    setHoverIndex(closest);
  }

  return (
    <div className="w-full overflow-x-auto">
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="w-full min-w-[480px]"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoverIndex(null)}
      >
        <line
          x1={PADDING.left}
          y1={HEIGHT - PADDING.bottom}
          x2={WIDTH - PADDING.right}
          y2={HEIGHT - PADDING.bottom}
          className="stroke-neutral-200 dark:stroke-neutral-800"
          strokeWidth={1}
        />

        <path d={areaPath} fill="#2a78d6" fillOpacity={0.1} stroke="none" />
        <path
          d={linePath}
          fill="none"
          stroke="#2a78d6"
          strokeWidth={2}
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {hovered && (
          <line
            x1={hovered.x}
            y1={PADDING.top}
            x2={hovered.x}
            y2={HEIGHT - PADDING.bottom}
            className="stroke-neutral-300 dark:stroke-neutral-700"
            strokeWidth={1}
          />
        )}

        {points.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={i === hoverIndex || i === points.length - 1 ? 5 : 3}
            fill="#2a78d6"
            stroke="white"
            strokeWidth={i === hoverIndex || i === points.length - 1 ? 2 : 0}
          />
        ))}

        <text x={last.x} y={PADDING.top - 6} textAnchor="end" className="fill-neutral-900 text-[11px] font-medium dark:fill-neutral-100">
          {formatPrice(last.price, currency)}
        </text>
      </svg>

      <div className="flex justify-between px-1 text-xs text-neutral-500 dark:text-neutral-400">
        <span>{formatDate(entries[0].checkedAt)}</span>
        <span>Mín {formatPrice(minPrice, currency)} · Máx {formatPrice(maxPrice, currency)}</span>
        <span>{formatDate(entries[entries.length - 1].checkedAt)}</span>
      </div>

      {hovered && (
        <div className="mt-1 text-center text-sm">
          <span className="font-medium">{formatPrice(hovered.price, currency)}</span>
          <span className="text-neutral-500 dark:text-neutral-400"> — {formatDate(hovered.checkedAt)}</span>
        </div>
      )}
    </div>
  );
}
