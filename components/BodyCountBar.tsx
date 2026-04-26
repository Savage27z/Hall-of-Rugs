"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { DayStats } from "@/lib/types";

function formatLiquidity(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}k`;
  return `$${n.toFixed(0)}`;
}

function formatNumber(n: number): string {
  return n.toLocaleString("en-US");
}

function useCountUp(
  target: number,
  duration: number = 1200
): number {
  const [value, setValue] = useState(0);
  const startTime = useRef<number | null>(null);
  const frameRef = useRef<number | null>(null);

  const animate = useCallback(
    (timestamp: number) => {
      if (!startTime.current) startTime.current = timestamp;
      const elapsed = timestamp - startTime.current;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(target * eased));
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      }
    },
    [target, duration]
  );

  useEffect(() => {
    startTime.current = null;
    frameRef.current = requestAnimationFrame(animate);
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [animate]);

  return value;
}

/** Monumental stat bar showing today's body count with animated count-up numbers */
export default function BodyCountBar({
  stats,
}: {
  stats: DayStats | null;
}) {
  const died = useCountUp(stats?.tokensDiedToday ?? 0);
  const liq = useCountUp(stats?.totalLiquidityRemoved ?? 0);
  const holders = useCountUp(stats?.totalHoldersBagged ?? 0);
  const biggest = useCountUp(stats?.biggestRugMcap ?? 0);

  return (
    <div className="w-full border-y border-border py-6 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-0 sm:justify-between">
          <div className="text-center sm:text-left">
            <p className="font-mono text-5xl sm:text-7xl lg:text-[80px] text-white leading-none tracking-tight">
              {died}
            </p>
            <p className="font-mono text-[10px] text-muted tracking-wider mt-2">
              TOKENS DIED TODAY
            </p>
          </div>

          <div className="hidden sm:block w-px h-12 bg-accent" />

          <div className="text-center">
            <p className="font-mono text-5xl sm:text-7xl lg:text-[80px] text-white leading-none tracking-tight">
              {formatLiquidity(liq)}
            </p>
            <p className="font-mono text-[10px] text-muted tracking-wider mt-2">
              LIQUIDITY REMOVED
            </p>
          </div>

          <div className="hidden sm:block w-px h-12 bg-accent" />

          <div className="text-center">
            <p className="font-mono text-5xl sm:text-7xl lg:text-[80px] text-white leading-none tracking-tight">
              {formatNumber(holders)}
            </p>
            <p className="font-mono text-[10px] text-muted tracking-wider mt-2">
              HOLDERS BAGGED
            </p>
          </div>

          <div className="hidden sm:block w-px h-12 bg-accent" />

          <div className="text-center sm:text-right">
            <p className="font-mono text-3xl sm:text-5xl lg:text-[64px] text-white leading-none tracking-tight">
              {stats?.biggestRugName ?? "N/A"}
            </p>
            <p className="font-mono text-[10px] text-muted tracking-wider mt-2">
              BIGGEST RUG TODAY{biggest > 0 ? ` — ${formatLiquidity(biggest)}` : ""}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
