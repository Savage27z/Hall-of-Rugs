import { NextResponse } from "next/server";
import {
  getDeadTokenByAddress,
  seedMockData,
  upsertDeadToken,
} from "@/lib/db";
import {
  getTokenOverview,
  getTokenSecurity,
  getTokenOHLCV,
  getTokenPrice,
  generateMockOHLCV,
} from "@/lib/birdeye";
import { classify, computeMetrics } from "@/lib/classifier";
import { getOneLiner } from "@/lib/oneliner";
import type {
  DeadToken,
  AutopsyResult,
  SecurityFlag,
  OHLCVPoint,
} from "@/lib/types";

export const dynamic = "force-dynamic";

function isValidSolanaAddress(address: string): boolean {
  return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get("address") ?? "";

  if (!address || !isValidSolanaAddress(address)) {
    return NextResponse.json(
      { error: "Invalid Solana address" },
      { status: 400 }
    );
  }

  seedMockData();

  const apiKey = process.env.BIRDEYE_API_KEY;

  if (apiKey) {
    try {
      // Birdeye endpoint: /defi/token_overview
      const overview = await getTokenOverview(address);
      if (!overview) {
        const cached = getDeadTokenByAddress(address);
        if (cached) {
          return buildMockAutopsy(cached);
        }
        return NextResponse.json(
          {
            error:
              "This token is so dead we can't even find its records.",
          },
          { status: 404 }
        );
      }

      // Birdeye endpoint: /defi/token_security
      const security = await getTokenSecurity(address);

      // Birdeye endpoint: /defi/ohlcv
      const createdAt = overview.createdAt
        ? overview.createdAt
        : Math.floor(Date.now() / 1000) - 7 * 24 * 60 * 60;
      const ohlcv = await getTokenOHLCV(
        address,
        createdAt,
        Math.floor(Date.now() / 1000),
        "1H"
      );

      // Birdeye endpoint: /defi/price
      const priceData = await getTokenPrice(address);

      const metrics = computeMetrics({
        liquidity: overview.liquidity,
        mc: overview.mc,
        v24hUSD: overview.v24hUSD,
        holder: overview.holder,
        price: overview.price,
        history24hPrice: overview.history24hPrice,
        createdAt: overview.createdAt
          ? overview.createdAt * 1000
          : undefined,
        lastTradeUnixTime: overview.lastTradeUnixTime,
        peakMcap: overview.realMc ?? overview.mc * 1.2,
      });

      const result = classify(metrics);

      const token: DeadToken = {
        address,
        symbol: overview.symbol,
        name: overview.name,
        verdict: result.verdict,
        cause: result.cause,
        oneLiner: getOneLiner(result.verdict),
        bornAt: overview.createdAt
          ? overview.createdAt * 1000
          : Date.now() - result.timeToDeathHours * 60 * 60 * 1000,
        diedAt:
          result.verdict === "STILL ALIVE" ? 0 : Date.now(),
        peakMcap: metrics.peakMcap,
        finalMcap: overview.mc,
        liquidityRemovedPct: metrics.liquidityRemovedPct,
        holdersBagged: overview.holder,
        priceDropPct: metrics.priceDropPct,
        timeToDeathHours: result.timeToDeathHours,
        brutalityScore: result.brutalityScore,
        logoUri: overview.logoURI,
      };

      if (result.verdict !== "STILL ALIVE") {
        upsertDeadToken(token);
      }

      const securityFlags = buildSecurityFlags(security);

      const autopsyResult: AutopsyResult = {
        token,
        priceHistory:
          ohlcv.length > 0
            ? ohlcv
            : generateMockOHLCV(
                metrics.peakMcap / 1000,
                result.timeToDeathHours || 48,
                result.verdict
              ),
        securityFlags,
        topHoldersPct: security?.top10HolderPercent ?? 0,
        currentPrice: priceData?.value ?? overview.price,
        currentLiquidity: overview.liquidity,
        peakLiquidity: overview.liquidity * (1 + metrics.liquidityRemovedPct / 100),
      };

      return NextResponse.json(autopsyResult);
    } catch {
      // Fall through to cached/mock
    }
  }

  const cached = getDeadTokenByAddress(address);
  if (cached) {
    return buildMockAutopsy(cached);
  }

  return NextResponse.json(
    {
      error:
        "This token is so dead we can't even find its records.",
    },
    { status: 404 }
  );
}

function buildMockAutopsy(token: DeadToken): NextResponse {
  const priceHistory = generateMockOHLCV(
    token.peakMcap / 1000,
    token.timeToDeathHours || 48,
    token.verdict
  );

  const securityFlags: SecurityFlag[] = [
    {
      label: "Mint Authority",
      danger: token.verdict === "RUGGED",
      detail: token.verdict === "RUGGED" ? "Active — can mint unlimited tokens" : "Revoked",
    },
    {
      label: "Freeze Authority",
      danger: token.verdict === "RUGGED",
      detail: token.verdict === "RUGGED" ? "Active — can freeze holder wallets" : "Revoked",
    },
    {
      label: "Mutable Metadata",
      danger: true,
      detail: "Metadata can be changed by creator",
    },
    {
      label: "Top 10 Holder Concentration",
      danger: true,
      detail: `Top 10 wallets hold ${token.verdict === "RUGGED" ? "89" : "67"}% of supply`,
    },
    {
      label: "Honeypot Detection",
      danger: token.verdict === "RUGGED",
      detail: token.verdict === "RUGGED" ? "Suspicious sell restrictions detected" : "No restrictions detected",
    },
    {
      label: "Liquidity Lock",
      danger: true,
      detail: "No liquidity lock found",
    },
  ];

  const result: AutopsyResult = {
    token,
    priceHistory,
    securityFlags,
    topHoldersPct: token.verdict === "RUGGED" ? 89 : 67,
    currentPrice: token.finalMcap / 1_000_000,
    currentLiquidity: token.finalMcap * 0.1,
    peakLiquidity: token.peakMcap * 0.3,
  };

  return NextResponse.json(result);
}

function buildSecurityFlags(
  security: {
    mintAuthority?: string;
    freezeAuthority?: string;
    mutableMetadata: boolean;
    top10HolderPercent: number;
    isHoneypot?: boolean;
    transferFeeEnable?: boolean;
    nonTransferable?: boolean;
    top10UserPercent?: number;
  } | null
): SecurityFlag[] {
  if (!security) {
    return [
      {
        label: "Security Data",
        danger: true,
        detail: "Unable to fetch security data",
      },
    ];
  }

  const flags: SecurityFlag[] = [];

  flags.push({
    label: "Mint Authority",
    danger: !!security.mintAuthority,
    detail: security.mintAuthority
      ? "Active — can mint unlimited tokens"
      : "Revoked",
  });

  flags.push({
    label: "Freeze Authority",
    danger: !!security.freezeAuthority,
    detail: security.freezeAuthority
      ? "Active — can freeze holder wallets"
      : "Revoked",
  });

  flags.push({
    label: "Mutable Metadata",
    danger: security.mutableMetadata,
    detail: security.mutableMetadata
      ? "Metadata can be changed by creator"
      : "Metadata is immutable",
  });

  flags.push({
    label: "Top 10 Holder Concentration",
    danger: security.top10HolderPercent > 50,
    detail: `Top 10 wallets hold ${security.top10HolderPercent.toFixed(1)}% of supply`,
  });

  flags.push({
    label: "Honeypot Detection",
    danger: !!security.isHoneypot,
    detail: security.isHoneypot
      ? "Suspicious sell restrictions detected"
      : "No restrictions detected",
  });

  if (security.transferFeeEnable) {
    flags.push({
      label: "Transfer Fee",
      danger: true,
      detail: "Token has transfer fees enabled",
    });
  }

  if (security.nonTransferable) {
    flags.push({
      label: "Non-Transferable",
      danger: true,
      detail: "Token cannot be transferred",
    });
  }

  return flags;
}
