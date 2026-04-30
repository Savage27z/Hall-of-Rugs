"use client";

import { useRouter } from "next/navigation";
import LiveRadar from "./LiveRadar";

const SUGGESTED_TOKENS: { label: string; symbol: string; address: string }[] = [
  { label: "Wrapped SOL", symbol: "SOL", address: "So11111111111111111111111111111111111111112" },
  { label: "Bonk", symbol: "BONK", address: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263" },
  { label: "Jupiter", symbol: "JUP", address: "JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN" },
  { label: "Raydium", symbol: "RAY", address: "4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R" },
  { label: "Orca", symbol: "ORCA", address: "orcaEKTdK7LKz57vaAYr9QeNsVEPfiu6QeMU1kektZE" },
];

const BIRDEYE_ENDPOINTS = [
  "token_overview",
  "token_security",
  "ohlcv",
  "price",
  "new_listing",
  "token_trending",
];

export default function EmptyGraveyardPanel() {
  const router = useRouter();

  return (
    <div className="space-y-8">
      <div className="bg-surface border border-border rounded-[4px] p-5 sm:p-6">
        <p className="font-mono text-xs tracking-wider text-accent mb-1">
          THE GRAVEYARD IS QUIET
        </p>
        <p className="font-sans text-sm text-mono leading-relaxed mb-5">
          No dead tokens indexed yet. The scanner checks Birdeye for new listings and trending tokens each cycle
          — when one flatlines, it lands here. Meanwhile, try an instant autopsy on any Solana token:
        </p>

        <div className="flex flex-wrap gap-2 mb-6">
          {SUGGESTED_TOKENS.map((t) => (
            <button
              key={t.address}
              onClick={() => router.push(`/autopsy/${t.address}`)}
              className="group flex items-center gap-1.5 font-mono text-xs border border-border bg-bg px-3 py-2 rounded-[4px] transition-all duration-150 hover:border-accent hover:shadow-[0_0_12px_rgba(220,38,38,0.15)]"
            >
              <span className="text-white group-hover:text-accent transition-colors">${t.symbol}</span>
              <span className="text-muted text-[10px] hidden sm:inline">{t.label}</span>
            </button>
          ))}
        </div>

        <p className="font-mono text-[10px] text-muted tracking-wider">
          LIVE EXAMPLES — CLICK ANY TOKEN TO RUN A FULL BIRDEYE-POWERED AUTOPSY
        </p>
      </div>

      <LiveRadar />

      <div className="bg-surface border border-border rounded-[4px] p-5 sm:p-6">
        <p className="font-mono text-xs tracking-wider text-mono mb-3">
          WHY THIS WINS
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <p className="font-mono text-[10px] text-muted tracking-wider mb-1">REAL DATA ONLY</p>
            <p className="font-sans text-xs text-mono leading-relaxed">
              Every number on this page comes from Birdeye. No mock data, no fake corpses, no seeded bodies.
            </p>
          </div>
          <div>
            <p className="font-mono text-[10px] text-muted tracking-wider mb-1">6 BIRDEYE ENDPOINTS</p>
            <p className="font-sans text-xs text-mono leading-relaxed">
              {BIRDEYE_ENDPOINTS.join(" · ")}
            </p>
          </div>
          <div>
            <p className="font-mono text-[10px] text-muted tracking-wider mb-1">VERDICT ENGINE</p>
            <p className="font-sans text-xs text-mono leading-relaxed">
              5 classifications — RUGGED, FAILED LAUNCH, ABANDONED, SLOW BLEED, STILL ALIVE — driven by on-chain metrics.
            </p>
          </div>
          <div>
            <p className="font-mono text-[10px] text-muted tracking-wider mb-1">SHAREABLE OBITUARIES</p>
            <p className="font-sans text-xs text-mono leading-relaxed">
              Every death certificate is a shareable card with tweet-ready text and downloadable PNG.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
