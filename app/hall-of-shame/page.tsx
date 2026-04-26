import HallOfShameTable from "@/components/HallOfShameTable";

export default function HallOfShamePage() {
  return (
    <div className="min-h-screen py-8 sm:py-12 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 sm:mb-12">
          <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl text-white tracking-tight mb-2">
            Hall of Shame
          </h1>
          <p className="font-mono text-xs sm:text-sm text-muted tracking-wider">
            THE MOST BRUTAL RUGS EVER INDEXED — RANKED BY BRUTALITY
            SCORE
          </p>
        </div>

        <HallOfShameTable />

        <footer className="border-t border-border mt-12 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="font-mono text-[10px] text-muted tracking-wider">
              HALL OF RUGS — SOLANA&apos;S TOKEN GRAVEYARD
            </p>
            <p className="font-mono text-[10px] text-muted tracking-wider">
              BUILT FOR BIRDEYE DATA BIP COMPETITION SPRINT 2 — APRIL
              2026
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
