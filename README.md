# Hall of Rugs

> Solana's Token Graveyard — powered by Birdeye Data API

A dark-humour public obituary board for dead Solana tokens. Part official death certificate, part savage degen commentary. Browse the graveyard, perform autopsies, and visit the Hall of Shame.

**Live URL:** https://hall-of-rugs.vercel.app/

Built for Birdeye Data BIP Competition Sprint 2 — April 2026

#BirdeyeAPI @birdeye_data

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                   NEXT.JS APP ROUTER                │
│                                                     │
│  ┌──────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ Homepage │  │ Autopsy Page │  │ Hall of Shame│  │
│  │    /     │  │ /autopsy/:id │  │ /hall-of-shame│ │
│  └────┬─────┘  └──────┬───────┘  └──────┬───────┘  │
│       │               │                 │           │
│  ┌────▼───────────────▼─────────────────▼────────┐  │
│  │              API ROUTES (Server-side)          │  │
│  │  /api/tokens/dead  /api/tokens/autopsy        │  │
│  │  /api/tokens/radar  /api/stats/today           │  │
│  └────┬──────────────────────────────────────────┘  │
│       │                                             │
│  ┌────▼────────┐  ┌─────────────┐  ┌────────────┐  │
│  │ lib/birdeye │  │ lib/db      │  │lib/classify │  │
│  │ (API Client)│  │ (SQLite)    │  │(Verdicts)   │  │
│  │             │  │             │  │             │  │
│  │ lib/token   │  │             │  │lib/oneliner │  │
│  │  Metrics    │  │             │  │             │  │
│  └────┬────────┘  └──────┬──────┘  └────────────┘  │
│       │                  │                          │
└───────┼──────────────────┼──────────────────────────┘
        │                  │
        ▼                  ▼
  ┌──────────┐     ┌──────────────┐
  │ Birdeye  │     │ SQLite DB    │
  │ Data API │     │ .data/*.sqlite│
  └──────────┘     └──────────────┘
```

## Birdeye Endpoints Used

| Endpoint | Purpose |
|----------|---------|
| `/defi/v2/tokens/new_listing` | Discover new tokens to monitor |
| `/defi/token_security` | Honeypot, holder concentration, mint authority |
| `/defi/token_trending` | Cross-reference tokens that trended then died |
| `/defi/ohlcv` | Price history for death charts |
| `/defi/price` | Current price lookups |
| `/defi/token_overview` | Token metadata, MCap, volume, liquidity |
| `/v1/wallet/token_list` | Dev wallet movement tracking |

## Setup

```bash
git clone https://github.com/savage27z/Hall-of-Rugs.git
cd Hall-of-Rugs
cp .env.example .env       # Add your BIRDEYE_API_KEY
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `BIRDEYE_API_KEY` | Birdeye Data API key | (required for live data) |
| `NEXT_PUBLIC_SITE_URL` | Public site URL | |
| `NEXT_PUBLIC_POLL_INTERVAL_MS` | Client polling interval (ms) | `120000` |
| `RUG_LIQUIDITY_THRESHOLD` | Min liquidity % removed for RUGGED verdict | `0.80` |
| `FAILED_LAUNCH_MCAP_THRESHOLD` | Max peak MCap for FAILED LAUNCH | `10000` |
| `ABANDONED_VOLUME_DAYS` | Days of zero volume for ABANDONED | `7` |

All data is real. Without `BIRDEYE_API_KEY`, discovery and autopsy routes return empty/informative responses — no mock or placeholder data is rendered. When no dead tokens are indexed, the homepage shows:

- **Live Birdeye Radar**: a real-time scanner table of trending/new tokens with risk assessment from Birdeye overview data
- **Suggested addresses**: clickable sample tokens (SOL, BONK, JUP, RAY, ORCA) for instant autopsy
- **Proof points**: endpoints used, verdict engine summary, shareable obituary feature

The graveyard populates organically as the scanner discovers tokens that match death criteria. No fake bodies are seeded.

## API Call Logging

Every Birdeye API call is logged to `api_calls.log` in the project root:

```
[2026-04-26T12:00:00.000Z] [/defi/token_overview] [7xKXtg2C...] [200]
```

Format: `[timestamp] [endpoint] [token_address] [status_code]`

In production usage with a valid Birdeye API key, the log accumulates naturally as the app discovers and indexes dead tokens. The hackathon requirement of 50+ logged calls will be met through normal usage of the graveyard features (browsing, autopsy lookups, polling).

## Tech Stack

- **Next.js 14** App Router with TypeScript strict mode
- **Tailwind CSS** with CSS variables
- **SQLite** via better-sqlite3 (5-minute API dedup cache)
- **Recharts** for price death charts
- **Google Fonts**: Instrument Serif, JetBrains Mono, DM Sans
- Deployable to **Vercel**

## Features

- **Homepage Graveyard**: Live feed of dead tokens as death certificate cards with filter/sort
- **Live Birdeye Radar**: Real-time scanner showing trending/new tokens with risk levels when graveyard is empty
- **Token Autopsy**: Deep-dive analysis with price charts, security flags, verdicts, and Birdeye evidence summary
- **Hall of Shame**: Leaderboard of the most brutal rugs ever indexed
- **Classification Engine**: RUGGED / FAILED LAUNCH / ABANDONED / SLOW BLEED / STILL ALIVE
- **Alive/Monitored**: Tokens that pass all checks show positive "Alive / Monitored" verdict with evidence
- **Auto-polling**: Updates every 2 minutes
- **Share**: Copy tweet-ready obituaries to clipboard

## API Routes

| Route | Purpose |
|-------|----------|
| `/api/tokens/dead` | Discover + list dead tokens from Birdeye new listings/trending |
| `/api/tokens/autopsy` | Deep analysis: overview + security + OHLCV + price |
| `/api/tokens/radar` | Live scanner: trending/new tokens with risk assessment |
| `/api/stats/today` | Daily stats (bodies, liquidity removed, holders bagged) |

---

Built for Birdeye Data BIP Competition Sprint 2 — April 2026
