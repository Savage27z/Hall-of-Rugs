"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import type { RadarCandidate } from "@/lib/tokenMetrics";

function formatMcap(n: number): string {
  if (!Number.isFinite(n) || n <= 0) return "—";
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}k`;
  return `$${n.toFixed(0)}`;
}

function formatChange(n: number): string {
  if (!Number.isFinite(n)) return "—";
  const sign = n >= 0 ? "+" : "";
  return `${sign}${n.toFixed(1)}%`;
}

function riskColor(level: string): string {
  switch (level) {
    case "CRITICAL": return "text-accent";
    case "HIGH": return "text-accent/80";
    case "MEDIUM": return "text-yellow-500";
    case "LOW": return "text-mono";
    case "HEALTHY": return "text-green-500";
    default: return "text-muted";
  }
}

function riskBg(level: string): string {
  switch (level) {
    case "CRITICAL": return "bg-accent/10 border-accent/30";
    case "HIGH": return "bg-accent/5 border-accent/20";
    case "MEDIUM": return "bg-yellow-500/5 border-yellow-500/20";
    case "LOW": return "bg-white/5 border-border";
    case "HEALTHY": return "bg-green-500/5 border-green-500/20";
    default: return "bg-surface border-border";
  }
}

export default function LiveRadar() {
  const [candidates, setCandidates] = useState<RadarCandidate[]>([]);
  const [source, setSource] = useState<string>("loading");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/tokens/radar")
      .then((r) => r.json())
      .then((data: { candidates: RadarCandidate[]; source: string; message?: string }) => {
        setCandidates(data.candidates ?? []);
        setSource(data.source);
        setMessage(data.message ?? null);
      })
      .catch(() => {
        setSource("unavailable");
        setMessage("Could not reach radar. Use the search bar above.");
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="bg-surface border border-border rounded-[4px] p-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="inline-block w-2 h-2 rounded-full bg-accent animate-pulse" />
          <p className="font-mono text-xs tracking-wider text-muted">
            SCANNING BIRDEYE RADAR...
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 bg-border/30 rounded-[4px] animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface border border-border rounded-[4px] p-5 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className={`inline-block w-2 h-2 rounded-full ${source === "birdeye" ? "bg-green-500" : "bg-muted"}`} />
          <p className="font-mono text-xs tracking-wider text-mono">
            LIVE BIRDEYE RADAR
          </p>
        </div>
        <p className="font-mono text-[10px] text-muted tracking-wider">
          {source === "birdeye" ? "CONNECTED" : source === "cache" ? "CACHED" : "OFFLINE"}
        </p>
      </div>

      {message && candidates.length === 0 && (
        <p className="font-mono text-xs text-muted mb-4">{message}</p>
      )}

      {candidates.length > 0 && (
        <div className="overflow-x-auto -mx-5 sm:-mx-6 px-5 sm:px-6">
          <table className="w-full min-w-[640px]">
            <thead>
              <tr className="border-b border-border">
                <th className="font-mono text-[10px] text-muted tracking-wider text-left py-2 pr-3">TOKEN</th>
                <th className="font-mono text-[10px] text-muted tracking-wider text-right py-2 px-3">MCAP</th>
                <th className="font-mono text-[10px] text-muted tracking-wider text-right py-2 px-3">LIQ</th>
                <th className="font-mono text-[10px] text-muted tracking-wider text-right py-2 px-3">HOLDERS</th>
                <th className="font-mono text-[10px] text-muted tracking-wider text-right py-2 px-3">24H</th>
                <th className="font-mono text-[10px] text-muted tracking-wider text-left py-2 px-3">RISK</th>
                <th className="font-mono text-[10px] text-muted tracking-wider text-right py-2 pl-3"></th>
              </tr>
            </thead>
            <tbody>
              {candidates.map((c, i) => (
                <tr
                  key={c.address}
                  className="border-b border-border/50 hover:bg-white/[0.02] transition-colors opacity-0 animate-fade-up"
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  <td className="py-2.5 pr-3">
                    <Link href={`/autopsy/${c.address}`} className="group">
                      <span className="font-mono text-sm text-white group-hover:text-accent transition-colors">
                        ${c.symbol}
                      </span>
                      <span className="font-sans text-[10px] text-muted ml-1.5 hidden sm:inline">
                        {c.name.length > 16 ? c.name.slice(0, 16) + "..." : c.name}
                      </span>
                    </Link>
                  </td>
                  <td className="font-mono text-xs text-mono text-right py-2.5 px-3">
                    {formatMcap(c.marketCap)}
                  </td>
                  <td className="font-mono text-xs text-mono text-right py-2.5 px-3">
                    {formatMcap(c.liquidity)}
                  </td>
                  <td className="font-mono text-xs text-mono text-right py-2.5 px-3">
                    {c.holders > 0 ? c.holders.toLocaleString() : "—"}
                  </td>
                  <td className={`font-mono text-xs text-right py-2.5 px-3 ${c.priceChange24h >= 0 ? "text-green-500" : "text-accent"}`}>
                    {formatChange(c.priceChange24h)}
                  </td>
                  <td className="py-2.5 px-3">
                    <span className={`inline-block font-mono text-[10px] tracking-wider px-2 py-0.5 rounded-sm border ${riskBg(c.riskLevel)} ${riskColor(c.riskLevel)}`}>
                      {c.riskLabel.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-2.5 pl-3 text-right">
                    <Link
                      href={`/autopsy/${c.address}`}
                      className="font-mono text-[10px] tracking-wider text-muted hover:text-accent transition-colors"
                    >
                      AUTOPSY &rarr;
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
