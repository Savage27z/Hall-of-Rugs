import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Hall of Rugs — Solana's Token Graveyard",
  description:
    "Public obituary board for dead Solana tokens. Powered by Birdeye Data API.",
  openGraph: {
    title: "Hall of Rugs — Solana's Token Graveyard",
    description:
      "Public obituary board for dead Solana tokens. Powered by Birdeye Data API.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-bg text-white font-sans min-h-screen">
        <nav className="fixed top-0 left-0 right-0 z-50 bg-bg/90 backdrop-blur-none border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-12">
            <a
              href="/"
              className="font-serif text-lg text-white tracking-wide hover:text-accent transition-colors duration-150"
            >
              Hall of Rugs
            </a>
            <div className="flex items-center gap-6">
              <a
                href="/"
                className="font-mono text-[10px] tracking-wider text-muted hover:text-white transition-colors duration-150"
              >
                GRAVEYARD
              </a>
              <a
                href="/hall-of-shame"
                className="font-mono text-[10px] tracking-wider text-muted hover:text-white transition-colors duration-150"
              >
                HALL OF SHAME
              </a>
            </div>
          </div>
        </nav>
        <main className="pt-12">{children}</main>
      </body>
    </html>
  );
}
