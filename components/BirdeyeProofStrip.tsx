"use client";

import { useRouter } from "next/navigation";

const SAMPLE_TOKEN = {
  label: "Wrapped SOL",
  symbol: "SOL",
  address: "So11111111111111111111111111111111111111112",
};

const PILLARS = [
  {
    tag: "TECHNICAL DEPTH",
    detail: "6 Birdeye endpoints · API cache · classifier pipeline",
  },
  {
    tag: "PRODUCT UTILITY",
    detail: "Rug & failed-launch autopsies on any Solana token",
  },
  {
    tag: "PRESENTATION",
    detail: "Shareable death certificates · downloadable PNG cards",
  },
  {
    tag: "REAL DATA ONLY",
    detail: "Zero mock data — every number from live Birdeye APIs",
  },
];

export default function BirdeyeProofStrip() {
  const router = useRouter();

  return (
    <div className="bg-surface border border-border rounded-[4px] p-4 sm:p-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <p className="font-mono text-[10px] sm:text-xs tracking-wider text-mono">
            LIVE BIRDEYE DATA — NO FAKE BODIES
          </p>
        </div>
        <button
          onClick={() => router.push(`/autopsy/${SAMPLE_TOKEN.address}`)}
          className="font-mono text-[10px] tracking-wider border border-border text-muted px-3 py-1.5 rounded-[2px] transition-all duration-150 hover:border-accent hover:text-accent whitespace-nowrap self-start sm:self-auto"
        >
          AUTOPSY ANY TOKEN → ${SAMPLE_TOKEN.symbol}
        </button>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
        {PILLARS.map((p) => (
          <div key={p.tag}>
            <p className="font-mono text-[10px] text-accent tracking-wider mb-0.5">
              {p.tag}
            </p>
            <p className="font-sans text-[10px] sm:text-xs text-muted leading-snug">
              {p.detail}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
