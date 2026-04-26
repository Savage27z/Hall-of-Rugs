import type { Verdict } from "./types";

interface ClassifierInput {
  liquidityRemovedPct: number;
  priceDropPct: number;
  peakMcap: number;
  holders: number;
  volumeLast24h: number;
  daysSinceLastTrade: number;
  ageHours: number;
  declineDurationDays: number;
}

interface ClassifierResult {
  verdict: Verdict;
  cause: string;
  brutalityScore: number;
  timeToDeathHours: number;
}

const RUG_LIQUIDITY_THRESHOLD = parseFloat(
  process.env.RUG_LIQUIDITY_THRESHOLD ?? "0.80"
);
const FAILED_LAUNCH_MCAP_THRESHOLD = parseFloat(
  process.env.FAILED_LAUNCH_MCAP_THRESHOLD ?? "10000"
);
const ABANDONED_VOLUME_DAYS = parseInt(
  process.env.ABANDONED_VOLUME_DAYS ?? "7",
  10
);

export function classify(input: ClassifierInput): ClassifierResult {
  const {
    liquidityRemovedPct,
    priceDropPct,
    peakMcap,
    holders,
    volumeLast24h,
    daysSinceLastTrade,
    ageHours,
    declineDurationDays,
  } = input;

  const liqFraction = liquidityRemovedPct / 100;
  const priceFraction = priceDropPct / 100;

  if (liqFraction >= RUG_LIQUIDITY_THRESHOLD && priceFraction >= 0.9 && ageHours <= 48) {
    const brutalityScore = Math.min(
      100,
      Math.round(
        liqFraction * 40 +
          priceFraction * 30 +
          Math.min(holders / 100, 1) * 20 +
          Math.min(peakMcap / 1000000, 1) * 10
      )
    );
    return {
      verdict: "RUGGED",
      cause: `Liquidity removed ${liquidityRemovedPct}% within ${Math.round(ageHours)}hrs of launch`,
      brutalityScore,
      timeToDeathHours: Math.round(ageHours * 10) / 10,
    };
  }

  if (
    peakMcap < FAILED_LAUNCH_MCAP_THRESHOLD &&
    volumeLast24h < 100 &&
    holders < 50
  ) {
    const brutalityScore = Math.min(
      100,
      Math.round(20 + priceFraction * 25)
    );
    return {
      verdict: "FAILED LAUNCH",
      cause: `Never reached $${(FAILED_LAUNCH_MCAP_THRESHOLD / 1000).toFixed(0)}k MCap, volume dried within ${Math.round(ageHours)}hrs`,
      brutalityScore,
      timeToDeathHours: Math.round(ageHours * 10) / 10,
    };
  }

  if (
    peakMcap >= 50000 &&
    holders >= 100 &&
    daysSinceLastTrade >= ABANDONED_VOLUME_DAYS
  ) {
    const brutalityScore = Math.min(
      100,
      Math.round(
        50 +
          Math.min(daysSinceLastTrade / 30, 1) * 20 +
          priceFraction * 15 +
          Math.min(holders / 1000, 1) * 15
      )
    );
    return {
      verdict: "ABANDONED",
      cause: `Had $${(peakMcap / 1000).toFixed(0)}k MCap and ${holders} holders but zero volume for ${daysSinceLastTrade}+ days`,
      brutalityScore,
      timeToDeathHours: Math.round(daysSinceLastTrade * 24),
    };
  }

  if (declineDurationDays >= 14 && priceFraction >= 0.95) {
    const brutalityScore = Math.min(
      100,
      Math.round(
        40 + priceFraction * 25 + Math.min(declineDurationDays / 60, 1) * 20 + Math.min(holders / 500, 1) * 15
      )
    );
    return {
      verdict: "SLOW BLEED",
      cause: `Gradual decline over ${declineDurationDays} days, down ${Math.round(priceDropPct)}% from peak`,
      brutalityScore,
      timeToDeathHours: Math.round(declineDurationDays * 24),
    };
  }

  return {
    verdict: "STILL ALIVE",
    cause: "Patient is alive but on life support. Exit while you can.",
    brutalityScore: 0,
    timeToDeathHours: 0,
  };
}

export function computeMetrics(overview: {
  liquidity: number;
  mc: number;
  v24hUSD: number;
  holder: number;
  price: number;
  history24hPrice: number;
  createdAt?: number;
  lastTradeUnixTime?: number;
  peakMcap?: number;
}): ClassifierInput {
  const now = Date.now();
  const createdAt = overview.createdAt ?? now - 7 * 24 * 60 * 60 * 1000;
  const ageHours = (now - createdAt) / (60 * 60 * 1000);
  const peakMcap = overview.peakMcap ?? overview.mc * 1.5;
  const priceDropPct =
    overview.history24hPrice > 0
      ? Math.max(
          0,
          ((overview.history24hPrice - overview.price) /
            overview.history24hPrice) *
            100
        )
      : 0;
  const lastTrade = overview.lastTradeUnixTime
    ? overview.lastTradeUnixTime * 1000
    : now;
  const daysSinceLastTrade = (now - lastTrade) / (24 * 60 * 60 * 1000);

  const liquidityRemovedPct =
    peakMcap > 0
      ? Math.max(0, Math.min(100, ((peakMcap - overview.mc) / peakMcap) * 100))
      : 0;

  return {
    liquidityRemovedPct,
    priceDropPct,
    peakMcap,
    holders: overview.holder,
    volumeLast24h: overview.v24hUSD,
    daysSinceLastTrade: Math.max(0, daysSinceLastTrade),
    ageHours,
    declineDurationDays: Math.max(0, ageHours / 24),
  };
}
