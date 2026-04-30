import { NextResponse } from "next/server";
import { getNewListings, getTrendingTokens, getTokenOverview } from "@/lib/birdeye";
import { overviewToCandidate, type RadarCandidate } from "@/lib/tokenMetrics";

export const dynamic = "force-dynamic";

const MAX_CANDIDATES = 10;

export async function GET() {
  const apiKey = process.env.BIRDEYE_API_KEY;
  if (!apiKey) {
    return NextResponse.json({
      candidates: [],
      source: "unavailable" as const,
      message: "Birdeye API key not configured. Use the search bar to autopsy any Solana token address.",
    });
  }

  try {
    const [newListings, trending] = await Promise.all([
      getNewListings(15).catch(() => []),
      getTrendingTokens().catch(() => []),
    ]);

    const seen = new Set<string>();
    const rawCandidates = [
      ...trending.map((t) => ({
        address: t.address,
        symbol: t.symbol,
        name: t.name,
        logoUri: t.logoURI,
      })),
      ...newListings.map((t) => ({
        address: t.address,
        symbol: t.symbol,
        name: t.name,
        logoUri: t.logoURI,
      })),
    ].filter((t) => {
      if (seen.has(t.address)) return false;
      seen.add(t.address);
      return true;
    });

    const batch = rawCandidates.slice(0, MAX_CANDIDATES);

    const results = await Promise.allSettled(
      batch.map(async (c) => {
        const overview = await getTokenOverview(c.address);
        if (!overview) return null;
        return overviewToCandidate(c.address, overview, c);
      })
    );

    const candidates: RadarCandidate[] = results
      .filter(
        (r): r is PromiseFulfilledResult<RadarCandidate | null> =>
          r.status === "fulfilled" && r.value !== null
      )
      .map((r) => r.value!);

    candidates.sort((a, b) => {
      const riskOrder = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3, HEALTHY: 4 };
      return (riskOrder[a.riskLevel] ?? 5) - (riskOrder[b.riskLevel] ?? 5);
    });

    return NextResponse.json({
      candidates,
      source: "birdeye" as const,
      message: candidates.length === 0
        ? "Scanner found no candidates this cycle. Use the search bar to autopsy any address."
        : undefined,
    });
  } catch {
    return NextResponse.json({
      candidates: [],
      source: "unavailable" as const,
      message: "Birdeye API temporarily unavailable. Try autopsy by address.",
    });
  }
}
