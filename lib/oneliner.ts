import type { Verdict } from "./types";

const ONE_LINERS: Record<Verdict, string> = {
  RUGGED: "Dev said WAGMI. Dev meant 'I'm wagmi.'",
  "FAILED LAUNCH": "Launched into a wall.",
  ABANDONED:
    "The team pivoted to stealth mode. Very stealth. Permanently.",
  "SLOW BLEED": "Still technically alive. Technically.",
  "STILL ALIVE":
    "No death indicators found. Vital signs present.",
};

export function getOneLiner(verdict: Verdict): string {
  return ONE_LINERS[verdict] ?? ONE_LINERS["STILL ALIVE"];
}
