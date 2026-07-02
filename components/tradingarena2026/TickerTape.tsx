"use client";

/* Persistent bottom ticker-tape HUD — pure ambience, decorative data.
   White/silver = up, red = down (the deck's market semantics). Deterministic
   values so SSR and client render identically; CSS marquee, paused under
   prefers-reduced-motion. */

const TICKS: Array<{ sym: string; px: string; chg: string; up: boolean }> = [
  { sym: "BTC-PERP", px: "118,442.5", chg: "+2.41%", up: true },
  { sym: "ETH-PERP", px: "6,918.20", chg: "+1.87%", up: true },
  { sym: "SOL-PERP", px: "312.44", chg: "-3.12%", up: false },
  { sym: "XRP-PERP", px: "3.8821", chg: "+0.64%", up: true },
  { sym: "DOGE-PERP", px: "0.5217", chg: "-1.95%", up: false },
  { sym: "AVAX-PERP", px: "88.06", chg: "+4.28%", up: true },
  { sym: "LINK-PERP", px: "41.77", chg: "-0.83%", up: false },
  { sym: "OP-PERP", px: "5.643", chg: "+6.02%", up: true },
  { sym: "ARB-PERP", px: "2.918", chg: "-2.47%", up: false },
  { sym: "TON-PERP", px: "12.335", chg: "+0.29%", up: true },
  { sym: "SUI-PERP", px: "9.812", chg: "+3.55%", up: true },
  { sym: "PEPE-PERP", px: "0.0000412", chg: "-5.68%", up: false },
];

function TickRun() {
  return (
    <span className="inline-flex items-center">
      {TICKS.map((tk) => (
        <span key={tk.sym} className="inline-flex items-baseline gap-2 px-6 py-1.5">
          <span className="text-[0.6rem] font-bold tracking-[0.18em] text-[var(--arena-silver)]">
            {tk.sym}
          </span>
          <span className="text-[0.66rem] font-semibold text-[var(--arena-white)]">{tk.px}</span>
          <span
            className={`text-[0.6rem] font-bold ${tk.up ? "text-[var(--arena-steel)]" : "arena-down"}`}
          >
            {tk.up ? "▲" : "▼"} {tk.chg}
          </span>
          <span className="ml-4 h-3 w-px bg-[var(--arena-line)]" aria-hidden />
        </span>
      ))}
    </span>
  );
}

export default function TickerTape() {
  return (
    <div
      className="arena-ticker pointer-events-none fixed inset-x-0 bottom-0 z-20 overflow-hidden"
      aria-hidden
    >
      <div className="arena-ticker-track">
        <TickRun />
        <TickRun />
      </div>
    </div>
  );
}
