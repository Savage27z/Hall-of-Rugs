"use client";

const DEATH_MESSAGES = [
  "☠️ $SAFERUG — Rugged after 4 hours. 1,204 holders left behind.",
  "⚠️ $ELONCAT — Dev wallet dumped 100% supply. Peak MCap: $2.3M.",
  "☠️ $TRUSTME — Liquidity removed 92%. The name was a red flag.",
  "⚠️ $PUMP69 — Classic pump & dump. 6,200 holders rugged.",
  "☠️ $DEFINOT — LP pulled via mixer. $1.5M peak MCap gone.",
  "⚠️ $RUGSAFE — The irony. Insurance token rugged at $1.2M.",
  "☠️ $MOONDOGE — Failed launch. Never reached $10k MCap.",
  "⚠️ $GHOSTCHAIN — Team disappeared. $80k MCap abandoned.",
  "☠️ $SLOWDEATH — Down 97% over 3 weeks. Still technically alive.",
  "⚠️ $YOLOCOIN — 18 holders. $1,800 peak. DOA.",
  "☠️ $WAGMI2 — Down 96% from ATH. The slow bleed continues.",
  "⚠️ $GRAVEYARD — Zero volume for 14 days. 340 holders ghosted.",
];

/** Scrolling death ticker with continuous pure CSS infinite scroll animation */
export default function DeathTicker() {
  const items = [...DEATH_MESSAGES, ...DEATH_MESSAGES];

  return (
    <div className="w-full border-t border-accent/30 border-b border-b-accent/30 bg-dead-ticker overflow-hidden">
      <div className="flex animate-ticker whitespace-nowrap py-2.5">
        {items.map((msg, i) => (
          <span
            key={i}
            className="font-mono text-xs text-white/80 mx-8 inline-block shrink-0"
          >
            {msg}
          </span>
        ))}
      </div>
    </div>
  );
}
