import type { BirdeyeTokenOverview, Verdict } from "./types";

export function safeNumber(value: unknown, fallback = 0): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

export function firstPositive(...values: unknown[]): number {
  for (const value of values) {
    const n = safeNumber(value, NaN);
    if (Number.isFinite(n) && n > 0) return n;
  }
  return 0;
}

export function currentMarketCap(overview: BirdeyeTokenOverview): number {
  const price = safeNumber(overview.price);
  const supply = safeNumber(overview.supply);
  return firstPositive(
    overview.mc,
    overview.realMc,
    overview.marketCap,
    overview.fdv,
    supply > 0 && price > 0 ? supply * price : 0,
    safeNumber(overview.liquidity) * 10
  );
}

export function maxOverviewPrice(overview: BirdeyeTokenOverview): number {
  const currentPrice = safeNumber(overview.price);
  const prices = [
    overview.history24hPrice,
    overview.history12hPrice,
    overview.history8hPrice,
    overview.history6hPrice,
    overview.history4hPrice,
    overview.history2hPrice,
    overview.history1hPrice,
    overview.history30mPrice,
    currentPrice,
  ]
    .map((v) => safeNumber(v, NaN))
    .filter((v) => Number.isFinite(v) && v > 0);
  return Math.max(currentPrice, ...prices);
}

export type RiskLevel = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "HEALTHY";

export interface RadarCandidate {
  address: string;
  symbol: string;
  name: string;
  logoUri?: string;
  price: number;
  marketCap: number;
  liquidity: number;
  holders: number;
  volume24h: number;
  priceChange24h: number;
  riskLevel: RiskLevel;
  riskLabel: string;
  verdict: Verdict | null;
}

export function assessRisk(overview: BirdeyeTokenOverview): {
  riskLevel: RiskLevel;
  riskLabel: string;
  verdict: Verdict | null;
} {
  const mc = currentMarketCap(overview);
  const liq = safeNumber(overview.liquidity);
  const vol = safeNumber(overview.v24hUSD);
  const holders = safeNumber(overview.holder);
  const change = safeNumber(overview.priceChange24hPercent);

  if (mc < 5_000 && change <= -90) {
    return { riskLevel: "CRITICAL", riskLabel: "Probable rug", verdict: "RUGGED" };
  }
  if (mc > 0 && mc < 10_000 && vol < 100 && holders < 50) {
    return { riskLevel: "CRITICAL", riskLabel: "Failed launch", verdict: "FAILED LAUNCH" };
  }
  if (mc >= 50_000 && holders >= 100 && vol <= 10) {
    return { riskLevel: "HIGH", riskLabel: "Abandoned", verdict: "ABANDONED" };
  }
  if (change <= -70 && vol <= Math.max(1_000, mc * 0.05) && liq <= Math.max(5_000, mc * 0.1)) {
    return { riskLevel: "HIGH", riskLabel: "Slow bleed", verdict: "SLOW BLEED" };
  }
  if (change <= -30 || (liq > 0 && liq < mc * 0.05)) {
    return { riskLevel: "MEDIUM", riskLabel: "Elevated risk", verdict: null };
  }
  if (change <= -10 || holders < 100) {
    return { riskLevel: "LOW", riskLabel: "Monitor", verdict: null };
  }
  return { riskLevel: "HEALTHY", riskLabel: "Alive", verdict: "STILL ALIVE" };
}

export function overviewToCandidate(
  address: string,
  overview: BirdeyeTokenOverview,
  fallback?: { symbol?: string; name?: string; logoUri?: string }
): RadarCandidate {
  const { riskLevel, riskLabel, verdict } = assessRisk(overview);
  return {
    address,
    symbol: overview.symbol || fallback?.symbol || "???",
    name: overview.name || fallback?.name || "Unknown",
    logoUri: overview.logoURI || fallback?.logoUri,
    price: safeNumber(overview.price),
    marketCap: currentMarketCap(overview),
    liquidity: safeNumber(overview.liquidity),
    holders: safeNumber(overview.holder),
    volume24h: safeNumber(overview.v24hUSD),
    priceChange24h: safeNumber(overview.priceChange24hPercent),
    riskLevel,
    riskLabel,
    verdict,
  };
}
