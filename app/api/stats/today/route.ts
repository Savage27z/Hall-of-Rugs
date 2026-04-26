import { NextResponse } from "next/server";
import { getTodayStats, seedMockData } from "@/lib/db";
import type { DayStats } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET() {
  seedMockData();

  const raw = getTodayStats();

  const stats: DayStats = {
    tokensDiedToday: raw.count,
    totalLiquidityRemoved: raw.liquidityRemoved,
    totalHoldersBagged: raw.holdersBagged,
    biggestRugName: raw.biggestRugName,
    biggestRugMcap: raw.biggestRugMcap,
  };

  return NextResponse.json(stats);
}
